// lib/ai/chunking/narrative-chunker.ts

export interface Chunk {
  text: string
  category: string
  subcategory?: string
  metadata: {
    source: string
    year?: string
    paragraphRange?: string
  }
}

/**
 * Chunk journey documents using sliding window approach
 * Journey documents are narrative-style, so we use overlapping windows
 * to preserve context across chunk boundaries
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

  // Split into paragraphs (separated by double newlines or single newlines)
  const paragraphs = content
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => {
      // Clean up line breaks within paragraphs
      return p.replace(/\n/g, ' ').replace(/\s+/g, ' ')
    })

  console.log(`Journey document has ${paragraphs.length} paragraphs`)

  // Sliding window parameters
  const windowSize = 4 // Number of paragraphs per chunk
  const overlapSize = 2 // Number of paragraphs to overlap

  // If document is very short, create single chunk
  if (paragraphs.length <= windowSize) {
    chunks.push({
      text: paragraphs.join('\n\n'),
      category: 'journey_narrative',
      metadata: {
        source,
        year,
        paragraphRange: `1-${paragraphs.length}`,
      },
    })
    return chunks
  }

  // Create sliding windows
  for (let i = 0; i < paragraphs.length; i += (windowSize - overlapSize)) {
    const window = paragraphs.slice(i, i + windowSize)

    if (window.length === 0) break

    // Stop if we're just repeating the same content
    if (window.length < overlapSize && i > 0) {
      break
    }

    const startParagraph = i + 1
    const endParagraph = i + window.length

    chunks.push({
      text: window.join('\n\n'),
      category: 'journey_narrative',
      metadata: {
        source,
        year,
        paragraphRange: `${startParagraph}-${endParagraph}`,
      },
    })
  }

  console.log(`✅ Chunked journey into ${chunks.length} chunks with overlap`)
  return chunks
}

/**
 * Alternative chunking by token count (more precise)
 * @param content The extracted journey text
 * @param source Source filename
 * @param year Optional year
 * @param targetTokens Target tokens per chunk (default: 700)
 * @param overlapTokens Overlap tokens between chunks (default: 150)
 * @returns Array of chunks
 */
export function chunkJourneyByTokens(
  content: string,
  source: string,
  year?: string,
  targetTokens: number = 700,
  overlapTokens: number = 150
): Chunk[] {
  const chunks: Chunk[] = []

  // Simple tokenization (split by whitespace, rough approximation)
  const words = content.split(/\s+/)
  const totalTokens = words.length

  console.log(`Journey document has ~${totalTokens} tokens`)

  if (totalTokens <= targetTokens) {
    // Document is short enough to be a single chunk
    chunks.push({
      text: content,
      category: 'journey_narrative',
      metadata: { source, year },
    })
    return chunks
  }

  let chunkIndex = 1
  for (let i = 0; i < words.length; i += (targetTokens - overlapTokens)) {
    const windowWords = words.slice(i, i + targetTokens)

    if (windowWords.length === 0) break

    // Stop if we're just repeating a tiny fragment
    if (windowWords.length < overlapTokens && i > 0) {
      break
    }

    const chunkText = windowWords.join(' ')

    chunks.push({
      text: chunkText,
      category: 'journey_narrative',
      subcategory: `chunk_${chunkIndex}`,
      metadata: {
        source,
        year,
      },
    })

    chunkIndex++
  }

  console.log(`✅ Chunked journey into ${chunks.length} token-based chunks`)
  return chunks
}

/**
 * Extract key sections from journey document if they have headers
 * (Some journey docs may have section headers like "Q1 2024", "January", etc.)
 */
export function extractJourneySections(content: string, source: string, year?: string): Chunk[] {
  const chunks: Chunk[] = []

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
          category: 'journey_section',
          subcategory: currentHeader.toLowerCase().replace(/\s+/g, '_'),
          metadata: {
            source,
            year,
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
      category: 'journey_section',
      subcategory: currentHeader.toLowerCase().replace(/\s+/g, '_'),
      metadata: {
        source,
        year,
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
