"use client"

import { IconType } from "react-icons"
import { AnimatedCard } from "@/components/animations/animated-card"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { 
  SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiPython, SiNodedotjs,
  SiOpenai, SiAnthropic, SiGooglegemini, SiHuggingface, SiLangchain,
  SiSupabase, SiPostgresql, SiPrisma, SiVercel, SiAmazon, SiDocker,
  SiGithub, SiMixpanel, SiFigma, SiNotion, SiLinear, SiTailwindcss,
  SiFramer, SiFastapi, SiGit, SiPostman, SiGoogleanalytics,
  SiTableau, SiAirtable, SiZapier, SiStripe, SiSlack, SiTrello,
  SiJira, SiMongodb, SiRedis, SiGraphql, SiNginx, SiKubernetes,
  SiTensorflow, SiPytorch, SiJupyter, SiNumpy, SiPandas,
  SiStorybook, SiVite, SiFastapi as SiFastapiAlt, SiReplit, SiRetool
} from "react-icons/si"

const coreSkills = [
  { header: "Product Management", items: ["MVP Building","Feature Prioritization","Roadmapping","PRD Writing","Cross-Functional Leadership","Experimentation Design","Product Visioning","Market Research","OKR Planning","Go-to-Market Planning","Business Case Development"]},
  { header: "AI Development", items: ["LLM Fine-Tuning","LoRA Training","RAG Systems","Voice Agent Development","Prompt Engineering","Context Engineering","Function Calling","Tool Integration","Agentic Workflow Design","Multi-Agent Orchestration","MCP Server Development","Agent SDK Integration","Model Selection Strategy","Text-to-Image Generation","Image-to-Image Translation","Inpainting & Outpainting","Style Transfer","ControlNet Implementation","Model Training","API Integration"]},
  { header: "Data & Analytics", items: ["SQL Analytics","Data Pipeline Design","Funnel Analysis","Cohort Analysis","Dashboard Building","Statistical Analysis","Performance Metrics","Vector Embeddings","Data Cleaning"]},
  { header: "User & Growth", items: ["User Research","UX Strategy","Onboarding Optimization","Retention Strategy","Engagement Design","A/B Testing","Conversion Optimization"]},
  { header: "Content & Strategy", items: ["Content Strategy","Storytelling","Trend Integration","Campaign Design","Growth Experiments"]},
  { header: "Product Operations", items: ["Roadmap Execution","Feedback Loops","Documentation","Knowledge Management","Experiment Tracking","Stakeholder Management"]},
]

const techStack = [
  { header: "AI & ML Platforms", items: ["OpenAI","Anthropic","Groq","Grok","Gemini","OpenRouter","Hugging Face","ElevenLabs","Whisper","Runway ML","HeyGen"]},
  { header: "Agentic AI & Orchestration", items: ["OpenAI Agents SDK","Google ADK","Claude Agent SDK","MCP Servers","A2A Protocol","Agno","CrewAI","AutoGen","LangGraph","Multi-Agent Systems"]},
  { header: "AI Development Frameworks", items: ["LangChain","LlamaIndex","DSPy","ComfyUI","FlashAttention","Gradio","Baseten"]},
  { header: "Generative AI & Diffusion", items: ["Stable Diffusion","SDXL","Flux","Midjourney","ControlNet","AnimateDiff","DreamBooth","LoRA Training","Wan","Veo","NanoBanana","Seedream","InstantID","IP-Adapter"]},
  { header: "Frontend", items: ["React","Next.js","TypeScript","JavaScript","Tailwind","ShadCN","Framer Motion"]},
  { header: "Backend & APIs", items: ["Python","Node.js","FastAPI","Streamlit","Supabase","PostgreSQL","Prisma","Resend","Postman"]},
  { header: "Infra & DevOps", items: ["Vercel","AWS","Docker","GitHub Actions","Git","Serverless Deployment"]},
  { header: "Analytics & Operations", items: ["Mixpanel","PostHog","Amplitude","Google Analytics","Retool","Tableau","Notion","Linear","Coda","Airtable"]},
  { header: "Design & Prototyping", items: ["Figma","V0","Cursor","Claude Code","Bolt.new","Lovable","Replit","VoiceFlow"]},
  { header: "AI Coding Assistants", items: ["Antigravity","Google AI Studio","Gemini Code Assist","GitHub Copilot","Windsurf","Codeium"]},
  { header: "Automation & Workflows", items: ["Make.com","n8n","Zapier","Retool Workflows"]},
]

