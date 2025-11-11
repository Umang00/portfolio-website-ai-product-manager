"use client"

import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { useState, useEffect } from "react"

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let ticking = false

    const toggleVisibility = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsVisible(window.scrollY > window.innerHeight * 1.2)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", toggleVisibility, { passive: true })
    toggleVisibility() // Check initial state
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  if (!isVisible) return null

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className="fixed bottom-8 right-8 z-50 shadow-lg"
      aria-label="Back to top"
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  )
}
