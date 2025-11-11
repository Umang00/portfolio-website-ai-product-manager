"use client"

import { useEffect, useRef, useState } from "react"
import { getSoundManager } from "@/lib/sounds/soundManager"

export function useCelebrateOnView(threshold = 0.3) {
  const ref = useRef<HTMLElement>(null)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || hasTriggered) return
        setHasTriggered(true)

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (!prefersReducedMotion) {
          // Trigger confetti blast
          const confetti = (await import("canvas-confetti")).default
          confetti({ particleCount: 110, spread: 75, origin: { y: 0.8 } })
          
          // Unlock audio context and play celebration sound when confetti triggers
          // The confetti blast itself is a user-triggered event (scrolling), so we can use it to unlock audio
          try {
            const soundManager = getSoundManager()
            if (soundManager && !soundManager.getMuted()) {
              // Unlock audio context first (using the confetti trigger as user interaction)
              await soundManager.unlockAudioContext()
              
              // Preload the sound
              soundManager.preload("celebrate")
              
              // Play the sound after a small delay to ensure it's loaded
              setTimeout(() => {
                soundManager.play("celebrate")
              }, 100)
            }
          } catch (error) {
            // Sound may not be available; ignore silently
            console.debug("Celebration sound could not be played:", error)
          }
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasTriggered, threshold])

  return ref
}
