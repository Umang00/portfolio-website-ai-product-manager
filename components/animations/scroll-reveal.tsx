"use client"

import { motion, Variants } from "framer-motion"
import { ReactNode } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { animationConfig } from "@/lib/animations/config"

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  variant?: "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight" | "scaleIn" | "scaleInBounce"
  duration?: number
  delay?: number
  once?: boolean
  amount?: number
}

/**
 * ScrollReveal Component
 * Wrapper component for scroll-triggered animations
 */
export function ScrollReveal({
  children,
  className,
  variant = "fadeInUp",
  duration = 0.6,
  delay = 0,
  once = true,
  amount = 0.3,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion()

  // If user prefers reduced motion, don't animate
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  const variants = animationConfig.variants[variant] as Variants

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  )
}

/**
 * ScrollRevealList Component
 * For staggered list animations
 */
interface ScrollRevealListProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  delayChildren?: number
}

export function ScrollRevealList({
  children,
  className,
  staggerDelay = 0.1,
  delayChildren = 0,
}: ScrollRevealListProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  )
}

/**
 * ScrollRevealItem Component
 * Child component for ScrollRevealList
 */
interface ScrollRevealItemProps {
  children: ReactNode
  className?: string
}

export function ScrollRevealItem({ children, className }: ScrollRevealItemProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  )
}

