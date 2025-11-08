// lib/ai/service.ts
import { loadAllPDFs, loadPDF, PDFDocument } from './loaders/pdf-loader'
import { loadGitHubRepos, GitHubRepo } from './loaders/github-loader'
import { chunkResume, chunkLinkedIn, Chunk as ProfessionalChunk } from './chunking/professional-chunker'
import { chunkJourney, Chunk as NarrativeChunk } from './chunking/narrative-chunker'
import { chunkGeneric, Chunk as GenericChunk } from './chunking/generic-chunker'
import { chunkGitHub, Chunk as MarkdownChunk } from './chunking/markdown-chunker'
import { generateEmbedding, batchGenerateEmbeddings } from './embeddings'
import {
  storeEmbeddings,
  clearEmbeddings,
  deleteBySource,
  searchSimilar,
  smartSearch,
  analyzeQueryForCategories,
  getVectorStoreStats,
  VectorDocument,
} from './vector-store'
import { generateResponse, optimizeQuery, generateFollowUpQuestions, compressMemory, generateFallbackQuestions } from './llm'
import {
  checkForChanges,
  updateFileMetadata,
  getFileHash,
  getFileSize,
} from './file-watcher'
import path from 'path'
import crypto from 'crypto'

type Chunk = ProfessionalChunk | NarrativeChunk | GenericChunk | MarkdownChunk

/**
 * Format source filename to user-friendly display name
 * @param filename The source filename from metadata
 * @returns User-friendly display name
 */
