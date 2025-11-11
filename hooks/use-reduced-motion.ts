"use client"

import { useEffect, useState, useCallback } from "react"

const STORAGE_KEY = "prefers-reduced-motion"

/**
 * Hook to detect if user prefers reduced motion
 * Checks system preference, localStorage preference, and provides toggle function
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === "undefined") return

    // Check localStorage first (user override)
    const storedPreference = localStorage.getItem(STORAGE_KEY)
    if (storedPreference !== null) {
      setPrefersReducedMotion(storedPreference === "true")
      return
    }

    // Otherwise check system preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes to system preference
    const handleChange = (event: MediaQueryListEvent) => {
      // Only update if no localStorage override exists
      if (localStorage.getItem(STORAGE_KEY) === null) {
        setPrefersReducedMotion(event.matches)
      }
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Hook to toggle reduced motion preference
 * Saves to localStorage for persistence
 */
export function useToggleReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const storedPreference = localStorage.getItem(STORAGE_KEY)
    const systemPreference = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    setPrefersReducedMotion(
      storedPreference !== null ? storedPreference === "true" : systemPreference
    )
  }, [])

  const toggle = useCallback(() => {
    const newValue = !prefersReducedMotion
    setPrefersReducedMotion(newValue)
    localStorage.setItem(STORAGE_KEY, String(newValue))
    
    // Trigger a custom event so components can react
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("reduced-motion-changed", { detail: newValue }))
    }
  }, [prefersReducedMotion])

  return { prefersReducedMotion, toggle }
}

