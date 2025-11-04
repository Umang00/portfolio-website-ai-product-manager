// app/api/ai/compress-memory/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { compressMemory } from '@/lib/ai/service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { conversationHistory } = body

    if (!conversationHistory || typeof conversationHistory !== 'string') {
      return NextResponse.json(
        { error: 'Conversation history is required' },
        { status: 400 }
      )
    }

    const compressedMemory = await compressMemory(conversationHistory)

    return NextResponse.json({
      originalLength: conversationHistory.length,
      compressedLength: compressedMemory.length,
      compressedMemory,
    })
  } catch (error) {
    console.error('[Compress Memory API] Error:', error)

    // Return original on error
    const body = await req.json().catch(() => ({ conversationHistory: '' }))
    return NextResponse.json({
      originalLength: body.conversationHistory.length,
      compressedLength: body.conversationHistory.length,
      compressedMemory: body.conversationHistory,
      error: 'Compression failed, using original',
    })
  }
}
