"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X } from "lucide-react"

const navItems = [
  { name: "Home", href: "#hero" },
  { name: "Process", href: "#process" },
  { name: "Highlights", href: "#highlights" },
  { name: "Projects", href: "#projects" },
  { name: "Social Proof", href: "#social-proof" },
  { name: "Journey", href: "#journey" },
  { name: "Tools", href: "#tools" },
  { name: "Contact", href: "#contact" },
]

export function StickyHeader() {
  const [activeSection, setActiveSection] = useState("hero")
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map((i) => i.href.slice(1))
      const y = window.scrollY + 100
      for (const section of sections) {
        const el = document.getElementById(section)
        if (!el) continue
        const { offsetTop, offsetHeight } = el
        if (y >= offsetTop && y < offsetTop + offsetHeight) {
          setActiveSection(section)
          break
        }
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
      return () => { b.style.overflow = prev }
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
      <nav className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Left: name */}
          <div className="font-bold text-lg md:text-xl tracking-tight">Umang Thakkar</div>

          {/* Center: desktop nav (>= lg) */}
          <div className="hidden lg:flex flex-1 justify-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant={activeSection === item.href.slice(1) ? "default" : "ghost"}
                size="sm"
                onClick={() => scrollTo(item.href)}
                className="text-base px-4 py-2"
              >
                {item.name}
              </Button>
            ))}
          </div>

          {/* Right: theme toggle + burger (< lg) */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              aria-label="Open menu"
              className="p-2 lg:hidden"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Drawer & overlay for < lg */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!drawerOpen}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setDrawerOpen(false)}
        />

        {/* Panel */}
        <aside
          className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-background border-l shadow-xl
                      transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="font-semibold">Menu</div>
            <button aria-label="Close menu" className="p-2" onClick={() => setDrawerOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant={activeSection === item.href.slice(1) ? "default" : "ghost"}
                size="sm"
                className="justify-start text-base px-4 py-2"
                onClick={() => scrollTo(item.href)}
              >
                {item.name}
              </Button>
            ))}

            <div className="mt-4 border-t pt-4">
              <div className="text-sm text-muted-foreground mb-2">Appearance</div>
              <ThemeToggle />
            </div>
          </div>
        </aside>
      </div>
    </header>
  )
}
