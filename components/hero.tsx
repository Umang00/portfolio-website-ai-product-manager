"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ArrowUp } from "lucide-react"
import { Typewriter } from "react-simple-typewriter"
import { LinkedInButton, GitHubButton, ResumeButton } from "@/components/ui/social-buttons"
import { ChatOverlay } from "@/components/ai/chat-overlay"

const greetings = ["Hey there!", "Welcome!", "Hello!", "Hi!"]

export function Hero() {
  const [currentGreeting, setCurrentGreeting] = useState(0)
  const [query, setQuery] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGreeting((prev) => (prev + 1) % greetings.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    if (trimmedQuery) {
      setIsChatOpen(true)
      // The ChatOverlay will handle sending the query via initialQuery prop
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col justify-center items-center px-4 py-20 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.05'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
        <Badge variant="secondary" className="text-sm px-4 py-2 transition-all duration-300">
          {greetings[currentGreeting]}
        </Badge>

        <div className="relative mx-auto mb-10 w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80">
  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-2xl" />
  <img
    src="/umang-profile.png"
    alt="Umang Thakkar"
    className="absolute inset-0 w-full h-full rounded-full object-cover border-4 border-white shadow-2xl transition-all duration-500 hover:scale-105"
  />
</div>


        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-balance min-h-[120px] md:min-h-[180px]">
            I'm Umang — building products that{" "}
            <span className="text-primary">
              <Typewriter
                words={["ship", "scale", "monetize"]}
                loop={0}
                cursor
                cursorStyle="_"
                typeSpeed={100}
                deleteSpeed={50}
                delaySpeed={2000}
              />
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance mt-4 mb-8 animate-in fade-in duration-1000 delay-500">
  AI Product Manager focused on data-driven growth and user delight.
</p>

        </div>

        <form onSubmit={handleSubmit} className="relative w-full max-w-3xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="pl-12 pr-16 h-16 text-lg rounded-2xl border-2 w-full hover:border-primary/50 focus:border-primary transition-all duration-300"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={!query.trim()}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 disabled:opacity-50"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </form>

        <div className="flex justify-center gap-4">
          <LinkedInButton />
          <GitHubButton />
          <ResumeButton />
        </div>
      </div>

      {/* Full-page Chat Overlay */}
      <ChatOverlay
        open={isChatOpen}
        onClose={() => {
          setIsChatOpen(false)
          setQuery("")
        }}
        initialQuery={query}
      />
    </section>
  )
}
