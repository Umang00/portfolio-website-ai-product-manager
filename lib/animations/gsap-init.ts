/**
 * GSAP Initialization
 * Ensures GSAP and ScrollTrigger are properly loaded and registered
 */

import { useEffect } from "react"

let gsapInitialized = false

export function initializeGSAP() {
  if (typeof window === "undefined" || gsapInitialized) return

  try {
    // Use require-style dynamic import to avoid webpack issues
    // This ensures GSAP is loaded as a module correctly
    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger")
    ]).then(([gsapModule, ScrollTriggerModule]) => {
      // GSAP v3 exports an object, not a function
      const gsap = (gsapModule as any).default || gsapModule
      const ScrollTrigger = ScrollTriggerModule.ScrollTrigger || (ScrollTriggerModule as any).default
      
      // Check if gsap is an object with registerPlugin method
      if (gsap && typeof gsap.registerPlugin === "function" && ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger)
        gsapInitialized = true
        
        // Make available globally for debugging
        if (typeof window !== "undefined") {
          (window as any).gsap = gsap
          ;(window as any).ScrollTrigger = ScrollTrigger
        }
      } else {
        console.warn("GSAP: Invalid GSAP or ScrollTrigger module", { gsap, ScrollTrigger })
      }
    }).catch((err) => {
      console.warn("GSAP initialization error:", err)
    })
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

