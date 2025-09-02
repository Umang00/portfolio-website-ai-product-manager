"use client"

import { useState } from "react"

const beltTools = [
  { name: "React", icon: "⚛️" },
  { name: "Next.js", icon: "▲" },
  { name: "TypeScript", icon: "📘" },
  { name: "Python", icon: "🐍" },
  { name: "Figma", icon: "🎨" },
  { name: "Mixpanel", icon: "📊" },
  { name: "Supabase", icon: "🗄️" },
  { name: "Vercel", icon: "▲" },
  { name: "PostgreSQL", icon: "🐘" },
  { name: "Docker", icon: "🐳" },
  { name: "AWS", icon: "☁️" },
  { name: "Stripe", icon: "💳" },
  { name: "Linear", icon: "📋" },
  { name: "Notion", icon: "📝" },
  { name: "Slack", icon: "💬" },
  { name: "GitHub", icon: "🐙" },
]

const categorizedTools = {
  Frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
  Backend: ["Node.js", "Python", "PostgreSQL", "Supabase", "Prisma"],
  Design: ["Figma", "Adobe Creative Suite", "Sketch", "Principle"],
  Analytics: ["Mixpanel", "Google Analytics", "Amplitude", "PostHog"],
  DevOps: ["Vercel", "AWS", "Docker", "GitHub Actions"],
  Product: ["Linear", "Notion", "Miro", "Slack", "Zoom"],
}

export function ToolsRing() {
  const [isPaused, setIsPaused] = useState(false)

  return (
    <section id="tools" className="py-20 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">My Toolkit</h2>
          <p className="text-lg text-muted-foreground">Technologies and tools I use to ship products</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Top belt - Left to Right */}
            <div
              className="overflow-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className={`flex gap-6 ${isPaused ? "" : "animate-scroll-left"}`}>
                {[...beltTools, ...beltTools].map((tool, index) => (
                  <div key={index} className="flex-none bg-card rounded-lg p-4 border min-w-[120px] text-center">
                    <div className="text-2xl mb-2">{tool.icon}</div>
                    <span className="text-sm font-medium">{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom belt - Right to Left */}
            <div
              className="overflow-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className={`flex gap-6 ${isPaused ? "" : "animate-scroll-right"}`}>
                {[...beltTools.slice().reverse(), ...beltTools.slice().reverse()].map((tool, index) => (
                  <div key={index} className="flex-none bg-card rounded-lg p-4 border min-w-[120px] text-center">
                    <div className="text-2xl mb-2">{tool.icon}</div>
                    <span className="text-sm font-medium">{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(categorizedTools).map(([category, tools]) => (
              <div key={category} className="bg-card rounded-lg p-4 border">
                <h3 className="font-semibold mb-3 text-primary">{category}</h3>
                <div className="space-y-2">
                  {tools.map((tool, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {tool}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
