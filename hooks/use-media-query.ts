"use client"

import { useState, useEffect } from "react"

/**
 * Hook to detect if a media query matches
 * @param query - CSS media query string (e.g., "(min-width: 768px)")
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia(query)

    // Set initial value
    setMatches(mediaQuery.matches)

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener
    mediaQuery.addEventListener("change", handler)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handler)
    }
  }, [query])

  return matches
}

/**
 * Convenience hook for detecting mobile screens (< 768px)
 */
export function useIsMobile(): boolean {
  return !useMediaQuery("(min-width: 768px)")
}

/**
 * Convenience hook for detecting tablet and above (>= 768px)
 */
export function useIsTabletOrAbove(): boolean {
  return useMediaQuery("(min-width: 768px)")
}
