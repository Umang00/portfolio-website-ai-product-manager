# 🎨 Animation System Boilerplate - Reusable Code

Complete animation system with all components, hooks, and configurations ready to use in any React/Next.js project.

## 📦 Required Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "react-countup": "^6.5.0",
    "howler": "^2.2.4",
    "gsap": "^3.12.5"
  }
}
```

---

## 🎯 1. Animation Configuration

**File: `lib/animations/config.ts`**

```typescript
/**
 * Animation Configuration
 * Centralized animation settings for consistent motion design
 */

export const animationConfig = {
  // Duration presets (in seconds)
  duration: {
    fast: 0.15,
    normal: 0.3,
    medium: 0.5,
    slow: 0.8,
    verySlow: 1.2,
  },

  // Easing functions
  easing: {
    easeIn: "easeIn",
    easeOut: "easeOut",
    easeInOut: "easeInOut",
    spring: { type: "spring" as const, stiffness: 400, damping: 10 },
    springBouncy: { type: "spring" as const, stiffness: 300, damping: 15 },
    springGentle: { type: "spring" as const, stiffness: 200, damping: 20 },
  },

  // Common animation variants
  variants: {
    // Fade animations
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    fadeInUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
    fadeInDown: {
      hidden: { opacity: 0, y: -20 },
      visible: { opacity: 1, y: 0 },
    },
    fadeInLeft: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
    },
    fadeInRight: {
      hidden: { opacity: 0, x: 20 },
      visible: { opacity: 1, x: 0 },
    },

    // Scale animations
    scaleIn: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
    scaleInBounce: {
      hidden: { opacity: 0, scale: 0.5 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 15 }
      },
    },

    // Slide animations
    slideInLeft: {
      hidden: { x: -100, opacity: 0 },
      visible: { x: 0, opacity: 1 },
    },
    slideInRight: {
      hidden: { x: 100, opacity: 0 },
      visible: { x: 0, opacity: 1 },
    },

    // Stagger container
    staggerContainer: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2,
        },
      },
    },

    // Hover effects
    lift: {
      rest: { y: 0 },
      hover: { y: -8 },
    },
    scale: {
      rest: { scale: 1 },
      hover: { scale: 1.05 },
    },
    glow: {
      rest: { boxShadow: "0 0 0 0 rgba(37, 99, 235, 0)" },
      hover: { boxShadow: "0 0 20px 5px rgba(37, 99, 235, 0.3)" },
    },
  },

  // Viewport settings for scroll animations
  viewport: {
    once: true,
    amount: 0.3,
    margin: "-100px",
  },

  // Hover animation presets
  hover: {
    lift: {
      y: -10,
      transition: { duration: 0.2 },
    },
    scale: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tilt: {
      rotateX: 5,
      rotateY: 5,
      transition: { duration: 0.3 },
    },
  },

  // Tap animation presets
  tap: {
    scale: { scale: 0.95 },
    bounce: { scale: 0.9, transition: { type: "spring", stiffness: 400, damping: 10 } },
  },
} as const;

/**
 * Helper function to create staggered children animations
 */
