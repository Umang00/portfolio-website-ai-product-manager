"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { AnimatedCard } from "@/components/animations/animated-card"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { highlightMetrics } from "@/lib/utils/highlight-metrics"
import { journeyContent, getPersona } from "@/lib/content-data"

type TimelineItem = {
  title: string
  company: string
  date: string
  roleId: keyof typeof journeyContent.pm
}

// Persona-specific titles for 100x Engineers role
const get100xTitle = (persona: string): string => {
  switch (persona) {
    case "pm":
      return "AI Product Builder"
    case "consultant":
      return "AI Automation Consultant"
    case "builder":
      return "AI Engineer"
    default:
      return "AI Builder"
  }
}

const getTimelineItems = (persona: string): TimelineItem[] => [
  {
    title: get100xTitle(persona),
    company: "100x Engineers Cohort",
    date: "July 2025 – Present",
    roleId: "100x-engineers",
  },
  {
    title: "Associate Product Manager",
    company: "Hunch (Dating & Social App)",
    date: "Oct 2023 – Jun 2025",
    roleId: "hunch-apm",
  },
  {
    title: "Content Strategist",
    company: "Hunch (Polling App)",
    date: "Nov 2022 – Sep 2023",
    roleId: "hunch-content",
  },
  {
    title: "Content Writer",
    company: "PlotX (Crypto Gaming Platform)",
    date: "Jun 2022 – Oct 2022",
    roleId: "plotx",
  },
  {
    title: "Content Writer",
    company: "iNurture Education Solutions (EdTech)",
    date: "Feb 2022 – Jun 2022",
    roleId: "inurture",
  },
  {
    title: "Content Writer",
    company: "Freelance",
    date: "Nov 2021 – May 2022",
    roleId: "freelance",
  },
]

export function Timeline() {
  const persona = getPersona()
  const personaJourney = journeyContent[persona]
  const timelineItems = getTimelineItems(persona)
  
  const [isExpanded, setIsExpanded] = useState(false)
  const visibleItems = isExpanded ? timelineItems : timelineItems.slice(0, 2)

  return (
    <section id="journey" className="py-20 px-4 bg-muted/50 dark:bg-muted/20">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal variant="fadeInUp" delay={0.2}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">My Journey</h2>
            <p className="text-lg text-muted-foreground">The path of building, scaling, and reimagining products</p>
          </div>
        </ScrollReveal>

        <div className="space-y-8">
          {visibleItems.map((item, index) => (
            <ScrollReveal
              key={index}
              variant={index % 2 === 0 ? "fadeInLeft" : "fadeInRight"}
              delay={index * 0.15}
            >
              <div className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-primary rounded-full border-4 border-background ring-4 ring-primary/20"></div>
                  {index < visibleItems.length - 1 && <div className="w-0.5 flex-1 bg-border mt-4"></div>}
                </div>

                <div className="flex-1 pb-8">
                  <AnimatedCard
                    variant="all"
                    className="bg-card rounded-lg p-6 border"
                  >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="text-primary font-medium">{item.company}</p>
                    </div>
                    <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded w-fit">
                      {item.date}
                    </span>
                  </div>

                  <ul className="space-y-2.5">
                    {personaJourney[item.roleId].map((achievement, i) => (
                      <li key={i} className="text-muted-foreground leading-relaxed flex items-start gap-3">
                        <span className="text-primary mt-1 flex-shrink-0 text-lg leading-none">•</span>
                        <span className="flex-1">{highlightMetrics(achievement)}</span>
                      </li>
                    ))}
                  </ul>
                  </AnimatedCard>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal variant="fadeInUp" delay={0.4}>
          <div className="flex justify-center mt-12">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              size="lg"
              className="gap-2"
            >
            {isExpanded ? (
              <>
                Show Less
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                View Full Journey
                <ChevronDown className="w-4 h-4" />
              </>
            )}
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
