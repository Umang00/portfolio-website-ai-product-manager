/**
 * Test Chunking Endpoint
 *
 * Tests document chunking without generating embeddings.
 * Useful for rapid iteration and debugging chunking strategies.
 *
 * POST /api/ai/test-chunking
 * Body: { filename: string, documentType?: string, secret: string }
 *
 * Returns: { chunks, stats, quality }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  testChunking,
  testAllDocuments,
  validateChunkQuality,
  type TestChunk,
  type ChunkingStats,
  type ChunkQualityReport
} from '@/lib/ai/test-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, documentType, secret, testAll } = body;

    // Verify admin secret
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Test all documents
    if (testAll) {
      const documentMap: Record<string, 'resume' | 'linkedin' | 'journey' | 'github' | 'generic'> = {
        'Umang_Thakkar_PM_Master_Resume.pdf': 'resume',
        'LinkedIn.pdf': 'linkedin',
        'cohort_journey_fy-2025-2026.pdf': 'journey',
        // Add more as needed
      };

      const results = await testAllDocuments(documentMap);

      // Validate quality for each
      const qualityReports: Record<string, ChunkQualityReport> = {};
      for (const [file, result] of Object.entries(results)) {
        if (!result.error) {
          qualityReports[file] = validateChunkQuality(result.chunks, file);
        }
      }

      return NextResponse.json({
        results,
        qualityReports,
        summary: {
          totalFiles: Object.keys(results).length,
          passed: Object.values(qualityReports).filter(r => r.passed).length,
          failed: Object.values(qualityReports).filter(r => !r.passed).length
        }
      });
    }

    // Test single document
    if (!filename) {
      return NextResponse.json(
        { error: 'filename is required' },
        { status: 400 }
      );
    }

    // Auto-detect document type if not provided
    let type: 'resume' | 'linkedin' | 'journey' | 'github' | 'generic' = documentType || 'generic';
    if (!documentType) {
      type = detectDocumentType(filename);
    }

    // Run chunking test
    const { chunks, stats } = await testChunking(filename, type);

    // Validate quality
    const quality = validateChunkQuality(chunks, filename);

    // Prepare response with sample chunks (first 3 + last 1)
    const sampleChunks = [
      ...chunks.slice(0, 3),
      ...(chunks.length > 4 ? [chunks[chunks.length - 1]] : [])
    ];

    return NextResponse.json({
      filename,
      documentType: type,
      stats,
      quality,
      sampleChunks: sampleChunks.map(chunk => ({
        ...chunk,
        text: chunk.text.slice(0, 300) + (chunk.text.length > 300 ? '...' : '') // Truncate for readability
      })),
      fullChunks: chunks, // Include full chunks for detailed inspection
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test chunking error:', error);
    return NextResponse.json(
      {
        error: 'Failed to test chunking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for quick testing
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const filename = searchParams.get('filename');

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!filename) {
    return NextResponse.json({
      message: 'Test Chunking Endpoint',
      usage: {
        POST: '/api/ai/test-chunking',
        body: {
          filename: 'document.pdf',
          documentType: 'resume | linkedin | journey | github | generic (optional, auto-detected)',
          secret: 'your-ADMIN_SECRET',
          testAll: 'true (optional, tests all documents)'
        }
      },
      available: {
        resume: 'Umang_Thakkar_PM_Master_Resume.pdf',
        linkedin: 'LinkedIn.pdf',
        journey: 'cohort_journey_fy-2025-2026.pdf'
      }
    });
  }

  // Run test for single file
  try {
    const type = detectDocumentType(filename);
    const { chunks, stats } = await testChunking(filename, type);
    const quality = validateChunkQuality(chunks, filename);

    return NextResponse.json({
      filename,
      documentType: type,
      stats,
      quality,
      chunkCount: chunks.length
    });

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to test chunking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Auto-detect document type from filename
 */
function detectDocumentType(filename: string): 'resume' | 'linkedin' | 'journey' | 'github' | 'generic' {
  const lower = filename.toLowerCase();

  if (lower.includes('resume') || lower.includes('cv')) {
    return 'resume';
  }
  if (lower.includes('linkedin') || lower.includes('profile')) {
    return 'linkedin';
  }
  if (lower.includes('journey') || lower.includes('cohort')) {
    return 'journey';
  }
  if (lower.includes('github') || lower.includes('readme')) {
    return 'github';
  }

  return 'generic';
}