function formatSourceName(filename: string): string {
  // Map of known filenames to friendly names
  const sourceMap: Record<string, string> = {
    'Umang_Thakkar_PM_Master_Resume.pdf': 'Resume',
    'LinkedIn.pdf': 'LinkedIn Profile',
    'journey_fy-2023-2024.pdf': 'Journey (2023-2024)',
    'journey_fy-2024-2025.pdf': 'Journey (2024-2025)',
    'journey_fy-2025-2026.pdf': 'Journey (2025-2026)',
  }

  // Handle GitHub repos (no .pdf extension)
  if (!filename.includes('.pdf')) {
    // Format GitHub repo names nicely
    return `GitHub: ${filename.replace(/-/g, ' ').replace(/_/g, ' ')}`
  }

  // Return mapped name or format the filename nicely
  if (sourceMap[filename]) {
    return sourceMap[filename]
  }

  // Fallback: format filename nicely
  return filename
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace('.pdf', '')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

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
  filesUpdated?: string[]
  error?: string
}> {
  try {
    console.log('🔨 Building memory index...')

    // Step 1: Check for changes (unless force rebuild)
    let changedPDFs: string[] = []
    let changedGitHubRepos: string[] = []

    if (!forceRebuild) {
      console.log('🔍 Checking for file changes...')
      
      // Load GitHub repos first to check for changes
      let githubReposForCheck: Array<{ name: string; updatedAt: string }> = []
      if (process.env.GITHUB_USERNAME) {
        const repos = await loadGitHubRepos()
        githubReposForCheck = repos.map(r => ({ name: r.name, updatedAt: r.updatedAt }))
      }

      const changes = await checkForChanges(githubReposForCheck)
      changedPDFs = changes.changedPDFs
      changedGitHubRepos = changes.changedGitHubRepos

      if (changedPDFs.length === 0 && changedGitHubRepos.length === 0) {
        console.log('✅ No changes detected, skipping rebuild')
        return {
          success: true,
          skipped: true,
          chunksCreated: 0,
          documentsProcessed: 0,
        }
      }

      console.log(`📝 Changes detected: ${changedPDFs.length} PDF(s), ${changedGitHubRepos.length} GitHub repo(s)`)
    }

    // Step 2: Load documents (all if force rebuild, or only changed if incremental)
    console.log('📥 Loading documents...')
    let pdfDocuments: PDFDocument[] = []

    if (forceRebuild) {
      // Load all PDFs
      pdfDocuments = await loadAllPDFs()
      console.log(`Loaded ${pdfDocuments.length} PDF documents (full rebuild)`)
    } else {
      // Load only changed PDFs
      if (changedPDFs.length > 0) {
        console.log(`Loading ${changedPDFs.length} changed PDF file(s)...`)
        for (const filename of changedPDFs) {
          try {
            const doc = await loadPDF(filename)
            pdfDocuments.push(doc)
          } catch (error) {
            console.error(`Error loading ${filename}:`, error)
          }
        }
        console.log(`Loaded ${pdfDocuments.length} changed PDF documents`)
      }
    }

    // Step 3: Load GitHub data (optional)
    let githubRepos: GitHubRepo[] = []

    if (process.env.GITHUB_USERNAME) {
      console.log('📥 Loading GitHub repositories...')
      githubRepos = await loadGitHubRepos()

      if (!forceRebuild) {
        // Filter to only changed repos
        if (changedGitHubRepos.length > 0) {
          githubRepos = githubRepos.filter(r => changedGitHubRepos.includes(r.name))
          console.log(`Filtered to ${githubRepos.length} changed GitHub repository/repositories`)
        } else {
          githubRepos = []
          console.log('No changed GitHub repositories')
        }
      } else {
        console.log(`Loaded ${githubRepos.length} GitHub repositories (full rebuild)`)
      }
    } else {
      console.log('⏭️  Skipping GitHub (no GITHUB_USERNAME configured)')
    }

    // Step 4: Delete old embeddings for changed files (before processing new chunks)
    if (!forceRebuild && (changedPDFs.length > 0 || changedGitHubRepos.length > 0)) {
      const sourcesToDelete = [...changedPDFs, ...changedGitHubRepos]
      console.log(`🗑️  Deleting old embeddings for changed sources: ${sourcesToDelete.join(', ')}`)
      await deleteBySource(sourcesToDelete)
    } else if (forceRebuild) {
      // Clear all embeddings for full rebuild
      console.log('🗑️  Clearing all embeddings (full rebuild)')
      await clearEmbeddings()
    }

    // Step 5: Chunk documents based on type
    console.log('✂️  Chunking documents...')
    const allChunks: Chunk[] = []
    const fileChunkCounts: Map<string, number> = new Map()

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

      fileChunkCounts.set(doc.filename, docChunks.length)
      allChunks.push(...docChunks)
    }

    // Step 6: Chunk GitHub repositories with smart section-aware chunking
    for (const repo of githubRepos) {
      if (!repo.readme) continue

      const repoMetadata = {
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stars,
        topics: repo.topics,
      }

      const githubChunks = chunkGitHub(
        repo.readme,
        repoMetadata,
        repo.name,
        new Date(repo.updatedAt).getFullYear().toString()
      )

      fileChunkCounts.set(repo.name, githubChunks.length)
      allChunks.push(...githubChunks)
    }

    console.log(`✅ Created ${allChunks.length} chunks from ${pdfDocuments.length + githubRepos.length} source(s)`)

    if (allChunks.length === 0) {
      console.warn('⚠️  No chunks created. Check your documents folder.')
      return {
        success: false,
        chunksCreated: 0,
        documentsProcessed: 0,
        error: 'No chunks created',
      }
    }

    // Step 7: Generate embeddings
    console.log('🧠 Generating embeddings...')
    const texts = allChunks.map(chunk => chunk.text)
    const embeddings = await batchGenerateEmbeddings(texts)

    if (embeddings.length !== allChunks.length) {
      throw new Error('Embeddings count mismatch with chunks count')
    }

    // Step 8: Prepare vector documents
    const vectorDocuments: VectorDocument[] = allChunks.map((chunk, index) => ({
      text: chunk.text,
      embedding: embeddings[index],
      category: chunk.category,
      subcategory: chunk.subcategory,
      metadata: chunk.metadata,
      createdAt: new Date(),
    }))

    // Step 9: Store new embeddings
    console.log('💾 Storing embeddings in MongoDB...')
    await storeEmbeddings(vectorDocuments)

    // Step 10: Update file metadata for processed files
    console.log('📝 Updating file metadata...')
    const documentsPath = path.join(process.cwd(), 'documents')

    for (const doc of pdfDocuments) {
      const filePath = path.join(documentsPath, doc.filename)
      const hash = await getFileHash(filePath)
      const fileSize = getFileSize(filePath)
      const chunkCount = fileChunkCounts.get(doc.filename) || 0

      await updateFileMetadata(doc.filename, hash, chunkCount, fileSize, 'pdf')
    }

    for (const repo of githubRepos) {
      const chunkCount = fileChunkCounts.get(repo.name) || 0
      // For GitHub repos, we use updatedAt as the "hash" equivalent
      // Create a simple hash from the repo name + updatedAt for consistency
      const hash = crypto
        .createHash('sha256')
        .update(`${repo.name}:${repo.updatedAt}`)
        .digest('hex')

      await updateFileMetadata(
        repo.name,
        hash,
        chunkCount,
        0, // GitHub repos don't have a file size
        'github',
        repo.updatedAt
      )
    }

    const filesUpdated = forceRebuild
      ? undefined
      : [...changedPDFs, ...changedGitHubRepos]

    console.log('✅ Memory index built successfully!')

    return {
      success: true,
      chunksCreated: allChunks.length,
      documentsProcessed: pdfDocuments.length + githubRepos.length,
      filesUpdated,
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
    // Format context without exposing technical source details to LLM
    const context = searchResults
      .map((result) => {
        return result.text
      })
      .join('\n\n---\n\n')

    // Limit context size (max 8000 characters)
    const maxContextLength = 8000
    const trimmedContext = context.length > maxContextLength
      ? context.slice(0, maxContextLength) + '\n\n[...]'
      : context

    // Step 5: Generate response with LLM
    console.log('💬 Generating response...')
    const answer = await generateResponse(trimmedContext, query, conversationHistory)

    // Step 6: Extract unique sources and format them for display
    const rawSources = Array.from(
      new Set(searchResults.map(r => r.metadata.source).filter(Boolean))
    )
    const sources = rawSources.map(formatSourceName)

    // Step 7: Generate follow-up questions (non-blocking - use fallback if fails)
    // Note: Free models often return empty responses, so we rely on intelligent fallback
    // Note: Rate limiting may queue requests, so we use a longer timeout (30 seconds)
    console.log('❓ Generating follow-up questions...')
    let suggestedQuestions: string[] = []
    
    // Try LLM generation with timeout (30 seconds to account for rate limiting delays)
    const followUpPromise = generateFollowUpQuestions(trimmedContext, query, answer)
    const timeoutPromise = new Promise<string[]>((resolve) => {
      setTimeout(() => {
        console.log('[Service] Follow-up questions timeout after 30s (rate limiter may still be processing)')
        resolve([])
      }, 30000) // 30 seconds to allow rate limiter to process queued requests
    })
    
    try {
      const result = await Promise.race([followUpPromise, timeoutPromise])
      suggestedQuestions = result || []
      
      // Ensure we always have 3 questions
      if (suggestedQuestions.length < 3) {
        console.log(`[Service] Got ${suggestedQuestions.length} questions from LLM, using fallback for remaining`)
        const fallback = generateFallbackQuestions(query, answer)
        // Merge intelligently: use LLM questions first, then fill with fallback
        suggestedQuestions = [...suggestedQuestions, ...fallback].slice(0, 3)
      }
    } catch (error) {
      console.error('[Service] Error generating follow-up questions, using fallback:', error)
      suggestedQuestions = generateFallbackQuestions(query, answer)
    }
    
    // Final safety check - always return 3 questions
    if (suggestedQuestions.length < 3) {
      console.warn(`[Service] Still only have ${suggestedQuestions.length} questions, using full fallback`)
      suggestedQuestions = generateFallbackQuestions(query, answer)
    }

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
