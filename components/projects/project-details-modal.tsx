"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChatOverlay } from "@/components/ai/chat-overlay"
import { Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { highlightMetrics } from "@/lib/utils/highlight-metrics"
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
          {/* Visually hidden title for accessibility */}
          <DialogTitle className="sr-only">
            {project.title} - Project Details
          </DialogTitle>
          <div className="space-y-6">
            {/* Problem Section */}
            {project.problem && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Problem
                </h3>
                <p className="text-foreground leading-relaxed">
                  {highlightMetrics(project.problem)}
                </p>
              </div>
            )}

            {/* Solution/Approach Section */}
            {(project.detailedDescription || project.briefDescription) && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Solution
                </h3>
                <div className="space-y-4">
                  {(project.detailedDescription || project.briefDescription).split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-foreground leading-relaxed">
                      {highlightMetrics(paragraph.trim())}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Outcome Section */}
            {project.outcomeBullets && project.outcomeBullets.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Outcomes
                </h3>
                <ul className="list-disc list-inside space-y-2 text-foreground">
                  {project.outcomeBullets.map((bullet, index) => (
                    <li key={index}>{highlightMetrics(bullet)}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hover Details */}
            {project.hoverDetails && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Additional Details
                </h3>
                <p className="text-sm text-muted-foreground">
                  {highlightMetrics(project.hoverDetails)}
                </p>
              </div>
            )}

            {/* Technologies Section */}
            {project.technologies && project.technologies.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-lg font-semibold text-foreground">
                  Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
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
              </div>
            )}
          </div>

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

