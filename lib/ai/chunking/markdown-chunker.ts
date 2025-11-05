// lib/ai/chunking/markdown-chunker.ts
import { detectParagraphs, detectSentences, calculateSmartOverlap, detectSectionHeaders } from './boundary-detector'

export interface Chunk {
  text: string
  category: string
  subcategory: string | null
  metadata: {
    source: string
    year?: string
    section?: string
    partInfo?: string  // e.g., "Part 1 of 3"
    language?: string
    stars?: number
    topics?: string[]
  }
}

/**
 * Chunk GitHub repository README files with markdown section awareness
 * Detects markdown headers (# Header, ## Header, etc.) and creates chunks
 * that respect section boundaries
 *
 * @param content The README markdown content
 * @param repoMetadata Repository metadata (name, description, language, stars, topics)
 * @param source Repository name
 * @param year Year from updatedAt
 * @returns Array of chunks
 */
export function chunkGitHub(
  content: string,
  repoMetadata: {
    name: string
    description?: string
    language?: string
    stars?: number
    topics?: string[]
  },
  source: string,
  year?: string
): Chunk[] {
  const chunks: Chunk[] = []

  // Detect markdown headers
  const sectionHeaders = detectSectionHeaders(content)

  // If no headers, fall back to paragraph-based chunking
  if (sectionHeaders.length === 0) {
    return chunkGitHubByParagraphs(content, repoMetadata, source, year)
  }

  // Create metadata text to prepend to each chunk
  const metadataText = `Repository: ${repoMetadata.name}
${repoMetadata.description ? `Description: ${repoMetadata.description}` : ''}
Language: ${repoMetadata.language || 'Unknown'}
Stars: ${repoMetadata.stars || 0}
Topics: ${repoMetadata.topics?.join(', ') || 'None'}`

  // Split content by sections
  const sections: Array<{ header: string; content: string; position: number }> = []

  for (let i = 0; i < sectionHeaders.length; i++) {
    const currentHeader = sectionHeaders[i]
    const nextHeader = sectionHeaders[i + 1]

    const startPos = currentHeader.position
    const endPos = nextHeader ? nextHeader.position : content.length

    const sectionContent = content.slice(startPos, endPos).trim()

    sections.push({
      header: currentHeader.header,
      content: sectionContent,
      position: currentHeader.position,
    })
  }

  // Chunk each section (if section is too large, split it further)
  const targetWords = 600
  const maxWords = 800

  for (const section of sections) {
    const sectionWords = section.content.split(/\s+/).length

    // If section is small enough, create single chunk
    if (sectionWords <= maxWords) {
      chunks.push({
        text: `${metadataText}\n\n${section.content}`,
        category: 'github',
        subcategory: section.header.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        metadata: {
          source,
          year,
          section: section.header,
          language: repoMetadata.language,
          stars: repoMetadata.stars,
          topics: repoMetadata.topics,
        },
      })
    } else {
      // Section is large, split by paragraphs with smart overlap
      const paragraphs = detectParagraphs(section.content)
      let currentChunk: string[] = []
      let currentWordCount = 0
      let partIndex = 1

      for (const paragraph of paragraphs) {
        const paragraphWords = paragraph.split(/\s+/).length

        if (currentWordCount > 0 && currentWordCount + paragraphWords > maxWords) {
          // Save current chunk with smart overlap
          const chunkText = currentChunk.join('\n\n')
          const overlap = calculateSmartOverlap(chunkText, 25)

          chunks.push({
            text: `${metadataText}\n\nSection: ${section.header}\n\n${chunkText}`,
            category: 'github',
            subcategory: section.header.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            metadata: {
              source,
              year,
              section: section.header,
              partInfo: `Part ${partIndex}`,
              language: repoMetadata.language,
              stars: repoMetadata.stars,
              topics: repoMetadata.topics,
            },
          })

          // Start new chunk with overlap
          currentChunk = [overlap, paragraph]
          currentWordCount = overlap.split(/\s+/).length + paragraphWords
          partIndex++
        } else {
          currentChunk.push(paragraph)
          currentWordCount += paragraphWords
        }
      }

      // Save last chunk of section
      if (currentChunk.length > 0) {
        chunks.push({
          text: `${metadataText}\n\nSection: ${section.header}\n\n${currentChunk.join('\n\n')}`,
          category: 'github',
          subcategory: section.header.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          metadata: {
            source,
            year,
            section: section.header,
            partInfo: partIndex > 1 ? `Part ${partIndex}` : undefined,
            language: repoMetadata.language,
            stars: repoMetadata.stars,
            topics: repoMetadata.topics,
          },
        })
      }
    }
  }

  // Add overall part info to all chunks
  const totalChunks = chunks.length
  if (totalChunks > 1) {
    chunks.forEach((chunk, index) => {
      const existingPartInfo = chunk.metadata.partInfo
      if (existingPartInfo && existingPartInfo.startsWith('Part ')) {
        // Keep section part info, add overall context
        chunk.metadata.partInfo = `${existingPartInfo} (Chunk ${index + 1} of ${totalChunks})`
      } else {
        chunk.metadata.partInfo = `Part ${index + 1} of ${totalChunks}`
      }
    })
  }

  console.log(`✅ Chunked GitHub README into ${chunks.length} section-aware chunks`)
  return chunks
}

