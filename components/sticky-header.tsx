"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

const navItems = [
  { name: "Home", href: "#hero" },
  { name: "KPIs", href: "#kpis" },
  { name: "Process", href: "#process" },
  { name: "Projects", href: "#projects" },
  { name: "Social Proof", href: "#social-proof" },
  { name: "Journey", href: "#journey" },
  { name: "Tools", href: "#tools" },
  { name: "Contact", href: "#contact" },
]

export function StickyHeader() {
  const [activeSection, setActiveSection] = useState("hero")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  // Scroll spy with requestAnimationFrame throttling for performance
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sections = navItems.map((i) => i.href.slice(1))
          const y = window.scrollY + 100
          const viewportCenter = window.scrollY + window.innerHeight / 2
          
          // Find the section whose center is closest to the viewport center
          let activeSection = "hero"
          let minDistance = Infinity
          
          for (const section of sections) {
            const el = document.getElementById(section)
            if (!el) continue
            const { offsetTop, offsetHeight } = el
            const sectionCenter = offsetTop + offsetHeight / 2
            const distance = Math.abs(viewportCenter - sectionCenter)
            
            // Only consider sections that are in view
            if (y >= offsetTop && y < offsetTop + offsetHeight) {
              if (distance < minDistance) {
                minDistance = distance
                activeSection = section
              }
            }
          }
          
          setActiveSection(activeSection)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Lock body scroll when drawer open
  useEffect(() => {
    const b = document.body
    if (drawerOpen) {
      const prev = b.style.overflow
      b.style.overflow = "hidden"
      return () => {
        b.style.overflow = prev
      }
    }
  }, [drawerOpen])

  const scrollTo = (href: string) => {
    const el = document.getElementById(href.slice(1))
    if (!el) return
    el.scrollIntoView({ behavior: "smooth" })
    setDrawerOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="font-bold text-xl md:text-2xl tracking-tight">
            Umang Thakkar
          </div>

          {/* Center (desktop nav) */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.href.slice(1)
              return (
                <motion.div
                  key={item.name}
                  className="relative"
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="default"
                    onClick={() => scrollTo(item.href)}
                    className="text-sm px-3 py-2 font-medium relative"
                    enableAnimation={false}
                  >
                    {item.name}
                    {isActive && !shouldReduceMotion && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        layoutId="activeIndicator"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Button>
                </motion.div>
              )
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <motion.button
              aria-label="Open menu"
              className="p-2 lg:hidden hover:bg-accent rounded-md transition-colors"
              onClick={() => setDrawerOpen(true)}
              whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-6 w-6" />
            </motion.button>
          </div>
        </div>
      </nav>


      {/* Drawer & overlay for < lg */}
      <AnimatePresence>
        {drawerOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50"
            aria-hidden={!drawerOpen}
          >
            {/* Overlay - strong blur and dim to hide background content */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
            />

            {/* Panel - solid background to fully cover content behind */}
            <motion.aside
              className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-background dark:bg-[#0a0a0a] border-l shadow-2xl isolate"
              role="dialog"
              aria-modal="true"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ backgroundColor: 'var(--background)' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b bg-inherit">
                <div className="font-semibold">Menu</div>
                <motion.button
                  aria-label="Close menu"
                  className="p-2"
                  onClick={() => setDrawerOpen(false)}
                  whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 90 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              <motion.div
                className="p-4 flex flex-col gap-2 bg-inherit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {navItems.map((item, index) => {
                  const isActive = activeSection === item.href.slice(1)
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className="justify-start text-base px-4 py-2 w-full"
                        onClick={() => scrollTo(item.href)}
                        enableAnimation={false}
                      >
                        {item.name}
                      </Button>
                    </motion.div>
                  )
                })}

                <motion.div
                  className="mt-4 border-t pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-sm text-muted-foreground mb-2">Appearance</div>
                  <ThemeToggle />
                </motion.div>
              </motion.div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </header>
  )
}
