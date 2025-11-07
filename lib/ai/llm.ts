// lib/ai/llm.ts
if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('Please define the OPENROUTER_API_KEY environment variable inside .env.local')
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const LLM_MODEL = process.env.LLM_MODEL || 'meta-llama/llama-3.1-8b-instruct:free'
const LLM_MAX_TOKENS = parseInt(process.env.LLM_MAX_TOKENS || '2000')
const LLM_TEMPERATURE = parseFloat(process.env.LLM_TEMPERATURE || '0.7')

/**
 * System prompt that defines Umang's AI companion persona
 */
const SYSTEM_PROMPT = `You are Umang Thakkar's AI companion, designed to help visitors learn about Umang's professional background, skills, projects, and journey.

**Your Role:**
- Speak in first person as Umang Thakkar ("I did this", not "Umang did this")
- Be conversational, friendly, and natural - like you're chatting with a colleague
- Share information from your experience and memory
- If you don't know something, say so naturally: "I don't have that information" or "I'm not sure about that"
- Emphasize recent work and achievements when relevant
- Explain technical concepts clearly without oversimplifying

**Communication Style:**
- Keep responses concise and natural (2-4 paragraphs for most questions)
- Use bullet points for lists when appropriate
- Be enthusiastic about projects and achievements, but authentic
- Show personality while maintaining professionalism
- Avoid formal language - be conversational and approachable
- Don't say things like "the context provided" or "based on the context" - just speak naturally from your experience

**Answering Questions:**
- Answer based on what you know from your experience
- If you don't have information, acknowledge it honestly and naturally
- Don't make up details or extrapolate beyond what you know
- When discussing projects or experience, share specific details naturally
- Never mention file names, documents, or technical details about how information is stored
- Don't reference "the context" or "provided information" - just speak from your experience

**Recency:**
- Prioritize information from 2025-2026 when discussing current work
- Mention if information is from earlier periods when relevant

**Important:**
- You are Umang speaking in first person
- Be natural and conversational - like you're explaining your work to a friend
- Never mention technical implementation details (files, documents, context, etc.)
- Just share your experience and knowledge naturally

Remember: You are representing Umang in first person. Be helpful, accurate, authentic, and conversational.`

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Generate a response using OpenRouter's LLM
 * @param context The retrieved context from vector search
 * @param query The user's query
 * @param conversationHistory Optional conversation history for context
 * @returns The LLM's response
 */
export async function generateResponse(
  context: string,
  query: string,
  conversationHistory: string = ''
): Promise<string> {
  try {
    // Construct the user prompt with context and query
    let userPrompt = ''

    // Ensure conversationHistory is a string
    const conversationHistoryStr =
      typeof conversationHistory === 'string' ? conversationHistory : String(conversationHistory || '')

    if (conversationHistoryStr && conversationHistoryStr.trim().length > 0) {
      userPrompt = `CONVERSATION MEMORY:\n${conversationHistoryStr}\n\nCONTEXT:\n${context}\n\nQUESTION: ${query}`
    } else {
      userPrompt = `CONTEXT:\n${context}\n\nQUESTION: ${query}`
    }

    const messages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Umang Thakkar Portfolio AI'
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: messages,
        max_tokens: LLM_MAX_TOKENS,
        temperature: LLM_TEMPERATURE,
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response generated from LLM')
    }

    return data.choices[0].message.content
  } catch (error) {
    console.error('Error generating LLM response:', error)
    throw error
  }
}

/**
 * Optimize a user query for better retrieval
 * @param query The original user query
 * @param conversationMemory Optional conversation context
 * @returns Optimized query string
 */
export async function optimizeQuery(
  query: string,
  conversationMemory: string = ''
): Promise<string> {
  try {
    const optimizationPrompt = conversationMemory
      ? `Based on this conversation context:\n${conversationMemory}\n\nRewrite this query to be more specific and search-friendly: "${query}"\n\nProvide only the rewritten query, no explanation.`
      : `Rewrite this query to be more specific and search-friendly for finding information about a person's professional background: "${query}"\n\nProvide only the rewritten query, no explanation.`

    const messages: Message[] = [
      { role: 'system', content: 'You are a query optimization assistant. Rewrite queries to be more specific and effective for semantic search.' },
      { role: 'user', content: optimizationPrompt }
    ]

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Umang Thakkar Portfolio AI'
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: messages,
        max_tokens: 200,
        temperature: 0.3,
      })
    })

    if (!response.ok) {
      console.warn('Query optimization failed, using original query')
      return query
    }

    const data = await response.json()
    const optimizedQuery = data.choices[0].message.content.trim().replace(/^["']|["']$/g, '')

    console.log(`Query optimized: "${query}" -> "${optimizedQuery}"`)
    return optimizedQuery
  } catch (error) {
    console.error('Error optimizing query, using original:', error)
    return query
  }
}

/**
 * Generate follow-up question suggestions
 * @param context The context that was used
 * @param query The user's query
 * @param answer The AI's response
 * @returns Array of 3 suggested follow-up questions
 */
