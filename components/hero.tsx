"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Maximize, Mic, ArrowUp } from "lucide-react"
import { Typewriter } from "react-simple-typewriter"
import { LinkedInButton, GitHubButton, ResumeButton } from "@/components/ui/social-buttons"
import { ChatOverlay } from "@/components/ai/chat-overlay"
import { useSpeechInput } from "@/hooks/use-speech-input"
import { HeroStickyNotes } from "@/components/hero-sticky-notes"
import { ScrollReveal, ScrollRevealList, ScrollRevealItem } from "@/components/animations/scroll-reveal"

const greetings = ["Hey there!", "Welcome!", "Hello!", "Hi!"]

export function Hero() {
  const [currentGreeting, setCurrentGreeting] = useState(0)
  const [query, setQuery] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [interimInput, setInterimInput] = useState("") // For interim speech recognition results
  const pendingQueryRef = useRef<string | undefined>(undefined) // Track query to send when opening chat

  // Voice input hook
  const { listening, supported: speechSupported, start: startListening, stop: stopListening, error: speechError, permission: micPermission } = useSpeechInput({
    onResult: (text, isFinal) => {
      if (isFinal) {
        // Final result - append to existing input (like ChatOverlay)
        setQuery((prev) => {
          const baseText = prev.replace(/ \[listening:.*?\]$/, "").trim()
          return baseText ? baseText + " " + text : text
        })
        setInterimInput("") // Clear interim
        stopListening()
      } else {
        // Interim result - show what's being transcribed
        setInterimInput(text)
      }
    },
  })

  useEffect(() => {
    setIsMounted(true)
    const interval = setInterval(() => {
      setCurrentGreeting((prev) => (prev + 1) % greetings.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Handle speech recognition errors
  useEffect(() => {
    if (speechError) {
      console.warn("[Voice Input] Error:", speechError)
    }
  }, [speechError])

  const handleOpenChat = () => {
    // Stop listening if active
    if (listening) {
      stopListening()
      setInterimInput("")
    }
    setIsChatOpen(true)
    // Open without initialQuery to show welcome screen (query will be empty or undefined)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Use query value, or if interimInput exists, combine them
    const finalQuery = interimInput ? `${query} ${interimInput}`.trim() : query.trim()
    if (finalQuery) {
      // Clear interim input and update query with final value
      if (interimInput) {
        setQuery(finalQuery)
        setInterimInput("")
        pendingQueryRef.current = finalQuery
      } else {
        pendingQueryRef.current = finalQuery
      }
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

  const handleMicClick = () => {
    if (listening) {
      stopListening()
      setInterimInput("") // Clear interim when stopping
    } else {
      startListening()
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
        <ScrollReveal variant="fadeInDown" delay={0.2}>
          <Badge variant="secondary" className="text-sm px-4 py-2 transition-all duration-300 relative z-20">
            {greetings[currentGreeting]}
          </Badge>
        </ScrollReveal>

        <ScrollReveal variant="scaleIn" delay={0.6} duration={0.8}>
          <div className="relative mx-auto mb-10 w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 z-20 overflow-visible">
            {/* Sticky Notes positioned relative to profile image */}
            <HeroStickyNotes />
            
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-2xl" />
            <img
              src="/umang-profile.png"
              alt="Umang Thakkar"
              className="absolute inset-0 w-full h-full rounded-full object-cover border-4 border-white shadow-2xl transition-all duration-500 hover:scale-105"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fadeInUp" delay={0.4} duration={0.7}>
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-balance min-h-[120px] md:min-h-[180px]">
              I'm Umang — building products that{" "}
              <span className="text-primary">
                {isMounted ? (
                  <Typewriter
                    words={["ship", "scale", "monetize"]}
                    loop={0}
                    cursor
                    cursorStyle="_"
                    typeSpeed={100}
                    deleteSpeed={50}
                    delaySpeed={2000}
                  />
                ) : (
                  "ship"
                )}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance mt-4 mb-8">
              AI Product Manager focused on data-driven growth and user delight.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fadeInUp" delay={0.8} duration={0.6}>
          <form onSubmit={handleSubmit} className="relative w-full max-w-3xl mx-auto flex items-center gap-2">
            {/* Maximize Icon Button - Opens AI Companion page */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleOpenChat}
              className="h-12 w-12 rounded-xl bg-background border border-border hover:bg-muted transition-all duration-300 flex-shrink-0"
              title="Open AI Companion"
            >
              <Maximize className="h-5 w-5 text-foreground" />
            </Button>

            {/* Microphone Icon Button - Voice Input */}
            {speechSupported && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleMicClick}
                disabled={micPermission === "denied"}
                className={`h-12 w-12 rounded-xl bg-background border border-border hover:bg-muted transition-all duration-300 flex-shrink-0 ${
                  listening ? "bg-primary/10 text-primary border-primary/50" : ""
                } ${micPermission === "denied" ? "opacity-50 cursor-not-allowed" : ""}`}
                title={listening ? "Stop listening" : micPermission === "denied" ? "Microphone permission denied" : "Start voice input"}
              >
                <Mic className={`h-5 w-5 ${listening ? "text-primary" : "text-foreground"}`} />
              </Button>
            )}

            {/* Input Field */}
            <div className="relative flex-1">
              <Input
                value={interimInput ? (query ? `${query} ${interimInput}` : interimInput) : query}
                onChange={(e) => {
                  // Only update query if not showing interim input
                  if (!interimInput) {
                    setQuery(e.target.value)
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder={listening ? "Listening..." : "Ask me anything..."}
                className="h-16 text-lg rounded-2xl border-2 w-full hover:border-primary/50 focus:border-primary transition-all duration-300 pr-16"
                readOnly={!!interimInput}
              />
              {/* Submit Button */}
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                disabled={!query.trim() && !interimInput}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-xl bg-background border border-border hover:bg-muted transition-all duration-300 disabled:opacity-50"
              >
                <ArrowUp className="h-5 w-5 text-foreground" />
              </Button>
            </div>
          </form>
        </ScrollReveal>

        <ScrollRevealList staggerDelay={0.1} delayChildren={1.0}>
          <div className="flex justify-center gap-4">
            <ScrollRevealItem>
              <LinkedInButton />
            </ScrollRevealItem>
            <ScrollRevealItem>
              <GitHubButton />
            </ScrollRevealItem>
            <ScrollRevealItem>
              <ResumeButton />
            </ScrollRevealItem>
          </div>
        </ScrollRevealList>
      </div>

      {/* Full-page Chat Overlay */}
      <ChatOverlay
        open={isChatOpen}
        onClose={() => {
          setIsChatOpen(false)
          setQuery("")
          setInterimInput("")
          pendingQueryRef.current = undefined
          if (listening) {
            stopListening()
          }
        }}
        initialQuery={pendingQueryRef.current || (query.trim() || undefined)}
      />
    </section>
  )
}