const techLogos: Array<{ name: string; Icon: IconType; color?: string }> = [
  { name: "React", Icon: SiReact, color: "#61DAFB" },
  { name: "Next.js", Icon: SiNextdotjs },
  { name: "TypeScript", Icon: SiTypescript, color: "#3178C6" },
  { name: "JavaScript", Icon: SiJavascript, color: "#F7DF1E" },
  { name: "Python", Icon: SiPython, color: "#3776AB" },
  { name: "Node.js", Icon: SiNodedotjs, color: "#339933" },
  { name: "Tailwind", Icon: SiTailwindcss, color: "#06B6D4" },
  { name: "Vite", Icon: SiVite, color: "#646CFF" },
  { name: "OpenAI", Icon: SiOpenai },
  { name: "Anthropic", Icon: SiAnthropic, color: "#D4A574" },
  { name: "Gemini", Icon: SiGooglegemini, color: "#4285F4" },
  { name: "Hugging Face", Icon: SiHuggingface, color: "#FFD21E" },
  { name: "LangChain", Icon: SiLangchain },
  { name: "Storybook", Icon: SiStorybook, color: "#FF4785" },
  { name: "Replit", Icon: SiReplit },
  { name: "Retool", Icon: SiRetool },
  { name: "Supabase", Icon: SiSupabase, color: "#3ECF8E" },
  { name: "PostgreSQL", Icon: SiPostgresql, color: "#4169E1" },
  { name: "MongoDB", Icon: SiMongodb, color: "#47A248" },
  { name: "Redis", Icon: SiRedis, color: "#DC382D" },
  { name: "Prisma", Icon: SiPrisma },
  { name: "GraphQL", Icon: SiGraphql, color: "#E10098" },
  { name: "FastAPI", Icon: SiFastapi, color: "#009688" },
  { name: "Vercel", Icon: SiVercel },
  { name: "AWS", Icon: SiAmazon, color: "#FF9900" },
  { name: "Docker", Icon: SiDocker, color: "#2496ED" },
  { name: "Kubernetes", Icon: SiKubernetes, color: "#326CE5" },
  { name: "Nginx", Icon: SiNginx, color: "#009639" },
  { name: "GitHub", Icon: SiGithub },
  { name: "Git", Icon: SiGit, color: "#F05032" },
  { name: "Mixpanel", Icon: SiMixpanel, color: "#7856FF" },
  { name: "Slack", Icon: SiSlack, color: "#4A154B" },
  { name: "Google Analytics", Icon: SiGoogleanalytics, color: "#E37400" },
  { name: "Tableau", Icon: SiTableau, color: "#E97627" },
  { name: "Figma", Icon: SiFigma, color: "#F24E1E" },
  { name: "Notion", Icon: SiNotion },
  { name: "Linear", Icon: SiLinear },
  { name: "Airtable", Icon: SiAirtable, color: "#18BFFF" },
  { name: "Zapier", Icon: SiZapier, color: "#FF4A00" },
  { name: "Stripe", Icon: SiStripe, color: "#008CDD" },
  { name: "Trello", Icon: SiTrello, color: "#0052CC" },
  { name: "Jira", Icon: SiJira, color: "#0052CC" },
  { name: "Postman", Icon: SiPostman, color: "#FF6C37" },
  { name: "TensorFlow", Icon: SiTensorflow, color: "#FF6F00" },
  { name: "PyTorch", Icon: SiPytorch, color: "#EE4C2C" },
  { name: "Jupyter", Icon: SiJupyter, color: "#F37626" },
  { name: "NumPy", Icon: SiNumpy, color: "#013243" },
  { name: "Pandas", Icon: SiPandas, color: "#150458" },
  { name: "Framer", Icon: SiFramer },
]

