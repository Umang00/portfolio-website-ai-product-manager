# Overview

This is a personal portfolio website for Umang Thakkar, an AI Product Manager with 6+ years of experience. The site showcases professional experience, shipped products, client testimonials, and provides contact mechanisms. Built as a modern, performant single-page application with Next.js 14 (App Router), it emphasizes visual storytelling through interactive components, smooth animations, and data-driven highlights.

The portfolio follows a structured narrative flow: Hero introduction → KPI metrics → Process methodology → Shipped highlights → Featured projects → Social proof (client logos + testimonials) → Professional journey timeline → Technology toolkit → Contact section → Footer.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework & Rendering**
- Next.js 14 with App Router for server-side rendering and client-side hydration
- React Server Components (RSC) enabled for improved performance
- TypeScript for type safety across the codebase
- Client components (`"use client"`) used strategically for interactive elements (animations, modals, form handling)

**Styling Strategy**
- Tailwind CSS with custom design tokens using OKLCH color space for consistent theming
- shadcn/ui component library (Radix UI primitives) for accessible, customizable UI components
- Custom CSS variables for light/dark theme support with system preference detection
- Geist Sans and Geist Mono fonts for typography

**Component Architecture**
- Section-based component structure mirroring the page flow (Hero, KPIs, ProcessWheel, etc.)
- Reusable UI primitives in `/components/ui` (Button, Badge, Input, Dialog, etc.)
- Custom hooks for common patterns (`useCelebrateOnView` for intersection-based animations)
- Utility functions centralized in `/lib/utils.ts` for class name merging

**Animation & Interaction**
- Framer Motion for declarative animations (used selectively to maintain bundle size)
- react-simple-typewriter for Hero section typewriter effect
- react-countup for animated KPI metrics with intersection observer triggers
- keen-slider for carousel/slider functionality with auto-scroll and pause-on-hover
- canvas-confetti for celebratory effects on key sections
- Respects `prefers-reduced-motion` for accessibility

**State Management**
- React hooks (useState, useEffect, useRef) for local component state
- Context API for theme management (ThemeProvider)
- No global state management library (Redux/Zustand) - intentionally kept simple
- LocalStorage for theme persistence

## Backend Architecture

**API Routes**
- Next.js API routes for server-side functionality
- `/app/api/contact/route.tsx` handles contact form submissions
- Email delivery via Resend API with environment-based configuration
- Form validation and honeypot spam protection on client side

**Data Sources**
- Static data stored as TypeScript constants (logos, testimonials, timeline items)
- No traditional database for content - portfolio data is code-defined
- Supabase client utilities present but not actively used in current implementation

## External Dependencies

**Third-Party Services**
- **Resend**: Transactional email service for contact form submissions
- **Calendly**: Embedded scheduling widget for meeting bookings (iframe integration)
- **Vercel Analytics**: Performance and visitor analytics
- **Supabase**: Client libraries included for future database/auth features (currently unused)

**UI Libraries**
- **Radix UI**: Accessible component primitives (Dialog, Dropdown, Tooltip, etc.)
- **Lucide React**: Icon library for consistent iconography
- **Sonner**: Toast notification system with custom styling

**Animation & Interaction Libraries**
- **keen-slider**: Touch-enabled slider/carousel
- **canvas-confetti**: Particle effects for celebrations
- **react-countup**: Number animation for KPI metrics
- **react-simple-typewriter**: Typewriter text effect

**Development Tools**
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Static type checking
- **class-variance-authority**: Type-safe variant-based styling
- **clsx/tailwind-merge**: Class name utilities

**Performance Considerations**
- Code splitting through dynamic imports for heavy libraries (confetti)
- Image optimization via `next/image` component
- Bundle size target: ≤150 kB gzipped JavaScript
- Lighthouse performance target: ≥95 score
- Intersection observers used to defer animations until elements are visible

**Deployment & Analytics**
- Deployed on Replit with autoscale deployment target
- Environment variables for API keys (Resend, Supabase) managed through Replit Secrets
- Built-in Vercel Analytics for performance monitoring
- Development server runs on 0.0.0.0:5000 for Replit compatibility
- Production build uses `pnpm run build` → `pnpm run start`