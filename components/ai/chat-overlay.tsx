"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageBubble } from "./message-bubble"
import { SuggestedQuestions } from "./suggested-questions"
import { Send, Loader2, Bot, ArrowLeft, Mic } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSpeechInput } from "@/hooks/use-speech-input"

interface Message {
  role: "user" | "assistant"
  content: string
  sources?: string[]
  id?: number
}

interface ChatOverlayProps {
  open: boolean
  onClose: () => void
  initialQuery?: string
}

const STARTER_QUESTIONS = [
  "What did Umang work on at Hunch?",
  "Tell me about Umang's journey and career decisions",
  "What technical projects has Umang built?",
  "What skills has Umang developed from his experiences?",
]

export function ChatOverlay({ open, onClose, initialQuery }: ChatOverlayProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState(initialQuery || "")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([])
  const [messageIdCounter, setMessageIdCounter] = useState(0)
  const messageIdCounterRef = useRef(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasSentInitialQuery = useRef(false)

  // Helper function to get next message ID
  const getNextMessageId = () => {
    messageIdCounterRef.current += 1
    setMessageIdCounter(messageIdCounterRef.current)
    return messageIdCounterRef.current
  }

  // Voice input hook
  const { listening, supported: speechSupported, start: startListening, stop: stopListening, error: speechError } = useSpeechInput({
    onResult: (text, isFinal) => {
      if (isFinal) {
        // Final result - set the complete text
        setInput(text)
        stopListening()
      } else {
        // Interim result - show what's being transcribed
        setInput(text)
      }
    },
  })

  // Log speech recognition errors (non-blocking)
  useEffect(() => {
    if (speechError) {
      // Network errors are common with Speech Recognition API and shouldn't crash the app
      if (speechError === "network") {
        console.warn("[Voice Input] Network error - Speech Recognition service unavailable. This is normal if offline or service is down.")
      } else {
        console.warn("[Voice Input] Error:", speechError)
      }
    }
  }, [speechError])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  // Send initial query if provided (only once when overlay opens)
  useEffect(() => {
    if (initialQuery && messages.length === 0 && open && !hasSentInitialQuery.current) {
      hasSentInitialQuery.current = true
      setInput(initialQuery)
      // Trigger send after a brief delay to ensure overlay is rendered
      const timer = setTimeout(() => {
        // Call handleSendMessage logic directly here to avoid dependency issues
          const queryText = initialQuery.trim()
          if (queryText) {
            const userMessageId = getNextMessageId()
            const userMessage: Message = { role: "user", content: queryText, id: userMessageId }
            setMessages((prev) => [...prev, userMessage])
            setInput("")
            setIsLoading(true)
            setSuggestedQuestions([])

          fetch("/api/ai/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: queryText,
              conversationHistory: conversationHistory,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`API error: ${response.status}`)
              }
              return response.json()
            })
            .then((data) => {
              const assistantMessageId = getNextMessageId()
              const assistantMessage: Message = {
                role: "assistant",
                content: data.answer,
                sources: data.sources,
                id: assistantMessageId,
              }
              setMessages((prev) => [...prev, assistantMessage])
              setConversationHistory((prev) => [
                ...prev,
                { role: "user" as const, content: queryText },
                { role: "assistant" as const, content: data.answer },
              ])
              if (data.suggestedQuestions && data.suggestedQuestions.length > 0) {
                setSuggestedQuestions(data.suggestedQuestions)
              }
            })
            .catch((error) => {
              console.error("Error sending message:", error)
              const errorMessageId = getNextMessageId()
              const errorMessage: Message = {
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again.",
                id: errorMessageId,
              }
              setMessages((prev) => [...prev, errorMessage])
            })
            .finally(() => {
              setIsLoading(false)
            })
        }
      }, 100)
      return () => clearTimeout(timer)
    }
    // Reset flag when overlay closes
    if (!open) {
      hasSentInitialQuery.current = false
    }
  }, [initialQuery, open, messages.length, conversationHistory])

  // Reset when closed
  useEffect(() => {
    if (!open) {
      // Keep conversation history for next time
      // setMessages([])
      // setConversationHistory([])
      // setSuggestedQuestions([])
    }
  }, [open])

  const handleRegenerate = async (messageId: number) => {
    // Find the user message that preceded this assistant message
    const assistantIndex = messages.findIndex((m) => m.id === messageId)
    if (assistantIndex > 0) {
      const userMessage = messages[assistantIndex - 1]
      if (userMessage.role === "user") {
        // Remove the assistant message and regenerate
        const newMessages = messages.slice(0, assistantIndex)
        setMessages(newMessages)
        // Remove from conversation history
        const newHistory = conversationHistory.slice(0, -2)
        setConversationHistory(newHistory)
        
        // Resend the query
        const queryText = userMessage.content
        setIsLoading(true)
        setSuggestedQuestions([])

        try {
          const response = await fetch("/api/ai/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: queryText,
              conversationHistory: newHistory,
            }),
          })

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
          }

          const data = await response.json()

          // Add AI response to UI
          const assistantMessageId = getNextMessageId()
          const assistantMessage: Message = {
            role: "assistant",
            content: data.answer,
            sources: data.sources,
            id: assistantMessageId,
          }
          setMessages((prev) => [...prev, assistantMessage])

          // Update conversation history
          const updatedHistory = [
            ...newHistory,
            { role: "user" as const, content: queryText },
            { role: "assistant" as const, content: data.answer },
          ]
          setConversationHistory(updatedHistory)

          // Update suggested questions
          if (data.suggestedQuestions && data.suggestedQuestions.length > 0) {
            setSuggestedQuestions(data.suggestedQuestions)
          }
        } catch (error) {
          console.error("Error regenerating message:", error)
          const errorMessageId = getNextMessageId()
          const errorMessage: Message = {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
            id: errorMessageId,
          }
          setMessages((prev) => [...prev, errorMessage])
        } finally {
          setIsLoading(false)
        }
      }
    }
  }

  const handleSendMessage = async (query?: string) => {
    const queryText = query || input.trim()
    if (!queryText || isLoading) return

    // Stop voice input if active
    if (listening) {
      stopListening()
    }

    // Add user message to UI immediately
    const userMessageId = getNextMessageId()
    const userMessage: Message = { role: "user", content: queryText, id: userMessageId }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setSuggestedQuestions([])

    try {
      // Call API
      const response = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          conversationHistory: conversationHistory,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Add AI response to UI
      const assistantMessageId = getNextMessageId()
      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        id: assistantMessageId,
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Update conversation history
      const updatedHistory = [
        ...conversationHistory,
        { role: "user" as const, content: queryText },
        { role: "assistant" as const, content: data.answer },
      ]
      setConversationHistory(updatedHistory)

      // Update suggested questions
      if (data.suggestedQuestions && data.suggestedQuestions.length > 0) {
        setSuggestedQuestions(data.suggestedQuestions)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessageId = getNextMessageId()
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        id: errorMessageId,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleStarterQuestion = (question: string) => {
    handleSendMessage(question)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleReset = () => {
    setMessages([])
    setConversationHistory([])
    setSuggestedQuestions([])
    setInput("")
  }

  if (!open) return null

  const hasMessages = messages.length > 0

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="border-b px-6 py-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 -ml-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">AI Companion</h1>
              <p className="text-sm text-muted-foreground">
                Ask me anything about Umang
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasMessages && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Messages Area - Full Height */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {!hasMessages ? (
            // Starter Screen
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Welcome!</h2>
                <p className="text-muted-foreground max-w-md">
                  I'm Umang's AI companion. I can answer questions about his
                  experience, projects, skills, and journey. Try asking me
                  something!
                </p>
              </div>

              <div className="w-full max-w-lg space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Suggested questions:
                </p>
                <div className="grid gap-2">
                  {STARTER_QUESTIONS.map((question, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="justify-start text-left h-auto py-3 px-4 whitespace-normal"
                      onClick={() => handleStarterQuestion(question)}
                      disabled={isLoading}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Chat Messages
            <div className="space-y-4">
              {messages.map((message, idx) => (
                <MessageBubble
                  key={message.id ?? idx}
                  role={message.role}
                  content={message.content}
                  sources={message.sources}
                  messageId={message.id}
                  onRegenerate={handleRegenerate}
                />
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}

              {/* Suggested Questions */}
              {!isLoading && suggestedQuestions.length > 0 && (
                <SuggestedQuestions
                  questions={suggestedQuestions}
                  onQuestionClick={handleSendMessage}
                  isLoading={isLoading}
                />
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="border-t px-6 py-4 bg-background flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex gap-2"
          >
            {speechSupported && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (listening) {
                    stopListening()
                  } else {
                    startListening()
                  }
                }}
                disabled={isLoading}
                className={cn(
                  "shrink-0 h-[60px] w-[60px]",
                  listening && "text-primary animate-pulse"
                )}
                title={listening ? "Stop recording" : "Start voice input"}
              >
                <Mic className={cn("w-5 h-5", listening && "fill-current")} />
              </Button>
            )}
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isLoading
                  ? "Generating response..."
                  : listening
                  ? "Listening..."
                  : "Ask a question about Umang..."
              }
              disabled={isLoading || listening}
              className="min-h-[60px] max-h-[120px] resize-none"
              rows={2}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading || listening}
              className="shrink-0 h-[60px] w-[60px]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

