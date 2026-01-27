// lib/ai/loaders/pdf-loader-dynamic.ts
// Dynamic import version to work around Next.js webpack issues
import fs from 'fs'
import path from 'path'

export interface PDFDocument {
  filename: string
  content: string
  type: 'resume' | 'linkedin' | 'journey' | 'generic'
  metadata: {
    pages: number
    year?: string
    source: string
  }
}

/**
 * Parse a PDF file and extract its text content
 * @param filePath Absolute path to the PDF file
 * @returns Extracted text content
 */
export async function parsePDF(filePath: string): Promise<string> {
  try {
    // Use pdf-parse-new as the single parsing implementation
    const alt = await import('pdf-parse-new')
    const pdfFn = (alt as any)?.default ?? (alt as any)
    if (typeof pdfFn !== 'function') {
      throw new TypeError('pdf-parse-new did not export a function')
    }

    const dataBuffer = fs.readFileSync(filePath)
    const data = await (pdfFn as (b: Buffer) => Promise<{ text: string }>)(dataBuffer)

    // Filter out common PDF artifacts like page numbers
    let cleanedText = data.text
      .replace(/^Page \d+ of \d+$/gm, '')  // Remove "Page X of Y" lines
      .replace(/\f/g, '')  // Remove form feed characters (page breaks)
      .replace(/\n{3,}/g, '\n\n')  // Normalize multiple newlines to max 2

    return cleanedText
  } catch (error) {
    console.error(`Error parsing PDF ${filePath}:`, error)
    throw error
  }
}

/**
 * Detect the type of document based on filename and content
 * @param filename The name of the file
 * @param content The extracted text content
 * @returns Document type classification
 */
export function detectDocumentType(filename: string, content: string): PDFDocument['type'] {
  const lowerFilename = filename.toLowerCase()

  if (lowerFilename.includes('resume') || lowerFilename.includes('cv')) {
    return 'resume'
  }

  if (lowerFilename.includes('linkedin') || lowerFilename.includes('profile')) {
    return 'linkedin'
  }

  if (lowerFilename.includes('journey')) {
    return 'journey'
  }

  return 'generic'
}

/**
 * Extract year from filename if present (e.g., journey_fy-2023-2024.pdf)
 * @param filename The filename
 * @returns Extracted year or undefined
 */
export function extractYearFromFilename(filename: string): string | undefined {
  const yearMatch = filename.match(/20\d{2}/g)
  if (yearMatch && yearMatch.length > 0) {
    // If multiple years, take the most recent
    return yearMatch[yearMatch.length - 1]
  }
  return undefined
}

/**
 * Load all PDF and Markdown documents from the documents folder
 * @returns Array of parsed PDF documents
 */
export async function loadAllPDFs(): Promise<PDFDocument[]> {
  const documentsPath = path.join(process.cwd(), 'documents')

  if (!fs.existsSync(documentsPath)) {
    console.warn('Documents folder not found, creating it...')
    fs.mkdirSync(documentsPath, { recursive: true })
    return []
  }

  // Load both PDF and Markdown files
  const pdfFiles = fs.readdirSync(documentsPath).filter(f => f.endsWith('.pdf'))
  const mdFiles = fs.readdirSync(documentsPath).filter(f => f.endsWith('.md'))

  if (pdfFiles.length === 0 && mdFiles.length === 0) {
    console.warn('No PDF or Markdown files found in documents folder')
    return []
  }

  console.log(`Found ${pdfFiles.length} PDF files and ${mdFiles.length} Markdown files to process`)

  const documents: PDFDocument[] = []

  // Process PDF files
  for (const file of pdfFiles) {
    try {
      const filePath = path.join(documentsPath, file)
      const content = await parsePDF(filePath)
      const type = detectDocumentType(file, content)
      const year = extractYearFromFilename(file)

      // Get file stats for metadata
      const stats = fs.statSync(filePath)

      // Estimate page count (rough estimate based on content length)
      const estimatedPages = Math.ceil(content.length / 2000)

      documents.push({
        filename: file,
        content,
        type,
        metadata: {
          pages: estimatedPages,
          year,
          source: file,
        },
      })

      console.log(`✅ Loaded ${file} (${type}, ~${estimatedPages} pages)`)
    } catch (error) {
      console.error(`❌ Failed to load ${file}:`, error)
    }
  }

  // Process Markdown files (treated as 'generic' type)
  for (const file of mdFiles) {
    try {
      const filePath = path.join(documentsPath, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      const year = extractYearFromFilename(file)

      // Estimate page count (rough estimate based on content length)
      const estimatedPages = Math.ceil(content.length / 2000)

      documents.push({
        filename: file,
        content,
        type: 'generic',
        metadata: {
          pages: estimatedPages,
          year,
          source: file,
        },
      })

      console.log(`✅ Loaded ${file} (markdown/generic, ~${estimatedPages} pages)`)
    } catch (error) {
      console.error(`❌ Failed to load ${file}:`, error)
    }
  }

  return documents
}

/**
 * Load a specific PDF or Markdown document
 * @param filename Name of the file in the documents folder
 * @returns Parsed document
 */
export async function loadPDF(filename: string): Promise<PDFDocument> {
  const documentsPath = path.join(process.cwd(), 'documents')
  const filePath = path.join(documentsPath, filename)

  if (!fs.existsSync(filePath)) {
    throw new Error(`Document file not found: ${filename}`)
  }

  let content: string
  
  // Handle markdown files differently - read directly instead of parsing as PDF
  if (filename.endsWith('.md')) {
    content = fs.readFileSync(filePath, 'utf-8')
  } else {
    content = await parsePDF(filePath)
  }
  
  const type = filename.endsWith('.md') ? 'generic' : detectDocumentType(filename, content)
  const year = extractYearFromFilename(filename)

  const estimatedPages = Math.ceil(content.length / 2000)

  return {
    filename,
    content,
    type,
    metadata: {
      pages: estimatedPages,
      year,
      source: filename,
    },
  }
}

/**
 * Get list of all PDF and Markdown files in documents folder
 * @returns Array of filenames
 */
export function listPDFs(): string[] {
  const documentsPath = path.join(process.cwd(), 'documents')

  if (!fs.existsSync(documentsPath)) {
    return []
  }

  return fs.readdirSync(documentsPath).filter(f => f.endsWith('.pdf') || f.endsWith('.md'))
}
