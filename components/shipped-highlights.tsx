import { Badge } from "@/components/ui/badge"
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
]

export function ShippedHighlights() {
  return (
    <section id="highlights" className="py-20 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shipped Highlights</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Products I've built that delivered measurable impact
          </p>
        </div>

        {/* Slider container */}
        <div className="relative overflow-hidden">
          <div className="flex gap-6 pb-4">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex-none w-80 bg-card rounded-lg p-6 border">
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
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
