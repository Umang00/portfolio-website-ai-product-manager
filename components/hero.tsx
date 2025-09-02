"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Github, Linkedin, Send } from "lucide-react"
import { Typewriter } from "react-simple-typewriter"

const greetings = ["Hey there!", "Welcome!", "Hello!", "Hi!"]

export function Hero() {
  const [currentGreeting, setCurrentGreeting] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGreeting((prev) => (prev + 1) % greetings.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

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

      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        <Badge variant="secondary" className="text-sm px-4 py-2 transition-all duration-300">
          {greetings[currentGreeting]}
        </Badge>

        <div className="w-32 h-32 mx-auto mb-6">
          <img
            src="/placeholder.svg?height=128&width=128"
            alt="Umang Thakkar"
            className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg transition-all duration-500 hover:grayscale-0 grayscale"
          />
        </div>

        <div className="space-y-4">
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
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance animate-in fade-in duration-1000 delay-500">
            AI Product Manager focused on data-driven growth and user delight
          </p>
        </div>

        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Ask me anything..." className="pl-10 pr-12 h-12 text-center" />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <a href="https://www.linkedin.com/in/umang-thakkar-90a4a5164/" target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a href="https://github.com/Umang00" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
