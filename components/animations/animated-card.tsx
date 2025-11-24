"use client"

import { motion, HTMLMotionProps } from "framer-motion"
import { ReactNode } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useSound } from "@/hooks/use-sound"
import { use3DTilt } from "@/lib/animations/hooks"
import { animationConfig } from "@/lib/animations/config"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, "onAnimationStart"> {
  children: ReactNode
  enableSound?: boolean
  enable3D?: boolean
  enableMouseFollow?: boolean
  variant?: "lift" | "scale" | "glow" | "all"
  className?: string
  as?: keyof JSX.IntrinsicElements
}

/**
 * AnimatedCard Component
 * Card with hover effects, 3D tilt, and optional sound
 */
export function AnimatedCard({
  children,
  className,
  enableSound = false,
  enable3D = false,
  enableMouseFollow = false,
  variant = "lift",
  as = "div",
  ...props
}: AnimatedCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const { play } = useSound()
  const { elementRef, rotation, isHovering } = use3DTilt<HTMLDivElement>(
    enableMouseFollow && !shouldReduceMotion,
    animationConfig.threeD.maxRotation,
    animationConfig.threeD.sensitivity
  )

  const handleHoverStart = () => {
    if (enableSound && !shouldReduceMotion) {
      play("hover")
    }
  }

  // If reduced motion is preferred, return basic card
  if (shouldReduceMotion) {
    const Component = as as any
    return (
      <Component className={className} {...(props as any)}>
        {children}
      </Component>
    )
  }

  // Define hover animations based on variant
  const getHoverAnimation = () => {
    const animations: Record<string, any> = {}

    if (variant === "lift" || variant === "all") {
      animations.y = -10
    }

    if (variant === "scale" || variant === "all") {
      animations.scale = 1.05
    }

    if (variant === "glow" || variant === "all") {
      animations.boxShadow = "0 20px 40px rgba(37, 99, 235, 0.2)"
    }

    // Add 3D rotation if mouse follow is enabled
    if (enableMouseFollow && isHovering) {
      animations.rotateX = rotation.rotateX
      animations.rotateY = rotation.rotateY
    } else if (enable3D) {
      // Static 3D tilt
      animations.rotateX = 5
      animations.rotateY = 5
    }

    return animations
  }

  const style = enable3D || enableMouseFollow
    ? {
        transformStyle: "preserve-3d" as const,
        perspective: `${animationConfig.threeD.perspective}px`,
        willChange: "transform",
      }
    : {
        willChange: "transform",
      }

  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div

  return (
    <MotionComponent
      ref={elementRef}
      className={cn(className)}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 },
      }}
      whileHover={{
        ...getHoverAnimation(),
        transition: { duration: 0.2 },
      }}
      whileFocus={{
        ...getHoverAnimation(),
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      viewport={{ once: true, amount: 0.5 }}
      onHoverStart={handleHoverStart}
      style={style}
      tabIndex={props.onClick ? 0 : undefined}
      role={props.onClick ? "button" : undefined}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (props.onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          ;(props.onClick as any)(e)
        }
      }}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}

/**
 * AnimatedCardGrid Component
 * Grid container with staggered card animations
 */
interface AnimatedCardGridProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export function AnimatedCardGrid({
  children,
  className,
  staggerDelay = 0.1,
}: AnimatedCardGridProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * AnimatedCardGridItem Component
 * Individual card item for AnimatedCardGrid
 */
interface AnimatedCardGridItemProps {
  children: ReactNode
  className?: string
  enableSound?: boolean
  variant?: "lift" | "scale" | "glow" | "all"
}

export function AnimatedCardGridItem({
  children,
  className,
  enableSound = false,
  variant = "lift",
}: AnimatedCardGridItemProps) {
  const shouldReduceMotion = useReducedMotion()
  const { play } = useSound()

  const handleHoverStart = () => {
    if (enableSound && !shouldReduceMotion) {
      play("hover")
    }
  }

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  const getHoverAnimation = () => {
    const animations: Record<string, any> = {}

    if (variant === "lift" || variant === "all") {
      animations.y = -10
    }

    if (variant === "scale" || variant === "all") {
      animations.scale = 1.02
    }

    if (variant === "glow" || variant === "all") {
      animations.boxShadow = "0 20px 40px rgba(37, 99, 235, 0.2)"
    }

    return animations
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5 },
        },
      }}
      whileHover={{
        ...getHoverAnimation(),
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={handleHoverStart}
    >
      {children}
    </motion.div>
  )
}

