/**
 * Test Helpers for Document Chunking
 *
 * Provides utilities to test chunking strategies without generating embeddings.
 * This saves API costs and speeds up iteration during development.
 */

import { chunkResume, chunkLinkedIn } from './chunking/professional-chunker';
import { chunkJourney } from './chunking/narrative-chunker';
import { chunkGeneric } from './chunking/generic-chunker';
import { loadPDF } from './loaders/pdf-loader';
import { loadGitHubRepo } from './loaders/github-loader';

export interface ChunkBoundary {
  startChar: number;
  endChar: number;
  overlapWords: number;
  splitAt: 'paragraph_break' | 'sentence_end' | 'section_header' | 'fixed_size';
}

export interface TestChunk {
  text: string;
  category: string;
  subcategory: string | null;
  metadata: Record<string, any>;
  chunkIndex: number;
  boundaries: ChunkBoundary;
  tokenCount: number;
}

export interface ChunkingStats {
  totalChunks: number;
  avgChunkSize: number;
  minChunkSize: number;
  maxChunkSize: number;
  avgOverlap: number;
  totalTokens: number;
}

/**
 * Test document chunking without generating embeddings
 */
export async function testChunking(
  filename: string,
  documentType: 'resume' | 'linkedin' | 'journey' | 'github' | 'generic'
): Promise<{ chunks: TestChunk[]; stats: ChunkingStats }> {
  let content: string;
  let rawChunks: any[];

  // Load document
  if (documentType === 'github') {
    const githubData = await loadGitHubRepo(filename);
    content = githubData.content;
    // GitHub chunking happens in the loader
    rawChunks = [githubData]; // Simplified for now
  } else {
    // Load PDF
    const pdfData = await loadPDF(filename);
    content = pdfData.content;

    // Chunk based on type
    switch (documentType) {
      case 'resume':
        rawChunks = chunkResume(content, filename);
        break;
      case 'linkedin':
        rawChunks = chunkLinkedIn(content, filename);
        break;
      case 'journey':
        const year = extractYearFromFilename(filename);
        rawChunks = chunkJourney(content, filename, year);
        break;
      case 'generic':
      default:
        rawChunks = chunkGeneric(content, filename);
        break;
    }
  }

  // Convert to test chunks with boundaries
  const testChunks: TestChunk[] = rawChunks.map((chunk, index) => {
    const prevChunk = index > 0 ? rawChunks[index - 1] : null;
    const boundaries = calculateBoundaries(chunk.text, prevChunk?.text, content);
    const tokenCount = estimateTokenCount(chunk.text);

    return {
      text: chunk.text,
      category: chunk.category,
      subcategory: chunk.subcategory || null,
      metadata: chunk.metadata || {},
      chunkIndex: index,
      boundaries,
      tokenCount
    };
  });

  // Calculate statistics
  const stats = calculateStats(testChunks);

  return { chunks: testChunks, stats };
}

/**
 * Calculate chunk boundaries and overlap
 */
function calculateBoundaries(
  currentText: string,
  previousText: string | null,
  fullContent: string
): ChunkBoundary {
  const startChar = fullContent.indexOf(currentText);
  const endChar = startChar + currentText.length;

  let overlapWords = 0;
  let splitAt: ChunkBoundary['splitAt'] = 'fixed_size';

  if (previousText) {
    // Find overlap between previous and current chunk
    const overlap = findOverlap(previousText, currentText);
    overlapWords = overlap.split(/\s+/).length;

    // Determine split type
    if (currentText.match(/^#+\s+/)) {
      splitAt = 'section_header';
    } else if (currentText.startsWith('\n\n') || previousText.endsWith('\n\n')) {
      splitAt = 'paragraph_break';
    } else if (previousText.match(/[.!?]\s*$/)) {
      splitAt = 'sentence_end';
    }
  }

  return {
    startChar: startChar >= 0 ? startChar : 0,
    endChar: endChar >= 0 ? endChar : currentText.length,
    overlapWords,
    splitAt
  };
}

/**
 * Find overlapping text between two chunks
 */
function findOverlap(text1: string, text2: string): string {
  const maxOverlap = Math.min(200, text1.length, text2.length);

  for (let i = maxOverlap; i > 10; i--) {
    const end1 = text1.slice(-i);
    const start2 = text2.slice(0, i);

    if (end1 === start2) {
      return end1;
    }
  }

  return '';
}

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Calculate statistics for chunks
 */
function calculateStats(chunks: TestChunk[]): ChunkingStats {
  const sizes = chunks.map(c => c.text.length);
  const overlaps = chunks.slice(1).map(c => c.boundaries.overlapWords);
  const tokens = chunks.map(c => c.tokenCount);

  return {
    totalChunks: chunks.length,
    avgChunkSize: Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length),
    minChunkSize: Math.min(...sizes),
    maxChunkSize: Math.max(...sizes),
    avgOverlap: overlaps.length > 0
      ? Math.round(overlaps.reduce((a, b) => a + b, 0) / overlaps.length)
      : 0,
    totalTokens: tokens.reduce((a, b) => a + b, 0)
  };
}