export const staggerChildren = (staggerDelay = 0.1, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

/**
 * Helper function to create scroll-triggered animations
 */
export const scrollReveal = (
  variant: keyof typeof animationConfig.variants = "fadeInUp",
  duration = 0.6,
  delay = 0
) => ({
  initial: "hidden",
  whileInView: "visible",
  viewport: animationConfig.viewport,
  variants: animationConfig.variants[variant],
  transition: { duration, delay },
});
```

---

## ♿ 2. Accessibility Hook

**File: `hooks/useReducedMotion.ts`**

```typescript
"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if user prefers reduced motion
 * Respects system accessibility settings
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Helper function to get animation props that respect reduced motion
 */
export function getAnimationProps<T>(
  animation: T,
  reducedMotionFallback: Partial<T> = {}
): T | Partial<T> {
  if (typeof window === "undefined") return animation;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  return prefersReducedMotion ? reducedMotionFallback : animation;
}
```

---

## 🔊 3. Sound Manager

**File: `lib/sounds/soundManager.ts`**

```typescript
"use client";

import { Howl } from "howler";

/**
 * Sound Manager
 * Centralized sound effect management with Howler.js
 */

// Sound types
export type SoundType =
  | "click"
  | "hover"
  | "success"
  | "error"
  | "whoosh"
  | "pop"
  | "tick";

class SoundManager {
  private sounds: Map<SoundType, Howl> = new Map();
  private isMuted: boolean = false;
  private volume: number = 0.3; // Default subtle volume

  constructor() {
    // Only initialize on client side
    if (typeof window === "undefined") return;

    // Load user preferences from localStorage
    const savedMute = localStorage.getItem("soundMuted");
    const savedVolume = localStorage.getItem("soundVolume");

    this.isMuted = savedMute === "true";
    this.volume = savedVolume ? parseFloat(savedVolume) : 0.3;

    // Initialize sounds
    this.initializeSounds();
  }

  private initializeSounds() {
    // Initialize sounds - files should be in /public/sounds/
    // Only loads sounds that exist (won't error if missing)

    try {
      this.sounds.set(
        "click",
        new Howl({
          src: ["/sounds/click.mp3"],
          volume: this.volume,
        })
      );

      this.sounds.set(
        "hover",
        new Howl({
          src: ["/sounds/hover.mp3"],
          volume: this.volume * 0.5, // Even more subtle
        })
      );

      this.sounds.set(
        "success",
        new Howl({
          src: ["/sounds/success.mp3"],
          volume: this.volume,
        })
      );

      this.sounds.set(
        "error",
        new Howl({
          src: ["/sounds/error.mp3"],
          volume: this.volume,
        })
      );

      this.sounds.set(
        "whoosh",
        new Howl({
          src: ["/sounds/whoosh.mp3"],
          volume: this.volume,
        })
      );

      this.sounds.set(
        "pop",
        new Howl({
          src: ["/sounds/pop.mp3"],
          volume: this.volume,
        })
      );

      this.sounds.set(
        "tick",
        new Howl({
          src: ["/sounds/tick.mp3"],
          volume: this.volume * 0.3,
        })
      );
    } catch (error) {
      console.warn("Some sound files may not be loaded:", error);
    }
  }

  /**
   * Play a sound effect
   */
  play(soundType: SoundType) {
    if (this.isMuted || typeof window === "undefined") return;

    const sound = this.sounds.get(soundType);
    if (sound) {
      sound.play();
    }
  }

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem("soundMuted", this.isMuted.toString());
    return this.isMuted;
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem("soundVolume", this.volume.toString());

    // Update all sound volumes
    this.sounds.forEach((sound) => {
      sound.volume(this.volume);
    });
  }

  /**
   * Get current mute state
   */
  getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Preload a sound for better performance
   */
  preload(soundType: SoundType) {
    const sound = this.sounds.get(soundType);
    if (sound) {
      sound.load();
    }
  }

  /**
   * Stop all playing sounds
   */
  stopAll() {
    this.sounds.forEach((sound) => {
      sound.stop();
    });
  }
}

// Singleton instance
let soundManager: SoundManager | null = null;

/**
 * Get the sound manager instance
 */
export function getSoundManager(): SoundManager {
  if (typeof window === "undefined") {
    // Return a mock instance for SSR
    return {
      play: () => {},
      toggleMute: () => false,
      setVolume: () => {},
      getMuted: () => false,
      getVolume: () => 0.3,
      preload: () => {},
      stopAll: () => {},
    } as unknown as SoundManager;
  }

  if (!soundManager) {
    soundManager = new SoundManager();
  }

  return soundManager;
}

/**
 * React hook for sound effects
 */
