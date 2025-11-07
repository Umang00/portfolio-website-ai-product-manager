// app/api/ai/check-index/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDBAI } from '@/lib/db/mongodb'

// Force Node.js runtime
export const runtime = 'nodejs'

const COLLECTION_NAME = 'memoryIndex'
const VECTOR_INDEX_NAME = 'vector_index'

export async function GET(req: NextRequest) {
  try {
    const db = await getDBAI()
    const collection = db.collection(COLLECTION_NAME)

    // Check regular indexes
    const regularIndexes = await collection.indexes()
    
    // Check vector search indexes
    let vectorIndexes: any[] = []
    let vectorIndexExists = false
    let vectorIndexStatus = 'unknown'
    
    try {
      vectorIndexes = await collection.listSearchIndexes().toArray()
      const vectorIndex = vectorIndexes.find((idx: any) => idx.name === VECTOR_INDEX_NAME)
      vectorIndexExists = !!vectorIndex
      vectorIndexStatus = vectorIndex?.status || 'not found'
    } catch (error) {
      console.warn('Error checking vector search indexes:', error)
      // This might fail if index doesn't exist or API not available
    }

    // Count documents
    const documentCount = await collection.countDocuments()
    
    // Check if documents have embeddings
    const sampleDoc = await collection.findOne({ embedding: { $exists: true } })
    const hasEmbeddings = !!sampleDoc
    const embeddingDimensions = sampleDoc?.embedding?.length || 0

    return NextResponse.json({
      success: true,
      collection: COLLECTION_NAME,
      documentCount,
      hasEmbeddings,
      embeddingDimensions,
      regularIndexes: regularIndexes.map(idx => ({
        name: idx.name,
        keys: idx.key,
      })),
      vectorSearchIndex: {
        name: VECTOR_INDEX_NAME,
        exists: vectorIndexExists,
        status: vectorIndexStatus,
        allVectorIndexes: vectorIndexes.map(idx => ({
          name: idx.name,
          status: idx.status,
        })),
      },
      issue: !vectorIndexExists 
        ? 'Vector search index does not exist. Create it in MongoDB Atlas Search & Vector Search section.'
        : vectorIndexStatus !== 'READY' && vectorIndexStatus !== 'ACTIVE'
        ? `Vector search index exists but status is "${vectorIndexStatus}". Wait for it to become READY.`
        : null,
    })
  } catch (error) {
    console.error('[Check Index API] Error:', error)
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

