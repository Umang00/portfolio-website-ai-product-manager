import { Button } from "@/components/ui/button"
import { Github, Linkedin, Twitter, FileText } from "lucide-react"

const socialLinks = [
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/in/umang" },
  { name: "GitHub", icon: Github, href: "https://github.com/umang" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/umang" },
]

export function Footer() {
  return (
    <footer id="footer" className="py-20 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Let's Build Something Amazing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Always open to discussing new opportunities, product ideas, or just chatting about the latest in AI and
              product management.
            </p>
          </div>

          {/* Social links */}
          <div className="flex justify-center gap-4">
            {socialLinks.map((link) => (
              <Button key={link.name} variant="outline" size="icon" asChild>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  <link.icon className="h-4 w-4" />
                  <span className="sr-only">{link.name}</span>
                </a>
              </Button>
            ))}
            <Button variant="outline" asChild>
              <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-2" />
                Resume
              </a>
            </Button>
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              © 2024 Umang Thakkar. Built with Next.js, Tailwind CSS, and lots of ☕
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
