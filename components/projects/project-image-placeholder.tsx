"use client"

import { Sparkles, Code, Rocket, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Project } from "./types"

interface ProjectImagePlaceholderProps {
  project: Project
  className?: string
}

// Generate a consistent color based on project title
function getProjectColor(title: string): string {
  const hash = title.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  
  const colors = [
    "from-blue-500/20 via-purple-500/20 to-pink-500/20",
    "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
    "from-orange-500/20 via-red-500/20 to-rose-500/20",
    "from-indigo-500/20 via-blue-500/20 to-purple-500/20",
    "from-green-500/20 via-emerald-500/20 to-teal-500/20",
    "from-violet-500/20 via-purple-500/20 to-fuchsia-500/20",
  ]
  
  return colors[Math.abs(hash) % colors.length]
}

// Get icon based on project title/keywords
function getProjectIcon(title: string) {
  const lowerTitle = title.toLowerCase()
  if (lowerTitle.includes("ai") || lowerTitle.includes("chatbot") || lowerTitle.includes("astrology")) {
    return Sparkles
  }
  if (lowerTitle.includes("matching") || lowerTitle.includes("personality")) {
    return Code
  }
  if (lowerTitle.includes("voice") || lowerTitle.includes("uxr")) {
    return Zap
  }
  return Rocket
}

export function ProjectImagePlaceholder({
  project,
  className,
}: ProjectImagePlaceholderProps) {
  const colorClass = getProjectColor(project.title)
  const Icon = getProjectIcon(project.title)
  
  return (
    <div
      className={cn(
        "relative w-full h-full flex items-center justify-center overflow-hidden",
        "bg-gradient-to-br",
        colorClass,
        className
      )}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:32px_32px] animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%,rgba(255,255,255,0.05))] bg-[length:64px_64px]" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-4 p-8 text-center">
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg">
            <Icon className="w-12 h-12 md:w-16 md:h-16 text-primary" />
          </div>
        </div>
        
        {/* Project Title */}
        <div className="space-y-2 max-w-xs">
          <h3 className="text-lg md:text-xl font-bold text-foreground drop-shadow-sm">
            {project.title}
          </h3>
        </div>
      </div>
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
    </div>
  )
}

