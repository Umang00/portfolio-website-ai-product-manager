"use client"

import { useState } from "react"

const processSteps = [
  { title: "Research", icon: "🔎", desc: "Identify user jobs and constraints" },
  { title: "Build", icon: "🛠️", desc: "Vertical slice; smallest lovable" },
  { title: "Launch", icon: "🚀", desc: "Ship behind a flag; iterate" },
  { title: "Measure", icon: "📊", desc: "Mixpanel + SQL + surveys" },
  { title: "Learn", icon: "🧠", desc: "Close the loop; new bets" },
]

export function ProcessWheel() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)

  return (
    <section id="process" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">My Process</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A proven framework for shipping products that users love
          </p>
        </div>

        <div className="relative">
          <div className="w-32 h-32 mx-auto mb-12 border-2 border-dashed border-muted-foreground/30 rounded-full flex items-center justify-center">
            <span className="text-muted-foreground text-xs text-center">
              Mic/
              <br />
              Whiteboard
            </span>
          </div>

          <div className="relative w-96 h-96 mx-auto mb-12">
            <div className="absolute inset-0 border-2 border-dashed border-muted-foreground/20 rounded-full" />

            {processSteps.map((step, index) => {
              const angle = index * 72 - 90 // 360/5 = 72 degrees between steps, -90 to start at top
              const radian = (angle * Math.PI) / 180
              const radius = 160
              const x = Math.cos(radian) * radius
              const y = Math.sin(radian) * radius

              return (
                <div
                  key={index}
                  className="absolute w-16 h-16 -ml-8 -mt-8 cursor-pointer"
                  style={{
                    left: `50%`,
                    top: `50%`,
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  onMouseEnter={() => setHoveredStep(index)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  <div className="w-full h-full bg-card border-2 border-primary/20 rounded-full flex items-center justify-center text-2xl hover:border-primary transition-colors">
                    {step.icon}
                  </div>

                  {/* Tooltip */}
                  {hoveredStep === index && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-popover border rounded-lg p-3 shadow-lg z-10 w-48">
                      <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Process steps list for mobile */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:hidden">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center p-4 rounded-lg border bg-card">
                <div className="text-3xl mb-2">{step.icon}</div>
                <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
