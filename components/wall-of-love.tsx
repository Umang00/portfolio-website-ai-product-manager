"use client"

import { Button } from "@/components/ui/button"
import { Linkedin } from "lucide-react"
import { useState, useEffect } from "react"

const testimonials = [
  {
    avatar: "/placeholder.svg?height=48&width=48",
    name: "Siddharth Arya",
    title: "Director, Aryacorp",
    quote:
      "Umang is a highly enthusiastic product manager with exceptional analytical skills. His ability to translate complex user needs into actionable product features is remarkable.",
    linkedin: "https://linkedin.com/in/example",
  },
  {
    avatar: "/placeholder.svg?height=48&width=48",
    name: "Sarah Chen",
    title: "VP Engineering, TechFlow",
    quote:
      "Working with Umang was a game-changer for our product development. His data-driven approach and user-centric mindset helped us achieve 3x growth in user engagement.",
    linkedin: "https://linkedin.com/in/example",
  },
  {
    avatar: "/placeholder.svg?height=48&width=48",
    name: "Michael Rodriguez",
    title: "Founder, StartupLab",
    quote:
      "Umang has an incredible talent for identifying market opportunities and executing on them. His strategic thinking and execution skills are top-notch.",
    linkedin: "https://linkedin.com/in/example",
  },
  {
    avatar: "/placeholder.svg?height=48&width=48",
    name: "Emily Johnson",
    title: "Head of Product, InnovateCorp",
    quote:
      "Umang's strategic vision and execution capabilities are exceptional. He consistently delivers products that exceed user expectations and drive business growth.",
    linkedin: "https://linkedin.com/in/example",
  },
  {
    avatar: "/placeholder.svg?height=48&width=48",
    name: "David Kim",
    title: "CTO, NextGen Solutions",
    quote:
      "His ability to bridge the gap between technical complexity and user needs is outstanding. Umang is the kind of product leader every team needs.",
    linkedin: "https://linkedin.com/in/example",
  },
  {
    avatar: "/placeholder.svg?height=48&width=48",
    name: "Lisa Wang",
    title: "Product Designer, CreativeFlow",
    quote:
      "Collaborating with Umang was inspiring. His user-first approach and data-driven decisions resulted in products that users truly love.",
    linkedin: "https://linkedin.com/in/example",
  },
]

export function WallOfLove() {
  const [currentSet, setCurrentSet] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setCurrentSet((prev) => (prev + 1) % Math.ceil(testimonials.length / 2))
    }, 6000)

    return () => clearInterval(interval)
  }, [isPaused])

  const getCurrentTestimonials = () => {
    const startIndex = currentSet * 2
    return testimonials.slice(startIndex, startIndex + 2)
  }

  return (
    <section id="testimonials" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Wall of Love</h2>
          <p className="text-lg text-muted-foreground">Feedback from colleagues and collaborators</p>
        </div>

        <div className="hidden md:block">
          <div
            className="grid grid-cols-2 gap-8 min-h-[300px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {getCurrentTestimonials().map((testimonial, index) => (
              <div
                key={`${currentSet}-${index}`}
                className="bg-card rounded-lg p-6 border animate-in slide-in-from-right-5 duration-500"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full ring-2 ring-primary/20"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      {testimonial.linkedin && (
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" asChild>
                          <a href={testimonial.linkedin} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
                <blockquote className="text-sm leading-relaxed">"{testimonial.quote}"</blockquote>
              </div>
            ))}
          </div>
        </div>

        <div className="md:hidden flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="flex-none w-80 snap-start bg-card rounded-lg p-6 border">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full ring-2 ring-primary/20"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    {testimonial.linkedin && (
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" asChild>
                        <a href={testimonial.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>
              <blockquote className="text-sm leading-relaxed">"{testimonial.quote}"</blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
