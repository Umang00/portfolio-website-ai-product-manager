"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  const shouldReduceMotion = useReducedMotion()

  const baseClassName = cn(
    "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow,transform] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    className
  )

  if (shouldReduceMotion) {
    return (
      <textarea
        data-slot="textarea"
        className={baseClassName}
        {...props}
      />
    )
  }

  return (
    <motion.textarea
      data-slot="textarea"
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

export { Textarea }
