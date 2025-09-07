"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { CLIENT_LOGOS } from "@/lib/logos"
import { cn } from "@/lib/utils"

export function ClientLogos({
  speedSeconds = 18,
  rowHeight = 80,
  rowHeightMd = 96,
  rowHeightLg = 110,
}: {
  speedSeconds?: number
  rowHeight?: number
  rowHeightMd?: number
  rowHeightLg?: number
}) {
  // duplicate for seamless loop
  const items = useMemo(() => [...CLIENT_LOGOS, ...CLIENT_LOGOS], [])
  const [play, setPlay] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => setPlay(entries.some((e) => e.isIntersecting)),
      { rootMargin: "0px 0px -25% 0px", threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    // ✨ No forced background; inherits from theme
    <section aria-labelledby="trusted-by-heading" className="py-14 md:py-18 lg:py-22">
      <div className="text-center mb-14 md:mb-16">
        <h2 id="trusted-by-heading" className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Trusted By
        </h2>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground">
          Companies I&apos;ve helped build and scale products
        </p>
      </div>

      <div
        ref={containerRef}
        className={cn(
          "relative select-none logo-track",
          "[&:is(:hover,:focus-within)_.logos-track]:[animation-play-state:paused]"
        )}
        style={
          {
            ["--logo-h" as any]: `${rowHeight}px`,
            ["--logo-h-md" as any]: `${rowHeightMd}px`,
            ["--logo-h-lg" as any]: `${rowHeightLg}px`,
            ["--marquee-duration" as any]: `${speedSeconds}s`,
          } as React.CSSProperties
        }
      >
        <ul className={cn("logos-track flex items-center gap-14 md:gap-16 lg:gap-20 w-max", play ? "animate-marquee" : "")}>
          {items.map((logo, i) => {
            const card = (
              <div
                key={`${logo.name}-${i}`}
                className={cn(
                  "logo-card relative",
                  "h-[var(--logo-h)] md:h-[var(--logo-h-md)] lg:h-[var(--logo-h-lg)]",
                  "opacity-90 hover:opacity-100 transition-opacity"
                )}
                style={{ ["--logo-scale" as any]: String(logo.scale ?? 1) } as React.CSSProperties}
              >
                <Image
                  src={logo.src}
                  alt={logo.name}
                  fill
                  sizes="(min-width:1024px) 12rem, (min-width:768px) 10rem, 8rem"
                  className={cn(
                    "object-contain logo-img",
                    logo.keepColor ? "logo-color" : "logo-mono"
                  )}
                  priority={i < 8}
                />
              </div>
            )

            return logo.href ? (
              <li key={`li-${logo.name}-${i}`} className="list-none">
                <Link
                  href={logo.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="outline-none"
                  aria-label={logo.name}
                >
                  {card}
                </Link>
              </li>
            ) : (
              <li key={`li-${logo.name}-${i}`} className="list-none">
                {card}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