export function useSound() {
  const manager = getSoundManager();

  return {
    play: (soundType: SoundType) => manager.play(soundType),
    toggleMute: () => manager.toggleMute(),
    setVolume: (volume: number) => manager.setVolume(volume),
    isMuted: manager.getMuted(),
    volume: manager.getVolume(),
  };
}
```

---

## 📜 4. ScrollReveal Component

**File: `components/animations/ScrollReveal.tsx`**

```typescript
"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { animationConfig } from "@/lib/animations/config";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  variant?: "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight" | "scaleIn";
  duration?: number;
  delay?: number;
  once?: boolean;
  amount?: number;
}

/**
 * ScrollReveal Component
 * Wrapper component for scroll-triggered animations
 */
export function ScrollReveal({
  children,
  className,
  variant = "fadeInUp",
  duration = 0.6,
  delay = 0,
  once = true,
  amount = 0.3,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  // If user prefers reduced motion, don't animate
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants = animationConfig.variants[variant] as Variants;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScrollRevealList Component
 * For staggered list animations
 */
interface ScrollRevealListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}

export function ScrollRevealList({
  children,
  className,
  staggerDelay = 0.1,
  delayChildren = 0,
}: ScrollRevealListProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScrollRevealItem Component
 * Child component for ScrollRevealList
 */
interface ScrollRevealItemProps {
  children: ReactNode;
  className?: string;
}

export function ScrollRevealItem({ children, className }: ScrollRevealItemProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
```

---

## 🃏 5. AnimatedCard Component

**File: `components/animations/AnimatedCard.tsx`**

```typescript
"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSound } from "@/lib/sounds/soundManager";

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, "onAnimationStart"> {
  children: ReactNode;
  enableSound?: boolean;
  enable3D?: boolean;
  variant?: "lift" | "scale" | "glow" | "all";
}

/**
 * AnimatedCard Component
 * Card with hover effects, 3D tilt, and optional sound
 */
export function AnimatedCard({
  children,
  className,
  enableSound = false,
  enable3D = false,
  variant = "lift",
  ...props
}: AnimatedCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const { play } = useSound();

  const handleHoverStart = () => {
    if (enableSound && !shouldReduceMotion) {
      play("hover");
    }
  };

  // If reduced motion is preferred, return basic card
  if (shouldReduceMotion) {
    return (
      <div className={className} {...(props as any)}>
        {children}
      </div>
    );
  }

  // Define hover animations based on variant
  const getHoverAnimation = () => {
    const animations: Record<string, any> = {};

    if (variant === "lift" || variant === "all") {
      animations.y = -10;
    }

    if (variant === "scale" || variant === "all") {
      animations.scale = 1.02;
    }

    if (variant === "glow" || variant === "all") {
      animations.boxShadow = "0 20px 40px rgba(37, 99, 235, 0.2)";
    }

    if (enable3D) {
      animations.rotateX = 5;
      animations.rotateY = 5;
    }

    return animations;
  };

  const style = enable3D
    ? {
        transformStyle: "preserve-3d" as const,
        perspective: "1000px",
      }
    : undefined;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 },
      }}
      whileHover={{
        ...getHoverAnimation(),
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      viewport={{ once: true, amount: 0.3 }}
      onHoverStart={handleHoverStart}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedCardGrid Component
 * Grid container with staggered card animations
 */
interface AnimatedCardGridProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function AnimatedCardGrid({
  children,
  className,
  staggerDelay = 0.1,
}: AnimatedCardGridProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedCardGridItem Component
 * Individual card item for AnimatedCardGrid
 */
interface AnimatedCardGridItemProps {
  children: ReactNode;
  className?: string;
  enableSound?: boolean;
  variant?: "lift" | "scale" | "glow" | "all";
}

export function AnimatedCardGridItem({
  children,
  className,
  enableSound = false,
  variant = "lift",
}: AnimatedCardGridItemProps) {
  const shouldReduceMotion = useReducedMotion();
  const { play } = useSound();

  const handleHoverStart = () => {
    if (enableSound && !shouldReduceMotion) {
      play("hover");
    }
  };

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const getHoverAnimation = () => {
    const animations: Record<string, any> = {};

    if (variant === "lift" || variant === "all") {
      animations.y = -10;
    }

    if (variant === "scale" || variant === "all") {
      animations.scale = 1.02;
    }

    if (variant === "glow" || variant === "all") {
      animations.boxShadow = "0 20px 40px rgba(37, 99, 235, 0.2)";
    }

    return animations;
  };

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5 },
        },
      }}
      whileHover={{
        ...getHoverAnimation(),
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={handleHoverStart}
    >
      {children}
    </motion.div>
  );
}
```

---

## 🔘 6. AnimatedButton Component

**File: `components/animations/AnimatedButton.tsx`**

```typescript
"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSound } from "@/lib/sounds/soundManager";

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, "onAnimationStart"> {
  children: ReactNode;
  enableSound?: boolean;
  variant?: "scale" | "bounce" | "pulse" | "glow";
  className?: string;
}

/**
 * AnimatedButton Component
 * Button with micro-interactions and optional sound effects
 */
export function AnimatedButton({
  children,
  className,
  enableSound = false,
  variant = "scale",
  onClick,
  ...props
}: AnimatedButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const { play } = useSound();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (enableSound && !shouldReduceMotion) {
      play("click");
    }
    onClick?.(e);
  };

  // If reduced motion, return regular button
  if (shouldReduceMotion) {
    return (
      <button className={className} onClick={handleClick} {...(props as any)}>
        {children}
      </button>
    );
  }

  // Hover animation based on variant
  const getHoverAnimation = () => {
    switch (variant) {
      case "scale":
        return { scale: 1.05 };
      case "bounce":
        return { scale: 1.1, transition: { type: "spring", stiffness: 400, damping: 10 } };
      case "pulse":
        return { scale: 1.05 };
      case "glow":
        return {
          scale: 1.02,
          boxShadow: "0 0 20px rgba(37, 99, 235, 0.5)",
        };
      default:
        return { scale: 1.05 };
    }
  };

  // Tap animation
  const getTapAnimation = () => {
    if (variant === "bounce") {
      return { scale: 0.9, transition: { type: "spring", stiffness: 400, damping: 10 } };
    }
    return { scale: 0.95 };
  };

  // Pulse animation (continuous)
  const getPulseAnimation = () => {
    if (variant === "pulse") {
      return {
        boxShadow: [
          "0 0 0 0 rgba(37, 99, 235, 0.7)",
          "0 0 0 10px rgba(37, 99, 235, 0)",
          "0 0 0 0 rgba(37, 99, 235, 0)",
        ],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 0.5,
        },
      };
    }
    return {};
  };

  return (
    <motion.button
      className={className}
      whileHover={getHoverAnimation()}
      whileTap={getTapAnimation()}
      animate={getPulseAnimation()}
      onClick={handleClick}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * AnimatedIconButton Component
 * Icon button with rotation/bounce effects
 */
interface AnimatedIconButtonProps extends Omit<HTMLMotionProps<"button">, "onAnimationStart"> {
  children: ReactNode;
  enableSound?: boolean;
  className?: string;
}

export function AnimatedIconButton({
  children,
  className,
  enableSound = false,
  onClick,
  ...props
}: AnimatedIconButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const { play } = useSound();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (enableSound && !shouldReduceMotion) {
      play("click");
    }
    onClick?.(e);
  };

  if (shouldReduceMotion) {
    return (
      <button className={className} onClick={handleClick} {...(props as any)}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      className={className}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9, rotate: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      onClick={handleClick}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * AnimatedLink Component
 * Link with subtle hover effects
 */
interface AnimatedLinkProps extends Omit<HTMLMotionProps<"a">, "onAnimationStart"> {
  children: ReactNode;
  className?: string;
  enableSound?: boolean;
}

export function AnimatedLink({
  children,
  className,
  enableSound = false,
  ...props
}: AnimatedLinkProps) {
  const shouldReduceMotion = useReducedMotion();
  const { play } = useSound();

  const handleHoverStart = () => {
    if (enableSound && !shouldReduceMotion) {
      play("hover");
    }
  };

  if (shouldReduceMotion) {
    return (
      <a className={className} {...(props as any)}>
        {children}
      </a>
    );
  }

  return (
    <motion.a
      className={`relative inline-block ${className || ""}`}
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={handleHoverStart}
      {...props}
    >
      {children}
    </motion.a>
  );
}

/**
 * AnimatedUnderlineLink Component
 * Link with animated underline effect
 */
interface AnimatedUnderlineLinkProps extends Omit<HTMLMotionProps<"a">, "onAnimationStart"> {
  children: ReactNode;
  className?: string;
}

export function AnimatedUnderlineLink({
  children,
  className,
  ...props
}: AnimatedUnderlineLinkProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <a className={`relative ${className || ""}`} {...(props as any)}>
        {children}
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500" />
      </a>
    );
  }

  return (
    <motion.a className={`relative inline-block ${className || ""}`} {...props}>
      {children}
      <motion.span
        className="absolute bottom-0 left-0 h-0.5 bg-blue-500"
        initial={{ width: "0%" }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.3 }}
      />
    </motion.a>
  );
}
```

---

## 🔢 7. AnimatedCounter Component

**File: `components/animations/AnimatedCounter.tsx`**

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motion } from "framer-motion";
import { useSound } from "@/lib/sounds/soundManager";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  separator?: string;
  className?: string;
}

/**
 * AnimatedCounter Component
 * Number animation with CountUp effect
 */
export function AnimatedCounter({
  end,
  duration = 2.5,
  suffix = "",
  prefix = "",
  decimals = 0,
  separator = ",",
  className,
}: AnimatedCounterProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  // If reduced motion, show end value immediately
  if (shouldReduceMotion) {
    return (
      <div ref={ref} className={className}>
        {prefix}
        {end.toLocaleString()}
        {suffix}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {isInView && (
        <CountUp
          end={end}
          duration={duration}
          suffix={suffix}
          prefix={prefix}
          decimals={decimals}
          separator={separator}
        />
      )}
    </motion.div>
  );
}

/**
 * AnimatedStatCard Component
 * Stat card with animated counter
 */
interface AnimatedStatCardProps {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedStatCard({
  value,
  label,
  suffix = "",
  prefix = "",
  decimals = 0,
  className,
}: AnimatedStatCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const { play } = useSound();

  if (shouldReduceMotion) {
    return (
      <div className={className}>
        <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
          {prefix}
          {value.toLocaleString()}
          {suffix}
        </div>
        <div className="text-sm text-gray-400">{label}</div>
      </div>
    );
  }

  return (
    <motion.div
      className={`${className} cursor-pointer`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.1, y: -5 }}
      onHoverStart={() => play("pop")}
    >
      <AnimatedCounter
        end={value}
        suffix={suffix}
        prefix={prefix}
        decimals={decimals}
        className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2"
      />
      <div className="text-sm text-gray-400">{label}</div>
    </motion.div>
  );
}
```

