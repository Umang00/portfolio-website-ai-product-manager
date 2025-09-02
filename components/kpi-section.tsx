"use client"

import { useEffect, useState, useRef } from "react"
import CountUp from "react-countup"

const kpiChips = [
  { label: "Match-rate", value: 3.2, suffix: "×", prefix: "" },
  { label: "Polls", value: 100, suffix: "k+", prefix: "" },
  { label: "PM Experience", value: 6, suffix: " yrs", prefix: "" },
  { label: "Features", value: 40, suffix: "+", prefix: "" },
  { label: "Companies", value: 20, suffix: "+", prefix: "" },
  { label: "Session Time", value: 2, suffix: "×", prefix: "" },
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

  return (
    <section id="kpis" ref={sectionRef} className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Impact at a Glance</h2>
          <p className="text-muted-foreground">Key metrics from products I've shipped</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpiChips.map((kpi, index) => (
            <div
              key={index}
              className="bg-card border rounded-lg p-4 text-center hover:shadow-md transition-shadow"
              style={{
                animationDelay: `${index * 80}ms`,
              }}
            >
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                {isVisible ? (
                  <CountUp
                    start={0}
                    end={kpi.value}
                    duration={2}
                    delay={index * 0.08}
                    decimals={kpi.value % 1 !== 0 ? 1 : 0}
                    prefix={kpi.prefix}
                    suffix={kpi.suffix}
                    preserveValue
                  />
                ) : (
                  `${kpi.prefix}${kpi.value}${kpi.suffix}`
                )}
              </div>
              <div className="text-xs text-muted-foreground font-medium">{kpi.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
