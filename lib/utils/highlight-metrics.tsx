import React from "react"

interface Match {
  text: string
  start: number
  end: number
  priority: number // Higher priority = more important, should be highlighted
}

// Intelligent metric detection with context awareness
export function highlightMetrics(text: string): React.ReactNode {
  const matches: Match[] = []

  // Priority 10: Always highlight - Currency, large numbers with units, arrow transitions
  // Priority 8: Context-aware - Percentages, time improvements, availability indicators
  // Priority 6: Context-aware - Ranges, small numbers in improvement contexts
  // Priority 4: Context-aware - Standalone numbers that might be metrics

  // Pattern 1: Currency amounts (always highlight)
  const currencyPattern = /\$[\d,.]+[KM]?\+?/g
  for (const match of text.matchAll(currencyPattern)) {
    if (match.index !== undefined) {
      matches.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
        priority: 10,
      })
    }
  }

  // Pattern 2: 24/7 (availability indicator - always highlight)
  const availabilityPattern = /\b24\/7\b/gi
  for (const match of text.matchAll(availabilityPattern)) {
    if (match.index !== undefined) {
      matches.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
        priority: 10,
      })
    }
  }

  // Pattern 3: Arrow transitions showing growth (2 → 50, 2.3 → 5.8, etc.)
  const arrowPattern = /[\d,.]+\s*→\s*[\d,.]+\+?/g
  for (const match of text.matchAll(arrowPattern)) {
    if (match.index !== undefined) {
      matches.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
        priority: 10,
      })
    }
  }

  // Pattern 4: Large numbers with + suffix (5M+, 3K+, 100+, 100,000+, etc.)
  const largeNumberPattern = /[\d,]+[KM]?\+/g
  for (const match of text.matchAll(largeNumberPattern)) {
    if (match.index !== undefined) {
      matches.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
        priority: 10,
      })
    }
  }

  // Pattern 4b: Multipliers (3x, 25x, 2x, etc.)
  const multiplierPattern = /\b\d+x\b/gi
  for (const match of text.matchAll(multiplierPattern)) {
    if (match.index !== undefined) {
      matches.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
        priority: 10,
      })
    }
  }

  // Pattern 4c: Time with units (48 hours, 15 days, 4 minutes, 7-day, 24 hours, etc.)
  const timeWithUnitPattern = /\b\d+(?:-\d+)?\s*(?:hours?|days?|minutes?|min|seconds?|weeks?|months?)\b/gi
  for (const match of text.matchAll(timeWithUnitPattern)) {
    if (match.index !== undefined) {
      const isAlreadyMatched = matches.some(m => 
        match.index! >= m.start && match.index! < m.end
      )
      if (!isAlreadyMatched) {
        matches.push({
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          priority: 9,
        })
      }
    }
  }

  // Pattern 5: Percentage ranges (0-100%, 50-200%, etc.) - highlight if meaningful
  const percentageRangePattern = /\d+\s*-\s*\d+%/g
  for (const match of text.matchAll(percentageRangePattern)) {
    if (match.index !== undefined) {
      const context = getContext(text, match.index, match[0].length)
      // Highlight if it's a score/rating/compatibility range
      if (isScoreRange(context)) {
        matches.push({
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          priority: 8,
        })
      }
    }
  }

  // Pattern 6: "under X minutes/hours" - highlight the number
  const underTimePattern = /\bunder\s+(\d+)\s+(minute|minutes|min|hour|hours|hr|hrs)\b/gi
  for (const match of text.matchAll(underTimePattern)) {
    if (match.index !== undefined) {
      // Find the number part
      const numberMatch = match[1]
      const numberIndex = match.index + match[0].indexOf(numberMatch)
      matches.push({
        text: numberMatch,
        start: numberIndex,
        end: numberIndex + numberMatch.length,
        priority: 8,
      })
    }
  }

  // Pattern 7: "from X to Y" or "X-Y" time improvements
  const timeImprovementPattern = /(?:from|reducing|reduced)\s+(\d+(?:-\d+)?)\s*(?:days?|hours?|minutes?)\s+(?:to|→)\s+(\d+)\s*(?:minutes?|seconds?|hours?)/gi
  for (const match of text.matchAll(timeImprovementPattern)) {
    if (match.index !== undefined) {
      // Highlight both numbers
      const firstNum = match[1]
      const secondNum = match[2]
      const firstIndex = match.index + match[0].indexOf(firstNum)
      const secondIndex = match.index + match[0].indexOf(secondNum, firstIndex + firstNum.length)
      
      matches.push({
        text: firstNum,
        start: firstIndex,
        end: firstIndex + firstNum.length,
        priority: 8,
      })
      matches.push({
        text: secondNum,
        start: secondIndex,
        end: secondIndex + secondNum.length,
        priority: 8,
      })
    }
  }

  // Pattern 8: Percentages including comma-separated (2,400%, 100%, etc.)
  const percentagePattern = /[\d,]+%/g
  for (const match of text.matchAll(percentagePattern)) {
    if (match.index !== undefined) {
      // Check if this percentage is already part of a range
      const isInRange = matches.some(m => 
        match.index! >= m.start && match.index! < m.end
      )
      if (!isInRange) {
        const context = getContext(text, match.index, match[0].length)
        // Highlight if it's an improvement/increase/decrease metric
        if (isMetricPercentage(context, match[0])) {
          matches.push({
            text: match[0],
            start: match.index,
            end: match.index + match[0].length,
            priority: 8,
          })
        }
      }
    }
  }

  // Pattern 8b: Decimal numbers in context (2.3, 5.8, 4.2/5, etc.)
  const decimalPattern = /\b\d+\.\d+(?:\/\d+)?\b/g
  for (const match of text.matchAll(decimalPattern)) {
    if (match.index !== undefined) {
      const isAlreadyMatched = matches.some(m => 
        match.index! >= m.start && match.index! < m.end
      )
      if (!isAlreadyMatched) {
        matches.push({
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          priority: 7,
        })
      }
    }
  }

  // Pattern 9: Large standalone numbers with units (5M, 300, 3K, 100,000, etc.)
  const largeStandalonePattern = /\b[\d,]{3,}[KM]?\b|\b\d+[KM]\b/g
  for (const match of text.matchAll(largeStandalonePattern)) {
    if (match.index !== undefined) {
      // Check if already matched
      const isAlreadyMatched = matches.some(m => 
        match.index! >= m.start && match.index! < m.end
      )
      if (!isAlreadyMatched) {
        matches.push({
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          priority: 6,
        })
      }
    }
  }

  // Remove overlapping matches, keeping higher priority ones
  const filteredMatches = removeOverlaps(matches)

  // Sort by position
  filteredMatches.sort((a, b) => a.start - b.start)

  // Build the result
  const parts: Array<{ text: string; highlight: boolean }> = []
  let lastIndex = 0

  filteredMatches.forEach(match => {
    // Add text before match
    if (match.start > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.start), highlight: false })
    }

    // Add highlighted match
    parts.push({ text: match.text, highlight: true })
    lastIndex = match.end
  })

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlight: false })
  }

  // If no matches found, return original text
  if (parts.length === 0 || parts.every(p => !p.highlight)) {
    return text
  }

  // Return JSX with highlighted parts
  return (
    <>
      {parts.map((part, index) =>
        part.highlight ? (
          <span key={index} className="font-semibold text-primary">
            {part.text}
          </span>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </>
  )
}

// Helper: Get context around a match
function getContext(text: string, index: number, length: number, contextSize: number = 30): string {
  const start = Math.max(0, index - contextSize)
  const end = Math.min(text.length, index + length + contextSize)
  return text.slice(start, end).toLowerCase()
}

// Helper: Check if percentage range is a score/rating
function isScoreRange(context: string): boolean {
  const scoreKeywords = ['score', 'rating', 'compatibility', 'match', 'scale', 'range', 'level']
  return scoreKeywords.some(keyword => context.includes(keyword))
}

// Helper: Check if percentage is a metric (improvement, increase, decrease, etc.)
function isMetricPercentage(context: string, percentage: string): boolean {
  // Exclude small percentages in non-metric contexts
  const numValue = parseInt(percentage)
  if (numValue < 10) {
    // Only highlight if it's clearly a metric
    const metricKeywords = ['increase', 'decrease', 'improve', 'boost', 'reduce', 'growth', 'change', 'gain', 'loss']
    return metricKeywords.some(keyword => context.includes(keyword))
  }
  
  // For larger percentages, highlight if it's in a metric context
  const metricKeywords = [
    'increase', 'decrease', 'improve', 'boost', 'reduce', 'growth', 'change',
    'gain', 'loss', 'reduction', 'improvement', 'boosted', 'increased',
    'decreased', 'reduced', 'by', 'to', 'from', 'up', 'down'
  ]
  return metricKeywords.some(keyword => context.includes(keyword)) || numValue >= 20
}

// Helper: Remove overlapping matches, keeping higher priority ones
function removeOverlaps(matches: Match[]): Match[] {
  const filtered: Match[] = []
  
  // Sort by priority (descending), then by start position
  const sorted = [...matches].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    return a.start - b.start
  })

  for (const match of sorted) {
    // Check if this match overlaps with any existing match
    const overlaps = filtered.some(existing => 
      !(match.end <= existing.start || match.start >= existing.end)
    )
    
    if (!overlaps) {
      filtered.push(match)
    }
  }

  return filtered
}

