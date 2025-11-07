// app/api/ai/test-vector-search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateEmbedding } from '@/lib/ai/embeddings'
import { getDBAI } from '@/lib/db/mongodb'

export const runtime = 'nodejs'

const COLLECTION_NAME = 'memoryIndex'
const VECTOR_INDEX_NAME = 'vector_index'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, testWithoutCategories = false } = body

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    console.log(`[Test Vector Search] Testing query: "${query}"`)

    // Generate embedding
    const queryEmbedding = await generateEmbedding(query)
    console.log(`[Test Vector Search] Embedding generated: ${queryEmbedding.length} dimensions`)

    const db = await getDBAI()
    const collection = db.collection(COLLECTION_NAME)

    // Test 1: Basic vector search without any filters
    console.log('[Test Vector Search] Running basic vector search...')
    const basicPipeline = [
      {
        $vectorSearch: {
          index: VECTOR_INDEX_NAME,
          queryVector: queryEmbedding,
          path: 'embedding',
          numCandidates: 50,
          limit: 10,
        },
      },
      {
        $project: {
          _id: 0,
          text: 1, // Full text, we'll truncate in JS
          category: 1,
          subcategory: 1,
          metadata: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ]

    const basicResults = await collection.aggregate(basicPipeline).toArray()
    console.log(`[Test Vector Search] Basic search returned ${basicResults.length} results`)

    // Test 2: Check sample documents
    console.log('[Test Vector Search] Checking sample documents...')
    const sampleDocs = await collection
      .find({}, { projection: { text: 1, category: 1, metadata: 1 } })
      .limit(5)
      .toArray()

    // Test 3: Check if embeddings exist
    const docWithEmbedding = await collection.findOne(
      { embedding: { $exists: true } },
      { projection: { embedding: 1, text: 1 } }
    )

    // Test 4: Count documents by category
    const categoryCounts = await collection
      .aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ])
      .toArray()

    return NextResponse.json({
      success: true,
      query,
      embeddingDimensions: queryEmbedding.length,
      tests: {
        basicVectorSearch: {
          resultCount: basicResults.length,
          results: basicResults.slice(0, 3).map((r: any) => ({
            category: r.category,
            score: r.score,
            textPreview: r.text?.substring(0, 100),
            source: r.metadata?.source,
            subcategory: r.subcategory,
          })),
          allResults: basicResults.map((r: any) => ({
            category: r.category,
            score: r.score,
            textPreview: r.text?.substring(0, 100),
            source: r.metadata?.source,
            subcategory: r.subcategory,
          })),
        },
        sampleDocuments: {
          count: sampleDocs.length,
          documents: sampleDocs.map((d: any) => ({
            category: d.category,
            textPreview: d.text?.substring(0, 100),
            source: d.metadata?.source,
          })),
        },
        embeddingCheck: {
          hasEmbeddings: !!docWithEmbedding,
          embeddingDimensions: docWithEmbedding?.embedding?.length || 0,
          embeddingPreview: docWithEmbedding?.embedding?.slice(0, 5),
          sampleText: docWithEmbedding?.text?.substring(0, 100),
        },
        categoryDistribution: categoryCounts,
      },
    })
  } catch (error) {
    console.error('[Test Vector Search] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

