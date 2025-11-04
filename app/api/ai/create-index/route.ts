// app/api/ai/create-index/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { buildMemoryIndex } from '@/lib/ai/service'

// Force Node.js runtime (pdf-parse requires Node.js APIs)
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    console.log('[Create Index API] Starting index build...')

    const result = await buildMemoryIndex(true) // Force rebuild

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Memory index built successfully',
        chunksCreated: result.chunksCreated,
        documentsProcessed: result.documentsProcessed,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to build index',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[Create Index API] Error:', error)

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { forceRebuild = true } = body

    console.log(`[Create Index API] Starting index build (forceRebuild: ${forceRebuild})...`)

    const result = await buildMemoryIndex(forceRebuild)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.skipped ? 'No changes detected, skipped rebuild' : 'Memory index built successfully',
        chunksCreated: result.chunksCreated,
        documentsProcessed: result.documentsProcessed,
        skipped: result.skipped || false,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to build index',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[Create Index API] Error:', error)

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
