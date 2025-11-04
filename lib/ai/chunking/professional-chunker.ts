// lib/ai/chunking/professional-chunker.ts

export interface Chunk {
  text: string
  category: string
  subcategory?: string
  metadata: {
    source: string
    section?: string
    company?: string
    role?: string
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
  if (sections.skills) {
    chunks.push({
      text: sections.skills.join('\n'),
      category: 'resume_skills',
      metadata: { source, section: 'SKILLS' },
    })
  }

  // Process other sections (SUMMARY, ACHIEVEMENTS, etc.)
  for (const [sectionName, sectionContent] of Object.entries(sections)) {
    if (!['experience', 'education', 'skills'].includes(sectionName)) {
      chunks.push({
        text: sectionContent.join('\n'),
        category: 'resume_general',
        subcategory: sectionName,
        metadata: { source, section: sectionName.toUpperCase() },
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
  if (sections.skills) {
    chunks.push({
      text: sections.skills.join('\n'),
      category: 'linkedin_skills',
      metadata: { source, section: 'SKILLS' },
    })
  }

  // Process other sections
  for (const [sectionName, sectionContent] of Object.entries(sections)) {
    if (!['experience', 'education', 'skills'].includes(sectionName)) {
      chunks.push({
        text: sectionContent.join('\n'),
        category: 'linkedin_general',
        subcategory: sectionName,
        metadata: { source, section: sectionName.toUpperCase() },
      })
    }
  }

  console.log(`✅ Chunked LinkedIn profile into ${chunks.length} chunks`)
  return chunks
}

/**
 * Detect sections in document (EXPERIENCE, EDUCATION, SKILLS, etc.)
 */
function detectSections(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = {}
  let currentSection: string | null = null

  const sectionHeaders = [
    'EXPERIENCE',
    'WORK EXPERIENCE',
    'PROFESSIONAL EXPERIENCE',
    'EMPLOYMENT',
    'EDUCATION',
    'SKILLS',
    'TECHNICAL SKILLS',
    'SUMMARY',
    'ABOUT',
    'ACHIEVEMENTS',
    'PROJECTS',
    'CERTIFICATIONS',
    'LICENSES & CERTIFICATIONS',
    'HONORS & AWARDS',
  ]

  for (const line of lines) {
    const upperLine = line.toUpperCase()

    // Check if this line is a section header
    const matchedSection = sectionHeaders.find(header => {
      return upperLine === header || upperLine.startsWith(header)
    })

    if (matchedSection) {
      currentSection = matchedSection.toLowerCase().replace(/\s+/g, '_')
      sections[currentSection] = []
    } else if (currentSection) {
      sections[currentSection].push(line)
    }
  }

  return sections
}

/**
 * Extract individual job entries from experience section
 */
function extractExperienceEntries(
  experienceLines: string[],
  source: string,
  prefix: 'resume' | 'linkedin' = 'resume'
): Chunk[] {
  const chunks: Chunk[] = []
  let currentEntry: string[] = []
  let currentCompany: string | undefined
  let currentRole: string | undefined
  let currentYear: string | undefined

  for (let i = 0; i < experienceLines.length; i++) {
    const line = experienceLines[i]

    // Detect company name (usually bold/uppercase or followed by location)
    // Heuristic: Lines that are all caps or have common company indicators
    const isCompanyLine = /^[A-Z][A-Za-z\s&.,'-]+(\s*[|•]\s*|\s{2,})/.test(line)

    // Detect role line (usually has • separators or contains "duration" patterns)
    const isRoleLine = line.includes('•') || /\d{4}\s*-\s*\d{4}|\d{4}\s*-\s*Present/i.test(line)

    // Detect bullet points
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*')

    // If we detect a new company/role, save previous entry
    if ((isCompanyLine || isRoleLine) && currentEntry.length > 0 && !isBullet) {
      // Save previous entry
      chunks.push({
        text: currentEntry.join('\n'),
        category: `${prefix}_experience`,
        metadata: {
          source,
          section: 'EXPERIENCE',
          company: currentCompany,
          role: currentRole,
          year: currentYear,
        },
      })

      // Reset for new entry
      currentEntry = []
      currentCompany = undefined
      currentRole = undefined
      currentYear = undefined
    }

    // Extract metadata
    if (isCompanyLine && !currentCompany) {
      currentCompany = line.split(/[|•]/)[0].trim()
    }

    if (isRoleLine && !currentRole) {
      const roleParts = line.split('•').map(p => p.trim())
      currentRole = roleParts[0]

      // Extract year if present
      const yearMatch = line.match(/\d{4}/)
      if (yearMatch) {
        currentYear = yearMatch[0]
      }
    }

    currentEntry.push(line)
  }

  // Save last entry
  if (currentEntry.length > 0) {
    chunks.push({
      text: currentEntry.join('\n'),
      category: `${prefix}_experience`,
      metadata: {
        source,
        section: 'EXPERIENCE',
        company: currentCompany,
        role: currentRole,
        year: currentYear,
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
        category: `${prefix}_experience`,
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
        category: `${prefix}_education`,
        metadata: { source, section: 'EDUCATION' },
      })
      currentEntry = []
    }
  }

  // Save remaining entry
  if (currentEntry.length > 0) {
    chunks.push({
      text: currentEntry.join('\n'),
      category: `${prefix}_education`,
      metadata: { source, section: 'EDUCATION' },
    })
  }

  // If no chunks created, create one from all education lines
  if (chunks.length === 0 && educationLines.length > 0) {
    chunks.push({
      text: educationLines.join('\n'),
      category: `${prefix}_education`,
      metadata: { source, section: 'EDUCATION' },
    })
  }

  return chunks
}
