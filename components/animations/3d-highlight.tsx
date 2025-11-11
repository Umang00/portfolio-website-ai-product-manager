"use client"

import { ReactNode, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"

interface ThreeDHighlightProps {
  children: ReactNode
  className?: string
  intensity?: "low" | "medium" | "high"
  enableShadow?: boolean
  enableGradient?: boolean
  enableBorderGlow?: boolean
}

/**
 * ThreeDHighlight Component
 * Adds 3D highlight/glow effects that follow mouse position
 */
export function ThreeDHighlight({
  children,
  className,
  intensity = "medium",
  enableShadow = true,
  enableGradient = true,
  enableBorderGlow = false,
}: ThreeDHighlightProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const [isHovering, setIsHovering] = useState(false)

  // Mouse position relative to element
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring animations
  const springConfig = { damping: 15, stiffness: 150 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  // Transform values based on intensity
  const intensityMap = {
    low: { shadow: 8, gradient: 0.3, border: 2 },
    medium: { shadow: 15, gradient: 0.5, border: 3 },
    high: { shadow: 25, gradient: 0.7, border: 4 },
  }

  const { shadow, gradient, border } = intensityMap[intensity]

  // Calculate shadow offset (shadow follows mouse)
  const shadowX = useTransform(smoothX, (x) => x * 0.1)
  const shadowY = useTransform(smoothY, (y) => y * 0.1)

  // Calculate gradient position (gradient shifts with mouse)
  const gradientX = useTransform(smoothX, (x) => `${50 + x * 0.1}%`)
  const gradientY = useTransform(smoothY, (y) => `${50 + y * 0.1}%`)

  // Calculate border glow intensity (stronger near cursor)
  const glowIntensity = useTransform(
    [smoothX, smoothY],
    ([x, y]) => {
      const distance = Math.sqrt(x * x + y * y)
      return Math.max(0, 1 - distance / 200) // Max glow when cursor is at center
    }
  )

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovering(false)
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Dynamic Shadow */}
      {enableShadow && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            boxShadow: useTransform(
              [shadowX, shadowY, glowIntensity],
              ([x, y, intensity]) =>
                `${x}px ${y}px ${shadow * intensity}px rgba(37, 99, 235, ${0.2 * intensity})`
            ),
            zIndex: -1,
          }}
        />
      )}

      {/* Gradient Overlay */}
      {enableGradient && isHovering && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
          style={{
            background: useTransform(
              [gradientX, gradientY],
              ([x, y]) =>
                `radial-gradient(circle at ${x} ${y}, rgba(37, 99, 235, ${gradient}), transparent 70%)`
            ),
            zIndex: 1,
          }}
        />
      )}

      {/* Border Glow */}
      {enableBorderGlow && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            boxShadow: useTransform(
              glowIntensity,
              (intensity) =>
                `inset 0 0 ${border * intensity}px rgba(37, 99, 235, ${0.4 * intensity})`
            ),
            zIndex: 1,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

