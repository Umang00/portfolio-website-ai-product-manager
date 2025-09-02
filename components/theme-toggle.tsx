"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark")
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} className="h-9 w-9 bg-transparent">
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
