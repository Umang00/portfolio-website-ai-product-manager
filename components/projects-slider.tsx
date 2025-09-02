import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github } from "lucide-react"

const projects = [
  {
    title: "Dating App MVP",
    description: "AI-powered matching platform with real-time chat and video calls",
    image: "/placeholder.svg?height=400&width=600",
    kpi: "3.2× Match Rate",
    github: "https://github.com",
    live: "https://example.com",
    video: "https://example.com/video.mp4",
  },
  {
    title: "Polling Platform",
    description: "Scalable real-time polling system with analytics dashboard",
    image: "/placeholder.svg?height=400&width=600",
    kpi: "100k+ Polls",
    github: "https://github.com",
    live: "https://example.com",
    video: "https://example.com/video.mp4",
  },
  {
    title: "Analytics Suite",
    description: "Comprehensive product analytics with custom event tracking",
    image: "/placeholder.svg?height=400&width=600",
    kpi: "40+ Features",
    github: "https://github.com",
    live: "https://example.com",
    video: "https://example.com/video.mp4",
  },
]

export function ProjectsSlider() {
  return (
    <section id="projects" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Deep dives into products I've shipped from 0 to 1
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div key={index} className="group relative bg-card rounded-lg border overflow-hidden">
              <div className="relative">
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="sm" variant="secondary" asChild>
                    <a href={project.github} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button size="sm" variant="secondary" asChild>
                    <a href={project.live} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <Badge variant="default">{project.kpi}</Badge>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
