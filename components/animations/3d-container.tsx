"use client"

import { ReactNode } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"

interface ThreeDContainerProps {
  children: ReactNode
  perspective?: number
  className?: string
}

/**
 * ThreeDContainer Component
 * Container with 3D perspective for child elements
 * Enables 3D transforms for all children
 */
export function ThreeDContainer({
  children,
  perspective = 1000,
  className,
}: ThreeDContainerProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <div
      className={cn(className)}
      style={{
        perspective: `${perspective}px`,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  )
}

