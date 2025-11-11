"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  enableAnimation?: boolean
  animationVariant?: "scale" | "bounce" | "pulse" | "glow"
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  enableAnimation = true,
  animationVariant = "scale",
  ...props
}: ButtonProps) {
  const shouldReduceMotion = useReducedMotion()
  const Comp = asChild ? Slot : "button"
  const baseClassName = cn(buttonVariants({ variant, size, className }))

  // If reduced motion or animation disabled, return regular button
  if (shouldReduceMotion || !enableAnimation) {
    return (
      <Comp
        data-slot="button"
        className={baseClassName}
        {...(props as any)}
      />
    )
  }

  // Animation variants
  const getHoverAnimation = () => {
    switch (animationVariant) {
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

  const getTapAnimation = () => {
    if (animationVariant === "bounce") {
      return { scale: 0.9, transition: { type: "spring", stiffness: 400, damping: 10 } }
    }
    return { scale: 0.95 }
  }

  const getPulseAnimation = () => {
    if (animationVariant === "pulse") {
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

  // If asChild, we can't use motion.button, so return regular button
  if (asChild) {
    return (
      <Comp
        data-slot="button"
        className={baseClassName}
        {...(props as any)}
      />
    )
  }

  return (
    <motion.button
      data-slot="button"
      className={baseClassName}
      whileHover={getHoverAnimation()}
      whileTap={getTapAnimation()}
      animate={getPulseAnimation()}
      transition={{ duration: 0.2 }}
      {...(props as HTMLMotionProps<"button">)}
    />
  )
}

export { Button, buttonVariants }
