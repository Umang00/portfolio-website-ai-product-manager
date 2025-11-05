// lib/ai/chunking/narrative-chunker.ts
import { detectParagraphs, detectSentences, calculateSmartOverlap } from './boundary-detector'

export interface Chunk {
  text: string
  category: string
  subcategory: string | null
  metadata: {
    source: string
    fiscalYear?: string  // e.g., "FY25-26"
    paragraphRange?: string
    partInfo?: string  // e.g., "Part 1 of 3"
  }
}

/**
 * Extract fiscal year from filename (e.g., "fy25-26" -> "FY25-26")
 */
function extractFiscalYear(source: string): string | undefined {
  const fyMatch = source.match(/fy-?(\d{2,4})-(\d{2,4})/i)
  if (fyMatch) {
    const year1 = fyMatch[1].length === 2 ? fyMatch[1] : fyMatch[1].slice(-2)
    const year2 = fyMatch[2].length === 2 ? fyMatch[2] : fyMatch[2].slice(-2)
    return `FY${year1}-${year2}`
  }
  return undefined
}

/**
 * Chunk journey documents using smart boundary-aware approach
 * Journey documents are narrative-style, so we use smart overlap
 * (1 sentence or 20-25 words) to preserve context across chunk boundaries
 *
 * @param content The extracted journey text
 * @param source Source filename
 * @param year Optional year extracted from filename
 * @returns Array of chunks
 */
export function chunkJourney(
  content: string,
  source: string,
  year?: string
): Chunk[] {
  const chunks: Chunk[] = []

  // Extract fiscal year from filename (e.g., "FY25-26")
  const fiscalYear = extractFiscalYear(source)

  // Use smart paragraph detection (respects empty lines)
  const paragraphs = detectParagraphs(content)

  console.log(`Journey document has ${paragraphs.length} paragraphs`)

  // Target: ~450 tokens per chunk, soft max 500, allow up to 600 to complete naturally
  const targetTokens = 450
  const softMaxTokens = 500
  const bufferMaxTokens = 600  // Allow up to 600 to avoid tiny orphan chunks

  // If document is very short, create single chunk
  const totalWords = paragraphs.join(' ').split(/\s+/).length
  if (totalWords <= softMaxTokens) {
    chunks.push({
      text: paragraphs.join('\n\n'),
      category: 'journey',
      subcategory: null,
      metadata: {
        source,
        fiscalYear,
        paragraphRange: `1-${paragraphs.length}`,
        partInfo: 'Part 1 of 1',
      },
    })
    return chunks
  }

  // Build chunks respecting paragraph boundaries
  let currentChunk: string[] = []
  let currentWordCount = 0
  let chunkIndex = 1
  let startParagraph = 1
  let currentParagraphIndex = 0

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i]
    const paragraphTokens = paragraph.split(/\s+/).length

    // Check if adding this paragraph exceeds limits
    if (currentWordCount > 0 && currentWordCount + paragraphTokens > softMaxTokens) {
      // If we're in the buffer zone (500-600 tokens) and this completes naturally, allow it
      const projectedTotal = currentWordCount + paragraphTokens
      const isInBufferZone = projectedTotal <= bufferMaxTokens
      const isLastParagraph = i === paragraphs.length - 1

      // Allow buffer zone completion if it's reasonable
      if (isInBufferZone && (isLastParagraph || paragraphTokens < 100)) {
        // Add paragraph to complete chunk naturally
        currentChunk.push(paragraph)
        currentWordCount += paragraphTokens
        currentParagraphIndex = i + 1
        continue
      }

      // Otherwise, split here - save current chunk with smart overlap
      const chunkText = currentChunk.join('\n\n')
      const overlap = calculateSmartOverlap(chunkText)  // Last complete sentence only

      chunks.push({
        text: chunkText,
        category: 'journey',
        subcategory: null,
        metadata: {
          source,
          fiscalYear,
          paragraphRange: `${startParagraph}-${currentParagraphIndex}`,
        },
      })

      // Start new chunk with overlap
      currentChunk = [overlap, paragraph]
      currentWordCount = overlap.split(/\s+/).length + paragraphTokens
      startParagraph = currentParagraphIndex + 1
      chunkIndex++
    } else {
      // Add paragraph to current chunk
      currentChunk.push(paragraph)
      currentWordCount += paragraphTokens
    }

    currentParagraphIndex = i + 1
  }

  // Save last chunk
  if (currentChunk.length > 0) {
    chunks.push({
      text: currentChunk.join('\n\n'),
      category: 'journey',
      subcategory: null,
      metadata: {
        source,
        fiscalYear,
        paragraphRange: `${startParagraph}-${currentParagraphIndex}`,
      },
    })
  }

  // Add part info to all chunks
  const totalChunks = chunks.length
  chunks.forEach((chunk, index) => {
    chunk.metadata.partInfo = `Part ${index + 1} of ${totalChunks}`
  })

  console.log(`✅ Chunked journey into ${chunks.length} chunks with smart overlap`)
  return chunks
}

