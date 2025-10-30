"use client"

import { useEffect, useRef, useState } from "react"
import { IconType } from "react-icons"
import { 
  SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiPython, SiNodedotjs,
  SiOpenai, SiAnthropic, SiGooglegemini, SiHuggingface, SiLangchain,
  SiSupabase, SiPostgresql, SiPrisma, SiVercel, SiAmazon, SiDocker,
  SiGithub, SiMixpanel, SiFigma, SiNotion, SiLinear
} from "react-icons/si"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const coreSkills = [
  { header: "Product Management", items: ["MVP Building","Feature Prioritization","Roadmapping","PRD Writing","Cross-Functional Leadership","Experimentation Design","Product Visioning","Market Research","OKR Planning","Go-to-Market Planning","Business Case Development"]},
  { header: "AI Development", items: ["LLM Fine-Tuning","LoRA Training","RAG Systems","Voice Agent Development","Prompt Engineering","Context Engineering","Function Calling","Tool Integration","Agentic Workflow Design","Text-to-Image Generation","Image-to-Image Translation","Inpainting & Outpainting","Style Transfer","ControlNet Implementation","Model Training","API Integration"]},
  { header: "Data & Analytics", items: ["SQL Analytics","Data Pipeline Design","Funnel Analysis","Cohort Analysis","Dashboard Building","Statistical Analysis","Performance Metrics","Vector Embeddings","Data Cleaning"]},
  { header: "User & Growth", items: ["User Research","UX Strategy","Onboarding Optimization","Retention Strategy","Engagement Design","A/B Testing","Conversion Optimization"]},
  { header: "Content & Strategy", items: ["Content Strategy","Storytelling","Trend Integration","Campaign Design","Growth Experiments"]},
  { header: "Product Operations", items: ["Roadmap Execution","Feedback Loops","Documentation","Knowledge Management","Experiment Tracking","Stakeholder Management"]},
]

const techStack = [
  { header: "AI & ML Platforms", items: ["OpenAI","Anthropic","Groq","Grok","Gemini","OpenRouter","Hugging Face","ElevenLabs","Whisper","Runway ML","HeyGen"]},
  { header: "AI Development Frameworks", items: ["LangChain","LlamaIndex","AutoGen","CrewAI","DSPy","ComfyUI","FlashAttention","Gradio","Baseten"]},
  { header: "Generative AI & Diffusion", items: ["Stable Diffusion","SDXL","Flux","Midjourney","ControlNet","AnimateDiff","DreamBooth","LoRA Training","Wan","Veo","NanoBanana","Seedream","ESRGAN","Pix2Pix","CycleGAN","Gaussian Splatting","NeRFs","InstantID","IP-Adapter"]},
  { header: "Frontend", items: ["React","Next.js","TypeScript","JavaScript","Tailwind","ShadCN","Framer Motion"]},
  { header: "Backend & APIs", items: ["Python","Node.js","FastAPI","Supabase","PostgreSQL","Prisma","Resend","Postman"]},
  { header: "Infra & DevOps", items: ["Vercel","AWS","Docker","GitHub Actions","Git","Serverless Deployment"]},
  { header: "Analytics & Operations", items: ["Mixpanel","PostHog","Amplitude","Google Analytics","Retool","Tableau","Notion","Linear","Coda","Airtable"]},
  { header: "Design & Prototyping", items: ["Figma","V0","Cursor","Bolt.new","Lovable","Replit","VoiceFlow"]},
  { header: "Automation & Workflows", items: ["Make.com","n8n","Zapier","Retool Workflows"]},
]

