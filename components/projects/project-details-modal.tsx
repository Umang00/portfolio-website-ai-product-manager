"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChatOverlay } from "@/components/ai/chat-overlay"
import { Bot, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Project } from "./types"

interface ProjectDetailsModalProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectDetailsModal({
  project,
  open,
  onOpenChange,
}: ProjectDetailsModalProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Simplified AI query: "Tell me about [Project Title]. How was it built?"
  const aiQuery = `Tell me about ${project.title}. How was it built?`

  const handleAskAI = () => {
    // Close modal first, then open chat overlay
    onOpenChange(false)
    // Small delay to ensure modal closes before opening overlay
    setTimeout(() => {
      setIsChatOpen(true)
    }, 100)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{project.title}</DialogTitle>
          </DialogHeader>

          {/* Project Image */}
          {project.image && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted mb-4">
              <Image
                src={project.image}
                alt={project.imageAlt || project.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
          )}

          {/* Detailed Description */}
          {(project.detailedDescription || project.briefDescription) && (
            <div className="space-y-4">
              <p className="text-foreground leading-relaxed">
                {project.detailedDescription || project.briefDescription}
              </p>
            </div>
          )}

          {/* Bullets */}
          {project.bullets && project.bullets.length > 0 && (
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {project.bullets.map((bullet, index) => (
                <li key={index}>{bullet}</li>
              ))}
            </ul>
          )}

          {/* Hover Details */}
          {project.hoverDetails && (
            <p className="text-sm text-muted-foreground">
              {project.hoverDetails}
            </p>
          )}

          {/* Technologies (if present) */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <span className="text-sm font-medium text-muted-foreground w-full">
                Technologies:
              </span>
              {project.technologies.map((tech, index) => (
                <span
                  key={index}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm font-medium",
                    "bg-muted text-foreground"
                  )}
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Ask AI Companion Button */}
          <div className="pt-6 border-t">
            <Button
              variant="default"
              size="lg"
              onClick={handleAskAI}
              className="w-full"
              aria-label={`Ask AI Companion about ${project.title}`}
            >
              <Bot className="h-4 w-4 mr-2" />
              Ask AI Companion for More Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full-screen AI Companion - Rendered outside Dialog portal */}
      {isChatOpen && (
        <ChatOverlay
          open={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          initialQuery={aiQuery}
        />
      )}
    </>
  )
}

