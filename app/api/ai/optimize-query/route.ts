// app/api/ai/optimize-query/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { optimizeQuery } from '@/lib/ai/service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, conversationMemory } = body

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    const optimizedQuery = await optimizeQuery(query, conversationMemory || '')

    return NextResponse.json({
      originalQuery: query,
      optimizedQuery,
    })
  } catch (error) {
    console.error('[Optimize Query API] Error:', error)

    // Return original query on error
    const body = await req.json().catch(() => ({ query: '' }))
    return NextResponse.json({
      originalQuery: body.query,
      optimizedQuery: body.query,
      error: 'Optimization failed, using original query',
    })
  }
}
