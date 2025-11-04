// lib/ai/vector-store.ts
import { getDBAI } from '../db/mongodb'

export interface VectorDocument {
  text: string
  embedding: number[]
  category: string
  subcategory?: string
  metadata: {
    source: string
    section?: string
    company?: string
    role?: string
    year?: string
    chunkIndex?: number
    [key: string]: any
  }
  createdAt: Date
}

export interface SearchResult {
  text: string
  category: string
  subcategory?: string
  metadata: any
  score: number
}

const COLLECTION_NAME = 'memoryIndex'
const VECTOR_INDEX_NAME = 'vector_index'

/**
 * Store embeddings in MongoDB
 * @param documents Array of documents with embeddings
 */
export async function storeEmbeddings(documents: VectorDocument[]): Promise<void> {
  try {
    if (!documents || documents.length === 0) {
      console.warn('No documents to store')
      return
    }

    const db = await getDBAI()
    const collection = db.collection(COLLECTION_NAME)

    // Insert all documents
    await collection.insertMany(documents)

    console.log(`✅ Stored ${documents.length} embeddings in MongoDB`)
  } catch (error) {
    console.error('Error storing embeddings:', error)
    throw error
  }
}

/**
 * Clear all embeddings from the collection
 */
export async function clearEmbeddings(): Promise<void> {
  try {
    const db = await getDBAI()
    const collection = db.collection(COLLECTION_NAME)

    const result = await collection.deleteMany({})
    console.log(`🗑️ Cleared ${result.deletedCount} embeddings from collection`)
  } catch (error) {
    console.error('Error clearing embeddings:', error)
    throw error
  }
}

/**
 * Delete embeddings by source filename
 * @param sources Array of source filenames to delete
 */
export async function deleteBySource(sources: string[]): Promise<void> {
  try {
    const db = await getDBAI()
    const collection = db.collection(COLLECTION_NAME)

    const result = await collection.deleteMany({
      'metadata.source': { $in: sources },
    })

    console.log(`🗑️ Deleted ${result.deletedCount} embeddings from sources: ${sources.join(', ')}`)
  } catch (error) {
    console.error('Error deleting embeddings by source:', error)
    throw error
  }
}

/**
 * Basic vector similarity search using MongoDB Atlas Vector Search
 * @param queryEmbedding The query embedding vector
 * @param limit Number of results to return
 * @returns Array of search results
 */
