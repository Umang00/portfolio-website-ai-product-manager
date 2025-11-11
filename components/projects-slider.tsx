"use client"

import { useEffect, useState, useCallback } from "react"
import type { CarouselApi } from "@/components/ui/carousel"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { ProjectCard } from "./projects/project-card"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
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

  // Auto-scroll state
  const [isPaused, setIsPaused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // Custom auto-scroll that scrolls 2 projects at a time
  useEffect(() => {
    if (!api || prefersReducedMotion || projects.length <= 2) return

    const shouldPause = isPaused || isHovered || isFocused || !isCarouselVisible

    if (shouldPause) return

    const totalScrollPositions = Math.ceil(projects.length / 2)
    const intervalId = setInterval(() => {
      const currentIndex = api.selectedScrollSnap()
      const nextIndex = (Math.floor(currentIndex / 2) + 1) * 2

      if (nextIndex < projects.length) {
        api.scrollTo(nextIndex)
      } else {
        // Loop back to start
        api.scrollTo(0)
      }
    }, 3000)

    return () => clearInterval(intervalId)
  }, [api, prefersReducedMotion, projects.length, isPaused, isHovered, isFocused, isCarouselVisible])

  const handleInteraction = useCallback(() => {
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 100)
  }, [])


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

  // Handle keyboard navigation - scroll by 2 positions
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!api) return

      if (e.key === "ArrowLeft") {
        e.preventDefault()
        const currentIndex = api.selectedScrollSnap()
        const prevIndex = Math.max(0, Math.floor(currentIndex / 2) - 1) * 2
        api.scrollTo(prevIndex)
        handleInteraction()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        const currentIndex = api.selectedScrollSnap()
        const nextIndex = Math.min(projects.length - 1, (Math.floor(currentIndex / 2) + 1) * 2)
        api.scrollTo(nextIndex)
        handleInteraction()
      } else if (e.key === "Home") {
        e.preventDefault()
        api.scrollTo(0)
        handleInteraction()
      } else if (e.key === "End") {
        e.preventDefault()
        const lastIndex = Math.floor((projects.length - 1) / 2) * 2
        api.scrollTo(lastIndex)
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
      className="py-20 px-4 overflow-visible bg-muted/50 dark:bg-muted/20" // Add overflow-visible to section
      ref={carouselRef}
      onKeyDown={handleKeyDown}
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal variant="fadeInUp" delay={0.2}>
          <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Projects
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Deep dives into products I've shipped from 0 to 1
          </p>
        </div>
        </ScrollReveal>

        <div
          className="relative overflow-visible pt-8 pb-6 pl-6 pr-8 md:pt-12 md:pb-8 md:pl-8 md:pr-12" // Padding: top for hover lift, right for scale
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
              slidesToScroll: 1, // Scroll 1 slide at a time (we'll handle 2-project scrolling manually)
            }}
            className="w-full overflow-visible"
          >
            <CarouselContent className="-ml-2 md:-ml-4 overflow-visible">
              {projects.map((project, index) => (
                <CarouselItem
                  key={project.id}
                  className={cn(
                    "pl-2 md:pl-4",
                    // Show 2 cards on desktop, 1 on mobile
                    "basis-full md:basis-1/2"
                  )}
                >
                  {/* Padding wrapper to prevent hover overlap and clipping */}
                  <div className="pt-6 pb-2 pl-4 pr-4 md:pt-8 md:pb-3 md:pl-5 md:pr-6">
                  <ProjectCard
                    project={project}
                    priority={index < 2} // Priority load first 2
                  />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Arrows - Custom to scroll by 2 positions */}
            {projects.length > 2 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 size-8 rounded-full",
                    "left-0 md:-left-12"
                  )}
                  disabled={!canScrollPrev}
                  onClick={() => {
                    if (!api) return
                    const currentIndex = api.selectedScrollSnap()
                    const prevIndex = Math.max(0, Math.floor(currentIndex / 2) - 1) * 2
                    api.scrollTo(prevIndex)
                    handleInteraction()
                  }}
                  aria-label="Previous 2 projects"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Previous 2 projects</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 size-8 rounded-full",
                    "right-0 md:-right-12"
                  )}
                  disabled={!canScrollNext}
                  onClick={() => {
                    if (!api) return
                    const currentIndex = api.selectedScrollSnap()
                    const nextIndex = Math.min(projects.length - 1, (Math.floor(currentIndex / 2) + 1) * 2)
                    api.scrollTo(nextIndex)
                    handleInteraction()
                  }}
                  aria-label="Next 2 projects"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span className="sr-only">Next 2 projects</span>
                </Button>
              </>
            )}
          </Carousel>

          {/* Pagination Dots - One dot per scroll position (every 2 projects) */}
          {projects.length > 2 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.ceil(projects.length / 2) }).map(
                (_, index) => {
                  const scrollIndex = index * 2
                  // Calculate which projects are visible at this scroll position
                  const startProject = scrollIndex + 1
                  const endProject = Math.min(scrollIndex + 2, projects.length)
                  // Check if current position is within this scroll position's range
                  const isActive = current >= scrollIndex && current < scrollIndex + 2

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        api?.scrollTo(scrollIndex)
                        handleInteraction()
                      }}
                      className={cn(
                        "h-2 w-2 rounded-full transition-all",
                        isActive
                          ? "bg-primary w-8"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      )}
                      aria-label={`Go to projects ${startProject}-${endProject}`}
                      aria-current={isActive ? "true" : undefined}
                    />
                  )
                }
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
