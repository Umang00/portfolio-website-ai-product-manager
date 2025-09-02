const tools = [
  { name: "React", icon: "⚛️" },
  { name: "Next.js", icon: "▲" },
  { name: "TypeScript", icon: "📘" },
  { name: "Python", icon: "🐍" },
  { name: "Figma", icon: "🎨" },
  { name: "Mixpanel", icon: "📊" },
  { name: "Supabase", icon: "🗄️" },
  { name: "Vercel", icon: "▲" },
]

export function ToolsRing() {
  return (
    <section id="tools" className="py-20 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">My Toolkit</h2>
          <p className="text-lg text-muted-foreground">Technologies and tools I use to ship products</p>
        </div>

        {/* Tools ring container */}
        <div className="relative w-80 h-80 mx-auto">
          <div className="absolute inset-0 border-2 border-dashed border-muted-foreground/30 rounded-full flex items-center justify-center">
            <span className="text-muted-foreground text-center">
              Tools Ring
              <br />
              <span className="text-sm">(8 icons orbiting)</span>
            </span>
          </div>

          {/* Static tool icons for now */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            {tools.map((tool, index) => (
              <div key={index} className="text-center p-4 rounded-lg border bg-card">
                <div className="text-2xl mb-2">{tool.icon}</div>
                <span className="text-sm font-medium">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
