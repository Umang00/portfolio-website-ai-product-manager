"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const shouldReduceMotion = useReducedMotion()

  const baseClassName = cn(
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow,transform] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    className
  )

  if (shouldReduceMotion) {
    return (
      <input
        type={type}
        data-slot="input"
        suppressHydrationWarning
        className={baseClassName}
        {...props}
      />
    )
  }

  return (
    <motion.input
      type={type}
      data-slot="input"
      suppressHydrationWarning
      className={baseClassName}
      whileFocus={{
        scale: 1.01,
        boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1), 0 0 20px rgba(37, 99, 235, 0.1)",
      }}
      transition={{ duration: 0.2 }}
      {...props}
    />
  )
}

export { Input }
