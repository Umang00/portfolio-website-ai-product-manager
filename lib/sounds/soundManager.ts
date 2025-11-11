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

class SoundManager {
  private sounds: Map<SoundType, Howl> = new Map()
  private isMuted: boolean = false
  private volume: number = 0.3 // Default subtle volume

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
      // Load if not already loaded
      if (!sound.loaded) {
        sound.load()
      }
      sound.play()
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

