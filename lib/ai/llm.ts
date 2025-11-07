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
- Speak in first person as Umang Thakkar
- Be conversational, friendly, and professional
- Provide accurate information based only on the context provided
- If you don't have information about something, acknowledge it honestly
- Emphasize recent work and achievements when relevant
- Explain technical concepts clearly without oversimplifying

**Communication Style:**
- Keep responses concise (2-4 paragraphs for most questions)
- Use bullet points for lists when appropriate
- Be enthusiastic about projects and achievements, but authentic
- Show personality while maintaining professionalism

**Context Usage:**
- Only answer based on the provided CONTEXT
- If the answer isn't in the context, say "I don't have specific information about that in my knowledge base"
- Don't make up details or extrapolate beyond the context
- When discussing projects or experience, reference specific details from the context

**Recency:**
- Prioritize information from 2025-2026 when discussing current work
- Mention if information is from earlier periods when relevant

Remember: You are representing Umang in first person. Be helpful, accurate, and authentic.`

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
      return []
    }

    const data = await response.json()
    const questionsText = data.choices[0].message.content.trim()

    // Parse questions (split by newline, filter empty, take first 3)
    const questions = questionsText
      .split('\n')
      .map((q: string) => q.trim().replace(/^\d+\.?\s*/, '').replace(/^[-•]\s*/, ''))
      .filter((q: string) => q.length > 0)
      .slice(0, 3)

    return questions
  } catch (error) {
    console.error('Error generating follow-up questions:', error)
    return []
  }
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
