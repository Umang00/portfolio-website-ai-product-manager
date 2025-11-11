"use client"

import { useMemo } from "react"
import { Search, Target, Lightbulb, Rocket, RefreshCw } from "lucide-react"
import { AnimatedCard } from "@/components/animations/animated-card"
import { ScrollReveal, ScrollRevealList, ScrollRevealItem } from "@/components/animations/scroll-reveal"

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
        <ScrollReveal variant="fadeInUp" delay={0.2}>
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">My Process</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A proven framework for shipping products that users love
          </p>
        </div>
        </ScrollReveal>

        {/* Desktop / tablet wheel */}
        <ScrollReveal variant="scaleIn" delay={0.4} duration={0.8}>
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

                  {/* node positioned at exact distance from center */}
                  <div
                    className="absolute"
                    style={{ 
                      left: `calc(50% + ${iconX}px)`,
                      top: `calc(50% + ${iconY}px)`,
                    }}
                  >
                    <AnimatedCard
                      variant="all" // Full effects like other sections
                      enable3D={false} // Disable 3D effects for circular layout
                      enableMouseFollow={false} // Disable mouse follow for circular layout
                      className="flex flex-col items-center text-center -translate-x-1/2 -translate-y-1/2 bg-transparent border-0 shadow-none"
                      style={{ width: NODE_WIDTH }}
                    >
                      <div className="w-14 h-14 rounded-full border border-muted-foreground/40 bg-card flex items-center justify-center shadow-sm">
                        <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                      </div>
                      <div className="mt-3 font-semibold">{title}</div>
                      <div className="mt-1 text-sm text-muted-foreground leading-snug">{desc}</div>
                    </AnimatedCard>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        </ScrollReveal>

        {/* Mobile list */}
        <div className="md:hidden">
          <ScrollRevealList staggerDelay={0.1} delayChildren={0.3}>
            <ol className="space-y-4 max-w-2xl mx-auto">
          {STEPS.map(({ title, desc, Icon }, i) => (
            <ScrollRevealItem key={title}>
              <AnimatedCard
                as="li"
                variant="all" // Full effects like other sections
                className="p-4 rounded-xl border bg-card"
              >
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
              </AnimatedCard>
            </ScrollRevealItem>
          ))}
        </ol>
          </ScrollRevealList>
        </div>
      </div>
    </section>
  )
}
