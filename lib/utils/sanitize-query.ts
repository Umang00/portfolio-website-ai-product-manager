/**
 * Sanitize and prepare query string for AI Companion
 * Removes potentially harmful characters and normalizes whitespace
 */
export function sanitizeQuery(query: string): string {
  if (!query || typeof query !== "string") {
    return ""
  }

  return query
    .trim()
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/[<>]/g, "") // Remove angle brackets
    .slice(0, 1000) // Limit length
}

/**
 * Build comprehensive query for project-specific AI Companion questions
 */
export function buildProjectQuery(project: {
  id?: string
  title: string
  stack?: string
  repo?: string
  kpi?: string
  aiContext?: string
}): string {
  const parts: string[] = []

  parts.push(`Tell me about ${project.title}.`)

  if (project.stack) {
    parts.push(`Tech stack: ${project.stack}.`)
  }

  if (project.repo) {
    parts.push(`Repository: ${project.repo}.`)
  }

  if (project.kpi) {
    parts.push(`Key metric: ${project.kpi}.`)
  }

  if (project.aiContext) {
    parts.push(`Build notes: ${project.aiContext}.`)
  }

  parts.push(
    "How was it built? What were the key challenges and results?"
  )

  return sanitizeQuery(parts.join(" "))
}

