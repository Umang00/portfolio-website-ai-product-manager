"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  variant?: "default" | "circular" | "text" | "image"
}

function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  const shouldReduceMotion = useReducedMotion()

  const baseClassName = cn(
    "bg-muted animate-pulse",
    {
      "rounded-md": variant === "default",
      "rounded-full": variant === "circular",
      "rounded h-4": variant === "text",
      "rounded-md aspect-video": variant === "image",
    },
    className
  )

  if (shouldReduceMotion) {
    return <div className={baseClassName} {...props} />
  }

  return (
    <motion.div
      className={baseClassName}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      {...props}
    />
  )
}

export { Skeleton }