/**
 * Fallback chunking for GitHub README without clear sections
 * Uses paragraph-based chunking with smart overlap
 */
function chunkGitHubByParagraphs(
  content: string,
  repoMetadata: {
    name: string
    description?: string
    language?: string
    stars?: number
    topics?: string[]
  },
  source: string,
  year?: string
): Chunk[] {
  const chunks: Chunk[] = []

  // Create metadata text
  const metadataText = `Repository: ${repoMetadata.name}
${repoMetadata.description ? `Description: ${repoMetadata.description}` : ''}
Language: ${repoMetadata.language || 'Unknown'}
Stars: ${repoMetadata.stars || 0}
Topics: ${repoMetadata.topics?.join(', ') || 'None'}`

  const paragraphs = detectParagraphs(content)
  const targetWords = 600
  const maxWords = 800

  // If content is short, create single chunk
  const totalWords = content.split(/\s+/).length
  if (totalWords <= maxWords) {
    chunks.push({
      text: `${metadataText}\n\n${content}`,
      category: 'github',
      subcategory: null,
      metadata: {
        source,
        year,
        partInfo: 'Part 1 of 1',
        language: repoMetadata.language,
        stars: repoMetadata.stars,
        topics: repoMetadata.topics,
      },
    })
    return chunks
  }

  // Build chunks with smart overlap
  let currentChunk: string[] = []
  let currentWordCount = 0

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.split(/\s+/).length

    if (currentWordCount > 0 && currentWordCount + paragraphWords > maxWords) {
      // Save current chunk with smart overlap
      const chunkText = currentChunk.join('\n\n')
      const overlap = calculateSmartOverlap(chunkText, 25)

      chunks.push({
        text: `${metadataText}\n\n${chunkText}`,
        category: 'github',
        subcategory: null,
        metadata: {
          source,
          year,
          language: repoMetadata.language,
          stars: repoMetadata.stars,
          topics: repoMetadata.topics,
        },
      })

      // Start new chunk with overlap
      currentChunk = [overlap, paragraph]
      currentWordCount = overlap.split(/\s+/).length + paragraphWords
    } else {
      currentChunk.push(paragraph)
      currentWordCount += paragraphWords
    }
  }

  // Save last chunk
  if (currentChunk.length > 0) {
    chunks.push({
      text: `${metadataText}\n\n${currentChunk.join('\n\n')}`,
      category: 'github',
      subcategory: null,
      metadata: {
        source,
        year,
        language: repoMetadata.language,
        stars: repoMetadata.stars,
        topics: repoMetadata.topics,
      },
    })
  }

  // Add part info to all chunks
  const totalChunks = chunks.length
  chunks.forEach((chunk, index) => {
    chunk.metadata.partInfo = `Part ${index + 1} of ${totalChunks}`
  })

  console.log(`✅ Chunked GitHub README into ${chunks.length} paragraph-based chunks`)
  return chunks
}
