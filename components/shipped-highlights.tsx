"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"

type Highlight =
  | {
      title: string
      metric: string
      image: string
      description: string
      bullets?: never
    }
  | {
      title: string
      metric: string
      image: string
      description?: never
      bullets: string[]
    }

// ------- DUMMY DATA (unchanged) -------
const highlights: Highlight[] = [
  {
    title: "AI Matching Algorithm",
    bullets: ["Redesigned checkout for clarity and trust", "A/B tests lifted CVR by 45%"],
    metric: "3.2× Match Rate",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    title: "Real-time Polling System",
    description: "Built scalable polling infrastructure handling 100k+ daily interactions",
    metric: "100k+ Polls",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    title: "Growth Analytics Platform",
    description: "Designed comprehensive analytics suite for product decision making",
    metric: "40+ Features",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    title: "E-commerce Optimization",
    description: "Improved conversion rates by 45% through UX redesign and A/B testing",
    metric: "45% CVR Boost",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    title: "Mobile App Performance",
    description: "Reduced app load time by 60% through code optimization and caching",
    metric: "60% Faster",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    title: "API Infrastructure",
    description: "Built high-performance API serving 1M+ requests daily with 99.9% uptime",
    metric: "1M+ Requests",
    image: "/placeholder.svg?height=300&width=400",
  },
]

// ------- SMALL PRESENTATIONAL PIECES -------
function Card({ h }: { h: Highlight }) {
  return (
    <article className="bg-card rounded-xl border overflow-hidden h-full w-full">
      <img src={h.image || "/placeholder.svg"} alt={h.title} className="w-full h-64 object-cover" />
      <div className="p-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold">{h.title}</h3>
          <Badge variant="secondary" className="shrink-0">{h.metric}</Badge>
        </div>

        {"bullets" in h && h.bullets ? (
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            {h.bullets.map((b, i) => (
              <li key={i} className="leading-relaxed">{b}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground leading-relaxed">
            {("description" in h && h.description) || ""}
          </p>
        )}
      </div>
    </article>
  )
}

export function ShippedHighlights() {
  // Build pairs: [0,1], [2,3], [4,5], …
  const pairs = useMemo(() => {
    const out: Highlight[][] = []
    for (let i = 0; i < highlights.length; i += 2) {
      out.push(highlights.slice(i, i + 2))
    }
    return out
  }, [])

  const [current, setCurrent] = useState(0)
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    loop: false,
    rubberband: false,
    renderMode: "precision",
    slides: { perView: 1, spacing: 24 }, // one "pair" per step
    slideChanged(s) {
      setCurrent(s.track.details.rel)
    },
  })

  // Autoplay until last pair; pause on hover/drag
  useEffect(() => {
    const slider = instanceRef.current
    if (!slider) return

    const AUTOPLAY_MS = 2400
    let timer: ReturnType<typeof setInterval> | null = null
    let paused = false

    const play = () => {
      stop()
      timer = setInterval(() => {
        const det = slider.track.details
        if (det.rel < det.maxIdx) slider.next()
        else stop()
      }, AUTOPLAY_MS)
    }
    const stop = () => { if (timer) clearInterval(timer as any); timer = null }

    const el = slider.container
    const onOver = () => { paused = true; stop() }
    const onOut = () => { paused = false; play() }

    el.addEventListener("mouseover", onOver)
    el.addEventListener("mouseout", onOut)
    slider.on("dragStarted", stop)
    slider.on("animationEnded", () => { if (!paused) play() })
    slider.on("updated", () => { if (!paused) play() })

    play()
    return () => {
      stop()
      el.removeEventListener("mouseover", onOver)
      el.removeEventListener("mouseout", onOut)
    }
  }, [instanceRef])

  const atStart = current === 0
  const atEnd = !!instanceRef.current && current >= instanceRef.current.track.details.maxIdx

  return (
    <section id="highlights" className="py-20 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shipped Highlights</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Products I've built that delivered measurable impact
          </p>
        </div>

        {/* Give room for outside arrows so they are equidistant from cards */}
        <div className="relative px-12">
          <div ref={sliderRef} className="keen-slider">
            {pairs.map((pair, idx) => (
              <div key={idx} className="keen-slider__slide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* On mobile we only show the first card of the pair */}
                  <Card h={pair[0]} />
                  {pair[1] && <Card h={pair[1]} />}
                </div>
              </div>
            ))}
          </div>

          {/* Arrows outside the rail, same offset each side */}
          <Button
            variant="outline"
            size="icon"
            className="absolute -left-6 md:-left-8 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
            onClick={() => instanceRef.current?.prev()}
            disabled={atStart}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute -right-6 md:-right-8 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
            onClick={() => instanceRef.current?.next()}
            disabled={atEnd}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Dots */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {pairs.map((_, i) => (
              <button
                key={i}
                onClick={() => instanceRef.current?.moveToIdx(i)}
                className={`h-2 w-2 rounded-full transition ${
                  i === current ? "bg-foreground" : "bg-foreground/30"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
