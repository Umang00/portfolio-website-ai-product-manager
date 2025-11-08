// app/api/ai/tts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'

// Initialize client with service account credentials
let ttsClient: TextToSpeechClient | null = null

// TTS configuration from environment variables
const TTS_VOICE_NAME = process.env.TTS_VOICE_NAME || 'en-US-Chirp3-HD-Achird' // Default: Achird (male)
const TTS_LANGUAGE_CODE = process.env.TTS_LANGUAGE_CODE || 'en-US'
const TTS_SPEAKING_RATE = parseFloat(process.env.TTS_SPEAKING_RATE || '1.0')
const TTS_PITCH = parseFloat(process.env.TTS_PITCH || '0')
const TTS_VOLUME_GAIN_DB = parseFloat(process.env.TTS_VOLUME_GAIN_DB || '0')

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  try {
    // Parse JSON credentials from environment variable (service account JSON string)
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
    ttsClient = new TextToSpeechClient({ credentials })
    console.log('[TTS] Google Cloud TTS client initialized successfully')
    console.log(`[TTS] Voice: ${TTS_VOICE_NAME}, Language: ${TTS_LANGUAGE_CODE}`)
  } catch (error) {
    console.error('[TTS] Failed to parse Google credentials:', error)
  }
} else {
  console.warn('[TTS] GOOGLE_APPLICATION_CREDENTIALS_JSON not found, TTS API will not be available')
}

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

    if (!ttsClient) {
      return NextResponse.json(
        { error: 'Google Cloud TTS not configured. Please set GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable.' },
        { status: 503 }
      )
    }

    // Limit text length to prevent abuse
    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text is too long (max 5000 characters)' },
        { status: 400 }
      )
    }

    // Use Google Cloud Chirp 3: HD voices
    // Chirp 3: HD provides high-quality, natural-sounding speech
    // Voice name format: <locale>-Chirp3-HD-<voice>
    // Configuration can be changed via environment variables in .env.local
    const [response] = await ttsClient.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: TTS_LANGUAGE_CODE,
        name: TTS_VOICE_NAME, // Configurable via TTS_VOICE_NAME env var
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate: TTS_SPEAKING_RATE,
        pitch: TTS_PITCH,
        volumeGainDb: TTS_VOLUME_GAIN_DB,
      },
    })

    if (!response.audioContent) {
      throw new Error('No audio content received from Google Cloud TTS')
    }

    // Convert audio content to buffer
    const buffer = Buffer.from(response.audioContent as Uint8Array)

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

