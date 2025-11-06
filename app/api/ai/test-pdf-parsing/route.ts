// app/api/ai/test-pdf-parsing/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { loadAllPDFs } from '@/lib/ai/loaders/pdf-loader'

// Force Node.js runtime (pdf-parse requires Node.js APIs)
export const runtime = 'nodejs'

/**
 * Test endpoint to view raw PDF parsing output
 * Shows exactly what the PDF parser extracts and how sections are detected
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { filename, secret } = body

    // Verify admin secret
    const adminSecret = process.env.ADMIN_SECRET

    if (!adminSecret || secret !== adminSecret) {
      console.warn('[PDF Parsing Test] Unauthorized attempt')
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin secret' },
        { status: 401 }
      )
    }

    console.log(`[PDF Parsing Test] Testing: ${filename}`)

    // Load all PDFs
    const pdfDocuments = await loadAllPDFs()

    // Find the requested document
    const doc = pdfDocuments.find(d => d.filename.toLowerCase().includes(filename.toLowerCase()))

    if (!doc) {
      return NextResponse.json(
        { error: `Document not found: ${filename}`, availableDocuments: pdfDocuments.map(d => d.filename) },
        { status: 404 }
      )
    }

    // Split into lines
    const lines = doc.content.split('\n').map(l => l.trim()).filter(l => l.length > 0)

    // Detect sections using the SAME logic as chunker
    const sections = detectSections(lines)

    return NextResponse.json({
      success: true,
      filename: doc.filename,
      type: doc.type,
      metadata: doc.metadata,
      rawText: doc.content,
      lineCount: lines.length,
      lines: lines,
      sectionsDetected: Object.keys(sections),
      sectionDetails: Object.entries(sections).map(([name, content]) => ({
        sectionName: name,
        lineCount: content.length,
        lines: content,
        preview: content.slice(0, 5).join(' | ')  // First 5 lines preview
      }))
    })

  } catch (error) {
    console.error('[PDF Parsing Test] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Detect sections - COPY of current logic in professional-chunker.ts
 * This shows us exactly what the section detection is doing
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
      // No section detected yet - treat as "about_me" section
      // This captures header info like name, contact, etc. at the top of resume/LinkedIn
      if (!sections['about_me']) {
        sections['about_me'] = []
      }
      sections['about_me'].push(line)
    }
  }

  return sections
}