---

## 📦 8. Index File (Centralized Exports)

**File: `components/animations/index.ts`**

```typescript
/**
 * Animation Components Index
 * Centralized exports for all animation components
 */

// Scroll Reveal Components
export {
  ScrollReveal,
  ScrollRevealList,
  ScrollRevealItem,
} from "./ScrollReveal";

// Card Components
export {
  AnimatedCard,
  AnimatedCardGrid,
  AnimatedCardGridItem,
} from "./AnimatedCard";

// Button Components
export {
  AnimatedButton,
  AnimatedIconButton,
  AnimatedLink,
  AnimatedUnderlineLink,
} from "./AnimatedButton";

// Counter Components
export {
  AnimatedCounter,
  AnimatedStatCard,
} from "./AnimatedCounter";
```

---

## 🎯 Usage Examples

### Basic Scroll Reveal

```tsx
import { ScrollReveal } from "@/components/animations";

<ScrollReveal variant="fadeInUp">
  <h1>Hello World</h1>
</ScrollReveal>
```

### Staggered List

```tsx
import { ScrollRevealList, ScrollRevealItem } from "@/components/animations";

<ScrollRevealList staggerDelay={0.1}>
  {items.map((item) => (
    <ScrollRevealItem key={item.id}>
      <Card>{item.content}</Card>
    </ScrollRevealItem>
  ))}
</ScrollRevealList>
```

