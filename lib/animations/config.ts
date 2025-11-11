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

  // 3D Settings
  threeD: {
    perspective: 1000,
    maxRotation: 15, // degrees
    sensitivity: 25, // pixels per degree
  },

  // Stagger
  stagger: {
    default: 0.1, // 100ms
    fast: 0.05,    // 50ms
    slow: 0.15,    // 150ms
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

