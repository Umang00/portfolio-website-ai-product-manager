"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

/**
 * Hook to track mouse position
 */
export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", updateMousePosition)
    return () => window.removeEventListener("mousemove", updateMousePosition)
  }, [])

  return mousePosition
}

/**
 * Hook to track mouse position relative to an element
 */
export function useMousePositionRelative<T extends HTMLElement>() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const elementRef = useRef<T>(null)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!elementRef.current) return

    const rect = elementRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    setMousePosition({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener("mousemove", handleMouseMove)
    element.addEventListener("mouseenter", handleMouseEnter)
    element.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      element.removeEventListener("mousemove", handleMouseMove)
      element.removeEventListener("mouseenter", handleMouseEnter)
      element.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave])

  return { elementRef, mousePosition, isHovering }
}

/**
 * Hook for 3D tilt effect based on mouse position
 */
export function use3DTilt<T extends HTMLElement>(
  enabled: boolean = true,
  maxRotation: number = 15,
  sensitivity: number = 25
) {
  const prefersReducedMotion = useReducedMotion()
  const { elementRef, mousePosition, isHovering } = useMousePositionRelative<T>()
  const [rotation, setRotation] = useState({ rotateX: 0, rotateY: 0 })

  useEffect(() => {
    if (!enabled || prefersReducedMotion || !isHovering || !elementRef.current) {
      setRotation({ rotateX: 0, rotateY: 0 })
      return
    }

    const element = elementRef.current
    const rect = element.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const deltaX = mousePosition.x - centerX
    const deltaY = mousePosition.y - centerY

    const rotateY = Math.max(-maxRotation, Math.min(maxRotation, deltaX / sensitivity))
    const rotateX = Math.max(-maxRotation, Math.min(maxRotation, -deltaY / sensitivity))

    setRotation({ rotateX, rotateY })
  }, [enabled, prefersReducedMotion, isHovering, mousePosition, maxRotation, sensitivity])

  return { elementRef, rotation, isHovering }
}

/**
 * Hook for scroll-triggered animations
 */
export function useScrollAnimation(
  threshold: number = 0.3,
  rootMargin: string = "-100px"
) {
  const prefersReducedMotion = useReducedMotion()
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold, rootMargin }
    )

    const element = elementRef.current
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [threshold, rootMargin, prefersReducedMotion])

  return { elementRef, isVisible }
}

/**
 * Hook for stagger animations
 */
export function useStaggerAnimation(
  itemCount: number,
  staggerDelay: number = 0.1
) {
  const prefersReducedMotion = useReducedMotion()
  const [visibleItems, setVisibleItems] = useState<number[]>([])

  const revealItem = useCallback(
    (index: number) => {
      if (prefersReducedMotion) {
        setVisibleItems(Array.from({ length: itemCount }, (_, i) => i))
        return
      }

      setTimeout(() => {
        setVisibleItems((prev) => [...prev, index])
      }, index * staggerDelay * 1000)
    },
    [itemCount, staggerDelay, prefersReducedMotion]
  )

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleItems(Array.from({ length: itemCount }, (_, i) => i))
    }
  }, [itemCount, prefersReducedMotion])

  return { visibleItems, revealItem }
}