export async function searchSimilar(
  queryEmbedding: number[],
  limit: number = 5
): Promise<SearchResult[]> {
  try {
    const db = await getDBAI()
    const collection = db.collection(COLLECTION_NAME)

    const results = await collection
      .aggregate([
        {
          $vectorSearch: {
            index: VECTOR_INDEX_NAME,
            queryVector: queryEmbedding,
            path: 'embedding',
            numCandidates: limit * 10, // Search more candidates for better quality
            limit: limit,
          },
        },
        {
          $project: {
            _id: 0,
            text: 1,
            category: 1,
            subcategory: 1,
            metadata: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ])
      .toArray()

    return results as SearchResult[]
  } catch (error) {
    console.error('Error in vector search:', error)
    throw error
  }
}

/**
 * Advanced search with category filtering and re-ranking
 * @param queryEmbedding The query embedding vector
 * @param options Search options
 * @returns Array of search results
 */
export async function smartSearch(
  queryEmbedding: number[],
  options: {
    limit?: number
    categories?: string[]
    yearFilter?: string
    boostRecent?: boolean
  } = {}
): Promise<SearchResult[]> {
  try {
    const { limit = 5, categories, yearFilter, boostRecent = true } = options

    const db = await getDBAI()
    const collection = db.collection(COLLECTION_NAME)

    // Build the aggregation pipeline
    const pipeline: any[] = [
      {
        $vectorSearch: {
          index: VECTOR_INDEX_NAME,
          queryVector: queryEmbedding,
          path: 'embedding',
          numCandidates: limit * 20, // Get more candidates for filtering
          limit: limit * 4, // Get 4x results for re-ranking
        },
      },
      {
        $project: {
          _id: 0,
          text: 1,
          category: 1,
          subcategory: 1,
          metadata: 1,
          embedding: 1, // Keep embedding for potential re-ranking
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ]

    // Add category filter if specified
    if (categories && categories.length > 0) {
      pipeline.push({
        $match: {
          category: { $in: categories },
        },
      })
    }

    // Add year filter if specified
    if (yearFilter) {
      pipeline.push({
        $match: {
          'metadata.year': yearFilter,
        },
      })
    }

    const results = (await collection.aggregate(pipeline).toArray()) as SearchResult[]

    // Re-rank results if boost recent is enabled
    if (boostRecent) {
      return reRankResults(results, limit)
    }

    // Return top results
    return results.slice(0, limit)
  } catch (error) {
    console.error('Error in smart search:', error)
    throw error
  }
}

/**
 * Re-rank search results with multiple signals
 * @param results Initial search results
 * @param limit Final number of results to return
 * @returns Re-ranked results
 */
function reRankResults(results: SearchResult[], limit: number): SearchResult[] {
  const currentYear = new Date().getFullYear()

  const rankedResults = results.map(result => {
    let finalScore = result.score

    // Category boost (prefer certain categories)
    const categoryBoosts: Record<string, number> = {
      resume_experience: 1.3,
      linkedin_experience: 1.25,
      journey_narrative: 1.2,
      resume_skills: 1.15,
    }

    if (categoryBoosts[result.category]) {
      finalScore *= categoryBoosts[result.category]
    }

    // Recency boost
    if (result.metadata?.year) {
      const year = parseInt(result.metadata.year)
      if (year >= currentYear) {
        finalScore *= 1.3 // Current year
      } else if (year === currentYear - 1) {
        finalScore *= 1.2 // Last year
      } else if (year >= currentYear - 2) {
        finalScore *= 1.1 // Last 2 years
      }
    }

    // Chunk quality boost (prefer medium-length chunks)
    const tokenCount = result.text.split(/\s+/).length
    if (tokenCount >= 100 && tokenCount <= 300) {
      finalScore *= 1.1
    }

    return {
      ...result,
      score: finalScore,
    }
  })

  // Sort by final score and return top results
  rankedResults.sort((a, b) => b.score - a.score)
  return rankedResults.slice(0, limit)
}

/**
 * Analyze query to determine which categories to search
 * @param query The user query
 * @returns Array of relevant categories
 */
export function analyzeQueryForCategories(query: string): string[] {
  const ql = query.toLowerCase()
  const categories: string[] = []

  // Work/Experience related
  if (/work|job|experience|role|position|company|employment|career/.test(ql)) {
    categories.push('resume_experience', 'linkedin_experience')
  }

  // Journey/Story related
  if (/decision|learn|journey|why|story|approach|process|challenge/.test(ql)) {
    categories.push('journey_narrative', 'journey_section')
  }

  // Skills related
  if (/skill|technology|tool|tech stack|expertise|proficient/.test(ql)) {
    categories.push('resume_skills', 'linkedin_skills')
  }

  // Projects related
  if (/project|build|built|created|developed|code|github/.test(ql)) {
    categories.push('github', 'resume_experience', 'linkedin_experience')
  }

  // Education related
  if (/education|school|university|degree|study|learn/.test(ql)) {
    categories.push('resume_education', 'linkedin_education')
  }

  // If no specific categories found, search all
  if (categories.length === 0) {
    return []
  }

  return categories
}

/**
 * Get statistics about the vector store
 * @returns Statistics object
 */
export async function getVectorStoreStats(): Promise<{
  totalDocuments: number
  categoryCounts: Record<string, number>
  oldestDocument?: Date
  newestDocument?: Date
}> {
  try {
    const db = await getDBAI()
    const collection = db.collection(COLLECTION_NAME)

    const totalDocuments = await collection.countDocuments()

    // Get category distribution
    const categoryAgg = await collection
      .aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    const categoryCounts: Record<string, number> = {}
    for (const item of categoryAgg) {
      categoryCounts[item._id] = item.count
    }

    // Get oldest and newest documents
    const oldestDoc = await collection.findOne({}, { sort: { createdAt: 1 } })
    const newestDoc = await collection.findOne({}, { sort: { createdAt: -1 } })

    return {
      totalDocuments,
      categoryCounts,
      oldestDocument: oldestDoc?.createdAt,
      newestDocument: newestDoc?.createdAt,
    }
  } catch (error) {
    console.error('Error getting vector store stats:', error)
    throw error
  }
}

/**
 * Check if MongoDB Atlas Vector Search index exists
 * @returns True if index exists
 */
export async function checkVectorIndexExists(): Promise<boolean> {
  try {
    const db = await getDBAI()
    const collection = db.collection(COLLECTION_NAME)

    const indexes = await collection.listSearchIndexes().toArray()
    const vectorIndex = indexes.find((idx: any) => idx.name === VECTOR_INDEX_NAME)

    return !!vectorIndex
  } catch (error) {
    console.error('Error checking vector index:', error)
    return false
  }
}
