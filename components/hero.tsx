"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Github, Linkedin, ArrowUp } from "lucide-react"
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

      <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
        <Badge variant="secondary" className="text-sm px-4 py-2 transition-all duration-300">
          {greetings[currentGreeting]}
        </Badge>

        <div className="relative mx-auto mb-10 w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80">
  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-2xl" />
  <img
    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-dxvhPKosIlqvIAJZ0Ws5WpYwpJFVdU.png"
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
  AI Product Manager focused on data-driven growth and user delight
</p>

        </div>

        <div className="relative w-full max-w-3xl mx-auto">

          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
              placeholder="Ask me anything..."
              className="pl-12 pr-16 h-16 text-lg rounded-2xl border-2 w-full hover:border-primary/50 focus:border-primary transition-all duration-300"
        />

          <Button
  size="icon"
  variant="ghost"
  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
>
  <ArrowUp className="h-5 w-5" />
</Button>

        </div>

        <div className="flex justify-center gap-6">
          <Button variant="outline" size="lg" className="h-14 w-14 rounded-2xl bg-transparent" asChild>
            <a href="https://www.linkedin.com/in/umang-thakkar-90a4a5164/" target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-6 w-6" />
            </a>
          </Button>
          <Button variant="outline" size="lg" className="h-14 w-14 rounded-2xl bg-transparent" asChild>
            <a href="https://github.com/Umang00" target="_blank" rel="noopener noreferrer">
              <Github className="h-6 w-6" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