/**
 * Alternative chunking by token count with smart overlap
 * @param content The extracted journey text
 * @param source Source filename
 * @param year Optional year
 * @param targetTokens Target tokens per chunk (default: 450)
 * @returns Array of chunks
 */
export function chunkJourneyByTokens(
  content: string,
  source: string,
  year?: string,
  targetTokens: number = 450
): Chunk[] {
  const chunks: Chunk[] = []

  // Extract fiscal year from filename
  const fiscalYear = extractFiscalYear(source)

  // Use paragraph-aware chunking for better boundaries
  const paragraphs = detectParagraphs(content)
  const words = content.split(/\s+/)
  const totalTokens = words.length

  console.log(`Journey document has ~${totalTokens} tokens`)

  if (totalTokens <= targetTokens) {
    // Document is short enough to be a single chunk
    chunks.push({
      text: content,
      category: 'journey',
      subcategory: null,
      metadata: {
        source,
        fiscalYear,
        partInfo: 'Part 1 of 1',
      },
    })
    return chunks
  }

  // Build chunks with smart sentence-based overlap
  let currentText = ''
  let currentTokens = 0
  let chunkIndex = 1

  for (const paragraph of paragraphs) {
    const paragraphTokens = paragraph.split(/\s+/).length

    if (currentTokens > 0 && currentTokens + paragraphTokens > targetTokens) {
      // Save current chunk with smart overlap
      const overlap = calculateSmartOverlap(currentText)  // Last complete sentence only

      chunks.push({
        text: currentText,
        category: 'journey',
        subcategory: null,
        metadata: {
          source,
          fiscalYear,
        },
      })

      // Start new chunk with overlap
      currentText = overlap + '\n\n' + paragraph
      currentTokens = overlap.split(/\s+/).length + paragraphTokens
      chunkIndex++
    } else {
      currentText += (currentText ? '\n\n' : '') + paragraph
      currentTokens += paragraphTokens
    }
  }

  // Save last chunk
  if (currentText) {
    chunks.push({
      text: currentText,
      category: 'journey',
      subcategory: null,
      metadata: {
        source,
        fiscalYear,
      },
    })
  }

  // Add part info to all chunks
  const totalChunks = chunks.length
  chunks.forEach((chunk, index) => {
    chunk.metadata.partInfo = `Part ${index + 1} of ${totalChunks}`
  })

  console.log(`✅ Chunked journey into ${chunks.length} token-based chunks with smart overlap`)
  return chunks
}

/**
 * Extract key sections from journey document if they have headers
 * (Some journey docs may have section headers like "Q1 2024", "January", etc.)
 */
export function extractJourneySections(content: string, source: string, year?: string): Chunk[] {
  const chunks: Chunk[] = []

  // Extract fiscal year from filename
  const fiscalYear = extractFiscalYear(source)

  // Try to detect section headers (month names, quarter labels, etc.)
  const lines = content.split('\n')
  let currentSection: string[] = []
  let currentHeader: string | undefined

  const sectionPatterns = [
    /^(January|February|March|April|May|June|July|August|September|October|November|December)\s*\d{4}/i,
    /^(Q1|Q2|Q3|Q4)\s*\d{4}/i,
    /^(Week|Month)\s*\d+/i,
  ]

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (trimmedLine.length === 0) continue

    // Check if line matches a section header pattern
    const isHeader = sectionPatterns.some(pattern => pattern.test(trimmedLine))

    if (isHeader) {
      // Save previous section
      if (currentSection.length > 0 && currentHeader) {
        chunks.push({
          text: currentSection.join('\n'),
          category: 'journey',
          subcategory: currentHeader.toLowerCase().replace(/\s+/g, '_'),
          metadata: {
            source,
            year,
            fiscalYear,
          },
        })
      }

      // Start new section
      currentHeader = trimmedLine
      currentSection = []
    } else {
      currentSection.push(trimmedLine)
    }
  }

  // Save last section
  if (currentSection.length > 0 && currentHeader) {
    chunks.push({
      text: currentSection.join('\n'),
      category: 'journey',
      subcategory: currentHeader.toLowerCase().replace(/\s+/g, '_'),
      metadata: {
        source,
        fiscalYear,
      },
    })
  }

  // If no sections found, return empty (caller should use default chunking)
  if (chunks.length === 0) {
    console.log('No section headers detected in journey document')
  } else {
    console.log(`✅ Extracted ${chunks.length} sections from journey`)
  }

  return chunks
}
