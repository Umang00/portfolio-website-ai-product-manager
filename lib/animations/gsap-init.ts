/**
 * GSAP Initialization
 * Ensures GSAP and ScrollTrigger are properly loaded and registered
 */

import { useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

let gsapInitialized = false

export function initializeGSAP() {
  if (typeof window === "undefined" || gsapInitialized) return

  try {
    gsap.registerPlugin(ScrollTrigger)
    gsapInitialized = true
    
    // Make available globally for debugging
    if (typeof window !== "undefined") {
      (window as any).gsap = gsap
      (window as any).ScrollTrigger = ScrollTrigger
    }
  } catch (error) {
    console.warn("GSAP initialization error:", error)
  }
}

/**
 * Hook to ensure GSAP is initialized
 */
export function useGSAPInit() {
  useEffect(() => {
    initializeGSAP()
  }, [])
}

