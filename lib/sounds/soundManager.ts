"use client"

import { Howl } from "howler"

/**
 * Sound Manager
 * Centralized sound effect management with Howler.js
 */

// Sound types
export type SoundType =
  | "click"
  | "hover"
  | "success"
  | "error"
  | "whoosh"
  | "pop"
  | "tick"
  | "celebrate"

class SoundManager {
  private sounds: Map<SoundType, Howl> = new Map()
  private isMuted: boolean = false
  private volume: number = 0.3 // Default subtle volume
  private audioContextUnlocked: boolean = false

  constructor() {
    // Only initialize on client side
    if (typeof window === "undefined") return

    // Load user preferences from localStorage
    const savedMute = localStorage.getItem("soundMuted")
    const savedVolume = localStorage.getItem("soundVolume")

    this.isMuted = savedMute === "true"
    this.volume = savedVolume ? parseFloat(savedVolume) : 0.3

    // Initialize sounds
    this.initializeSounds()
    
    // Set up automatic unlock on first user interaction (fallback)
    this.setupAutoUnlock()
  }

  /**
   * Unlock audio context - can be called manually or on user interaction
   * This is required for browsers to allow audio playback
   */
  unlockAudioContext(): Promise<void> {
    if (this.audioContextUnlocked || typeof window === "undefined") {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      const unlock = () => {
        // Unlock Howler's audio context using its built-in method
        if (typeof Howl !== "undefined" && Howl.ctx && Howl.ctx.state === "suspended") {
          Howl.ctx.resume().then(() => {
            this.audioContextUnlocked = true
            resolve()
          }).catch(() => {
            // If resume fails, try playing a silent sound
            try {
              const silentSound = new Howl({
                src: ["data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="],
                volume: 0,
                onplay: () => {
                  silentSound.stop()
                  this.audioContextUnlocked = true
                  resolve()
                },
                onloaderror: () => {
                  // If silent sound fails, mark as unlocked anyway and resolve
                  this.audioContextUnlocked = true
                  resolve()
                },
              })
              silentSound.play()
            } catch (error) {
              console.debug("Failed to unlock audio context:", error)
              this.audioContextUnlocked = true
              resolve()
            }
          })
        } else {
          // If context doesn't exist yet, try playing a silent sound to create it
          try {
            const silentSound = new Howl({
              src: ["data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="],
              volume: 0,
              onplay: () => {
                silentSound.stop()
                this.audioContextUnlocked = true
                resolve()
              },
              onloaderror: () => {
                // If silent sound fails, mark as unlocked anyway and resolve
                this.audioContextUnlocked = true
                resolve()
              },
            })
            silentSound.play()
          } catch (error) {
            console.debug("Failed to unlock audio context:", error)
            this.audioContextUnlocked = true
            resolve()
          }
        }
      }

      // Try to unlock immediately (if called from user interaction context)
      unlock()
    })
  }

  /**
   * Set up automatic unlock on first user interaction
   */
  private setupAutoUnlock() {
    if (this.audioContextUnlocked || typeof window === "undefined") return

    // Listen for first user interaction
    const events = ["click", "touchstart", "keydown"]
    const handleInteraction = () => {
      this.unlockAudioContext()
      // Remove listeners after first interaction
      events.forEach((event) => {
        document.removeEventListener(event, handleInteraction)
      })
    }

    events.forEach((event) => {
      document.addEventListener(event, handleInteraction, { once: true, passive: true })
    })
  }

  private initializeSounds() {
    // Initialize sounds - files should be in /public/sounds/
    // Only loads sounds that exist (won't error if missing)

    try {
      this.sounds.set(
        "click",
        new Howl({
          src: ["/sounds/click.mp3"],
          volume: this.volume,
          preload: false, // Lazy load
        })
      )

      this.sounds.set(
        "hover",
        new Howl({
          src: ["/sounds/hover.mp3"],
          volume: this.volume * 0.5, // Even more subtle
          preload: false,
        })
      )

      this.sounds.set(
        "success",
        new Howl({
          src: ["/sounds/success.mp3"],
          volume: this.volume,
          preload: false,
        })
      )

      this.sounds.set(
        "error",
        new Howl({
          src: ["/sounds/error.mp3"],
          volume: this.volume,
          preload: false,
        })
      )

      this.sounds.set(
        "whoosh",
        new Howl({
          src: ["/sounds/whoosh.mp3"],
          volume: this.volume,
          preload: false,
        })
      )

      this.sounds.set(
        "pop",
        new Howl({
          src: ["/sounds/pop.mp3"],
          volume: this.volume,
          preload: false,
        })
      )

      this.sounds.set(
        "tick",
        new Howl({
          src: ["/sounds/tick.mp3"],
          volume: this.volume * 0.3,
          preload: false,
        })
      )

      this.sounds.set(
        "celebrate",
        new Howl({
          src: ["/sounds/crowd-hooray.mp3"],
          volume: this.volume * 0.5, // Slightly louder for celebration
          preload: false,
        })
      )
    } catch (error) {
      console.warn("Some sound files may not be loaded:", error)
    }
  }

  /**
   * Play a sound effect
   */
  play(soundType: SoundType) {
    if (this.isMuted || typeof window === "undefined") return

    const sound = this.sounds.get(soundType)
    if (sound) {
      // Try to unlock audio context if not already unlocked
      if (!this.audioContextUnlocked) {
        this.unlockAudioContext()
      }
      
      // Load if not already loaded
      if (!sound.loaded) {
        sound.load()
      }
      
      // Play the sound
      try {
        sound.play()
      } catch (error) {
        // If play fails, try unlocking context and retry
        console.debug("Sound play failed, attempting to unlock audio context:", error)
        this.unlockAudioContext()
        // Retry after a short delay
        setTimeout(() => {
          try {
            sound.play()
          } catch (retryError) {
            console.debug("Sound play retry failed:", retryError)
          }
        }, 100)
      }
    }
  }

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted
    localStorage.setItem("soundMuted", this.isMuted.toString())
    return this.isMuted
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
    localStorage.setItem("soundVolume", this.volume.toString())

    // Update all sound volumes
    this.sounds.forEach((sound) => {
      sound.volume(this.volume)
    })
  }

  /**
   * Get current mute state
   */
  getMuted(): boolean {
    return this.isMuted
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume
  }

  /**
   * Preload a sound for better performance
   */
  preload(soundType: SoundType) {
    const sound = this.sounds.get(soundType)
    if (sound && !sound.loaded) {
      sound.load()
    }
  }

  /**
   * Stop all playing sounds
   */
  stopAll() {
    this.sounds.forEach((sound) => {
      sound.stop()
    })
  }
}

// Singleton instance
let soundManager: SoundManager | null = null

/**
 * Get the sound manager instance
 */
export function getSoundManager(): SoundManager {
  if (typeof window === "undefined") {
    // Return a mock instance for SSR
    return {
      play: () => {},
      toggleMute: () => false,
      setVolume: () => {},
      getMuted: () => false,
      getVolume: () => 0.3,
      preload: () => {},
      stopAll: () => {},
      unlockAudioContext: () => Promise.resolve(),
    } as unknown as SoundManager
  }

  if (!soundManager) {
    soundManager = new SoundManager()
  }

  return soundManager
}

/**
 * React hook for sound effects
 */
export function useSound() {
  const manager = getSoundManager()

  return {
    play: (soundType: SoundType) => manager.play(soundType),
    toggleMute: () => manager.toggleMute(),
    setVolume: (volume: number) => manager.setVolume(volume),
    isMuted: manager.getMuted(),
    volume: manager.getVolume(),
  }
}