const techLogos: Array<{ name: string; Icon: IconType; color?: string }> = [
  { name: "React", Icon: SiReact, color: "#61DAFB" },
  { name: "Next.js", Icon: SiNextdotjs },
  { name: "TypeScript", Icon: SiTypescript, color: "#3178C6" },
  { name: "JavaScript", Icon: SiJavascript, color: "#F7DF1E" },
  { name: "Python", Icon: SiPython, color: "#3776AB" },
  { name: "Node.js", Icon: SiNodedotjs, color: "#339933" },
  { name: "OpenAI", Icon: SiOpenai },
  { name: "Claude", Icon: SiAnthropic, color: "#D4A574" },
  { name: "Gemini", Icon: SiGooglegemini, color: "#4285F4" },
  { name: "Groq", Icon: SiOpenai },
  { name: "Hugging Face", Icon: SiHuggingface, color: "#FFD21E" },
  { name: "LangChain", Icon: SiLangchain },
  { name: "LlamaIndex", Icon: SiOpenai },
  { name: "Supabase", Icon: SiSupabase, color: "#3ECF8E" },
  { name: "PostgreSQL", Icon: SiPostgresql, color: "#4169E1" },
  { name: "Prisma", Icon: SiPrisma },
  { name: "Vercel", Icon: SiVercel },
  { name: "AWS", Icon: SiAmazon, color: "#FF9900" },
  { name: "Docker", Icon: SiDocker, color: "#2496ED" },
  { name: "GitHub", Icon: SiGithub },
  { name: "Mixpanel", Icon: SiMixpanel, color: "#7856FF" },
  { name: "PostHog", Icon: SiMixpanel },
  { name: "Figma", Icon: SiFigma, color: "#F24E1E" },
  { name: "Notion", Icon: SiNotion },
  { name: "Linear", Icon: SiLinear },
  { name: "Cursor", Icon: SiLinear },
  { name: "ElevenLabs", Icon: SiOpenai },
]

function Capsule({ children }: { children: string }) {
  return (
    <span className="inline-block rounded-full px-3 py-1 text-sm bg-muted border border-border hover:bg-accent transition-colors">
      {children}
    </span>
  )
}

function CategoryCard({ header, items }: { header: string; items: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`bg-card rounded-lg p-6 border transition-all duration-500 motion-reduce:transition-none ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <h3 className="font-semibold text-lg mb-4 text-primary">{header}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Capsule key={index}>{item}</Capsule>
        ))}
      </div>
    </div>
  )
}

function MarqueeLogos() {
  const midpoint = Math.ceil(techLogos.length / 2)
  const row1Logos = techLogos.slice(0, midpoint)
  const row2Logos = techLogos.slice(midpoint)

  return (
    <TooltipProvider delayDuration={100}>
      <div className="mb-12 space-y-6 overflow-hidden">
        {/* Row 1: Left to Right */}
        <div className="relative group">
          <div className="flex gap-4 animate-marquee-ltr group-hover:pause group-focus-within:pause motion-reduce:animate-none">
            {[...row1Logos, ...row1Logos].map((tool, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <button
                    className="inline-flex items-center justify-center rounded-full w-12 h-12 bg-muted border border-border hover:bg-accent hover:scale-110 hover:shadow-lg transition-all duration-300 flex-shrink-0"
                    aria-label={tool.name}
                  >
                    <tool.Icon 
                      className="w-5 h-5" 
                      style={tool.color ? { color: tool.color } : undefined}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tool.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Row 2: Right to Left */}
        <div className="relative group">
          <div className="flex gap-4 animate-marquee-rtl group-hover:pause group-focus-within:pause motion-reduce:animate-none">
            {[...row2Logos, ...row2Logos].map((tool, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <button
                    className="inline-flex items-center justify-center rounded-full w-12 h-12 bg-muted border border-border hover:bg-accent hover:scale-110 hover:shadow-lg transition-all duration-300 flex-shrink-0"
                    aria-label={tool.name}
                  >
                    <tool.Icon 
                      className="w-5 h-5" 
                      style={tool.color ? { color: tool.color } : undefined}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tool.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export function SkillsAndStack() {
  return (
    <section id="tools" className="py-20 px-4">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* SECTION A - Core Skills */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Skills</h2>
            <p className="text-lg text-muted-foreground">Capabilities I bring to product building</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {coreSkills.map((category, index) => (
              <CategoryCard key={index} header={category.header} items={category.items} />
            ))}
          </div>
        </div>

        {/* SECTION B - Tech Stack */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tech Stack</h2>
            <p className="text-lg text-muted-foreground">Technologies and tools I use to ship products</p>
          </div>

          <MarqueeLogos />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {techStack.map((category, index) => (
              <CategoryCard key={index} header={category.header} items={category.items} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
