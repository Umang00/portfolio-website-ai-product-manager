// app/api/ai/tts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  console.warn('[TTS] OpenAI API key not found, TTS API will not be available')
}

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text } = body

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI TTS not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 503 }
      )
    }

    // Limit text length to prevent abuse
    if (text.length > 4000) {
      return NextResponse.json(
        { error: 'Text is too long (max 4000 characters)' },
        { status: 400 }
      )
    }

    // Use OpenAI TTS API with a natural-sounding voice
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1', // or 'tts-1-hd' for higher quality (more expensive)
      voice: 'nova', // Options: alloy, echo, fable, onyx, nova, shimmer (nova is most natural)
      input: text,
      speed: 1.0, // Slightly slower for more natural pace
    })

    // Convert response to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer())

    // Return audio file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('[TTS API] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

