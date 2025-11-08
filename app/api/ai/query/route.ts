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

    // Normalize conversationHistory to array format
    let normalizedHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
    
    if (conversationHistory) {
      if (Array.isArray(conversationHistory)) {
        // Normalize array of messages to standard format
        normalizedHistory = conversationHistory
          .map((msg: any) => {
            if (typeof msg === 'string') {
              // If it's a string, assume it's user content
              return { role: 'user' as const, content: msg }
            }
            if (msg && typeof msg === 'object') {
              const role = msg.role || msg.type || 'user'
              const content = msg.content || msg.text || msg.message || JSON.stringify(msg)
              // Normalize role to 'user' or 'assistant'
              const normalizedRole = role === 'assistant' || role === 'ai' ? 'assistant' : 'user'
              return { role: normalizedRole as 'user' | 'assistant', content: String(content) }
            }
            return null
          })
          .filter((msg): msg is { role: 'user' | 'assistant'; content: string } => msg !== null)
      } else if (typeof conversationHistory === 'string') {
        // If it's a string, treat as single user message
        normalizedHistory = [{ role: 'user' as const, content: conversationHistory }]
      }
    }

    // Convert to string format for LLM (backward compatibility)
    const conversationHistoryStr = normalizedHistory
      .map(msg => `${msg.role === 'assistant' ? 'AI' : 'User'}: ${msg.content}`)
      .join('\n')

    const result = await queryAI(query, conversationHistoryStr)

    // Return conversationHistory in standardized format for client to use
    const updatedConversationHistory = [
      ...normalizedHistory,
      { role: 'user' as const, content: query },
      { role: 'assistant' as const, content: result.answer },
    ]

    return NextResponse.json({
      ...result,
      conversationHistory: updatedConversationHistory,
    })
  } catch (error) {
    console.error('[Query API] Error:', error)

    // Handle moderation errors with a more user-friendly response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isModerationError = errorMessage.includes('moderation') || errorMessage.includes('flagged')
    
    return NextResponse.json(
      {
        error: isModerationError ? 'Content moderation' : 'Error processing query',
        message: errorMessage,
        ...(isModerationError && {
          suggestion: 'Please try rephrasing your question. This appears to be a false positive from the AI model\'s content moderation.',
        }),
      },
      { status: isModerationError ? 403 : 500 }
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
