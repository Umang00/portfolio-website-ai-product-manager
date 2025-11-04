// app/api/ai/test-pdfs/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { loadAllPDFs } from '@/lib/ai/loaders/pdf-loader'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get('secret')
    const adminSecret = process.env.ADMIN_SECRET

    if (!adminSecret || secret !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const docs = await loadAllPDFs()
    return NextResponse.json({
      success: true,
      count: docs.length,
      files: docs.map(d => ({ filename: d.filename, type: d.type, length: d.content.length })),
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}