### Animated Card

```tsx
import { AnimatedCard } from "@/components/animations";

<AnimatedCard variant="all" enableSound={true} enable3D={true}>
  <div className="p-6 bg-slate-800 rounded-lg">
    Card Content
  </div>
</AnimatedCard>
```

### Animated Button

```tsx
import { AnimatedButton } from "@/components/animations";

<AnimatedButton variant="pulse" enableSound={true}>
  Click Me
</AnimatedButton>
```

### Counter Animation

```tsx
import { AnimatedStatCard } from "@/components/animations";

<AnimatedStatCard
  value={200}
  suffix="%"
  label="Growth Rate"
/>
```

### Sound Effects

```tsx
import { useSound } from "@/lib/sounds/soundManager";

function MyComponent() {
  const { play, toggleMute } = useSound();

  return (
    <>
      <button onClick={() => play("success")}>
        Play Sound
      </button>
      <button onClick={toggleMute}>
        Toggle Mute
      </button>
    </>
  );
}
```

---

## 📋 Summary of All Animations

### 1. **Scroll Animations**
- ✅ `ScrollReveal` - Single element scroll reveal
- ✅ `ScrollRevealList` - Staggered list animations
- ✅ `ScrollRevealItem` - Individual list items

**Variants:** `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`, `scaleIn`

