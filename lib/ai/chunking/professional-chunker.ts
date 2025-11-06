// lib/ai/chunking/professional-chunker.ts

import {
  detectSectionHeaders,
  parseHeaderMetadata,
  calculateSmartOverlap,
  detectParagraphs
} from './boundary-detector';

export interface Chunk {
  text: string
  category: string
  subcategory: string | null
  metadata: {
    source: string
    section?: string
    company?: string
    position?: string
    role?: string
    location?: string
    dateRange?: string
    industry?: string
    year?: string
  }
}

/**
 * Chunk resume content by extracting job entries and sections
 * @param content The extracted resume text
 * @param source Source filename
 * @returns Array of chunks
 */
export function chunkResume(content: string, source: string): Chunk[] {
  const chunks: Chunk[] = []

  // Split content into lines
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  // Detect sections (EXPERIENCE, EDUCATION, SKILLS, etc.)
  const sections = detectSections(lines)

  // Process EXPERIENCE section
  if (sections.experience) {
    const experienceChunks = extractExperienceEntries(sections.experience, source)
    chunks.push(...experienceChunks)
  }

  // Process EDUCATION section
  if (sections.education) {
    const educationChunks = extractEducationEntries(sections.education, source)
    chunks.push(...educationChunks)
  }

  // Process SKILLS section
  if (sections.skills || sections.technical_skills || sections.skills_and_tools) {
    const skillsContent = sections.skills || sections.technical_skills || sections.skills_and_tools
    // Only create chunk if section has content
    if (skillsContent && skillsContent.length > 0) {
      chunks.push({
        text: skillsContent.join('\n'),
        category: 'resume',
        subcategory: 'skills',
        metadata: { source, section: 'SKILLS' },
      })
    }
  }

  // Process KEY PROJECTS section
  if (sections.key_projects || sections.key_projects_and_achievements || sections['key_projects_&_achievements'] || sections.projects) {
    const projectsContent = sections.key_projects || sections.key_projects_and_achievements || sections['key_projects_&_achievements'] || sections.projects
    const projectChunks = extractProjectEntries(projectsContent, source, 'resume')
    chunks.push(...projectChunks)
  }

  // Process other sections (SUMMARY, ACHIEVEMENTS, etc.)
  for (const [sectionName, sectionContent] of Object.entries(sections)) {
    if (!['experience', 'education', 'skills', 'technical_skills', 'skills_and_tools',
          'work_experience', 'professional_experience', 'employment',
          'key_projects', 'key_projects_and_achievements', 'key_projects_&_achievements', 'projects'].includes(sectionName)) {
      // Only create chunk if section has content
      if (sectionContent && sectionContent.length > 0) {
        chunks.push({
          text: sectionContent.join('\n'),
          category: 'resume',
          subcategory: sectionName,
          metadata: { source, section: sectionName.toUpperCase().replace(/_/g, ' ') },
        })
      }
    }
  }

  console.log(`✅ Chunked resume into ${chunks.length} chunks`)
  return chunks
}

/**
 * Chunk LinkedIn profile content
 * @param content The extracted LinkedIn PDF text
 * @param source Source filename
 * @returns Array of chunks
 */
