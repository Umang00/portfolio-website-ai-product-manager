"use client"

import { useCelebrateOnView } from "@/lib/use-celebrate-on-view"
import { GitHubButton, LinkedInButton, ResumeButton } from "@/components/ui/social-buttons"

export function Footer() {
  const footerRef = useCelebrateOnView(0.3)

  return (
    <footer ref={footerRef} id="footer" className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-4xl font-bold">
              🎉 <span>Congratulations — your search for the right PM ends here.</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              ⏳ The time is ticking — let’s stop searching and start building.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 md:gap-5">
            <LinkedInButton />
            <GitHubButton />
            <ResumeButton />
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              © 2026 Umang Thakkar. Powered by Next.js, Tailwind CSS, custom RAG and lots of tea. ☕
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
