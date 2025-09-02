const processSteps = [
  { title: "Build", icon: "🛠️", desc: "Ship vertical slice quickly" },
  { title: "Measure", icon: "📊", desc: "Mixpanel & SQL" },
  { title: "Learn", icon: "🧠", desc: "Rapid user feedback loops" },
  { title: "Launch", icon: "🚀", desc: "Scale, iterate, market" },
]

export function ProcessWheel() {
  return (
    <section id="process" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">My Process</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A proven framework for shipping products that users love
          </p>
        </div>

        <div className="relative">
          {/* SVG Wheel placeholder */}
          <div className="w-80 h-80 mx-auto mb-12 border-2 border-dashed border-muted-foreground/30 rounded-full flex items-center justify-center">
            <span className="text-muted-foreground">Process Wheel SVG</span>
          </div>

          {/* Process steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center p-6 rounded-lg border bg-card">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
