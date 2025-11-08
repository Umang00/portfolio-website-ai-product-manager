// app/api/ai/gladia/session/route.ts
import { NextRequest, NextResponse } from 'next/server'

if (!process.env.GLADIA_API_KEY) {
  console.warn('[Gladia Session] GLADIA_API_KEY not found, Gladia API will not be available')
}

const GLADIA_API_KEY = process.env.GLADIA_API_KEY
const GLADIA_API_URL = 'https://api.gladia.io'

export async function POST(req: NextRequest) {
  try {
    if (!GLADIA_API_KEY) {
      return NextResponse.json(
        { error: 'Gladia API not configured. Please set GLADIA_API_KEY environment variable.' },
        { status: 503 }
      )
    }

    // Initiate a Gladia live transcription session
    // Endpoint: POST /v2/live (for real-time WebSocket transcription)
    // Based on Gladia API docs: https://docs.gladia.io/api-reference/v2/live/init
    const response = await fetch(`${GLADIA_API_URL}/v2/live`, {
      method: 'POST',
      headers: {
        'X-Gladia-Key': GLADIA_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        encoding: 'wav/pcm',
        sample_rate: 16000,
        bit_depth: 16,
        channels: 1,
        // Configure to receive partial and final transcripts
        messages_config: {
          receive_partial_transcripts: true,
          receive_final_transcripts: true,
          receive_speech_events: false,
          receive_pre_processing_events: false,
          receive_realtime_processing_events: false,
          receive_post_processing_events: false,
          receive_acknowledgments: false,
          receive_errors: true,
          receive_lifecycle_events: false,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('[Gladia Session] API error:', response.status, errorData)
      return NextResponse.json(
        {
          error: 'Failed to initiate Gladia session',
          details: errorData,
        },
        { status: response.status }
      )
    }

    const sessionData = await response.json()
    
    // Gladia API returns: { id: string, url: string }
    // The 'url' field contains the WebSocket URL with token
    const websocketUrl = sessionData.url || sessionData.ws_url || null
    
    if (!websocketUrl) {
      console.warn('[Gladia Session] No WebSocket URL in response:', sessionData)
      return NextResponse.json(
        {
          error: 'No WebSocket URL received from Gladia',
          details: sessionData,
        },
        { status: 500 }
      )
    }
    
    // Return session configuration
    return NextResponse.json({
      success: true,
      session: sessionData,
      websocketUrl: websocketUrl,
      sessionId: sessionData.id || null,
    })
  } catch (error) {
    console.error('[Gladia Session] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

