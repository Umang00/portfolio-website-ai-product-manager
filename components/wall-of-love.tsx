"use client"

import { Button } from "@/components/ui/button"
import { Linkedin } from "lucide-react"
import { useState, useEffect } from "react"
import { AnimatedCard } from "@/components/animations/animated-card"
import { ScrollReveal } from "@/components/animations/scroll-reveal"

const testimonials = [
  {
    avatar: "/ashutosh-gupta.png",
    name: "Ashutosh Gupta",
    title: "Head of Strategy at Hunch",
    quote:
      "What makes Umang stand out is his builder mindset and his ability to blend AI expertise with creativity and data-driven thinking. He fine-tuned internal chat models that significantly improved engagement and built an internal analytics dashboard that gave us real-time insights. He brings together creativity, analytical thinking, AI skills, and product vision in a way that's rare to find.",
    linkedin: "https://www.linkedin.com/in/ashutosh-gupta-0321b2145/",
  },
  {
    avatar: "/shiv-pande.png",
    name: "Shiv Ram Pande",
    title: "Founding Team & CBO at BitSave",
    quote:
      "Umang rose to the challenge with dedication and endless ideas. He was a creative architect who shaped product direction through data-driven insights. His influence extended beyond his own work, shaping the content team through guidance and mentorship. His constructive criticism, always delivered with genuine desire for everyone's success, became a beacon.",
    linkedin: "https://www.linkedin.com/in/shivrampande/",
  },
  {
    avatar: "/dipayan-chatterjee.png",
    name: "Dipayan Chatterjee",
    title: "Full-stack Marketer",
    quote:
      "Umang embodies resilience, adaptability and grit. No matter how complex a problem may be, you can expect it to be assessed, quantified and worn down to a solution with simple determination.",
    linkedin: "https://www.linkedin.com/in/dipayanchatterjee/",
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
    <section id="testimonials" className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal variant="fadeInUp" delay={0.2}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Wall of Love</h2>
            <p className="text-lg text-muted-foreground">Feedback from colleagues and collaborators</p>
          </div>
        </ScrollReveal>

        <div className="hidden md:block">
          <div
            className="grid grid-cols-2 gap-8 min-h-[320px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {getCurrentTestimonials().map((testimonial, index) => (
              <AnimatedCard
                key={`${currentSet}-${index}`}
                variant="all"
                className="bg-card rounded-xl p-8 border shadow-sm"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative flex-shrink-0">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                      {testimonial.linkedin && (
                        <a
                          href={testimonial.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${testimonial.name}'s LinkedIn`}
                          className="group inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-[#0A66C2]/10 transition-colors flex-shrink-0"
                        >
                          <Linkedin className="h-4 w-4 transition-colors group-hover:text-[#0A66C2]" />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
                <blockquote className="text-base leading-relaxed text-foreground/90">
                  "{testimonial.quote}"
                </blockquote>
              </AnimatedCard>
            ))}
          </div>
        </div>

        <div className="md:hidden flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4">
          {testimonials.map((testimonial, index) => (
            <AnimatedCard
              key={index}
              variant="all"
              className="flex-none w-[85vw] snap-start bg-card rounded-xl p-6 border shadow-sm"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="relative flex-shrink-0">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-base">{testimonial.name}</h4>
                    {testimonial.linkedin && (
                      <a
                        href={testimonial.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${testimonial.name}'s LinkedIn`}
                        className="group inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card hover:bg-[#0A66C2]/10 transition-colors flex-shrink-0"
                      >
                        <Linkedin className="h-3.5 w-3.5 transition-colors group-hover:text-[#0A66C2]" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>
              <blockquote className="text-sm leading-relaxed text-foreground/90">
                "{testimonial.quote}"
              </blockquote>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  )
}
