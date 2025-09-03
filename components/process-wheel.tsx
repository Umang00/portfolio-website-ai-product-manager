"use client"

import { useMemo } from "react"
import { Search, Goal, ShieldCheck, Rocket, BarChart3 } from "lucide-react"

type Step = {
  title: string
  desc: string
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const STEPS: Step[] = [
  { title: "Discover",        desc: "Talk to users, audit data, map jobs-to-be-done.",                     Icon: Search },
  { title: "Define",          desc: "Frame problem, success metrics, guardrails (lean PRD/PR-FAQ).",      Icon: Goal },
  { title: "De-risk",         desc: "Prototype/MVP to test riskiest assumptions before scaling.",         Icon: ShieldCheck },
  { title: "Deliver",         desc: "Build vertical slices, feature-flag, roll out gradually.",           Icon: Rocket },
  { title: "Measure & Learn", desc: "Mixpanel/SQL + surveys → insights → next bets.",                     Icon: BarChart3 },
]

/** Layout constants */
const RADIUS = 170                 // inner circle radius (340px diameter)
const NODE_OFFSET = 150            // uniform distance from orbit edge to node (same for all five)
const ICON_DIAM = 56               // w-14 h-14 => 56px
const CONNECTOR_GAP = 12           // small gap so connector ends just before the icon
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
        </div>

        {/* Desktop / tablet wheel */}
        <div className="relative hidden md:block">
          <div
            className="relative mx-auto mt-2 mb-10"
            style={{ width: `${RADIUS * 2}px`, height: `${RADIUS * 2}px` }}
          >
            {/* Full-bleed portrait / safe placeholder */}
            <div className="absolute inset-0 rounded-full overflow-hidden shadow-xl bg-muted/20">
              {/* Put your photo in /public and update src below.
                 Leave alt empty so missing images don't render text on top. */}
              <img
                src="/umang-whiteboard.jpg"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* Dashed orbit */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground/30 pointer-events-none" />

            {/* Nodes */}
            {polar.map(({ angle, angleDeg }, i) => {
              const { Icon, title, desc } = STEPS[i]

              // Point on orbit edge
              const x = Math.cos(angle) * RADIUS
              const y = Math.sin(angle) * RADIUS

              // Node position (equal offset for all)
              const nx = Math.cos(angle) * (RADIUS + NODE_OFFSET)
              const ny = Math.sin(angle) * (RADIUS + NODE_OFFSET)

              // Connector length: from orbit edge toward node, stop before icon
              const connectorLen = Math.max(44, NODE_OFFSET - ICON_DIAM / 2 - CONNECTOR_GAP)

              return (
                <div key={title}>
                  {/* connector from orbit edge to just before the icon */}
                  <div
                    className="absolute left-1/2 top-1/2 origin-left border-t border-dashed border-muted-foreground/30"
                    style={{
                      width: `${connectorLen}px`,
                      transform: `translate(${x}px, ${y}px) rotate(${angleDeg}deg)`,
                    }}
                    aria-hidden="true"
                  />

                  {/* node */}
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ transform: `translate(${nx}px, ${ny}px)` }}
                  >
                    <div className="flex flex-col items-center text-center" style={{ width: NODE_WIDTH }}>
                      <div className="w-14 h-14 rounded-full border border-muted-foreground/40 bg-card flex items-center justify-center shadow-sm">
                        <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                      </div>
                      <div className="mt-3 font-semibold">{title}</div>
                      <div className="mt-1 text-sm text-muted-foreground leading-snug">{desc}</div>
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
