export interface Project {
  // Core fields
  id: string
  slug: string
  title: string
  image: string
  imageAlt: string
  imageBlurDataURL?: string

  // Descriptions
  briefDescription: string
  detailedDescription?: string // Solution/Action/Approach
  problem?: string // Problem/Context/Issue
  hoverDetails?: string
  outcomeBullets?: string[] // Results/Outcomes/Impacts as bullet points

  // Content
  technologies: string[] // Array for button labels
  tags?: string[]

  // Links (all optional)
  demoUrl?: string
  codeUrl?: string
  youtubeUrl?: string
  hasDemo?: boolean
  hasCode?: boolean
  hasYoutube?: boolean
  demoIsExternal?: boolean

  // Status
  status?: string
  statusColor?: string
  isFeatured?: boolean

  // Metrics
  kpi?: string
  kpiLabel?: string
  kpiValue?: string

  // AI Context
  aiContext?: string // Build notes/blob for companion
  stack?: string // Tech stack summary
  repo?: string // Repository name

  // Theming
  theme?: "dark" | "light"
}

