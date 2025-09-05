import { CLIENT_LOGOS } from "@/data/logos"

export function ClientLogos() {
  return (
    <section id="clients" className="py-20 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted By</h2>
          <p className="text-lg text-muted-foreground">Companies I've helped build and scale products</p>
        </div>

        <div className="relative overflow-hidden group">
          {/* Marquee track with duplicated logos for seamless loop */}
          <div className="flex items-center gap-10 will-change-transform animate-[marquee_18s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
            {/* First set of logos */}
            {CLIENT_LOGOS.map((client, index) => (
              <div key={`first-${index}`} className="shrink-0 flex items-center justify-center h-16 min-w-[180px] px-6">
                {client.href ? (
                  <a
                    href={client.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${client.name}`}
                    className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                  >
                    <img
                      src={client.src || "/placeholder.svg"}
                      alt={client.name}
                      aria-label={client.name}
                      className="h-10 w-auto object-contain filter grayscale opacity-70 saturate-75 transition-all duration-200 group-hover:opacity-80 hover:grayscale-0 hover:opacity-100 hover:saturate-100"
                    />
                  </a>
                ) : (
                  <img
                    src={client.src || "/placeholder.svg"}
                    alt={client.name}
                    aria-label={client.name}
                    className="h-10 w-auto object-contain filter grayscale opacity-70 saturate-75 transition-all duration-200 group-hover:opacity-80 hover:grayscale-0 hover:opacity-100 hover:saturate-100"
                  />
                )}
              </div>
            ))}

            {/* Duplicate set for seamless loop - hidden on reduced motion */}
            <div className="contents motion-reduce:hidden">
              {CLIENT_LOGOS.map((client, index) => (
                <div
                  key={`second-${index}`}
                  className="shrink-0 flex items-center justify-center h-16 min-w-[180px] px-6"
                >
                  {client.href ? (
                    <a
                      href={client.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit ${client.name}`}
                      className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                    >
                      <img
                        src={client.src || "/placeholder.svg"}
                        alt={client.name}
                        aria-label={client.name}
                        className="h-10 w-auto object-contain filter grayscale opacity-70 saturate-75 transition-all duration-200 group-hover:opacity-80 hover:grayscale-0 hover:opacity-100 hover:saturate-100"
                      />
                    </a>
                  ) : (
                    <img
                      src={client.src || "/placeholder.svg"}
                      alt={client.name}
                      aria-label={client.name}
                      className="h-10 w-auto object-contain filter grayscale opacity-70 saturate-75 transition-all duration-200 group-hover:opacity-80 hover:grayscale-0 hover:opacity-100 hover:saturate-100"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
