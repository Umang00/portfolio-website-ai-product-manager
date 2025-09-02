import { Hero } from "@/components/hero"
import { ProcessWheel } from "@/components/process-wheel"
import { ShippedHighlights } from "@/components/shipped-highlights"
import { ProjectsSlider } from "@/components/projects-slider"
import { ClientLogos } from "@/components/client-logos"
import { WallOfLove } from "@/components/wall-of-love"
import { ToolsRing } from "@/components/tools-ring"
import { Timeline } from "@/components/timeline"
import { Footer } from "@/components/footer"
import { ChatFAB } from "@/components/chat-fab"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Hero />
      <ProcessWheel />
      <ShippedHighlights />
      <ProjectsSlider />
      <ClientLogos />
      <WallOfLove />
      <ToolsRing />
      <Timeline />
      <Footer />

      <ChatFAB />
    </main>
  )
}
