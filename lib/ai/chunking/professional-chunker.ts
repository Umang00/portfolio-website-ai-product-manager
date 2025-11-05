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
    chunks.push({
      text: skillsContent.join('\n'),
      category: 'resume',
      subcategory: 'skills',
      metadata: { source, section: 'SKILLS' },
    })
  }

  // Process other sections (SUMMARY, ACHIEVEMENTS, etc.)
  for (const [sectionName, sectionContent] of Object.entries(sections)) {
    if (!['experience', 'education', 'skills', 'technical_skills', 'skills_and_tools',
          'work_experience', 'professional_experience', 'employment'].includes(sectionName)) {
      chunks.push({
        text: sectionContent.join('\n'),
        category: 'resume',
        subcategory: sectionName,
        metadata: { source, section: sectionName.toUpperCase().replace(/_/g, ' ') },
      })
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
    chunks.push({
      text: skillsContent.join('\n'),
      category: 'linkedin',
      subcategory: 'skills',
      metadata: { source, section: 'SKILLS' },
    })
  }

  // Process other sections
  for (const [sectionName, sectionContent] of Object.entries(sections)) {
    if (!['experience', 'education', 'skills', 'technical_skills', 'skills_and_tools',
          'work_experience', 'professional_experience', 'employment'].includes(sectionName)) {
      chunks.push({
        text: sectionContent.join('\n'),
        category: 'linkedin',
        subcategory: sectionName,
        metadata: { source, section: sectionName.toUpperCase().replace(/_/g, ' ') },
      })
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

    // Check if this line is ALL CAPS and short (likely a section header)
    const isAllCaps = upperLine === line.trim() && /^[A-Z\s&]+$/.test(upperLine) && upperLine.length < 100

    // Check if this line matches known section headers (case-insensitive)
    const matchedSection = sectionHeaders.find(header => {
      return upperLine === header || upperLine.startsWith(header) || upperLine.includes(header)
    })

    if (matchedSection || (isAllCaps && upperLine.length > 3)) {
      // Use matched section or the line itself as section name
      const sectionName = matchedSection || upperLine
      currentSection = sectionName.toLowerCase().replace(/\s+/g, '_').replace(/[&]/g, 'and')
      sections[currentSection] = []
    } else if (currentSection) {
      sections[currentSection].push(line)
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

    // Detect pipe delimiter format: "Company (Industry) | Position"
    const pipeMatch = line.match(/^(.+?)\s*\|\s*(.+)$/)

    // Detect company name with industry: "Company (Industry)"
    const companyIndustryMatch = line.match(/^([^(]+?)\s*\(([^)]+)\)\s*$/)

    // Detect date range patterns
    const dateMatch = line.match(/(\d{4})\s*[-–]\s*(\d{4}|Present|Current)/i)

    // Detect location patterns: "City, State" or "City, Country"
    const locationMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/)

    // Detect bullet points
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.startsWith('–')

    // If we detect a new job entry, save previous one
    const isNewEntry = (pipeMatch || companyIndustryMatch || dateMatch) && currentEntry.length > 5 && !isBullet

    if (isNewEntry) {
      // Save previous entry
      chunks.push({
        text: currentEntry.join('\n'),
        category: prefix,
        subcategory: 'experience',
        metadata: {
          source,
          section: 'EXPERIENCE',
          company: currentCompany,
          position: currentPosition,
          location: currentLocation,
          dateRange: currentDateRange,
          industry: currentIndustry,
          year: currentDateRange?.match(/\d{4}/)?.[0]
        },
      })

      // Reset for new entry
      currentEntry = []
      currentCompany = undefined
      currentPosition = undefined
      currentLocation = undefined
      currentDateRange = undefined
      currentIndustry = undefined
    }

    // Parse pipe delimiter: "Company (Industry) | Position"
    if (pipeMatch && !currentCompany) {
      const [, left, right] = pipeMatch

      // Check if left side has industry in parentheses
      const industryMatch = left.match(/^(.+?)\s*\(([^)]+)\)/)
      if (industryMatch) {
        currentCompany = industryMatch[1].trim()
        currentIndustry = industryMatch[2].trim()
        currentPosition = right.trim()
      } else {
        // Could be "Position | Company" or "Company | Position"
        // Heuristic: positions usually have keywords like Manager, Engineer, etc.
        const positionKeywords = /manager|engineer|developer|analyst|designer|specialist|consultant|director|lead|associate|intern|coordinator/i
        if (positionKeywords.test(left)) {
          currentPosition = left.trim()
          currentCompany = right.trim()
        } else {
          currentCompany = left.trim()
          currentPosition = right.trim()
        }
      }
    }
    // Parse company with industry: "Company (Industry)"
    else if (companyIndustryMatch && !currentCompany) {
      currentCompany = companyIndustryMatch[1].trim()
      currentIndustry = companyIndustryMatch[2].trim()
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
    chunks.push({
      text: currentEntry.join('\n'),
      category: prefix,
      subcategory: 'experience',
      metadata: {
        source,
        section: 'EXPERIENCE',
        company: currentCompany,
        position: currentPosition,
        location: currentLocation,
        dateRange: currentDateRange,
        industry: currentIndustry,
        year: currentDateRange?.match(/\d{4}/)?.[0]
      },
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
