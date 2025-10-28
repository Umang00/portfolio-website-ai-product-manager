"use client"

import { useMemo } from "react"
import { Search, Target, Lightbulb, Rocket, RefreshCw } from "lucide-react"

type Step = {
  title: string
  desc: string
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const STEPS: Step[] = [
  { title: "Discover",  desc: "Ground every decision in user truth through conversations, data analysis, and jobs-to-be-done mapping.", Icon: Search },
  { title: "Define",    desc: "Translate ambiguity into clarity with crisp problem statements, success metrics, and guardrails.",        Icon: Target },
  { title: "Prototype", desc: "Test the riskiest assumptions early with MVPs and experiments before committing to scale.",              Icon: Lightbulb },
  { title: "Ship",      desc: "Deliver value iteratively using vertical slices and feature flags to learn fast and reduce risk.",       Icon: Rocket },
  { title: "Iterate",   desc: "Turn metrics and user feedback into insights that drive continuous improvement and impact.",             Icon: RefreshCw },
]

/** Layout constants */
const RADIUS = 170                 // inner circle radius (340px diameter)
const ICON_RADIUS = 320            // distance from center to icon center (equal for all)
const ICON_DIAM = 56               // w-14 h-14 => 56px
const CONNECTOR_GAP = 8            // small gap so connector ends just before the icon
const NODE_WIDTH = 232             // text block width

// Arc: start near upper-right, sweep across bottom to upper-left (no node at top).
const START_DEG = -20
const SPAN_DEG  = 220

const toRad = (deg: number) => (deg * Math.PI) / 180

export function ProcessWheel() {
  const polar = useMemo(() => {
    const n = STEPS.length
    return Array.from({ length: n }).map((_, i) => {
      const angleDeg = START_DEG + (i * SPAN_DEG) / (n - 1)
      return { angleDeg, angle: toRad(angleDeg) }
    })
  }, [])

  return (
    <section id="process" className="px-4 pt-24 pb-52 md:pt-28 md:pb-60">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">My Process</h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            A proven framework for shipping products that users love
          </p>
          <p className="text-sm md:text-base text-muted-foreground/80 max-w-2xl mx-auto mt-2 italic">
            Great products emerge from ruthless iteration, not perfect planning
          </p>
        </div>

        {/* Desktop / tablet wheel */}
        <div className="relative hidden md:block">
          <div
            className="relative mx-auto mt-2 mb-10"
            style={{ width: `${RADIUS * 2}px`, height: `${RADIUS * 2}px` }}
          >
            {/* Full-bleed portrait / safe placeholder */}
            <div className="absolute inset-0 rounded-full overflow-hidden shadow-xl bg-muted/20">
              <img
                src="/umang-profile.png"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* Dashed orbit */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground/30 pointer-events-none" />

            {/* Nodes */}
            {polar.map(({ angle, angleDeg }, i) => {
              const { Icon, title, desc } = STEPS[i]

              // Point on orbit edge (where connector starts)
              const orbitX = Math.cos(angle) * RADIUS
              const orbitY = Math.sin(angle) * RADIUS

              // Icon center position (equal distance from center for all)
              const iconX = Math.cos(angle) * ICON_RADIUS
              const iconY = Math.sin(angle) * ICON_RADIUS

              // Connector length: from orbit edge to icon edge (not center)
              const connectorLen = ICON_RADIUS - RADIUS - ICON_DIAM / 2 - CONNECTOR_GAP

              return (
                <div key={title}>
                  {/* connector from orbit edge to icon edge */}
                  <div
                    className="absolute left-1/2 top-1/2 origin-left border-t border-dashed border-muted-foreground/30"
                    style={{
                      width: `${connectorLen}px`,
                      transform: `translate(${orbitX}px, ${orbitY}px) rotate(${angleDeg}deg)`,
                    }}
                    aria-hidden="true"
                  />

                  {/* icon positioned at exact distance from center */}
                  <div
                    className="absolute left-1/2 top-1/2"
                    style={{ transform: `translate(${iconX}px, ${iconY}px)` }}
                  >
                    <div className="flex flex-col items-center text-center" style={{ width: NODE_WIDTH }}>
                      <div className="w-14 h-14 rounded-full border border-muted-foreground/40 bg-card flex items-center justify-center shadow-sm -translate-x-1/2 -translate-y-1/2">
                        <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                      </div>
                      <div className="mt-3 font-semibold -translate-x-1/2">{title}</div>
                      <div className="mt-1 text-sm text-muted-foreground leading-snug -translate-x-1/2">{desc}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile list */}
        <ol className="md:hidden space-y-4 max-w-2xl mx-auto">
          {STEPS.map(({ title, desc, Icon }, i) => (
            <li key={title} className="p-4 rounded-xl border bg-card">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-10 h-10 rounded-full border border-muted-foreground/40 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">
                    {i + 1}. {title}
                  </div>
                  <div className="text-sm text-muted-foreground">{desc}</div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
