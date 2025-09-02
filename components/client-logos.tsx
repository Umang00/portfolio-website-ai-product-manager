const clientLogos = [
  { name: "TechCorp", logo: "/placeholder.svg?height=60&width=120" },
  { name: "StartupXYZ", logo: "/placeholder.svg?height=60&width=120" },
  { name: "InnovateLab", logo: "/placeholder.svg?height=60&width=120" },
  { name: "DataFlow", logo: "/placeholder.svg?height=60&width=120" },
  { name: "CloudTech", logo: "/placeholder.svg?height=60&width=120" },
  { name: "AIVentures", logo: "/placeholder.svg?height=60&width=120" },
]

export function ClientLogos() {
  return (
    <section id="clients" className="py-20 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted By</h2>
          <p className="text-lg text-muted-foreground">Companies I've helped build and scale products</p>
        </div>

        {/* Logo marquee container */}
        <div className="relative overflow-hidden">
          <div className="flex gap-12 items-center justify-center flex-wrap">
            {clientLogos.map((client, index) => (
              <div key={index} className="flex-none grayscale hover:grayscale-0 transition-all duration-300">
                <img
                  src={client.logo || "/placeholder.svg"}
                  alt={client.name}
                  className="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