export function chunkLinkedIn(content: string, source: string): Chunk[] {
  const chunks: Chunk[] = []

  // LinkedIn PDFs often have a similar structure to resumes
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const sections = detectSections(lines)

  // Process EXPERIENCE section
  if (sections.experience) {
    const experienceChunks = extractExperienceEntries(sections.experience, source, 'linkedin')
    chunks.push(...experienceChunks)
  }

  // Process EDUCATION section
  if (sections.education) {
    const educationChunks = extractEducationEntries(sections.education, source, 'linkedin')
    chunks.push(...educationChunks)
  }

  // Process SKILLS section
  if (sections.skills || sections.technical_skills || sections.skills_and_tools) {
    const skillsContent = sections.skills || sections.technical_skills || sections.skills_and_tools
    // Only create chunk if section has content
    if (skillsContent && skillsContent.length > 0) {
      chunks.push({
        text: skillsContent.join('\n'),
        category: 'linkedin',
        subcategory: 'skills',
        metadata: { source, section: 'SKILLS' },
      })
    }
  }

  // Process KEY PROJECTS section
  if (sections.key_projects || sections.key_projects_and_achievements || sections['key_projects_&_achievements'] || sections.projects) {
    const projectsContent = sections.key_projects || sections.key_projects_and_achievements || sections['key_projects_&_achievements'] || sections.projects
    const projectChunks = extractProjectEntries(projectsContent, source, 'linkedin')
    chunks.push(...projectChunks)
  }

  // Process other sections
  for (const [sectionName, sectionContent] of Object.entries(sections)) {
    if (!['experience', 'education', 'skills', 'technical_skills', 'skills_and_tools',
          'work_experience', 'professional_experience', 'employment',
          'key_projects', 'key_projects_and_achievements', 'key_projects_&_achievements', 'projects'].includes(sectionName)) {
      // Only create chunk if section has content
      if (sectionContent && sectionContent.length > 0) {
        chunks.push({
          text: sectionContent.join('\n'),
          category: 'linkedin',
          subcategory: sectionName,
          metadata: { source, section: sectionName.toUpperCase().replace(/_/g, ' ') },
        })
      }
    }
  }

  console.log(`✅ Chunked LinkedIn profile into ${chunks.length} chunks`)
  return chunks
}

/**
 * Detect sections in document (EXPERIENCE, EDUCATION, SKILLS, etc.)
 * Now case-insensitive and includes more section headers
 */
function detectSections(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = {}
  let currentSection: string | null = null

  // Expanded section headers - case insensitive matching
  const sectionHeaders = [
    'EXPERIENCE',
    'WORK EXPERIENCE',
    'PROFESSIONAL EXPERIENCE',
    'EMPLOYMENT',
    'EDUCATION',
    'SKILLS',
    'TOP SKILLS',
    'KEY SKILLS',
    'CORE SKILLS',
    'TECHNICAL SKILLS',
    'SKILLS & TOOLS',
    'SUMMARY',
    'PROFESSIONAL SUMMARY',
    'ABOUT',
    'ABOUT ME',
    'ACHIEVEMENTS',
    'KEY ACHIEVEMENTS',
    'PROJECTS',
    'KEY PROJECTS',
    'KEY PROJECTS AND ACHIEVEMENTS',
    'KEY PROJECTS & ACHIEVEMENTS',
    'CERTIFICATIONS',
    'LICENSES & CERTIFICATIONS',
    'LICENSES AND CERTIFICATIONS',
    'HONORS & AWARDS',
    'HONORS AND AWARDS',
    'AWARDS',
    'CONTACT',
    'LANGUAGES',
  ]

  for (const line of lines) {
    const upperLine = line.toUpperCase().trim()

    // Skip empty lines
    if (!upperLine) continue

    // Check if this line matches known section headers (case-insensitive)
    // Use exact match or startsWith only - no includes() to avoid false positives
    const matchedSection = sectionHeaders.find(header => {
      return upperLine === header || upperLine.startsWith(header + ' ')
    })

    if (matchedSection) {
      // Use the matched section header as the section name
      currentSection = matchedSection.toLowerCase().replace(/\s+/g, '_').replace(/[&]/g, 'and')

      // Only create new section if it doesn't already exist (avoid overwrites)
      if (!sections[currentSection]) {
        sections[currentSection] = []
      }
    } else if (currentSection) {
      // Add content to current section
      sections[currentSection].push(line)
    } else {
      // No section detected yet - treat as "about_me" or "summary" section
      // This captures header info like name, contact, etc. at the top of resume/LinkedIn
      if (!sections['about_me']) {
        sections['about_me'] = []
      }
      sections['about_me'].push(line)
    }
  }

  return sections
}

