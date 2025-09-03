"use client"

import { useEffect, useRef, useState } from "react"

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
          const confetti = (await import("canvas-confetti")).default
          confetti({ particleCount: 110, spread: 75, origin: { y: 0.8 } })
        }

        try {
          const audio = new Audio("/sfx/chime.mp3")
          audio.volume = 0.3
          await audio.play()
        } catch {
          // autoplay may be blocked; ignore
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasTriggered, threshold])

  return ref
}
