"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"

const highlights = [
  {
    title: "AI Matching Algorithm",
    description: "Increased match rates by 3.2x using ML-powered compatibility scoring",
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

export function ShippedHighlights() {
  const [sliderRef, instanceRef] = useKeenSlider(
    {
      loop: true,
      mode: "free",
      slides: {
        perView: "auto",
        spacing: 24,
      },
      created(s) {
        s.moveToIdx(0, true, {
          duration: 0,
        })
      },
    },
    [
      (slider) => {
        let timeout: ReturnType<typeof setTimeout>
        let mouseOver = false

        function clearNextTimeout() {
          clearTimeout(timeout)
        }

        function nextTimeout() {
          clearTimeout(timeout)
          if (mouseOver) return
          timeout = setTimeout(() => {
            slider.next()
          }, 3000)
        }

        slider.on("created", () => {
          slider.container.addEventListener("mouseover", () => {
            mouseOver = true
            clearNextTimeout()
          })
          slider.container.addEventListener("mouseout", () => {
            mouseOver = false
            nextTimeout()
          })
          nextTimeout()
        })

        slider.on("dragStarted", clearNextTimeout)
        slider.on("animationEnded", nextTimeout)
        slider.on("updated", nextTimeout)
      },
    ],
  )

  return (
    <section id="highlights" className="py-20 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shipped Highlights</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Products I've built that delivered measurable impact
          </p>
        </div>

        <div className="relative">
          <div ref={sliderRef} className="keen-slider">
            {highlights.map((highlight, index) => (
              <div key={index} className="keen-slider__slide min-w-80 max-w-80">
                <div className="bg-card rounded-lg p-6 border h-full">
                  <img
                    src={highlight.image || "/placeholder.svg"}
                    alt={highlight.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">{highlight.title}</h3>
                      <Badge variant="secondary">{highlight.metric}</Badge>
                    </div>
                    <p className="text-muted-foreground">{highlight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
            onClick={() => instanceRef.current?.prev()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
            onClick={() => instanceRef.current?.next()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
