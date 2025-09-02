import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const greetings = ["Hey there!", "Welcome!", "Hello!", "Hi!"]
const kpiChips = ["3.2× Match-rate", "100k+ Polls", "6 yrs PM", "40 Features"]

export function Hero() {
  return (
    <section id="hero" className="min-h-screen flex flex-col justify-center items-center px-4 py-20">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Greeting pill */}
        <Badge variant="secondary" className="text-sm px-4 py-2">
          {greetings[0]}
        </Badge>

        {/* Main heading */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-balance">I'm Umang, shipping products that scale</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            AI Product Manager focused on data-driven growth and user delight
          </p>
        </div>

        {/* AI Companion search bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Ask me anything..." className="pl-10 h-12 text-center" />
        </div>

        {/* KPI chips */}
        <div className="flex flex-wrap justify-center gap-3">
          {kpiChips.map((kpi, index) => (
            <Badge key={index} variant="outline" className="px-3 py-1">
              {kpi}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  )
}
