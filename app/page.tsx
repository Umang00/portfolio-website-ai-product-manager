import { StickyHeader } from "@/components/sticky-header"
import { Hero } from "@/components/hero"
import { KpiSection } from "@/components/kpi-section"
import { ProcessWheel } from "@/components/process-wheel"
import { ShippedHighlights } from "@/components/shipped-highlights"
import { ProjectsSlider } from "@/components/projects-slider"
import { ClientLogos } from "@/components/client-logos"
import { WallOfLove } from "@/components/wall-of-love"
import { SkillsAndStack } from "@/components/skills-and-stack"
import { Timeline } from "@/components/timeline"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { BackToTop } from "@/components/back-to-top"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <StickyHeader />

      <Hero />
      <KpiSection />
      <ProcessWheel />
      <ShippedHighlights />
      <ProjectsSlider />
      <section id="social-proof">
        <ClientLogos />
        <WallOfLove />
      </section>
      <section id="journey">
        <Timeline />
      </section>
      <SkillsAndStack />
      <ContactSection />
      <Footer />
      <BackToTop />

    </main>
  )
}
