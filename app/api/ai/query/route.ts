// app/api/ai/query/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { queryAI } from '@/lib/ai/service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, conversationHistory } = body

    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (query.length > 1000) {
      return NextResponse.json(
        { error: 'Query is too long (max 1000 characters)' },
        { status: 400 }
      )
    }

    // Process query
    console.log(`[Query API] Processing query: "${query.substring(0, 100)}..."`)

    const result = await queryAI(query, conversationHistory || '')

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Query API] Error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}
