"use client"

import { motion, HTMLMotionProps } from "framer-motion"
import { ReactNode } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useSound } from "@/hooks/use-sound"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, "onAnimationStart"> {
  children: ReactNode
  enableSound?: boolean
  variant?: "scale" | "bounce" | "pulse" | "glow"
  className?: string
}

/**
 * AnimatedButton Component
 * Button with micro-interactions and optional sound effects
 */
export function AnimatedButton({
  children,
  className,
  enableSound = false,
  variant = "scale",
  onClick,
  ...props
}: AnimatedButtonProps) {
  const shouldReduceMotion = useReducedMotion()
  const { play } = useSound()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (enableSound && !shouldReduceMotion) {
      play("click")
    }
    onClick?.(e)
  }

  // If reduced motion, return regular button
  if (shouldReduceMotion) {
    return (
      <button className={className} onClick={handleClick} {...(props as any)}>
        {children}
      </button>
    )
  }

  // Hover animation based on variant
  const getHoverAnimation = () => {
    switch (variant) {
      case "scale":
        return { scale: 1.05 }
      case "bounce":
        return { scale: 1.1, transition: { type: "spring", stiffness: 400, damping: 10 } }
      case "pulse":
        return { scale: 1.05 }
      case "glow":
        return {
          scale: 1.02,
          boxShadow: "0 0 20px rgba(37, 99, 235, 0.5)",
        }
      default:
        return { scale: 1.05 }
    }
  }

  // Tap animation
  const getTapAnimation = () => {
    if (variant === "bounce") {
      return { scale: 0.9, transition: { type: "spring", stiffness: 400, damping: 10 } }
    }
    return { scale: 0.95 }
  }

  // Pulse animation (continuous)
  const getPulseAnimation = () => {
    if (variant === "pulse") {
      return {
        boxShadow: [
          "0 0 0 0 rgba(37, 99, 235, 0.7)",
          "0 0 0 10px rgba(37, 99, 235, 0)",
          "0 0 0 0 rgba(37, 99, 235, 0)",
        ],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 0.5,
        },
      }
    }
    return {}
  }

  return (
    <motion.button
      className={cn(className)}
      whileHover={getHoverAnimation()}
      whileTap={getTapAnimation()}
      whileFocus={{
        scale: 1.02,
        outline: "2px solid rgba(37, 99, 235, 0.5)",
        outlineOffset: "2px",
      }}
      animate={getPulseAnimation()}
      onClick={handleClick}
      aria-label={props["aria-label"] || (typeof children === "string" ? children : undefined)}
      {...props}
    >
      {children}
    </motion.button>
  )
}

/**
 * AnimatedIconButton Component
 * Icon button with rotation/bounce effects
 */
interface AnimatedIconButtonProps extends Omit<HTMLMotionProps<"button">, "onAnimationStart"> {
  children: ReactNode
  enableSound?: boolean
  className?: string
}

export function AnimatedIconButton({
  children,
  className,
  enableSound = false,
  onClick,
  ...props
}: AnimatedIconButtonProps) {
  const shouldReduceMotion = useReducedMotion()
  const { play } = useSound()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (enableSound && !shouldReduceMotion) {
      play("click")
    }
    onClick?.(e)
  }

  if (shouldReduceMotion) {
    return (
      <button className={className} onClick={handleClick} {...(props as any)}>
        {children}
      </button>
    )
  }

  return (
    <motion.button
      className={cn(className)}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9, rotate: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      onClick={handleClick}
      {...props}
    >
      {children}
    </motion.button>
  )
}

/**
 * AnimatedLink Component
 * Link with subtle hover effects
 */
interface AnimatedLinkProps extends Omit<HTMLMotionProps<"a">, "onAnimationStart"> {
  children: ReactNode
  className?: string
  enableSound?: boolean
}

export function AnimatedLink({
  children,
  className,
  enableSound = false,
  ...props
}: AnimatedLinkProps) {
  const shouldReduceMotion = useReducedMotion()
  const { play } = useSound()

  const handleHoverStart = () => {
    if (enableSound && !shouldReduceMotion) {
      play("hover")
    }
  }

  if (shouldReduceMotion) {
    return (
      <a className={cn("relative inline-block", className)} {...(props as any)}>
        {children}
      </a>
    )
  }

  return (
    <motion.a
      className={cn("relative inline-block", className)}
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={handleHoverStart}
      {...props}
    >
      {children}
    </motion.a>
  )
}

/**
 * AnimatedUnderlineLink Component
 * Link with animated underline effect
 */
interface AnimatedUnderlineLinkProps extends Omit<HTMLMotionProps<"a">, "onAnimationStart"> {
  children: ReactNode
  className?: string
}

export function AnimatedUnderlineLink({
  children,
  className,
  ...props
}: AnimatedUnderlineLinkProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return (
      <a className={cn("relative", className)} {...(props as any)}>
        {children}
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
      </a>
    )
  }

  return (
    <motion.a className={cn("relative inline-block", className)} {...props}>
      {children}
      <motion.span
        className="absolute bottom-0 left-0 h-0.5 bg-primary"
        initial={{ width: "0%" }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.3 }}
      />
    </motion.a>
  )
}

