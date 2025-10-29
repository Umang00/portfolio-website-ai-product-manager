type TimelineItem = {
  title: string
  company: string
  date: string
  achievements: string[]
}

const timelineItems: TimelineItem[] = [
  {
    title: "AI Builder",
    company: "100x Engineers Cohort",
    date: "Jun 2025 – Present",
    achievements: [
      "Upskilling in rapid MVP development and AI product experimentation through the cohort",
      "Founded Lightning AI Solutions to deliver end-to-end AI products as a one-person product team",
      "Built and shipped prototypes like Newsletter Generator, Lecture Lens, Foggy LoRA, and Astrology AI MVP",
      "Specializing in End-to-End Product Building, LLM fine-tuning, Voice Agent Architectures, RAG Systems, and AI Agents",
    ],
  },
  {
    title: "Associate Product Manager",
    company: "Hunch (Dating & Social App)",
    date: "Oct 2024 – Jun 2025",
    achievements: [
      "Increased user engagement by 200% through MBTI-based personality matching system",
      "Created web onboarding revenue stream generating $1.5K monthly, contributing 30% boost to $5K monthly revenue",
      "Built Retool analytics dashboard, saving $1K+ monthly and 15+ hours weekly of manual analysis",
      "Improved session time by 100% with fine-tuned chat models and AI conversation starters",
      "Deployed voice-based UXR agent, scaling research from 2 → 50+ daily calls, reducing costs by 70%",
      "Enhanced View-to-Wave conversion by 50% through optimized shortvibes",
      "Automated A/B testing workflows, reducing dependency on tech team by 80%",
      "Built custom GPT for app store review sentiment analysis",
    ],
  },
  {
    title: "Content Strategist",
    company: "Hunch (Polling App)",
    date: "Oct 2023 – Sep 2024",
    achievements: [
      "Orchestrated content strategy during app transition from polling to dating",
      "Managed team of 6, improving output by 60%",
      "Designed and launched Poll Promotion Interface, cutting manual work by 85%",
      "Reduced Day-0 uninstall rate by 35% via optimized onboarding polls",
      "Ran content experiments for female categories, achieving 80% increase in publications and 100% increase in share",
      "Enhanced personalized feeds with category-based targeting",
    ],
  },
  {
    title: "Content Writer",
    company: "PlotX (Crypto Gaming Platform)",
    date: "Jun 2022 – Oct 2022",
    achievements: [
      "Improved organic traffic by 50%, driving 3K+ monthly signups",
      "Authored 30+ SEO-rich blogs, boosting engagement time by 100% and reducing bounce rate by 25%",
      "Conducted 100+ research interviews, validating polling concepts for Hunch's pivot",
    ],
  },
  {
    title: "Content Writer",
    company: "iNurture Education Solutions (EdTech)",
    date: "Feb 2022 – Jun 2022",
    achievements: [
      "Improved course completion by 20% and student satisfaction by 15%",
      "Developed academic content impacting 5K+ learners across AI, Finance, Law, and Cybersecurity",
    ],
  },
  {
    title: "Content Writer",
    company: "Freelance",
    date: "Nov 2021 – May 2022",
    achievements: [
      "Reached 5M+ readers by ghostwriting 300+ articles for 20+ global clients (Blockchain Council, CoinFantasy, Guardian Link, Economic Times, Niva Bupa Life Insurance)",
      "Increased engagement by 30% for client brands in finance, investment, and crypto",
      "Secured long-term partnerships with 80% of clients",
    ],
  },
]

export function Timeline() {
  return (
    <section id="journey" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">My Journey</h2>
          <p className="text-lg text-muted-foreground">The path of building, scaling, and reimagining products</p>
        </div>

        <div className="space-y-8">
          {timelineItems.map((item, index) => (
            <div key={index} className="flex gap-6 group">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-primary rounded-full border-4 border-background ring-4 ring-primary/20"></div>
                {index < timelineItems.length - 1 && <div className="w-0.5 flex-1 bg-border mt-4"></div>}
              </div>

              <div className="flex-1 pb-8">
                <div className="bg-card rounded-lg p-6 border hover:border-primary/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="text-primary font-medium">{item.company}</p>
                    </div>
                    <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded w-fit">
                      {item.date}
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {item.achievements.map((achievement, i) => (
                      <li key={i} className="text-muted-foreground leading-relaxed flex gap-2">
                        <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
