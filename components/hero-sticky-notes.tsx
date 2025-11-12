"use client"

import { motion } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"

// PM Learnings/Quotes for sticky notes
// Horizontal arrangement: 1,3,4,6 at equal level; 2 centered between 1,3 on left; 5 centered between 4,6 on right
const leftSideNotes = [
  {
    id: 1,
    text: "90% of PMs fail to deliver because they skip user research",
    color: "yellow",
    rotation: -4,
    yOffset: -120, // Top position at equal level with note 4
    xOffset: -40,
    tapePosition: "top-center",
  },
  {
    id: 2,
    text: "Ship fast, learn faster. Perfection is the enemy of progress.",
    color: "pink",
    rotation: 1,
    yOffset: 0, // Centered between note 1 and 3
    xOffset: -35,
    tapePosition: "top-center",
  },
  {
    id: 3,
    text: "Data tells you what, users tell you why",
    color: "blue",
    rotation: -2,
    yOffset: 120, // Bottom position at equal level with note 6
    xOffset: -40,
    tapePosition: "top-center",
  },
]

// Right side notes: 4 at top, 5 in middle, 6 at bottom (4 and 6 aligned with 1 and 3)
const rightSideNotes = [
  {
    id: 4,
    text: "The best product decisions come from saying 'no' 9 times out of 10",
    color: "green",
    rotation: 3,
    yOffset: -120, // Top position at equal level with note 1
    xOffset: 40,
    tapePosition: "top-center",
  },
  {
    id: 5,
    text: "200% engagement increase isn't luck—it's ruthless iteration",
    color: "yellow",
    rotation: -1,
    yOffset: 0, // Centered between note 4 and 6
    xOffset: 35,
    tapePosition: "top-center",
  },
  {
    id: 6,
    text: "Build for users, measure for business, iterate for impact",
    color: "pink",
    rotation: 2,
    yOffset: 120, // Bottom position at equal level with note 3
    xOffset: 40,
    tapePosition: "top-center",
  },
]

const colorStyles = {
  yellow: {
    bg: "bg-yellow-200 dark:bg-yellow-800",
    text: "text-yellow-900 dark:text-yellow-100",
    border: "border-yellow-300 dark:border-yellow-700",
  },
  pink: {
    bg: "bg-pink-200 dark:bg-pink-800",
    text: "text-pink-900 dark:text-pink-100",
    border: "border-pink-300 dark:border-pink-700",
  },
  blue: {
    bg: "bg-blue-200 dark:bg-blue-800",
    text: "text-blue-900 dark:text-blue-100",
    border: "border-blue-300 dark:border-blue-700",
  },
  green: {
    bg: "bg-green-200 dark:bg-green-800",
    text: "text-green-900 dark:text-green-100",
    border: "border-green-300 dark:border-green-700",
  },
}

type TapePosition = "top-left" | "top-right" | "top-center" | "top-bottom" | "sides"

interface StickyNoteProps {
  note: typeof leftSideNotes[0] | typeof rightSideNotes[0]
  index: number
  side: "left" | "right"
}

