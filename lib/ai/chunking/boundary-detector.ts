/**
 * Boundary Detector
 *
 * Smart boundary detection for document chunking.
 * Handles paragraph breaks, sentence endings, and intelligent overlap.
 */

/**
 * Detect paragraph boundaries in text
 * Paragraphs are separated by empty lines (2+ newlines)
 */
export function detectParagraphs(text: string): string[] {
  // Split on empty lines (one or more blank lines)
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  return paragraphs;
}

/**
 * Detect sentences in text
 * Handles common abbreviations (Dr., Mr., etc., i.e., e.g.)
 */
export function detectSentences(text: string): string[] {
  // Common abbreviations that shouldn't trigger sentence breaks
  const abbreviations = [
    'Dr', 'Mr', 'Mrs', 'Ms', 'Prof', 'Sr', 'Jr',
    'etc', 'i.e', 'e.g', 'vs', 'Inc', 'Ltd', 'Co',
    'Corp', 'dept', 'fig', 'approx', 'est', 'min', 'max'
  ];

  // Temporarily replace abbreviations to avoid false splits
  let cleaned = text;
  abbreviations.forEach(abbr => {
    const pattern = new RegExp(`\\b${abbr}\\.`, 'gi');
    cleaned = cleaned.replace(pattern, `${abbr}<DOT>`);
  });

  // Also handle decimal numbers (e.g., "3.14")
  cleaned = cleaned.replace(/(\d)\.(\d)/g, '$1<DOT>$2');

  // Split on sentence endings (. ! ?) followed by whitespace
  const sentences = cleaned.split(/[.!?]+\s+/);

  // Restore dots and clean up
  return sentences
    .map(s => s.replace(/<DOT>/g, '.').trim())
    .filter(s => s.length > 0);
}

/**
 * Calculate smart overlap between chunks
 * Returns the last complete sentence, regardless of word count
 * (Could be 4 words or 100 words - we preserve the complete sentence)
 */
export function calculateSmartOverlap(previousChunk: string, maxWords?: number): string {
  const sentences = detectSentences(previousChunk);

  if (sentences.length === 0) {
    return '';
  }

  // Return last complete sentence (no word limit)
  return sentences[sentences.length - 1];
}

/**
 * Find the nearest natural boundary (sentence or paragraph end) after a target position
 */
export function findNaturalBoundary(
  text: string,
  targetPosition: number,
  preferParagraph: boolean = true
): number {
  if (targetPosition >= text.length) {
    return text.length;
  }

  const afterTarget = text.slice(targetPosition);

  // First, look for paragraph break (highest priority if preferred)
  if (preferParagraph) {
    const paragraphBreak = afterTarget.match(/\n\s*\n/);
    if (paragraphBreak && paragraphBreak.index !== undefined && paragraphBreak.index < 200) {
      return targetPosition + paragraphBreak.index + paragraphBreak[0].length;
    }
  }

  // Look for sentence end (. ! ?) followed by whitespace
  const sentenceEnd = afterTarget.match(/[.!?]\s+/);
  if (sentenceEnd && sentenceEnd.index !== undefined && sentenceEnd.index < 300) {
    return targetPosition + sentenceEnd.index + sentenceEnd[0].length;
  }

  // Look for paragraph break even if not preferred initially
  if (!preferParagraph) {
    const paragraphBreak = afterTarget.match(/\n\s*\n/);
    if (paragraphBreak && paragraphBreak.index !== undefined && paragraphBreak.index < 400) {
      return targetPosition + paragraphBreak.index + paragraphBreak[0].length;
    }
  }

  // Fallback: use target position
  return targetPosition;
}

/**
 * Split text into chunks at natural boundaries
 * @param text - The text to split
 * @param maxChunkSize - Maximum chunk size in characters
 * @param overlapSize - Overlap in characters (or 'smart' for sentence-based)
 * @returns Array of text chunks
 */