/**
 * Extract individual job entries from experience section
 * Now handles pipe delimiters and extracts proper metadata
 */
function extractExperienceEntries(
  experienceLines: string[],
  source: string,
  prefix: 'resume' | 'linkedin' = 'resume'
): Chunk[] {
  const chunks: Chunk[] = []
  let currentEntry: string[] = []
  let currentCompany: string | undefined
  let currentPosition: string | undefined
  let currentLocation: string | undefined
  let currentDateRange: string | undefined
  let currentIndustry: string | undefined

  for (let i = 0; i < experienceLines.length; i++) {
    const line = experienceLines[i]

    // Detect pipe delimiter format - check if line has pipes
    const hasPipes = line.includes('|')

    // Split by pipes if present (handles multiple pipes)
    const pipeParts = hasPipes ? line.split('|').map(p => p.trim()) : []

    // Detect company name with industry: "Company (Industry)"
    const companyIndustryMatch = line.match(/^([^(]+?)\s*\(([^)]+)\)/)

    // Detect date range patterns - support month names + year format
    // Matches: "October 2024 – June 2025", "Oct 2024 - Present", "2024 - 2025"
    const dateMatch = line.match(
      /((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{4})\s*[-–—]\s*((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{4}|Present|Current)/i
    )

    // Detect location patterns: "City, State" or "City, Country"
    const locationMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/)

    // Detect bullet points
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.startsWith('–')

    // Improved job header detection - distinguish from location/date lines
    const isJobHeader = hasPipes && pipeParts.length > 0 && !isBullet && (() => {
      // Position keywords that appear in job titles
      const positionKeywords = /manager|engineer|developer|analyst|designer|specialist|consultant|director|lead|associate|intern|coordinator|writer|strategist|architect|scientist|researcher/i

      // Check if line contains position keywords (likely a job header)
      const hasPositionKeyword = pipeParts.some(part => positionKeywords.test(part))

      // Check if line is primarily dates (NOT a job header)
      const isDatesLine = pipeParts.some(part =>
        /^\d{4}\s*[-–]\s*(\d{4}|Present|Current)/i.test(part) ||
        /^(January|February|March|April|May|June|July|August|September|October|November|December)/i.test(part)
      )

      // Check if line starts with location pattern (NOT a job header)
      const startsWithLocation = locationMatch !== null

      // A line is a job header if:
      // 1. Has position keywords, OR
      // 2. Has company with industry pattern AND at least 2 pipe parts, AND
      // 3. Doesn't start with location, AND
      // 4. Doesn't have dates as first element
      return (hasPositionKeyword || (companyIndustryMatch && pipeParts.length >= 2)) &&
             !startsWithLocation &&
             !isDatesLine
    })()

    // If we detect a new job entry, save previous one
    const isNewEntry = isJobHeader && currentEntry.length > 0

    if (isNewEntry) {
      // Save previous entry
      // For LinkedIn: only basic metadata (experience is one large chunk with multiple jobs)
      // For Resume: full metadata per job (each job is a separate chunk)
      const metadata: Record<string, any> = {
        source,
        section: 'EXPERIENCE'
      }

      // Only add detailed metadata for Resume (not LinkedIn)
      if (prefix === 'resume') {
        metadata.company = currentCompany
        metadata.position = currentPosition
        metadata.location = currentLocation
        metadata.dateRange = currentDateRange
        metadata.industry = currentIndustry
        metadata.year = currentDateRange?.match(/\d{4}/)?.[0]
      }

      chunks.push({
        text: currentEntry.join('\n'),
        category: prefix,
        subcategory: 'experience',
        metadata,
      })

      // Reset for new entry
      currentEntry = []
      currentCompany = undefined
      currentPosition = undefined
      currentLocation = undefined
      currentDateRange = undefined
      currentIndustry = undefined
    }

    // Parse pipe delimiter: Handle multiple formats
    // Format 1: "Company (Industry) | Position | Location | Dates" (4 parts)
    // Format 2: "Company (Industry) | Position" (2 parts)
    // Format 3: "Company | Position" (2 parts)
    // Only extract from job headers, not from location/date lines
    if (isJobHeader && !currentCompany) {
      if (pipeParts.length >= 4) {
        // Format 1: 4 parts - Company+Industry | Position | Location | Dates
        const part1 = pipeParts[0]
        const part2 = pipeParts[1]
        const part3 = pipeParts[2]
        const part4 = pipeParts[3]

        // Extract company and industry from first part
        const industryMatch = part1.match(/^(.+?)\s*\(([^)]+)\)/)
        if (industryMatch) {
          currentCompany = industryMatch[1].trim()
          currentIndustry = industryMatch[2].trim()
        } else {
          currentCompany = part1
        }

        currentPosition = part2
        currentLocation = part3
        currentDateRange = part4
      } else if (pipeParts.length >= 2) {
        // Format 2 or 3: 2 parts
        const part1 = pipeParts[0]
        const part2 = pipeParts[1]

        // Check if first part has industry in parentheses
        const industryMatch = part1.match(/^(.+?)\s*\(([^)]+)\)/)
        if (industryMatch) {
          currentCompany = industryMatch[1].trim()
          currentIndustry = industryMatch[2].trim()
          currentPosition = part2
        } else {
          // Could be "Position | Company" or "Company | Position"
          // Heuristic: positions usually have keywords
          const positionKeywords = /manager|engineer|developer|analyst|designer|specialist|consultant|director|lead|associate|intern|coordinator/i
          if (positionKeywords.test(part1)) {
            currentPosition = part1
            currentCompany = part2
          } else {
            currentCompany = part1
            currentPosition = part2
          }
        }
      }
    }
    // Parse company with industry: "Company (Industry)"
    else if (companyIndustryMatch && !currentCompany) {
      currentCompany = companyIndustryMatch[1].trim()
      currentIndustry = companyIndustryMatch[2].trim()
    }

    // Handle location | date line (second line format after job header)
    if (hasPipes && !isJobHeader && currentCompany && pipeParts.length >= 2) {
      // Check if this is a "Location | Date" format line
      const part1 = pipeParts[0]
      const part2 = pipeParts[1]

      // Check if part2 contains a date pattern
      const dateInPart2 = part2.match(
        /((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{4})\s*[-–—]\s*((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{4}|Present|Current)/i
      )

      // First part looks like location, second part looks like date
      if (locationMatch || /^[A-Z][a-z]+/.test(part1)) {
        if (!currentLocation) currentLocation = part1
        if (!currentDateRange && dateInPart2) currentDateRange = part2
      }
    }

    // Extract date range
    if (dateMatch && !currentDateRange) {
      currentDateRange = dateMatch[0]
    }

    // Extract location
    if (locationMatch && !currentLocation && !isBullet) {
      currentLocation = locationMatch[0]
    }

    currentEntry.push(line)
  }

  // Save last entry
  if (currentEntry.length > 0) {
    // For LinkedIn: only basic metadata (experience is one large chunk with multiple jobs)
    // For Resume: full metadata per job (each job is a separate chunk)
    const metadata: Record<string, any> = {
      source,
      section: 'EXPERIENCE'
    }

    // Only add detailed metadata for Resume (not LinkedIn)
    if (prefix === 'resume') {
      metadata.company = currentCompany
      metadata.position = currentPosition
      metadata.location = currentLocation
      metadata.dateRange = currentDateRange
      metadata.industry = currentIndustry
      metadata.year = currentDateRange?.match(/\d{4}/)?.[0]
    }

    chunks.push({
      text: currentEntry.join('\n'),
      category: prefix,
      subcategory: 'experience',
      metadata,
    })
  }

  // If heuristic extraction failed, fall back to simple chunking
  if (chunks.length === 0 && experienceLines.length > 0) {
    // Group every 10-15 lines as a chunk
    for (let i = 0; i < experienceLines.length; i += 12) {
      const chunkLines = experienceLines.slice(i, i + 12)
      chunks.push({
        text: chunkLines.join('\n'),
        category: prefix,
        subcategory: 'experience',
        metadata: { source, section: 'EXPERIENCE' },
      })
    }
  }

  return chunks
}

/**
 * Extract project entries from KEY PROJECTS section
 * Format: "Project Name | Goal" followed by bullet points
 */
function extractProjectEntries(
  projectLines: string[],
  source: string,
  prefix: 'resume' | 'linkedin' = 'resume'
): Chunk[] {
  const chunks: Chunk[] = []
  let currentEntry: string[] = []
  let currentProjectName: string | undefined
  let currentGoal: string | undefined

  for (let i = 0; i < projectLines.length; i++) {
    const line = projectLines[i]

    // Detect pipe delimiter format: "Project Name | Goal"
    const pipeMatch = line.match(/^(.+?)\s*\|\s*(.+)$/)

    // Detect bullet points
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.startsWith('–')

    // If we detect a new project entry (pipe-delimited line that's not a bullet), save previous one
    const isNewEntry = pipeMatch && currentEntry.length > 0 && !isBullet

    if (isNewEntry) {
      // Save previous entry
      chunks.push({
        text: currentEntry.join('\n'),
        category: prefix,
        subcategory: 'projects',
        metadata: {
          source,
          section: 'KEY PROJECTS',
          projectName: currentProjectName,
          goal: currentGoal,
        },
      })

      // Reset for new entry
      currentEntry = []
      currentProjectName = undefined
      currentGoal = undefined
    }

    // Parse pipe delimiter: "Project Name | Goal"
    if (pipeMatch && !currentProjectName) {
      const [, name, goal] = pipeMatch
      currentProjectName = name.trim()
      currentGoal = goal.trim()
    }

    currentEntry.push(line)
  }

  // Save last entry
  if (currentEntry.length > 0) {
    chunks.push({
      text: currentEntry.join('\n'),
      category: prefix,
      subcategory: 'projects',
      metadata: {
        source,
        section: 'KEY PROJECTS',
        projectName: currentProjectName,
        goal: currentGoal,
      },
    })
  }

  // If no pipe-delimited projects found, treat entire section as one chunk
  if (chunks.length === 0 && projectLines.length > 0) {
    chunks.push({
      text: projectLines.join('\n'),
      category: prefix,
      subcategory: 'projects',
      metadata: { source, section: 'KEY PROJECTS' },
    })
  }

  return chunks
}

/**
 * Extract education entries
 */
function extractEducationEntries(
  educationLines: string[],
  source: string,
  prefix: 'resume' | 'linkedin' = 'resume'
): Chunk[] {
  const chunks: Chunk[] = []

  // Education entries are usually short, so we can chunk more aggressively
  let currentEntry: string[] = []

  for (const line of educationLines) {
    currentEntry.push(line)

    // If entry is getting long (>5 lines), save it
    if (currentEntry.length >= 5) {
      chunks.push({
        text: currentEntry.join('\n'),
        category: prefix,
        subcategory: 'education',
        metadata: { source, section: 'EDUCATION' },
      })
      currentEntry = []
    }
  }

  // Save remaining entry
  if (currentEntry.length > 0) {
    chunks.push({
      text: currentEntry.join('\n'),
      category: prefix,
      subcategory: 'education',
      metadata: { source, section: 'EDUCATION' },
    })
  }

  // If no chunks created, create one from all education lines
  if (chunks.length === 0 && educationLines.length > 0) {
    chunks.push({
      text: educationLines.join('\n'),
      category: prefix,
      subcategory: 'education',
      metadata: { source, section: 'EDUCATION' },
    })
  }

  return chunks
}