export async function generateFollowUpQuestions(
  context: string,
  query: string,
  answer: string
): Promise<string[]> {
  try {
    const prompt = `Based on this Q&A about Umang Thakkar:

QUESTION: ${query}
ANSWER: ${answer}

Suggest 3 natural follow-up questions that would help the user learn more. Make them specific and engaging.

Format: Return only the 3 questions, one per line, without numbering or bullets.`

    const messages: Message[] = [
      { role: 'system', content: 'You generate relevant follow-up questions to help users explore topics in depth.' },
      { role: 'user', content: prompt }
    ]

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Umang Thakkar Portfolio AI'
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: messages,
        max_tokens: 300,
        temperature: 0.8,
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`[Follow-up Questions] API error: ${response.status} ${response.statusText}`, errorData)
      // Return fallback questions instead of empty array
      return generateFallbackQuestions(query, answer)
    }

    const data = await response.json()

    if (!data.choices || data.choices.length === 0) {
      console.warn('[Follow-up Questions] No response from LLM, using fallback')
      return generateFallbackQuestions(query, answer)
    }

    const questionsText = data.choices[0].message.content.trim()
    
    // Log the raw response for debugging
    console.log(`[Follow-up Questions] Raw LLM response: "${questionsText.substring(0, 200)}..."`)

    // Parse questions - handle multiple formats
    let questions: string[] = []
    
    // Try splitting by newline first
    const lines = questionsText.split('\n').map((q: string) => q.trim()).filter((q: string) => q.length > 0)
    
    for (const line of lines) {
      // Remove numbering (1., 2., 3., etc.)
      let cleaned = line.replace(/^\d+[\.\)]\s*/, '')
      // Remove bullets (-, •, *, etc.)
      cleaned = cleaned.replace(/^[-•*]\s*/, '')
      // Remove quotes if present
      cleaned = cleaned.replace(/^["']|["']$/g, '')
      // Remove common prefixes
      cleaned = cleaned.replace(/^(question|q|follow-up|followup):\s*/i, '')
      
      // Only add if it looks like a question (ends with ? or is substantial)
      if (cleaned.length > 10 && (cleaned.endsWith('?') || cleaned.length > 20)) {
        questions.push(cleaned)
      }
    }
    
    // If we still don't have questions, try splitting by other delimiters
    if (questions.length === 0) {
      // Try splitting by periods followed by space (for questions that might be on one line)
      const periodSplit = questionsText.split(/\.\s+/).map((q: string) => q.trim()).filter((q: string) => q.length > 10 && q.endsWith('?'))
      questions = periodSplit.slice(0, 3)
    }
    
    // If still no questions, try extracting questions from the text using regex
    if (questions.length === 0) {
      const questionRegex = /[^.!?]*\?/g
      const matches = questionsText.match(questionRegex)
      if (matches) {
        questions = matches
          .map((q: string) => q.trim().replace(/^\d+[\.\)]\s*/, '').replace(/^[-•*]\s*/, ''))
          .filter((q: string) => q.length > 10)
          .slice(0, 3)
      }
    }

    // Take first 3 questions
    questions = questions.slice(0, 3)

    console.log(`[Follow-up Questions] Parsed ${questions.length} questions:`, questions)

    // If we got fewer than 3 questions, use fallback
    if (questions.length < 3) {
      console.warn(`[Follow-up Questions] Only got ${questions.length} questions, using fallback for missing ones`)
      const fallback = generateFallbackQuestions(query, answer)
      return [...questions, ...fallback].slice(0, 3)
    }

    console.log(`[Follow-up Questions] Generated ${questions.length} questions successfully`)
    return questions
  } catch (error) {
    console.error('[Follow-up Questions] Error generating follow-up questions:', error)
    // Return fallback questions instead of empty array
    return generateFallbackQuestions(query, answer)
  }
}

/**
 * Generate fallback follow-up questions when LLM fails
 * @param query The user's query
 * @param answer The AI's answer
 * @returns Array of 3 fallback questions
 */
function generateFallbackQuestions(query: string, answer: string): string[] {
  // Extract key topics from the answer to generate relevant follow-ups
  const lowerAnswer = answer.toLowerCase()
  const lowerQuery = query.toLowerCase()

  const fallbackQuestions = [
    "Can you tell me more about that?",
    "What other projects or experiences relate to this?",
    "How did this impact your career or skills?"
  ]

  // Try to make questions more specific based on query/answer content
  if (lowerQuery.includes('hunch') || lowerAnswer.includes('hunch')) {
    return [
      "What were the biggest challenges you faced at Hunch?",
      "How did your role evolve during your time at Hunch?",
      "What skills did you develop from your experience at Hunch?"
    ]
  }

  if (lowerQuery.includes('project') || lowerAnswer.includes('project')) {
    return [
      "What technologies did you use in this project?",
      "What was the outcome or impact of this project?",
      "What did you learn from building this project?"
    ]
  }

  if (lowerQuery.includes('skill') || lowerAnswer.includes('skill')) {
    return [
      "How did you develop these skills?",
      "Which projects helped you practice these skills?",
      "What advice would you give to someone learning these skills?"
    ]
  }

  if (lowerQuery.includes('journey') || lowerAnswer.includes('journey') || lowerAnswer.includes('career')) {
    return [
      "What were the key turning points in your career?",
      "How did you decide to transition between roles?",
      "What advice would you give to someone starting a similar journey?"
    ]
  }

  return fallbackQuestions
}

/**
 * Compress conversation history into a concise memory summary
 * @param conversationHistory The full conversation history
 * @returns Compressed memory summary (max 200 words)
 */
export async function compressMemory(conversationHistory: string): Promise<string> {
  try {
    const prompt = `Summarize this conversation into key points (max 200 words). Focus on:
- Topics discussed
- Specific details mentioned
- User's interests/focus areas

CONVERSATION:
${conversationHistory}

Provide a concise summary:`

    const messages: Message[] = [
      { role: 'system', content: 'You compress conversation history into concise summaries.' },
      { role: 'user', content: prompt }
    ]

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Umang Thakkar Portfolio AI'
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: messages,
        max_tokens: 300,
        temperature: 0.3,
      })
    })

    if (!response.ok) {
      return conversationHistory // Fallback to original
    }

    const data = await response.json()
    return data.choices[0].message.content.trim()
  } catch (error) {
    console.error('Error compressing memory:', error)
    return conversationHistory
  }
}
