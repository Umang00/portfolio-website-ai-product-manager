"use client"

import { Button } from "@/components/ui/button"
import { Github, Linkedin, FileText } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const socialLinks = [
  { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/umang-thakkar-90a4a5164/" },
  { name: "GitHub", icon: Github, href: "https://github.com/Umang00" },
]

export function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true)

          const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

          if (!prefersReducedMotion) {
            const confetti = (await import("canvas-confetti")).default

            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.8 },
              zIndex: 9999,
            })
          }

          // Play chime if available
          const audio = document.getElementById("footer-chime") as HTMLAudioElement | null
          if (audio) {
            try {
              audio.volume = 0.3
              await audio.play()
            } catch {
              console.log("[footer] Autoplay blocked for chime")
            }
          }
        }
      },
      { threshold: 0.3 },
    )

    if (footerRef.current) {
      observer.observe(footerRef.current)
    }

    return () => observer.disconnect()
  }, [hasTriggered])

  return (
    <footer ref={footerRef} id="footer" className="py-20 px-4 bg-muted/50">
      <audio id="footer-chime" src="/sfx/chime.mp3" preload="auto" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              🎉 Congratulations — your search for the right PM ends here.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ⏳ The time is ticking — let’s stop searching and start building.
            </p>
          </div>

          {/* Social links */}
          <div className="flex justify-center gap-4">
            {socialLinks.map((link) => (
              <Button key={link.name} variant="outline" size="icon" asChild>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  <link.icon className="h-4 w-4" />
                  <span className="sr-only">{link.name}</span>
                </a>
              </Button>
            ))}
            <Button variant="outline" asChild>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault()
                  window.open("/resume.pdf", "_blank", "noopener,noreferrer")
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Resume
              </a>
            </Button>
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              © 2024 Umang Thakkar. Built with Next.js, Tailwind CSS, and lots of ☕
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
