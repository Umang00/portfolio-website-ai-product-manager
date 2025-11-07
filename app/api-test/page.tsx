'use client'

import { useState, useEffect } from 'react'
import { APIEndpoint, APITester } from '@/components/api-test/APITester'

// Define all API endpoints
const endpoints: APIEndpoint[] = [
  {
    name: 'Query AI (Chat)',
    method: 'POST',
    path: '/api/ai/query',
    description: 'Query the AI companion with a question.\n• Returns AI response based on retrieved context\n• Supports conversation history for multi-turn conversations\n• Returns updated conversationHistory array (ready to pass to next request)\n• Includes suggested follow-up questions\n\n💡 Tip: Use the returned conversationHistory in your next request for context-aware responses',
    requiresAuth: false,
    body: {
      query: 'string (required) - Your question',
      conversationHistory: 'array (optional) - Previous messages in format [{role: "user"|"assistant", content: string}]'
    },
    example: {
      query: 'What did Umang work on at Hunch?',
      conversationHistory: []
    },
    examples: [
      {
        name: 'First Query (No History)',
        description: 'Start a new conversation',
        body: {
          query: 'What did Umang work on at Hunch?',
          conversationHistory: []
        }
      },
      {
        name: 'Follow-up Query (With History)',
        description: 'Continue conversation using returned conversationHistory',
        body: {
          query: 'What was his biggest achievement there?',
          conversationHistory: [
            {
              role: 'user',
              content: 'What did Umang work on at Hunch?'
            },
            {
              role: 'assistant',
              content: 'At Hunch, I worked on building an AI product that helped users discover personalized recommendations...'
            }
          ]
        }
      }
    ]
  },
  {
    name: 'Create Index (Change Detection)',
    method: 'POST',
    path: '/api/ai/create-index',
    description: 'Create or rebuild the memory index with change detection.\n• Use forceRebuild=false to test change detection (skips if no files changed)\n• Use forceRebuild=true to force a full rebuild\n• Response includes filesUpdated array for incremental updates',
    requiresAuth: false,
    body: {
      forceRebuild: 'boolean (optional, default: true)'
    },
    example: {
      forceRebuild: false
    }
  },
  {
    name: 'Rebuild Index (Admin)',
    method: 'POST',
    path: '/api/ai/rebuild',
    description: 'Force rebuild the memory index (admin only).\n• Always performs full rebuild\n• Requires admin secret authentication\n• Returns system statistics after rebuild',
    requiresAuth: true,
    body: {
      secret: 'string (required)'
    },
    example: {
      secret: ''
    }
  },
  {
    name: 'Get Index Stats (Admin)',
    method: 'GET',
    path: '/api/ai/rebuild',
    description: 'Get current index statistics (admin only).\n• Returns total documents count\n• Shows category breakdown\n• Requires admin secret authentication',
    requiresAuth: true,
    queryParams: {
      secret: 'string (required)'
    }
  },
  {
    name: 'Test PDF Parsing (Testing)',
    method: 'POST',
    path: '/api/ai/test-pdf-parsing',
    description: 'Test PDF parsing and section detection without generating embeddings.\n• No API costs (does not call OpenAI)\n• Returns parsed text and detected sections\n• Useful for debugging PDF loading issues',
    requiresAuth: true,
    body: {
      filename: 'string (required)',
      secret: 'string (required)'
    },
    example: {
      filename: 'Umang_Thakkar_PM_Master_Resume.pdf',
      secret: ''
    }
  },
  {
    name: 'Test Chunking (Testing)',
    method: 'POST',
    path: '/api/ai/test-chunking',
    description: 'Test document chunking strategies without generating embeddings.\n• No API costs (does not call OpenAI)\n• Tests chunking for different document types\n• Returns chunk statistics and quality metrics',
    requiresAuth: true,
    body: {
      filename: 'string (required)',
      documentType: 'string (optional: resume | linkedin | journey | github | generic)',
      secret: 'string (required)',
      testAll: 'boolean (optional)'
    },
    example: {
      filename: 'Umang_Thakkar_PM_Master_Resume.pdf',
      documentType: 'resume',
      secret: '',
      testAll: false
    }
  },
  {
    name: 'Test Chunking GET (Testing)',
    method: 'GET',
    path: '/api/ai/test-chunking',
    description: 'Test chunking via GET request (admin only).\n• Convenient GET endpoint for quick testing\n• No API costs\n• Requires admin secret',
    requiresAuth: true,
    queryParams: {
      secret: 'string (required)',
      filename: 'string (optional)'
    }
  },
  {
    name: 'List PDFs (Testing)',
    method: 'GET',
    path: '/api/ai/test-pdfs',
    description: 'List and test all PDFs without triggering embeddings.\n• Returns list of all PDF files\n• Shows document types and text lengths\n• No API costs',
    requiresAuth: true,
    queryParams: {
      secret: 'string (required)'
    }
  },
  {
    name: 'Optimize Query (Query Enhancement)',
    method: 'POST',
    path: '/api/ai/optimize-query',
    description: 'Optimize a query for better retrieval.\n• Rewrites queries to improve search results\n• Enhances query intent detection\n• Returns optimized query string',
    requiresAuth: false,
    body: {
      query: 'string (required)'
    },
    example: {
      query: 'What did Umang work on?'
    }
  },
  {
    name: 'Compress Memory (Conversation)',
    method: 'POST',
    path: '/api/ai/compress-memory',
    description: 'Compress conversation history to reduce token usage.\n• Summarizes old messages\n• Preserves important context\n• Reduces LLM token consumption',
    requiresAuth: false,
    body: {
      history: 'array (required)'
    },
    example: {
      history: []
    }
  },
  {
    name: 'Check Index Status (Diagnostics)',
    method: 'GET',
    path: '/api/ai/check-index',
    description: 'Check MongoDB index status and diagnose vector search issues.\n• Verifies vector search index exists\n• Checks document count and embeddings\n• Shows index status and configuration',
    requiresAuth: false,
  },
  {
    name: 'Test Vector Search (Debugging)',
    method: 'POST',
    path: '/api/ai/test-vector-search',
    description: 'Test vector search directly to debug "No relevant context" issues.\n• Runs vector search without category filters\n• Shows raw search results and scores\n• Displays sample documents and category distribution',
    requiresAuth: false,
    body: {
      query: 'string (required)',
      testWithoutCategories: 'boolean (optional)'
    },
    example: {
      query: 'What did Umang work on at Hunch?',
      testWithoutCategories: true
    }
  }
]

