"use client"

import { useEffect, useState, useRef } from "react"
import CountUp from "react-countup"
import { TrendingUp, DollarSign, Scissors, Clock, BarChart3, Zap, Briefcase, Users, Target } from "lucide-react"

const quickStats = [
  { label: "Years Experience", value: 4, suffix: "+", icon: Briefcase },
  { label: "Clients Served", value: 20, suffix: "+", icon: Users },
  { label: "Users Reached", value: 5, suffix: "M+", icon: Target },
]

const impactKpis = [
  { label: "User Engagement Increased", value: 200, suffix: "%", prefix: "", icon: TrendingUp },
  { label: "Monthly Revenue Boosted", value: 30, suffix: "%", prefix: "", icon: DollarSign },
  { label: "Cost Reduction Achieved", value: 70, suffix: "%", prefix: "", icon: Scissors },
  { label: "Session Time Improved", value: 100, suffix: "%", prefix: "", icon: Clock },
  { label: "Organic Traffic Growth", value: 50, suffix: "%", prefix: "", icon: BarChart3 },
  { label: "Manual Work Eliminated", value: 80, suffix: "%", prefix: "", icon: Zap },
]

export function KpiSection() {
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

  const renderMetricCard = (metric: any, index: number) => {
    const Icon = metric.icon

    return (
      <div key={`${metric.label}-${index}`}>
        <dt className="sr-only">{metric.label}</dt>
        <dd
          className="bg-card border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-center"
          style={{
            animationDelay: `${index * 80}ms`,
          }}
        >
          <Icon className="w-6 h-6 mx-auto mb-4 text-muted-foreground/60" />

          <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
            {isVisible && !prefersReducedMotion ? (
              <CountUp
                start={0}
                end={metric.value}
                duration={2.2}
                delay={index * 0.1}
                decimals={metric.value % 1 !== 0 ? 1 : 0}
                prefix={metric.prefix}
                suffix={metric.suffix}
                preserveValue
              />
            ) : (
              `${metric.prefix}${metric.value}${metric.suffix}`
            )}
          </div>

          <div className="text-sm text-muted-foreground font-medium leading-tight">{metric.label}</div>
        </dd>
      </div>
    )
  }

  return (
    <section id="kpis" ref={sectionRef} className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5">Impact At A Glance</h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8">Key metrics from products I've shipped</p>
          
          {/* Quick Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm md:text-base text-muted-foreground/80">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="font-semibold text-foreground">
                    {isVisible && !prefersReducedMotion ? (
                      <CountUp
                        start={0}
                        end={stat.value}
                        duration={2}
                        delay={0.2}
                        suffix={stat.suffix}
                        preserveValue
                      />
                    ) : (
                      `${stat.value}${stat.suffix}`
                    )}
                  </span>
                  <span>{stat.label}</span>
                  {index < quickStats.length - 1 && <span className="hidden md:inline ml-2">•</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Impact Metrics */}
        <div className="space-y-6">
          {/* Top Row - Primary Impact */}
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {impactKpis.slice(0, 3).map((metric, index) => renderMetricCard(metric, index))}
          </dl>

          {/* Bottom Row - Supporting Impact */}
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {impactKpis.slice(3, 6).map((metric, index) => renderMetricCard(metric, index + 3))}
          </dl>
        </div>
      </div>
    </section>
  )
}
