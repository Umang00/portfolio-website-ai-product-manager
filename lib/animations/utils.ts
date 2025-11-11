/**
 * Animation Utilities
 * Helper functions for animations, transforms, and performance optimization
 */

import { animationConfig } from "./config";

/**
 * Calculate 3D rotation based on mouse position relative to element center
 */
export function calculate3DRotation(
  mouseX: number,
  mouseY: number,
  elementX: number,
  elementY: number,
  elementWidth: number,
  elementHeight: number
): { rotateX: number; rotateY: number } {
  const centerX = elementX + elementWidth / 2
  const centerY = elementY + elementHeight / 2

  const deltaX = mouseX - centerX
  const deltaY = mouseY - centerY

  const { maxRotation, sensitivity } = animationConfig.threeD

  // Calculate rotation angles (inverted Y for natural feel)
  const rotateY = Math.max(
    -maxRotation,
    Math.min(maxRotation, deltaX / sensitivity)
  )
  const rotateX = Math.max(
    -maxRotation,
    Math.min(maxRotation, -deltaY / sensitivity)
  )

  return { rotateX, rotateY }
}

/**
 * Get GPU-accelerated transform style
 */
export function getGPUAcceleratedStyle() {
  return {
    willChange: "transform",
    transform: "translateZ(0)", // Force GPU acceleration
  }
}

/**
 * Calculate parallax offset based on scroll position
 */
export function calculateParallaxOffset(
  scrollY: number,
  elementTop: number,
  speed: number = 0.5
): number {
  const elementOffset = scrollY - elementTop
  return elementOffset * speed
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor
}

/**
 * Easing functions
 */
export const easing = {
  easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutBack: (t: number): number => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },
}

/**
 * Debounce function for scroll/resize handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for scroll/resize handlers
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