export default function APITestPage() {
  const [adminSecret, setAdminSecret] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    // Load admin secret from localStorage if available
    const savedSecret = localStorage.getItem('admin_secret')
    if (savedSecret) {
      setAdminSecret(savedSecret)
      setIsAuthenticated(true)
    }
  }, [])

  const handleAuth = () => {
    if (adminSecret) {
      localStorage.setItem('admin_secret', adminSecret)
      setIsAuthenticated(true)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_secret')
    setAdminSecret('')
    setIsAuthenticated(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">API Testing Interface</h1>
          <p className="text-gray-400">
            Test all RAG pipeline endpoints with authentication handled automatically
          </p>
        </div>

        {/* Authentication Section */}
        {!isAuthenticated && (
          <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Admin Authentication</h2>
            <div className="flex gap-4">
              <input
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Enter ADMIN_SECRET"
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              />
              <button
                onClick={handleAuth}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                Authenticate
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              Your secret is stored locally and will be automatically included in authenticated requests
            </p>
          </div>
        )}

        {isAuthenticated && (
          <div className="mb-8 p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Authenticated</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        )}

        {/* API Tester Component */}
        <APITester endpoints={endpoints} adminSecret={isAuthenticated ? adminSecret : ''} />
      </div>
    </div>
  )
}

