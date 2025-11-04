// lib/ai/chunking/generic-chunker.ts

export interface Chunk {
  text: string
  category: string
  metadata: {
    source: string
    chunkIndex?: number
  }
}

/**
 * Generic chunking strategy for documents that don't fit other categories
 * Uses simple paragraph-based chunking with target size
 *
 * @param content The document content
 * @param source Source filename
 * @param targetChunkSize Target characters per chunk (default: 1000)
 * @returns Array of chunks
 */
export function chunkGeneric(
  content: string,
  source: string,
  targetChunkSize: number = 1000
): Chunk[] {
  const chunks: Chunk[] = []

  // Split into paragraphs
  const paragraphs = content
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0)

  let currentChunk: string[] = []
  let currentSize = 0
  let chunkIndex = 1

  for (const paragraph of paragraphs) {
    const paragraphSize = paragraph.length

    // If adding this paragraph would exceed target size, save current chunk
    if (currentSize + paragraphSize > targetChunkSize && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.join('\n\n'),
        category: 'generic',
        metadata: {
          source,
          chunkIndex,
        },
      })

      currentChunk = []
      currentSize = 0
      chunkIndex++
    }

    currentChunk.push(paragraph)
    currentSize += paragraphSize
  }

  // Save remaining chunk
  if (currentChunk.length > 0) {
    chunks.push({
      text: currentChunk.join('\n\n'),
      category: 'generic',
      metadata: {
        source,
        chunkIndex,
      },
    })
  }

  console.log(`✅ Chunked generic document into ${chunks.length} chunks`)
  return chunks
}

/**
 * Chunk by fixed character count with overlap
 * @param content The document content
 * @param source Source filename
 * @param chunkSize Characters per chunk (default: 1000)
 * @param overlap Overlap characters (default: 200)
 * @returns Array of chunks
 */
export function chunkByCharacterCount(
  content: string,
  source: string,
  chunkSize: number = 1000,
  overlap: number = 200
): Chunk[] {
  const chunks: Chunk[] = []
  const totalLength = content.length

  for (let i = 0; i < totalLength; i += (chunkSize - overlap)) {
    const chunkText = content.slice(i, i + chunkSize)

    if (chunkText.trim().length === 0) continue

    chunks.push({
      text: chunkText,
      category: 'generic',
      metadata: {
        source,
        chunkIndex: chunks.length + 1,
      },
    })
  }

  console.log(`✅ Chunked by character count into ${chunks.length} chunks`)
  return chunks
}
