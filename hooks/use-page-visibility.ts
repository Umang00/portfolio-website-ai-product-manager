"use client"

import { useEffect, useState } from "react"

/**
 * Hook to detect if the page/tab is visible
 * Returns true when page is visible, false when hidden
 */
export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Check if document is available
    if (typeof document === "undefined") return

    // Set initial value
    setIsVisible(!document.hidden)

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  return isVisible
}