### 2. **Card Animations**
- ✅ `AnimatedCard` - Single card with hover effects
- ✅ `AnimatedCardGrid` - Grid container with stagger
- ✅ `AnimatedCardGridItem` - Grid card items

**Variants:** `lift`, `scale`, `glow`, `all`

**Features:** 3D tilt, sound effects, accessibility support

### 3. **Button Animations**
- ✅ `AnimatedButton` - Button with micro-interactions
- ✅ `AnimatedIconButton` - Icon button with rotation
- ✅ `AnimatedLink` - Link with slide effect
- ✅ `AnimatedUnderlineLink` - Link with animated underline

**Variants:** `scale`, `bounce`, `pulse`, `glow`

### 4. **Counter Animations**
- ✅ `AnimatedCounter` - Number count-up animation
- ✅ `AnimatedStatCard` - Pre-styled stat card with counter

**Features:** Intersection Observer, accessibility support

### 5. **Sound System**
- ✅ `useSound` hook - Play sounds, toggle mute, set volume
- ✅ Sound types: `click`, `hover`, `success`, `error`, `whoosh`, `pop`, `tick`

### 6. **Accessibility**
- ✅ `useReducedMotion` hook - Respects user preferences
- ✅ All components automatically disable animations when reduced motion is preferred

---

## 🚀 Quick Setup Checklist

1. ✅ Install dependencies: `npm install framer-motion react-countup howler`
2. ✅ Copy all component files to your project
3. ✅ Copy `lib/animations/config.ts` to your project
4. ✅ Copy `hooks/useReducedMotion.ts` to your project
5. ✅ Copy `lib/sounds/soundManager.ts` to your project
6. ✅ Create `/public/sounds/` directory (optional, for sound effects)
7. ✅ Add sound files (optional): `click.mp3`, `hover.mp3`, `success.mp3`, etc.
8. ✅ Import and use components!

---

## 📝 Notes

- All components are SSR-safe (check for `window` before using)
- All components respect `prefers-reduced-motion`
- Sound system is optional (works without sound files)
- TypeScript types are included
- Fully customizable via props
- Performance optimized (uses GPU-accelerated transforms)

---

**Ready to use!** 🎉