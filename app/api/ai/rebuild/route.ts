// app/api/ai/rebuild/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { buildMemoryIndex, getSystemStats } from '@/lib/ai/service'

// Force Node.js runtime (pdf-parse requires Node.js APIs)
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { secret } = body

    // Verify admin secret
    const adminSecret = process.env.ADMIN_SECRET

    if (!adminSecret || secret !== adminSecret) {
      console.warn('[Rebuild API] Unauthorized attempt')
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin secret' },
        { status: 401 }
      )
    }

    console.log('[Rebuild API] Admin rebuild triggered...')

    // Force full rebuild
    const result = await buildMemoryIndex(true)

    if (result.success) {
      console.log('[Rebuild API] Rebuild completed successfully')

      // Get updated stats
      const stats = await getSystemStats()

      return NextResponse.json({
        success: true,
        message: 'Index rebuilt successfully',
        chunksCreated: result.chunksCreated,
        documentsProcessed: result.documentsProcessed,
        stats: stats.vectorStore,
      })
    } else {
      console.error('[Rebuild API] Rebuild failed:', result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to rebuild index',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[Rebuild API] Error:', error)

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

// GET endpoint to view stats (requires admin secret in query param)
export async function GET(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get('secret')
    const adminSecret = process.env.ADMIN_SECRET

    if (!adminSecret || secret !== adminSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const stats = await getSystemStats()

    return NextResponse.json({
      success: true,
      stats: stats.vectorStore,
    })
  } catch (error) {
    console.error('[Rebuild API] Error getting stats:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
