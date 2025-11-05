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