/**
 * Extract year from filename (e.g., "journey_fy-2025-2026.pdf" → "2025")
 */
function extractYearFromFilename(filename: string): string {
  const match = filename.match(/(\d{4})/);
  return match ? match[1] : new Date().getFullYear().toString();
}

/**
 * Test all documents in a directory
 */
export async function testAllDocuments(
  documentTypes: Record<string, 'resume' | 'linkedin' | 'journey' | 'github' | 'generic'>
): Promise<Record<string, { chunks: TestChunk[]; stats: ChunkingStats }>> {
  const results: Record<string, any> = {};

  for (const [filename, type] of Object.entries(documentTypes)) {
    try {
      results[filename] = await testChunking(filename, type);
    } catch (error) {
      results[filename] = {
        error: error instanceof Error ? error.message : 'Unknown error',
        chunks: [],
        stats: {
          totalChunks: 0,
          avgChunkSize: 0,
          minChunkSize: 0,
          maxChunkSize: 0,
          avgOverlap: 0,
          totalTokens: 0
        }
      };
    }
  }

  return results;
}

/**
 * Validate chunk quality
 */
export interface ChunkQualityReport {
  filename: string;
  issues: string[];
  warnings: string[];
  passed: boolean;
}

export function validateChunkQuality(chunks: TestChunk[], filename: string): ChunkQualityReport {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check for mid-sentence cuts
  chunks.forEach((chunk, i) => {
    if (i < chunks.length - 1) {
      const endsWithPunctuation = /[.!?]\s*$/.test(chunk.text);
      const startsWithNewline = chunk.text.startsWith('\n');
      const hasHeader = /^#+\s+/.test(chunks[i + 1].text);

      if (!endsWithPunctuation && !startsWithNewline && !hasHeader) {
        issues.push(`Chunk ${i} may have mid-sentence cut`);
      }
    }
  });

  // Check chunk sizes
  chunks.forEach((chunk, i) => {
    if (chunk.tokenCount < 100) {
      warnings.push(`Chunk ${i} is very small (${chunk.tokenCount} tokens)`);
    }
    if (chunk.tokenCount > 1000) {
      warnings.push(`Chunk ${i} is very large (${chunk.tokenCount} tokens)`);
    }
  });

  // Check category/subcategory structure
  chunks.forEach((chunk, i) => {
    if (!chunk.category) {
      issues.push(`Chunk ${i} missing category`);
    }
    if (chunk.category && chunk.category.includes('_')) {
      issues.push(`Chunk ${i} has invalid category format: "${chunk.category}" (should not contain underscore)`);
    }
  });

  // Check overlap
  const avgOverlap = chunks.slice(1).reduce((sum, c) => sum + c.boundaries.overlapWords, 0) / (chunks.length - 1 || 1);
  if (avgOverlap > 50) {
    warnings.push(`Average overlap is high: ${Math.round(avgOverlap)} words`);
  }

  return {
    filename,
    issues,
    warnings,
    passed: issues.length === 0
  };
}