function Capsule({ children }: { children: string }) {
  return (
    <span className="inline-block rounded-full px-3 py-1 text-sm bg-muted border border-border hover:bg-accent transition-colors">
      {children}
    </span>
  )
}

function CategoryCard({ header, items }: { header: string; items: string[] }) {
  return (
    <AnimatedCard
      variant="all"
      className="bg-card rounded-lg p-6 border"
    >
      <h3 className="font-semibold text-lg mb-4 text-primary">{header}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Capsule key={index}>{item}</Capsule>
        ))}
      </div>
    </AnimatedCard>
  )
}

function TechCard({ name, Icon, color }: { name: string; Icon: IconType; color?: string }) {
  const IconComponent = Icon as React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  return (
    <AnimatedCard
      variant="all"
      className="flex flex-col items-center justify-center gap-3 rounded-lg px-6 py-4 min-w-[140px] bg-card border border-border flex-shrink-0"
    >
      <IconComponent 
        className="w-8 h-8" 
        style={color ? { color } : undefined}
      />
      <span className="text-sm font-medium whitespace-nowrap">{name}</span>
    </AnimatedCard>
  )
}

function MarqueeLogos() {
  const midpoint = Math.ceil(techLogos.length / 2)
  const row1Logos = techLogos.slice(0, midpoint)
  const row2Logos = techLogos.slice(midpoint)

  return (
    <div className="mb-6 space-y-2 py-2"> {/* Reduced spacing: mb-6 (24px), space-y-2 (8px), py-2 (8px) */}
      {/* Row 1: Left to Right - Continuous loop */}
      <div className="relative group overflow-hidden pt-2 pb-2"> {/* Reduced padding: pt-2 pb-2 (8px top/bottom) */}
        <div className="flex gap-3 animate-marquee-ltr group-hover:pause group-focus-within:pause motion-reduce:animate-none w-max">
          {[...row1Logos, ...row1Logos].map((tool, index) => (
            <div key={index} className="flex-shrink-0 pt-2 pb-2"> {/* Padding to each card wrapper */}
              <TechCard name={tool.name} Icon={tool.Icon} color={tool.color} />
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Right to Left - Continuous loop */}
      <div className="relative group overflow-hidden pt-2 pb-2"> {/* Reduced padding: pt-2 pb-2 (8px top/bottom) */}
        <div className="flex gap-3 animate-marquee-rtl group-hover:pause group-focus-within:pause motion-reduce:animate-none w-max">
          {[...row2Logos, ...row2Logos].map((tool, index) => (
            <div key={index} className="flex-shrink-0 pt-2 pb-2"> {/* Padding to each card wrapper */}
              <TechCard name={tool.name} Icon={tool.Icon} color={tool.color} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SkillsAndStack() {
  return (
    <section id="tools" className="py-20 px-4">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* SECTION A - Core Skills */}
        <div>
          <ScrollReveal variant="fadeInUp" delay={0.2}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Skills</h2>
            <p className="text-lg text-muted-foreground">Capabilities I bring to product building</p>
          </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {coreSkills.map((category, index) => (
              <CategoryCard key={index} header={category.header} items={category.items} />
            ))}
          </div>
        </div>

        {/* SECTION B - Tech Stack */}
        <div>
          <ScrollReveal variant="fadeInUp" delay={0.2}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tech Stack</h2>
            <p className="text-lg text-muted-foreground">Technologies and tools I use to ship products</p>
          </div>
          </ScrollReveal>

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
