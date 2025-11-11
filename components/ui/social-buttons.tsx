"use client"

import { Github, Linkedin, FileText, Mail, MessageCircle, Calendar } from "lucide-react"

type CommonProps = {
  className?: string
}

// LinkedIn button
export function LinkedInButton({ className = "" }: CommonProps) {
  return (
    <a
      href="https://www.linkedin.com/in/umang-thakkar-90a4a5164/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="LinkedIn"
      className={[
        "group inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border",
        "bg-card text-white transition-colors",
        "hover:bg-[#0A66C2]/10 focus-visible:ring-2 focus-visible:ring-[#0A66C2]/40",
        className,
      ].join(" ")}
    >
      <Linkedin className="h-6 w-6 transition-colors group-hover:text-[#0A66C2]" />
    </a>
  )
}

// GitHub button
export function GitHubButton({ className = "" }: CommonProps) {
  return (
    <a
      href="https://github.com/Umang00"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
      className={[
        "group inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border",
        "bg-card text-white transition-colors",
        "hover:bg-white hover:text-black dark:hover:bg-white dark:hover:text-black",
        "focus-visible:ring-2 focus-visible:ring-foreground/30",
        className,
      ].join(" ")}
    >
      <Github className="h-6 w-6 transition-transform group-hover:scale-[1.05]" />
    </a>
  )
}

// Resume button
export function ResumeButton({ className = "" }: CommonProps) {
  return (
    <a
      href="/resume.pdf"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Resume"
      className={[
        "group inline-flex h-12 items-center gap-2 rounded-xl border border-border px-5",
        "bg-card text-white transition-colors",
        "hover:bg-amber-400 hover:text-black",
        "focus-visible:ring-2 focus-visible:ring-amber-500/40",
        className,
      ].join(" ")}
    >
      <FileText className="h-5 w-5" />
      <span className="text-base font-medium">Resume</span>
    </a>
  )
}

// Email button - icon only version for use inside other buttons
export function EmailButton({ className = "" }: CommonProps) {
  return (
    <div
      aria-label="Email"
      className={[
        "group inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border",
        "bg-card text-white transition-colors pointer-events-none",
        className,
      ].join(" ")}
    >
      <Mail className="h-6 w-6 transition-colors text-[#EA4335]" />
    </div>
  )
}

// WhatsApp button - icon only version for use inside other buttons
export function WhatsAppButton({ className = "" }: CommonProps) {
  return (
    <div
      aria-label="WhatsApp"
      className={[
        "group inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border",
        "bg-card text-white transition-colors pointer-events-none",
        className,
      ].join(" ")}
    >
      <MessageCircle className="h-6 w-6 transition-colors text-[#25D366]" />
    </div>
  )
}

// Calendar button - icon only version for use inside other buttons
export function CalendarButton({ 
  className = "", 
  onClick 
}: CommonProps & { onClick?: () => void }) {
  // When onClick is provided, render as a div (for use inside button wrappers)
  // When not provided, render as anchor
  if (onClick) {
    return (
      <div
        aria-label="Book a Call"
        className={[
          "group inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border",
          "bg-card text-white transition-colors pointer-events-none",
          className,
        ].join(" ")}
      >
        <Calendar className="h-6 w-6 transition-colors text-[#006BFF]" />
      </div>
    )
  }
  
  return (
    <a
      href="#contact"
      aria-label="Book a Call"
      className={[
        "group inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border",
        "bg-card text-white transition-colors",
        "hover:bg-[#006BFF]/10 focus-visible:ring-2 focus-visible:ring-[#006BFF]/40",
        className,
      ].join(" ")}
    >
      <Calendar className="h-6 w-6 transition-colors group-hover:text-[#006BFF]" />
    </a>
  )
}
