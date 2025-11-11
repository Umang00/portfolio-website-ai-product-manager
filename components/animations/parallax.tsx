"use client"

import { ReactNode, useEffect, useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useGSAPInit } from "@/lib/animations/gsap-init"

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface ParallaxProps {
  children: ReactNode
  speed?: number
  className?: string
  direction?: "up" | "down" | "left" | "right"
}

/**
 * Parallax Component
 * Creates subtle parallax effect on scroll using GSAP ScrollTrigger
 */
export function Parallax({
  children,
  speed = 0.5,
  className,
  direction = "up",
}: ParallaxProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  useGSAPInit() // Ensure GSAP is initialized

  useGSAP(
    () => {
      if (shouldReduceMotion || !elementRef.current) return

      const element = elementRef.current
      const parent = element.parentElement || element.offsetParent
      if (!parent) return

      // Calculate movement multipliers based on direction
      const yMultiplier = direction === "up" ? speed : direction === "down" ? -speed : 0
      const xMultiplier = direction === "left" ? speed : direction === "right" ? -speed : 0

      // Create parallax effect - element moves at different speed than scroll
      // Speed > 0 means element moves slower (background), speed < 0 means faster (foreground)
      const st = ScrollTrigger.create({
        trigger: parent,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          // Calculate scroll progress (0 to 1)
          const scrollProgress = self.progress
          
          // Parallax offset: positive speed moves element up as you scroll down
          // This creates the illusion of depth
          const parallaxOffset = scrollProgress * 200 * speed // Increased multiplier for visibility
          
          const y = direction === "up" ? -parallaxOffset : direction === "down" ? parallaxOffset : 0
          const x = direction === "left" ? -parallaxOffset : direction === "right" ? parallaxOffset : 0
          
          gsap.set(element, { 
            y: y * yMultiplier, 
            x: x * xMultiplier,
            force3D: true // GPU acceleration
          })
        },
      })

      return () => {
        st?.kill()
      }
    },
    { scope: elementRef, dependencies: [speed, direction, shouldReduceMotion] }
  )

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
}

interface ParallaxSectionProps {
  children: ReactNode
  speed?: number
  className?: string
}

/**
 * ParallaxSection Component
 * Creates parallax effect for entire sections
 */
export function ParallaxSection({
  children,
  speed = 0.3,
  className,
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const shouldReduceMotion = useReducedMotion()

  useGSAP(
    () => {
      if (shouldReduceMotion || !sectionRef.current) return

      const section = sectionRef.current

      gsap.to(section, {
        y: speed * 100,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      })
    },
    { scope: sectionRef, dependencies: [speed, shouldReduceMotion] }
  )

  return (
    <section ref={sectionRef} className={className}>
      {children}
    </section>
  )
}

