"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Youtube, FileText } from "lucide-react"
import { ProjectDetailsModal } from "./project-details-modal"
import { AnimatedCard } from "@/components/animations/animated-card"
import { ProjectImagePlaceholder } from "./project-image-placeholder"
import { CloudinaryImage } from "./cloudinary-image"
import { cn } from "@/lib/utils"
import { highlightMetrics } from "@/lib/utils/highlight-metrics"
import type { Project } from "./types"

interface ProjectCardProps {
  project: Project
  priority?: boolean // For image priority loading
  showTechnologies?: boolean // Optional prop to show/hide technologies
}

export function ProjectCard({
  project,
  priority = false,
  showTechnologies = false, // Default to false (hidden)
}: ProjectCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const cardRef = useRef<HTMLElement | null>(null)

  // Determine which action buttons to show
  const hasDemo = project.hasDemo ?? (!!project.demoUrl && project.demoUrl.trim() !== "")
  const hasYoutube = project.hasYoutube ?? (!!project.youtubeUrl && project.youtubeUrl.trim() !== "")
  
  // Check if we should show placeholder (no image or image failed to load)
  const showPlaceholder = !project.image || imageError


  return (
    <>
      <AnimatedCard
        as="article"
        ref={cardRef}
        variant="all"
        enableMouseFollow={true}
        className={cn(
          "group relative bg-card rounded-lg border overflow-hidden",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          "flex flex-col" // Use flex column for better height control
        )}
        aria-label={`Project: ${project.title}. ${project.briefDescription}`}
      >
        {/* Project Image - Fills entire container */}
        <div className="relative w-full h-80 md:h-96 overflow-hidden bg-muted flex-shrink-0">
          {showPlaceholder ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <ProjectImagePlaceholder project={project} />
            </div>
          ) : (
            <div className="relative w-full h-full next-image-wrapper">
              <CloudinaryImage
                src={project.image}
                alt={project.imageAlt || project.title}
                fill
                className="object-contain object-center transition-transform duration-300 group-hover:scale-105"
                priority={priority}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
                onError={() => setImageError(true)}
                style={{
                  imageRendering: 'auto',
                }}
              />
            </div>
          )}

          {/* Status Badge - Transparent with colored dot and text */}
          {/* Show for all projects with status (both real images and placeholders) */}
          {project.status && (
            <div className="absolute top-4 left-4 z-10">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                  "bg-background/60 backdrop-blur-sm border border-border/50",
                  project.status.toLowerCase() === "active" &&
                    "text-green-500 [&>span]:bg-green-500",
                  project.status.toLowerCase() === "in progress" &&
                    "text-yellow-500 [&>span]:bg-yellow-500",
                  project.status.toLowerCase() !== "active" &&
                    project.status.toLowerCase() !== "in progress" &&
                    "text-gray-500 [&>span]:bg-gray-500"
                )}
              >
                <span className="h-2 w-2 rounded-full animate-pulse shrink-0" />
                {project.status}
              </span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-xl font-semibold mb-2">{project.title}</h3>

          {/* Technology Buttons - Below title, optional */}
          {showTechnologies &&
            project.technologies &&
            project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {project.technologies.map((tech, index) => (
                  <button
                    key={index}
                    className={cn(
                      "px-3 py-1 rounded-md text-sm font-medium",
                      "bg-muted text-foreground",
                      "hover:bg-muted/80 transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                    aria-label={`Technology: ${tech}`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            )}

          {/* Brief Description */}
          <p className="text-muted-foreground mb-6 flex-1">
            {highlightMetrics(project.briefDescription)}
          </p>

          {/* Action Buttons - Responsive: icon-only on mobile, icon+text on larger screens */}
          <div className="flex gap-2 mt-auto flex-wrap">
            {/* View Details - Always present */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDetailsOpen(true)}
              className={cn(
                "h-10 min-w-[44px] transition-all duration-200",
                "hover:bg-accent hover:scale-[1.02]",
                "focus-visible:ring-2 focus-visible:ring-ring",
                "px-3 sm:px-4" // Smaller padding on mobile
              )}
              aria-label={`View details for ${project.title}`}
              title="View Details"
            >
              <FileText className="h-4 w-4 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">View Details</span>
            </Button>

            {/* View Demo - Optional */}
            {hasDemo && project.demoUrl && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className={cn(
                  "h-10 min-w-[44px] transition-all duration-200",
                  "hover:bg-accent hover:scale-[1.02]",
                  "focus-visible:ring-2 focus-visible:ring-ring",
                  "px-3 sm:px-4"
                )}
              >
                <a
                  href={project.demoUrl}
                  target={project.demoIsExternal ? "_blank" : undefined}
                  rel={
                    project.demoIsExternal
                      ? "noopener noreferrer"
                      : undefined
                  }
                  aria-label={`Try out ${project.title}`}
                  title="Try It Out"
                >
                  <ExternalLink className="h-4 w-4 sm:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Try It Out</span>
                </a>
              </Button>
            )}

            {/* View YouTube Video - Optional */}
            {hasYoutube && project.youtubeUrl && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className={cn(
                  "h-10 min-w-[44px] transition-all duration-200",
                  "hover:bg-accent hover:scale-[1.02]",
                  "focus-visible:ring-2 focus-visible:ring-ring",
                  "px-3 sm:px-4"
                )}
              >
                <a
                  href={project.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Watch video for ${project.title}`}
                  title="Watch Video"
                >
                  <Youtube className="h-4 w-4 sm:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Watch Video</span>
                </a>
              </Button>
            )}
          </div>
        </div>
      </AnimatedCard>

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={project}
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open)
          if (!open) {
            // Return focus to card when modal closes
            setTimeout(() => {
              cardRef.current?.focus()
            }, 100)
          }
        }}
      />
    </>
  )
}