function StickyNote({ note, index, side }: StickyNoteProps) {
  const prefersReducedMotion = useReducedMotion()
  const colors = colorStyles[note.color as keyof typeof colorStyles]

  // Create more realistic torn edge effect using clip-path
  const tornEdgePath = `
    polygon(
      0% 2%,
      3% 0%,
      7% 1%,
      10% 0%,
      15% 2%,
      20% 0%,
      25% 1%,
      30% 0%,
      35% 2%,
      40% 0%,
      45% 1%,
      50% 0%,
      55% 2%,
      60% 0%,
      65% 1%,
      70% 0%,
      75% 2%,
      80% 0%,
      85% 1%,
      90% 0%,
      95% 2%,
      98% 1%,
      100% 3%,
      100% 97%,
      98% 99%,
      95% 98%,
      90% 100%,
      85% 98%,
      80% 100%,
      75% 98%,
      70% 100%,
      65% 98%,
      60% 100%,
      55% 98%,
      50% 100%,
      45% 98%,
      40% 100%,
      35% 98%,
      30% 100%,
      25% 98%,
      20% 100%,
      15% 98%,
      10% 100%,
      5% 98%,
      2% 100%,
      0% 97%
    )
  `

  // Position based on side with V-shape offset
  const positionStyle = side === "left" 
    ? { 
        right: "100%", 
        marginRight: "24px",
      }
    : { 
        left: "100%", 
        marginLeft: "24px",
      }

  if (prefersReducedMotion) {
    return (
      <div
        className={cn(
          "absolute w-56 p-5 shadow-lg",
          colors.bg,
          colors.text,
          colors.border,
          "border-2"
        )}
        style={{
          ...positionStyle,
          top: "50%",
          transform: `translateX(${note.xOffset}px) translateY(calc(-50% + ${note.yOffset}px)) rotate(${note.rotation}deg)`,
          clipPath: tornEdgePath,
        }}
      >
        <p className="text-sm font-medium leading-tight">{note.text}</p>
      </div>
    )
  }

  return (
    <motion.div
      className={cn(
        "absolute w-60 p-5 shadow-2xl cursor-pointer",
        colors.bg,
        colors.text,
        colors.border,
        "border-2"
      )}
      style={{
        ...positionStyle,
        top: "50%",
        clipPath: tornEdgePath,
        filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
      }}
      initial={{ 
        opacity: 0, 
        scale: 0.8, 
        rotate: note.rotation + 10,
        x: note.xOffset + (side === "left" ? -20 : 20),
        y: note.yOffset + 20,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: note.rotation,
        x: note.xOffset,
        y: note.yOffset,
      }}
      transition={{
        delay: index * 0.15,
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.6,
      }}
      whileHover={{
        scale: 1.08,
        rotate: note.rotation + 3,
        x: note.xOffset,
        y: note.yOffset - 8,
        z: 50,
        filter: "drop-shadow(0 10px 25px rgba(0, 0, 0, 0.25))",
        transition: { duration: 0.2, type: "spring", stiffness: 400 },
      }}
    >
      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='paper' x='0' y='0' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='2' cy='2' r='0.5' fill='%23000' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23paper)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Transparent tape strips - extending BEYOND note edges into background (like real tape on wall) */}
      {note.tapePosition === "top-left" && (
        <div 
          className="absolute w-20 h-8 bg-gradient-to-br from-white/70 to-white/50 dark:from-white/50 dark:to-white/30 border border-white/80 dark:border-white/60 rounded-sm opacity-95 shadow-md"
          style={{
            top: "-12px",
            left: "-8px",
            transform: "rotate(-8deg)",
            clipPath: "polygon(0% 0%, 100% 0%, 98% 100%, 2% 100%)",
            zIndex: 15, // Behind note but visible
          }}
        />
      )}
      
      {note.tapePosition === "top-right" && (
        <div 
          className="absolute w-18 h-8 bg-gradient-to-br from-white/70 to-white/50 dark:from-white/50 dark:to-white/30 border border-white/80 dark:border-white/60 rounded-sm opacity-95 shadow-md"
          style={{
            top: "-12px",
            right: "-8px",
            transform: "rotate(8deg)",
            clipPath: "polygon(2% 0%, 100% 0%, 100% 100%, 0% 100%)",
            zIndex: 15,
          }}
        />
      )}
      
      {note.tapePosition === "top-center" && (
        <div 
          className="absolute w-24 h-8 bg-gradient-to-br from-white/70 to-white/50 dark:from-white/50 dark:to-white/30 border border-white/80 dark:border-white/60 rounded-sm opacity-95 shadow-md"
          style={{
            top: "-12px",
            left: "50%",
            transform: "translateX(-50%) rotate(-2deg)",
            clipPath: "polygon(2% 0%, 98% 0%, 100% 100%, 0% 100%)",
            zIndex: 15,
          }}
        />
      )}
      
      {note.tapePosition === "top-bottom" && (
        <>
          <div 
            className="absolute w-20 h-8 bg-gradient-to-br from-white/70 to-white/50 dark:from-white/50 dark:to-white/30 border border-white/80 dark:border-white/60 rounded-sm opacity-95 shadow-md"
            style={{
              top: "-12px",
              left: "50%",
              transform: "translateX(-50%) rotate(-3deg)",
              clipPath: "polygon(2% 0%, 98% 0%, 100% 100%, 0% 100%)",
              zIndex: 15,
            }}
          />
          <div 
            className="absolute w-20 h-8 bg-gradient-to-br from-white/70 to-white/50 dark:from-white/50 dark:to-white/30 border border-white/80 dark:border-white/60 rounded-sm opacity-95 shadow-md"
            style={{
              bottom: "-12px",
              left: "50%",
              transform: "translateX(-50%) rotate(3deg)",
              clipPath: "polygon(2% 0%, 98% 0%, 100% 100%, 0% 100%)",
              zIndex: 15,
            }}
          />
        </>
      )}
      
      {note.tapePosition === "sides" && (
        <>
          <div 
            className="absolute w-8 bg-gradient-to-br from-white/70 to-white/50 dark:from-white/50 dark:to-white/30 border border-white/80 dark:border-white/60 rounded-sm opacity-95 shadow-md"
            style={{
              top: "50%",
              left: "-16px",
              height: "80px",
              transform: "translateY(-50%) rotate(-5deg)",
              clipPath: "polygon(0% 2%, 100% 0%, 100% 98%, 0% 100%)",
              zIndex: 15,
            }}
          />
          <div 
            className="absolute w-8 bg-gradient-to-br from-white/70 to-white/50 dark:from-white/50 dark:to-white/30 border border-white/80 dark:border-white/60 rounded-sm opacity-95 shadow-md"
            style={{
              top: "50%",
              right: "-16px",
              height: "80px",
              transform: "translateY(-50%) rotate(5deg)",
              clipPath: "polygon(0% 0%, 100% 2%, 100% 100%, 0% 98%)",
              zIndex: 15,
            }}
          />
        </>
      )}

      {/* Content */}
      <p className="text-sm md:text-base font-medium leading-tight relative z-10">{note.text}</p>
    </motion.div>
  )
}

interface HeroStickyNotesProps {
  className?: string
}

export function HeroStickyNotes({ className }: HeroStickyNotesProps) {
  const prefersReducedMotion = useReducedMotion()

  // Hide on mobile, show on desktop
  // overflow-visible allows tape to extend beyond note boundaries
  return (
    <>
      {/* Left side notes - positioned relative to profile image container */}
      <div className={cn("hidden lg:block absolute inset-0 overflow-visible", className)}>
        {leftSideNotes.map((note, index) => (
          <StickyNote key={note.id} note={note} index={index} side="left" />
        ))}
      </div>

      {/* Right side notes - positioned relative to profile image container */}
      <div className={cn("hidden lg:block absolute inset-0 overflow-visible", className)}>
        {rightSideNotes.map((note, index) => (
          <StickyNote key={note.id} note={note} index={index + 3} side="right" />
        ))}
      </div>
    </>
  )
}

