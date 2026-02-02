"use client"

import { useEffect, useState, useRef } from "react"
import CountUp from "react-countup"
import { TrendingUp, DollarSign, Scissors, Clock, BarChart3, Zap, Briefcase, Users, Target, Gauge, CheckCircle2, Timer, Cpu, Activity, Percent, Database, Calendar } from "lucide-react"
import { AnimatedCardGrid, AnimatedCardGridItem } from "@/components/animations/animated-card"
import { ScrollReveal, ScrollRevealList, ScrollRevealItem } from "@/components/animations/scroll-reveal"
import { kpiContent, getPersona } from "@/lib/content-data"

// Icon mapping for dynamic KPI labels
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "Years Experience": Briefcase,
  "Clients Served": Users,
  "Users Reached": Target,
  "AI Products Shipped": Zap,
  "Production Deployments": Database,
  "MCP Servers Built": Cpu,
  "Hackathon Wins": CheckCircle2,
  "Hours Saved/Month": Clock,
  "SaaS Costs Cut": DollarSign,
  "Automations Running": Activity,
  "User Engagement Increased": TrendingUp,
  "Monthly Revenue Boosted": DollarSign,
  "Cost Reduction Achieved": Scissors,
  "Session Time Improved": Clock,
  "Organic Traffic Growth": BarChart3,
  "Manual Work Eliminated": Zap,
  "Voice-to-Voice Latency": Timer,
  "RAG Retrieval Precision": Gauge,
  "Uptime Achieved": CheckCircle2,
  "API Cost Reduction": Scissors,
  "Hallucination Rate": Activity,
  "MVP Shipping Time": Calendar,
  "Hours Saved Weekly": Clock,
  "Monthly SaaS Savings": DollarSign,
  "Time to Value": Timer,
  "SaaS Tools Replaced": Database,
}

// Parse value string to extract numeric part and formatting
function parseKpiValue(value: string): { numericValue: number; prefix: string; suffix: string; isSpecial: boolean } {
  // Handle special cases like "<500ms", "92%+", "$1K+"
  if (value.startsWith("<")) {
    const numMatch = value.match(/\d+/)
    return { numericValue: numMatch ? parseInt(numMatch[0]) : 0, prefix: "<", suffix: value.replace(/<?\d+/, ""), isSpecial: false }
  }
  if (value.startsWith("$")) {
    const numMatch = value.match(/\d+/)
    return { numericValue: numMatch ? parseInt(numMatch[0]) : 0, prefix: "$", suffix: value.replace(/\$\d+/, ""), isSpecial: false }
  }
  // Standard: "200%", "70%", "4+"
  const numMatch = value.match(/\d+/)
  const numericValue = numMatch ? parseInt(numMatch[0]) : 0
  const prefix = value.match(/^[^0-9]+/)?.[0] || ""
  const suffix = value.match(/[^0-9]+$/)?.[0] || ""
  
  // Check if it's a special value that shouldn't animate (like "4 weeks")
  const isSpecial = value.includes(" ")
  
  return { numericValue, prefix, suffix, isSpecial }
}

export function KpiSection() {
  const persona = getPersona()
  const content = kpiContent[persona]
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const renderMetricCard = (metric: { value: string; label: string }, index: number) => {
    const Icon = iconMap[metric.label] || Zap
    const { numericValue, prefix, suffix, isSpecial } = parseKpiValue(metric.value)

    return (
      <div key={`${metric.label}-${index}`}>
        <dt className="sr-only">{metric.label}</dt>
        <AnimatedCardGridItem
          variant="all"
          className="bg-card border rounded-xl p-6 text-center h-full flex flex-col justify-center"
        >
          <Icon className="w-6 h-6 mx-auto mb-4 text-muted-foreground/60" />

          <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
            {isVisible && !prefersReducedMotion && !isSpecial ? (
              <CountUp
                start={0}
                end={numericValue}
                duration={2.2}
                delay={index * 0.1}
                decimals={0}
                prefix={prefix}
                suffix={suffix}
                preserveValue
              />
            ) : (
              metric.value
            )}
          </div>

          <div className="text-sm text-muted-foreground font-medium leading-tight">{metric.label}</div>
        </AnimatedCardGridItem>
      </div>
    )
  }

  return (
    <section id="kpis" ref={sectionRef} className="pt-24 pb-20 px-4 bg-muted/50 dark:bg-muted/20 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal variant="fadeInUp" delay={0.2}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{content.header}</h2>
            <p className="text-lg text-muted-foreground">{content.subheader}</p>
            
            {/* Quick Stats Bar */}
            <ScrollRevealList staggerDelay={0.1} delayChildren={0.3}>
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm md:text-base text-muted-foreground/80">
                {content.quickStats.map((stat, index) => {
                  const Icon = iconMap[stat.label] || Zap
                  return (
                    <ScrollRevealItem key={stat.label}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="font-semibold text-foreground">
                          {stat.value}
                        </span>
                        <span>{stat.label}</span>
                        {index < content.quickStats.length - 1 && <span className="hidden md:inline ml-2">•</span>}
                      </div>
                    </ScrollRevealItem>
                  )
                })}
              </div>
            </ScrollRevealList>
          </div>
        </ScrollReveal>

        {/* Main Impact Metrics */}
        <div className="space-y-6">
          {/* Top Row - Primary Impact */}
          <AnimatedCardGrid className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.08}>
            <dl className="contents">
              {content.impactKpis.slice(0, 3).map((metric, index) => renderMetricCard(metric, index))}
            </dl>
          </AnimatedCardGrid>

          {/* Bottom Row - Supporting Impact */}
          <AnimatedCardGrid className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.08}>
            <dl className="contents">
              {content.impactKpis.slice(3, 6).map((metric, index) => renderMetricCard(metric, index + 3))}
            </dl>
          </AnimatedCardGrid>
        </div>
      </div>
    </section>
  )
}

