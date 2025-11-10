"use client"

import { useEffect, useState, useCallback } from "react"
import type { CarouselApi } from "@/components/ui/carousel"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ProjectCard } from "./projects/project-card"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { useAutoScroll } from "@/hooks/use-auto-scroll"
import { cn } from "@/lib/utils"
import { projectsData } from "./projects/projects-data"

export function ProjectsSlider() {
  // Filter featured projects or use all projects
  const projects = projectsData.filter((p) => p.isFeatured !== false)

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const [carouselRef, isCarouselVisible] = useIntersectionObserver({
    threshold: 0.1,
  })

  // Auto-scroll hook
  const {
    isPaused,
    setIsHovered,
    setIsFocused,
    setIsOffscreen,
    handleInteraction,
  } = useAutoScroll(api, {
    interval: prefersReducedMotion ? 0 : 3000, // 3 seconds
    enabled: !prefersReducedMotion && projects.length > 1,
    pauseOnHover: true,
    pauseOnFocus: true,
    pauseWhenHidden: true,
    pauseWhenOffscreen: true,
    resumeDelay: 0, // Resume immediately after interaction
  })

  // Update offscreen state
  useEffect(() => {
    setIsOffscreen(!isCarouselVisible)
  }, [isCarouselVisible, setIsOffscreen])

  // Handle carousel API
  useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap())
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
      handleInteraction() // Pause auto-scroll on manual navigation
    }

    api.on("select", handleSelect)

    return () => {
      api.off("select", handleSelect)
    }
  }, [api, handleInteraction])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!api) return

      if (e.key === "ArrowLeft") {
        e.preventDefault()
        api.scrollPrev()
        handleInteraction()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        api.scrollNext()
        handleInteraction()
      } else if (e.key === "Home") {
        e.preventDefault()
        api.scrollTo(0)
        handleInteraction()
      } else if (e.key === "End") {
        e.preventDefault()
        api.scrollTo(projects.length - 1)
        handleInteraction()
      }
    },
    [api, handleInteraction, projects.length]
  )

  // Empty state
  if (projects.length === 0) {
    return (
      <section id="projects" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Projects
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Deep dives into products I've shipped from 0 to 1
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Projects coming soon. Check back later!
            </p>
          </div>
        </div>
      </section>
    )
  }

  // Single project - center it
  if (projects.length === 1) {
    return (
      <section id="projects" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Projects
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Deep dives into products I've shipped from 0 to 1
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <ProjectCard project={projects[0]} priority />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      id="projects"
      className="py-20 px-4"
      ref={carouselRef}
      onKeyDown={handleKeyDown}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Projects
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Deep dives into products I've shipped from 0 to 1
          </p>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
              slidesToScroll: 1,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {projects.map((project, index) => (
                <CarouselItem
                  key={project.id}
                  className={cn(
                    "pl-2 md:pl-4",
                    // Show 2 cards on desktop, 1 on mobile
                    "basis-full md:basis-1/2"
                  )}
                >
                  <ProjectCard
                    project={project}
                    priority={index < 2} // Priority load first 2
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Arrows */}
            {projects.length > 2 && (
              <>
                <CarouselPrevious
                  className="left-0 md:-left-12"
                  aria-label="Previous project"
                />
                <CarouselNext
                  className="right-0 md:-right-12"
                  aria-label="Next project"
                />
              </>
            )}
          </Carousel>

          {/* Pagination Dots */}
          {projects.length > 2 && (
            <div className="flex justify-center gap-2 mt-8">
              {projects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    api?.scrollTo(index)
                    handleInteraction()
                  }}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all",
                    current === index
                      ? "bg-primary w-8"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={current === index ? "true" : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
