"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { CarouselApi } from "@/components/ui/carousel"

interface UseAutoScrollOptions {
  interval?: number // Milliseconds between scrolls
  enabled?: boolean // Whether auto-scroll is enabled
  pauseOnHover?: boolean // Pause when hovering
  pauseOnFocus?: boolean // Pause when focused
  pauseWhenHidden?: boolean // Pause when page is hidden
  pauseWhenOffscreen?: boolean // Pause when carousel is offscreen
  resumeDelay?: number // Delay before resuming after pause (ms)
}

/**
 * Hook to manage auto-scrolling for carousel
 * Returns pause/resume functions and paused state
 */
export function useAutoScroll(
  api: CarouselApi | undefined,
  options: UseAutoScrollOptions = {}
) {
  const {
    interval = 6000,
    enabled = true,
    pauseOnHover = true,
    pauseOnFocus = true,
    pauseWhenHidden = true,
    pauseWhenOffscreen = true,
    resumeDelay = 10000,
  } = options

  const [isPaused, setIsPaused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPageVisible, setIsPageVisible] = useState(true)
  const [isOffscreen, setIsOffscreen] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastInteractionRef = useRef<number>(0)

  // Check page visibility
  useEffect(() => {
    if (typeof document === "undefined" || !pauseWhenHidden) return

    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden)
    }

    setIsPageVisible(!document.hidden)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [pauseWhenHidden])

  // Clear intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current)
      }
    }
  }, [])

  // Auto-scroll logic
  useEffect(() => {
    if (!api || !enabled) return

    const shouldPause =
      isPaused ||
      (pauseOnHover && isHovered) ||
      (pauseOnFocus && isFocused) ||
      (pauseWhenHidden && !isPageVisible) ||
      (pauseWhenOffscreen && isOffscreen)

    if (shouldPause) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Set up auto-scroll interval
    intervalRef.current = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext()
      } else if (api.canScrollPrev()) {
        // If at end, loop back to start
        api.scrollTo(0)
      }
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [
    api,
    enabled,
    interval,
    isPaused,
    isHovered,
    isFocused,
    isPageVisible,
    isOffscreen,
    pauseOnHover,
    pauseOnFocus,
    pauseWhenHidden,
    pauseWhenOffscreen,
  ])

  // Handle user interaction - pause and schedule resume
  const handleInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now()
    setIsPaused(true)

    // Clear any existing resume timeout
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current)
    }

    // Schedule resume after delay
    resumeTimeoutRef.current = setTimeout(() => {
      const timeSinceInteraction = Date.now() - lastInteractionRef.current
      if (timeSinceInteraction >= resumeDelay) {
        setIsPaused(false)
      }
    }, resumeDelay)
  }, [resumeDelay])

  const pause = useCallback(() => {
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    setIsPaused(false)
  }, [])

  return {
    isPaused,
    pause,
    resume,
    setIsHovered,
    setIsFocused,
    setIsOffscreen,
    handleInteraction,
  }
}

