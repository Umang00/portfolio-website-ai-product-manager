'use client'

import { useState, useEffect } from 'react'
import { APIEndpoint, APITester } from '@/components/api-test/APITester'

// Define all API endpoints
const endpoints: APIEndpoint[] = [
  {
    name: 'Query AI',
    method: 'POST',
    path: '/api/ai/query',
    description: 'Query the AI companion with a question',
    requiresAuth: false,
    body: {
      query: 'string (required)',
      conversationHistory: 'array (optional)'
    },
    example: {
      query: 'What did Umang work on at Hunch?',
      conversationHistory: []
    }
  },
  {
    name: 'Create Index',
    method: 'POST',
    path: '/api/ai/create-index',
    description: 'Create or rebuild the memory index',
    requiresAuth: false,
    body: {
      forceRebuild: 'boolean (optional)'
    },
    example: {
      forceRebuild: false
    }
  },
  {
    name: 'Rebuild Index',
    method: 'POST',
    path: '/api/ai/rebuild',
    description: 'Force rebuild the memory index (admin only)',
    requiresAuth: true,
    body: {
      secret: 'string (required)'
    },
    example: {
      secret: ''
    }
  },
  {
    name: 'Get Rebuild Stats',
    method: 'GET',
    path: '/api/ai/rebuild',
    description: 'Get current index statistics (admin only)',
    requiresAuth: true,
    queryParams: {
      secret: 'string (required)'
    }
  },
  {
    name: 'Test PDF Parsing',
    method: 'POST',
    path: '/api/ai/test-pdf-parsing',
    description: 'Test PDF parsing and section detection without generating embeddings',
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
    name: 'Test Chunking',
    method: 'POST',
    path: '/api/ai/test-chunking',
    description: 'Test document chunking without generating embeddings',
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
    name: 'Test Chunking (GET)',
    method: 'GET',
    path: '/api/ai/test-chunking',
    description: 'Test chunking via GET request (admin only)',
    requiresAuth: true,
    queryParams: {
      secret: 'string (required)',
      filename: 'string (optional)'
    }
  },
  {
    name: 'Test PDFs',
    method: 'GET',
    path: '/api/ai/test-pdfs',
    description: 'List and test all PDFs without triggering embeddings',
    requiresAuth: true,
    queryParams: {
      secret: 'string (required)'
    }
  },
  {
    name: 'Optimize Query',
    method: 'POST',
    path: '/api/ai/optimize-query',
    description: 'Optimize a query for better retrieval',
    requiresAuth: false,
    body: {
      query: 'string (required)'
    },
    example: {
      query: 'What did Umang work on?'
    }
  },
  {
    name: 'Compress Memory',
    method: 'POST',
    path: '/api/ai/compress-memory',
    description: 'Compress conversation history',
    requiresAuth: false,
    body: {
      history: 'array (required)'
    },
    example: {
      history: []
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

