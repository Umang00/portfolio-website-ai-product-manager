// lib/ai/embeddings.ts
import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Please define the OPENAI_API_KEY environment variable inside .env.local')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const embeddingModel = process.env.EMBEDDING_MODEL || 'text-embedding-3-small'

/**
 * Generate embedding for a single text string
 * @param text The text to generate an embedding for
 * @returns Array of numbers representing the embedding (1536 dimensions)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty for embedding generation')
    }

    const response = await openai.embeddings.create({
      model: embeddingModel,
      input: text,
      encoding_format: 'float',
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

/**
 * Generate embeddings for multiple texts in batches
 * @param texts Array of texts to generate embeddings for
 * @param batchSize Number of texts to process per batch (default: 50)
 * @returns Array of embedding arrays
 */
export async function batchGenerateEmbeddings(
  texts: string[],
  batchSize: number = 50
): Promise<number[][]> {
  try {
    if (!texts || texts.length === 0) {
      return []
    }

    // Filter out empty texts
    const validTexts = texts.filter(t => t && t.trim().length > 0)
    if (validTexts.length === 0) {
      return []
    }

    const embeddings: number[][] = []

    // Process in batches to avoid rate limits
    for (let i = 0; i < validTexts.length; i += batchSize) {
      const batch = validTexts.slice(i, i + batchSize)

      console.log(`Processing embedding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validTexts.length / batchSize)}...`)

      const batchPromises = batch.map(text => generateEmbedding(text))
      const batchEmbeddings = await Promise.all(batchPromises)

      embeddings.push(...batchEmbeddings)

      // Add small delay between batches to avoid rate limiting
      if (i + batchSize < validTexts.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log(`✅ Generated ${embeddings.length} embeddings`)
    return embeddings
  } catch (error) {
    console.error('Error in batch embedding generation:', error)
    throw error
  }
}

/**
 * Calculate cosine similarity between two embeddings
 * @param embedding1 First embedding vector
 * @param embedding2 Second embedding vector
 * @returns Similarity score between -1 and 1 (higher is more similar)
 */
export function cosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same dimensions')
  }

  let dotProduct = 0
  let magnitude1 = 0
  let magnitude2 = 0

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i]
    magnitude1 += embedding1[i] * embedding1[i]
    magnitude2 += embedding2[i] * embedding2[i]
  }

  magnitude1 = Math.sqrt(magnitude1)
  magnitude2 = Math.sqrt(magnitude2)

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0
  }

  return dotProduct / (magnitude1 * magnitude2)
}
