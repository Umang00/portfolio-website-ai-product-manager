// app/api/ai/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { buildMemoryIndex } from '@/lib/ai/service'

// Force Node.js runtime (pdf-parse requires Node.js APIs)
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    // Verify cron secret (optional security measure)
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Refresh API] Unauthorized attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[Refresh API] Starting scheduled refresh...')

    // Check for changes and rebuild only if needed
    const result = await buildMemoryIndex(false)

    if (result.success) {
      if (result.skipped) {
        console.log('[Refresh API] No changes detected, skipped rebuild')
        return NextResponse.json({
          success: true,
          message: 'No changes detected',
          skipped: true,
        })
      } else {
        console.log('[Refresh API] Index refreshed successfully')
        return NextResponse.json({
          success: true,
          message: 'Index refreshed successfully',
          chunksCreated: result.chunksCreated,
          documentsProcessed: result.documentsProcessed,
        })
      }
    } else {
      console.error('[Refresh API] Refresh failed:', result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to refresh index',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[Refresh API] Error:', error)

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

// Also allow GET for manual testing
export async function GET(req: NextRequest) {
  try {
    console.log('[Refresh API] Manual refresh triggered...')

    const result = await buildMemoryIndex(false)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.skipped ? 'No changes detected' : 'Index refreshed successfully',
        chunksCreated: result.chunksCreated,
        documentsProcessed: result.documentsProcessed,
        skipped: result.skipped || false,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to refresh index',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[Refresh API] Error:', error)

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
