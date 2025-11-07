'use client'

import { useState } from 'react'

export interface APIEndpoint {
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  requiresAuth: boolean
  body?: Record<string, string>
  queryParams?: Record<string, string>
  example?: Record<string, any>
  examples?: Array<{
    name: string
    description: string
    body: Record<string, any>
  }>
}

interface APITesterProps {
  endpoints: APIEndpoint[]
  adminSecret: string
}

export function APITester({ endpoints, adminSecret }: APITesterProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null)
  const [selectedExampleIndex, setSelectedExampleIndex] = useState<number | null>(null)
  const [requestBody, setRequestBody] = useState<string>('')
  const [queryParams, setQueryParams] = useState<Record<string, string>>({})
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleEndpointSelect = (endpoint: APIEndpoint) => {
    setSelectedEndpoint(endpoint)
    setSelectedExampleIndex(null)
    setResponse(null)
    setError(null)
    
    // Initialize request body with example if available
    if (endpoint.example) {
      // Replace secret placeholder if authenticated
      const example = { ...endpoint.example }
      if (example.secret === '' && adminSecret) {
        example.secret = adminSecret
      }
      setRequestBody(JSON.stringify(example, null, 2))
    } else if (endpoint.body) {
      // Create empty body structure
      const emptyBody: Record<string, any> = {}
      Object.keys(endpoint.body).forEach(key => {
        if (key === 'secret' && adminSecret) {
          emptyBody[key] = adminSecret
        } else {
          emptyBody[key] = ''
        }
      })
      setRequestBody(JSON.stringify(emptyBody, null, 2))
    } else {
      setRequestBody('')
    }

    // Initialize query params
    if (endpoint.queryParams) {
      const params: Record<string, string> = {}
      Object.keys(endpoint.queryParams).forEach(key => {
        if (key === 'secret' && adminSecret) {
          params[key] = adminSecret
        } else {
          params[key] = ''
        }
      })
      setQueryParams(params)
    } else {
      setQueryParams({})
    }
  }

  const handleSendRequest = async () => {
    if (!selectedEndpoint) return

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      // Build URL with query params
      let url = selectedEndpoint.path
      if (selectedEndpoint.method === 'GET' && Object.keys(queryParams).length > 0) {
        const params = new URLSearchParams()
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value) params.append(key, value)
        })
        url += '?' + params.toString()
      }

      // Parse request body for POST requests
      let body: any = null
      if (selectedEndpoint.method === 'POST' && requestBody) {
        try {
          body = JSON.parse(requestBody)
          // Auto-fill secret if authenticated and not provided
          if (selectedEndpoint.requiresAuth && !body.secret && adminSecret) {
            body.secret = adminSecret
          }
        } catch (e) {
          throw new Error('Invalid JSON in request body')
        }
      }

      // Make request
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (body) {
        options.body = JSON.stringify(body)
      }

      const res = await fetch(url, options)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || `HTTP ${res.status}: ${res.statusText}`)
      } else {
        setResponse(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-600'
      case 'POST':
        return 'bg-blue-600'
      case 'PUT':
        return 'bg-yellow-600'
      case 'DELETE':
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Endpoints List */}
      <div className="lg:col-span-1">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <h2 className="text-xl font-semibold mb-4">Endpoints</h2>
          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            {endpoints.map((endpoint, idx) => (
              <button
                key={idx}
                onClick={() => handleEndpointSelect(endpoint)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedEndpoint?.path === endpoint.path && selectedEndpoint?.method === endpoint.method
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  <span className="text-sm font-medium truncate">{endpoint.name}</span>
                </div>
                <p className="text-xs text-gray-400 truncate">{endpoint.path}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Request/Response Panel */}
      <div className="lg:col-span-2">
        {selectedEndpoint ? (
          <div className="space-y-6">
            {/* Endpoint Info */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded font-semibold ${getMethodColor(selectedEndpoint.method)}`}>
                  {selectedEndpoint.method}
                </span>
                <code className="text-lg font-mono">{selectedEndpoint.path}</code>
              </div>
              <div className="text-gray-300 mb-4 whitespace-pre-line">
                {selectedEndpoint.description.split('\n').map((line, idx) => (
                  <div key={idx} className={line.startsWith('•') ? 'ml-2' : ''}>
                    {line}
                  </div>
                ))}
              </div>
              {selectedEndpoint.requiresAuth && (
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <span>🔒</span>
                  <span>Requires Admin Authentication</span>
                </div>
              )}
            </div>

            {/* Request Body (for POST) */}
            {selectedEndpoint.method === 'POST' && selectedEndpoint.body && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Request Body</h3>
                  {selectedEndpoint.examples && selectedEndpoint.examples.length > 0 && (
                    <div className="flex gap-2">
                      {selectedEndpoint.examples.map((example, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedExampleIndex(idx)
                            const exampleBody = { ...example.body }
                            if (exampleBody.secret === '' && adminSecret) {
                              exampleBody.secret = adminSecret
                            }
                            setRequestBody(JSON.stringify(exampleBody, null, 2))
                          }}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            selectedExampleIndex === idx
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                          title={example.description}
                        >
                          {example.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedEndpoint.examples && selectedExampleIndex !== null && (
                  <div className="mb-3 p-2 bg-blue-900/30 border border-blue-700 rounded text-sm text-blue-300">
                    {selectedEndpoint.examples[selectedExampleIndex].description}
                  </div>
                )}
                <textarea
                  value={requestBody}
                  onChange={(e) => {
                    setRequestBody(e.target.value)
                    setSelectedExampleIndex(null) // Clear selection when manually editing
                  }}
                  className="w-full h-48 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter JSON request body..."
                />
                {selectedEndpoint.body && (
                  <div className="mt-3 text-sm text-gray-400">
                    <p className="font-semibold mb-1">Expected fields:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {Object.entries(selectedEndpoint.body).map(([key, type]) => (
                        <li key={key}>
                          <code className="text-blue-400">{key}</code>: {type}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Query Params (for GET) */}
            {selectedEndpoint.method === 'GET' && selectedEndpoint.queryParams && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-3">Query Parameters</h3>
                <div className="space-y-3">
                  {Object.entries(selectedEndpoint.queryParams).map(([key, type]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1">
                        <code className="text-blue-400">{key}</code> ({type})
                      </label>
                      <input
                        type={key === 'secret' ? 'password' : 'text'}
                        value={queryParams[key] || ''}
                        onChange={(e) => setQueryParams({ ...queryParams, [key]: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={key === 'secret' && adminSecret ? 'Using saved secret' : `Enter ${key}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSendRequest}
              disabled={loading || (selectedEndpoint.requiresAuth && !adminSecret)}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                loading || (selectedEndpoint.requiresAuth && !adminSecret)
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>

            {/* Error Display */}
            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
                <pre className="text-sm text-red-300 whitespace-pre-wrap">{error}</pre>
              </div>
            )}

            {/* Response Display */}
            {response && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Response</h3>
                  {selectedEndpoint.path === '/api/ai/query' && response.conversationHistory && (
                    <button
                      onClick={() => {
                        const nextRequest = {
                          query: '', // User can fill this in
                          conversationHistory: response.conversationHistory,
                        }
                        setRequestBody(JSON.stringify(nextRequest, null, 2))
                        setSelectedExampleIndex(null) // Clear example selection
                      }}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                      title="Use this conversationHistory for your next request"
                    >
                      📋 Use History for Next Request
                    </button>
                  )}
                </div>
                <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(response, null, 2)}
                </pre>
                {selectedEndpoint.path === '/api/ai/query' && response.conversationHistory && (
                  <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded text-sm">
                    <p className="text-blue-300 font-semibold mb-2">💡 Conversation History:</p>
                    <p className="text-gray-300">
                      The response includes a <code className="bg-gray-800 px-1 rounded">conversationHistory</code> array 
                      with {response.conversationHistory.length} messages. Click "Use for Next Request" above to 
                      automatically populate it for your follow-up query.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
            <p className="text-gray-400">Select an endpoint to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

