const timelineItems = [
  {
    title: "About Me",
    date: "Present",
    description:
      "AI Product Manager passionate about building products that scale. 6+ years of experience shipping features that users love.",
    image: "/placeholder.svg?height=200&width=300",
    isAbout: true,
  },
  {
    title: "Senior Product Manager",
    date: "2022 - Present",
    description:
      "Leading AI-powered matching algorithms and growth initiatives. Increased user engagement by 3.2x through data-driven product decisions.",
    company: "TechCorp",
  },
  {
    title: "Product Manager",
    date: "2020 - 2022",
    description:
      "Built and scaled polling platform from 0 to 100k+ daily active users. Designed comprehensive analytics suite with 40+ features.",
    company: "StartupXYZ",
  },
  {
    title: "Associate Product Manager",
    date: "2018 - 2020",
    description:
      "Started my PM journey building user-facing features and learning the craft of product management through rapid iteration cycles.",
    company: "InnovateLab",
  },
]

export function Timeline() {
  return (
    <section id="about" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">My Journey</h2>
          <p className="text-lg text-muted-foreground">The path that led me to product management</p>
        </div>

        <div className="space-y-8">
          {timelineItems.map((item, index) => (
            <div key={index} className="flex gap-6 group">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-primary rounded-full border-4 border-background ring-4 ring-primary/20"></div>
                {index < timelineItems.length - 1 && <div className="w-0.5 h-16 bg-border mt-4"></div>}
              </div>

              <div className="flex-1 pb-8">
                <div className="bg-card rounded-lg p-6 border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      {item.company && <p className="text-primary font-medium">{item.company}</p>}
                    </div>
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">{item.date}</span>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>

                  {item.image && (
                    <div className="mt-4">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full max-w-sm rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