export function chunkAtNaturalBoundaries(
  text: string,
  maxChunkSize: number = 2000,
  overlapType: 'smart' | 'none' | number = 'smart'
): string[] {
  const chunks: string[] = [];
  let currentPosition = 0;

  while (currentPosition < text.length) {
    // Determine chunk end
    let chunkEnd = Math.min(currentPosition + maxChunkSize, text.length);

    // Find natural boundary if not at end
    if (chunkEnd < text.length) {
      chunkEnd = findNaturalBoundary(text, chunkEnd, true);
    }

    // Extract chunk
    const chunk = text.slice(currentPosition, chunkEnd).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Calculate next position with overlap
    if (overlapType === 'smart' && chunks.length > 0) {
      const overlap = calculateSmartOverlap(chunk);
      const overlapLength = overlap.length;
      currentPosition = chunkEnd - overlapLength;
    } else if (overlapType === 'none') {
      currentPosition = chunkEnd;
    } else if (typeof overlapType === 'number') {
      currentPosition = chunkEnd - overlapType;
    } else {
      currentPosition = chunkEnd;
    }

    // Prevent infinite loop
    if (currentPosition >= chunkEnd) {
      currentPosition = chunkEnd;
    }
  }

  return chunks;
}

/**
 * Check if a chunk ends with a natural boundary
 */
export function endsWithNaturalBoundary(text: string): {
  hasBoundary: boolean;
  type: 'paragraph' | 'sentence' | 'none';
} {
  // Check for paragraph break at end
  if (/\n\s*\n\s*$/.test(text)) {
    return { hasBoundary: true, type: 'paragraph' };
  }

  // Check for sentence end
  if (/[.!?]\s*$/.test(text)) {
    return { hasBoundary: true, type: 'sentence' };
  }

  return { hasBoundary: false, type: 'none' };
}

/**
 * Detect section headers (for professional documents)
 * Headers are typically:
 * - ALL CAPS
 * - Followed by newline
 * - Short (< 100 chars)
 */
export function detectSectionHeaders(text: string): Array<{
  header: string;
  position: number;
  type: 'all_caps' | 'title_case' | 'markdown';
}> {
  const headers: Array<{ header: string; position: number; type: 'all_caps' | 'title_case' | 'markdown' }> = [];
  const lines = text.split('\n');
  let position = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Markdown headers (# Header)
    const markdownMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (markdownMatch) {
      headers.push({
        header: markdownMatch[2],
        position,
        type: 'markdown'
      });
    }

    // ALL CAPS headers
    else if (
      trimmed.length > 0 &&
      trimmed.length < 100 &&
      trimmed === trimmed.toUpperCase() &&
      /[A-Z]/.test(trimmed) // Contains at least one letter
    ) {
      headers.push({
        header: trimmed,
        position,
        type: 'all_caps'
      });
    }

    // Title Case headers (if followed by newline and next line isn't title case)
    else if (
      trimmed.length > 0 &&
      trimmed.length < 100 &&
      /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/.test(trimmed)
    ) {
      headers.push({
        header: trimmed,
        position,
        type: 'title_case'
      });
    }

    position += line.length + 1; // +1 for newline
  }

  return headers;
}

/**
 * Extract metadata from section headers
 * Handles formats like:
 * - "Company (Industry) | Position"
 * - "Position | Company"
 * - "Date Range"
 */
export function parseHeaderMetadata(header: string): {
  company?: string;
  position?: string;
  location?: string;
  dateRange?: string;
  industry?: string;
} {
  const metadata: Record<string, string> = {};

  // Check for pipe delimiter
  if (header.includes('|')) {
    const parts = header.split('|').map(p => p.trim());

    // Format: "Company (Industry) | Position"
    const companyMatch = parts[0].match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if (companyMatch) {
      metadata.company = companyMatch[1].trim();
      metadata.industry = companyMatch[2].trim();
      if (parts[1]) {
        metadata.position = parts[1];
      }
    }
    // Format: "Position | Company"
    else {
      // Try to detect which is which (heuristic: position often has keywords like "Manager", "Engineer")
      const positionKeywords = /manager|engineer|developer|analyst|designer|specialist|consultant|director|lead/i;

      if (positionKeywords.test(parts[0])) {
        metadata.position = parts[0];
        metadata.company = parts[1] || '';
      } else {
        metadata.company = parts[0];
        metadata.position = parts[1] || '';
      }
    }
  }

  // Check for date range (YYYY-YYYY or Month YYYY - Month YYYY)
  const dateMatch = header.match(/(\d{4})\s*[-–]\s*(\d{4}|Present|Current)/i);
  if (dateMatch) {
    metadata.dateRange = dateMatch[0];
  }

  // Check for location patterns (City, State/Country)
  const locationMatch = header.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (locationMatch) {
    metadata.location = locationMatch[0];
  }

  return metadata;
}
