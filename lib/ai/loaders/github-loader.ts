// lib/ai/loaders/github-loader.ts
import fetch from 'node-fetch'

export interface GitHubRepo {
  name: string
  description: string | null
  url: string
  language: string | null
  stars: number
  forks: number
  topics: string[]
  readme: string | null
  updatedAt: string
}

const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'Umang00'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

/**
 * Fetch all public repositories for the configured GitHub user
 * @returns Array of repository data with READMEs
 */
export async function loadGitHubRepos(): Promise<GitHubRepo[]> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.mercy-preview+json',  // Required for topics
      'User-Agent': 'Umang-Portfolio-AI',
    }

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`
    }

    // Fetch user's repositories
    const reposResponse = await fetch(
      `${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`,
      { headers }
    )

    if (!reposResponse.ok) {
      console.error(`GitHub API error: ${reposResponse.status} ${reposResponse.statusText}`)
      return []
    }

    const reposData = await reposResponse.json() as any[]

    console.log(`Found ${reposData.length} GitHub repositories`)

    const repos: GitHubRepo[] = []

    // Process each repository
    for (const repo of reposData) {
      try {
        // Skip forks unless they have significant changes
        if (repo.fork && repo.stargazers_count === 0) {
          continue
        }

        // Fetch README
        let readme: string | null = null
        try {
          const readmeResponse = await fetch(
            `${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repo.name}/readme`,
            { headers }
          )

          if (readmeResponse.ok) {
            const readmeData = await readmeResponse.json() as any
            const readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8')
            readme = readmeContent
          }
        } catch (error) {
          // README not found or error fetching it
          console.log(`No README found for ${repo.name}`)
        }

        repos.push({
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          topics: repo.topics || [],
          readme,
          updatedAt: repo.updated_at,
        })

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error processing repo ${repo.name}:`, error)
      }
    }

    console.log(`✅ Loaded ${repos.length} GitHub repositories with data`)
    return repos
  } catch (error) {
    console.error('Error loading GitHub repos:', error)
    return []
  }
}

/**
 * Load a specific GitHub repository by name
 * @param repoName Name of the repository
 * @returns Repository data
 */
export async function loadGitHubRepo(repoName: string): Promise<GitHubRepo | null> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.mercy-preview+json',  // Required for topics
      'User-Agent': 'Umang-Portfolio-AI',
    }

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`
    }

    // Fetch repository data
    const repoResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repoName}`,
      { headers }
    )

    if (!repoResponse.ok) {
      console.error(`GitHub API error for ${repoName}: ${repoResponse.status}`)
      return null
    }

    const repo = await repoResponse.json() as any

    // Fetch README
    let readme: string | null = null
    try {
      const readmeResponse = await fetch(
        `${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repoName}/readme`,
        { headers }
      )

      if (readmeResponse.ok) {
        const readmeData = await readmeResponse.json() as any
        const readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8')
        readme = readmeContent
      }
    } catch (error) {
      console.log(`No README found for ${repoName}`)
    }

    return {
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      topics: repo.topics || [],
      readme,
      updatedAt: repo.updated_at,
    }
  } catch (error) {
    console.error(`Error loading GitHub repo ${repoName}:`, error)
    return null
  }
}

/**
 * Check GitHub API rate limit status
 * @returns Rate limit information
 */
export async function checkGitHubRateLimit(): Promise<{
  limit: number
  remaining: number
  reset: Date
} | null> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.mercy-preview+json',  // Required for topics
      'User-Agent': 'Umang-Portfolio-AI',
    }

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`
    }

    const response = await fetch(`${GITHUB_API_BASE}/rate_limit`, { headers })

    if (!response.ok) {
      return null
    }

    const data = await response.json() as any
    const coreRateLimit = data.resources.core

    return {
      limit: coreRateLimit.limit,
      remaining: coreRateLimit.remaining,
      reset: new Date(coreRateLimit.reset * 1000),
    }
  } catch (error) {
    console.error('Error checking GitHub rate limit:', error)
    return null
  }
}
