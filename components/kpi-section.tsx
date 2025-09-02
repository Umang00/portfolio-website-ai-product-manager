"use client"

import { useEffect, useState, useRef } from "react"
import CountUp from "react-countup"
import { Building2, Calendar, Rocket, TrendingUp, Clock, Target } from "lucide-react"

const profileStats = [
  { label: "Companies Served", value: 20, suffix: "+", prefix: "", icon: Building2 },
  { label: "Years Experience", value: 3, suffix: "+", prefix: "", icon: Calendar },
  { label: "Features Shipped", value: 50, suffix: "+", prefix: "", icon: Rocket },
]

const impactKpis = [
  { label: "Match-Rate Uplifted By", value: 3.2, suffix: "×", prefix: "", icon: Target },
  { label: "Session Time Increased By", value: 2, suffix: "×", prefix: "", icon: Clock },
  { label: "Onboarding Completion Skyrocketed By", value: 100, suffix: "%", prefix: "", icon: TrendingUp },
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

  const renderMetricCard = (metric: any, index: number, totalOffset = 0) => {
    const Icon = metric.icon
    const adjustedIndex = index + totalOffset

    return (
      <div key={`${metric.label}-${index}`}>
        <dt className="sr-only">{metric.label}</dt>
        <dd
          className="bg-card border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-center"
          style={{
            animationDelay: `${adjustedIndex * 80}ms`,
          }}
        >
          <Icon className="w-6 h-6 mx-auto mb-4 text-muted-foreground/60" />

<div className="text-4xl md:text-6xl font-bold text-primary mb-2">

            {isVisible && !prefersReducedMotion ? (
              <CountUp
                start={0}
                end={metric.value}
                duration={2.2}
                delay={adjustedIndex * 0.1}
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
  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5">Impact at a Glance</h2>
  <p className="text-base md:text-lg text-muted-foreground">Key metrics from products I've shipped</p>
</div>


        <div className="space-y-12">
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {profileStats.map((metric, index) => renderMetricCard(metric, index))}
          </dl>

          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {impactKpis.map((metric, index) => renderMetricCard(metric, index, profileStats.length))}
          </dl>
        </div>
      </div>
    </section>
  )
}
