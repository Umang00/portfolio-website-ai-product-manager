// lib/ai/loaders/pdf-loader.ts
import fs from 'fs'
import path from 'path'
const pdfParse = require('pdf-parse')

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
    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdfParse(dataBuffer)
    return data.text
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
 * Load all PDF documents from the documents folder
 * @returns Array of parsed PDF documents
 */
export async function loadAllPDFs(): Promise<PDFDocument[]> {
  const documentsPath = path.join(process.cwd(), 'documents')

  if (!fs.existsSync(documentsPath)) {
    console.warn('Documents folder not found, creating it...')
    fs.mkdirSync(documentsPath, { recursive: true })
    return []
  }

  const files = fs.readdirSync(documentsPath).filter(f => f.endsWith('.pdf'))

  if (files.length === 0) {
    console.warn('No PDF files found in documents folder')
    return []
  }

  console.log(`Found ${files.length} PDF files to process`)

  const documents: PDFDocument[] = []

  for (const file of files) {
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

  return documents
}

/**
 * Load a specific PDF document
 * @param filename Name of the PDF file in the documents folder
 * @returns Parsed PDF document
 */
export async function loadPDF(filename: string): Promise<PDFDocument> {
  const documentsPath = path.join(process.cwd(), 'documents')
  const filePath = path.join(documentsPath, filename)

  if (!fs.existsSync(filePath)) {
    throw new Error(`PDF file not found: ${filename}`)
  }

  const content = await parsePDF(filePath)
  const type = detectDocumentType(filename, content)
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
 * Get list of all PDF files in documents folder
 * @returns Array of filenames
 */
export function listPDFs(): string[] {
  const documentsPath = path.join(process.cwd(), 'documents')

  if (!fs.existsSync(documentsPath)) {
    return []
  }

  return fs.readdirSync(documentsPath).filter(f => f.endsWith('.pdf'))
}
