// lib/ai/service.ts
import { loadAllPDFs, PDFDocument } from './loaders/pdf-loader'
import { loadGitHubRepos, GitHubRepo } from './loaders/github-loader'
import { chunkResume, chunkLinkedIn, Chunk as ProfessionalChunk } from './chunking/professional-chunker'
import { chunkJourney, Chunk as NarrativeChunk } from './chunking/narrative-chunker'
import { chunkGeneric, Chunk as GenericChunk } from './chunking/generic-chunker'
import { generateEmbedding, batchGenerateEmbeddings } from './embeddings'
import {
  storeEmbeddings,
  clearEmbeddings,
  searchSimilar,
  smartSearch,
  analyzeQueryForCategories,
  getVectorStoreStats,
  VectorDocument,
} from './vector-store'
import { generateResponse, optimizeQuery, generateFollowUpQuestions, compressMemory } from './llm'

type Chunk = ProfessionalChunk | NarrativeChunk | GenericChunk

/**
 * Build or rebuild the memory index from all sources
 * @param forceRebuild If true, rebuild even if no changes detected
 * @returns Build result with statistics
 */
export async function buildMemoryIndex(forceRebuild: boolean = false): Promise<{
  success: boolean
  skipped?: boolean
  chunksCreated: number
  documentsProcessed: number
  error?: string
}> {
  try {
    console.log('🔨 Building memory index...')

    // Step 1: Load all documents
    console.log('📥 Loading documents...')
    const pdfDocuments = await loadAllPDFs()
    console.log(`Loaded ${pdfDocuments.length} PDF documents`)

    // Step 2: Load GitHub data (optional)
    let githubRepos: GitHubRepo[] = []
    if (process.env.GITHUB_USERNAME) {
      console.log('📥 Loading GitHub repositories...')
      githubRepos = await loadGitHubRepos()
      console.log(`Loaded ${githubRepos.length} GitHub repositories`)
    } else {
      console.log('⏭️  Skipping GitHub (no GITHUB_USERNAME configured)')
    }

    // Step 3: Chunk documents based on type
    console.log('✂️  Chunking documents...')
    const allChunks: Chunk[] = []

    for (const doc of pdfDocuments) {
      let docChunks: Chunk[] = []

      switch (doc.type) {
        case 'resume':
          docChunks = chunkResume(doc.content, doc.filename)
          break

        case 'linkedin':
          docChunks = chunkLinkedIn(doc.content, doc.filename)
          break

        case 'journey':
          docChunks = chunkJourney(doc.content, doc.filename, doc.metadata.year)
          break

        case 'generic':
        default:
          docChunks = chunkGeneric(doc.content, doc.filename)
          break
      }

      allChunks.push(...docChunks)
    }

    // Step 4: Chunk GitHub repositories
    for (const repo of githubRepos) {
      if (!repo.readme) continue

      // Create chunk for repo metadata + README
      const repoText = `${repo.name}\n${repo.description || ''}\n\nLanguage: ${repo.language}\nStars: ${repo.stars}\nTopics: ${repo.topics.join(', ')}\n\nREADME:\n${repo.readme}`

      // Split README into smaller chunks if too long
      const maxReadmeLength = 2000
      if (repoText.length > maxReadmeLength) {
        // Split into paragraphs
        const paragraphs = repo.readme.split(/\n\n+/)
        const repoMetadata = `${repo.name}\n${repo.description || ''}\nLanguage: ${repo.language}`

        for (let i = 0; i < paragraphs.length; i += 3) {
          const chunkParagraphs = paragraphs.slice(i, i + 3)
          const chunkText = `${repoMetadata}\n\n${chunkParagraphs.join('\n\n')}`

          allChunks.push({
            text: chunkText,
            category: 'github',
            metadata: {
              source: repo.name,
              year: new Date(repo.updatedAt).getFullYear().toString(),
            },
          })
        }
      } else {
        allChunks.push({
          text: repoText,
          category: 'github',
          metadata: {
            source: repo.name,
            year: new Date(repo.updatedAt).getFullYear().toString(),
          },
        })
      }
    }

    console.log(`✅ Created ${allChunks.length} chunks from all sources`)

    if (allChunks.length === 0) {
      console.warn('⚠️  No chunks created. Check your documents folder.')
      return {
        success: false,
        chunksCreated: 0,
        documentsProcessed: 0,
        error: 'No chunks created',
      }
    }

    // Step 5: Generate embeddings
    console.log('🧠 Generating embeddings...')
    const texts = allChunks.map(chunk => chunk.text)
    const embeddings = await batchGenerateEmbeddings(texts)

    if (embeddings.length !== allChunks.length) {
      throw new Error('Embeddings count mismatch with chunks count')
    }

    // Step 6: Prepare vector documents
    const vectorDocuments: VectorDocument[] = allChunks.map((chunk, index) => ({
      text: chunk.text,
      embedding: embeddings[index],
      category: chunk.category,
      subcategory: chunk.subcategory,
      metadata: chunk.metadata,
      createdAt: new Date(),
    }))

    // Step 7: Clear old embeddings and store new ones
    console.log('💾 Storing embeddings in MongoDB...')
    await clearEmbeddings()
    await storeEmbeddings(vectorDocuments)

    console.log('✅ Memory index built successfully!')

    return {
      success: true,
      chunksCreated: allChunks.length,
      documentsProcessed: pdfDocuments.length + githubRepos.length,
    }
  } catch (error) {
    console.error('❌ Error building memory index:', error)
    return {
      success: false,
      chunksCreated: 0,
      documentsProcessed: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Query the AI with RAG (Retrieval-Augmented Generation)
 * @param query User's query
 * @param conversationHistory Optional conversation history for context
 * @returns AI response with sources and suggestions
 */
export async function queryAI(
  query: string,
  conversationHistory: string = ''
): Promise<{
  answer: string
  sources: string[]
  suggestedQuestions: string[]
}> {
  try {
    console.log(`🔍 Processing query: "${query}"`)

    // Step 1: Analyze query to determine relevant categories
    const relevantCategories = analyzeQueryForCategories(query)
    console.log(`Categories detected: ${relevantCategories.length > 0 ? relevantCategories.join(', ') : 'all'}`)

    // Step 2: Generate query embedding
    console.log('🧠 Generating query embedding...')
    const queryEmbedding = await generateEmbedding(query)

    // Step 3: Search for relevant chunks
    console.log('🔍 Searching for relevant context...')
    const searchResults = await smartSearch(queryEmbedding, {
      limit: 5,
      categories: relevantCategories.length > 0 ? relevantCategories : undefined,
      boostRecent: true,
    })

    if (searchResults.length === 0) {
      console.warn('⚠️  No relevant context found')
      return {
        answer: "I don't have enough information to answer that question based on my knowledge about Umang. Could you try rephrasing or asking about something else?",
        sources: [],
        suggestedQuestions: [],
      }
    }

    console.log(`Found ${searchResults.length} relevant chunks`)

    // Step 4: Construct context from search results
    const context = searchResults
      .map((result, index) => {
        return `[Source ${index + 1}: ${result.metadata.source || 'Unknown'}]\n${result.text}`
      })
      .join('\n\n---\n\n')

    // Limit context size (max 8000 characters)
    const maxContextLength = 8000
    const trimmedContext = context.length > maxContextLength
      ? context.slice(0, maxContextLength) + '\n\n[Context truncated...]'
      : context

    // Step 5: Generate response with LLM
    console.log('💬 Generating response...')
    const answer = await generateResponse(trimmedContext, query, conversationHistory)

    // Step 6: Extract unique sources
    const sources = Array.from(
      new Set(searchResults.map(r => r.metadata.source).filter(Boolean))
    )

    // Step 7: Generate follow-up questions
    console.log('❓ Generating follow-up questions...')
    const suggestedQuestions = await generateFollowUpQuestions(trimmedContext, query, answer)

    console.log('✅ Query processed successfully')

    return {
      answer,
      sources,
      suggestedQuestions,
    }
  } catch (error) {
    console.error('❌ Error processing query:', error)
    throw error
  }
}

/**
 * Get statistics about the AI system
 * @returns Statistics object
 */
export async function getSystemStats(): Promise<{
  vectorStore: {
    totalDocuments: number
    categoryCounts: Record<string, number>
    oldestDocument?: Date
    newestDocument?: Date
  }
}> {
  try {
    const vectorStoreStats = await getVectorStoreStats()

    return {
      vectorStore: vectorStoreStats,
    }
  } catch (error) {
    console.error('Error getting system stats:', error)
    throw error
  }
}

/**
 * Export all functions for use in API routes
 */
export {
  optimizeQuery,
  compressMemory,
  analyzeQueryForCategories,
}
