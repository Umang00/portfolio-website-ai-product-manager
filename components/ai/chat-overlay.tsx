"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageBubble } from "./message-bubble"
import { SuggestedQuestions } from "./suggested-questions"
import { Send, Loader2, Bot, ArrowLeft, Mic } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSpeechInput } from "@/hooks/use-speech-input"
import { motion, AnimatePresence } from "framer-motion"
import { useSound } from "@/hooks/use-sound"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

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
  const [interimInput, setInterimInput] = useState("") // For interim speech recognition results
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([])
  const [messageIdCounter, setMessageIdCounter] = useState(0)
  const [mounted, setMounted] = useState(false)
  const messageIdCounterRef = useRef(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasSentInitialQuery = useRef(false)
  const { play } = useSound()
  const shouldReduceMotion = useReducedMotion()

  // Helper function to get next message ID
  const getNextMessageId = () => {
    messageIdCounterRef.current += 1
    setMessageIdCounter(messageIdCounterRef.current)
    return messageIdCounterRef.current
  }

  // Voice input hook
  const { listening, supported: speechSupported, start: startListening, stop: stopListening, error: speechError, permission: micPermission } = useSpeechInput({
    onResult: (text, isFinal) => {
      if (isFinal) {
        // Final result - append to existing input and keep listening
        setInput((prev) => {
          const baseText = prev.replace(/ \[listening:.*?\]$/, "").trim()
          return baseText ? baseText + " " + text : text
        })
        setInterimInput("") // Clear interim
        // Don't stop listening - user will click mic again to stop
      } else {
        // Interim result - show what's being transcribed
        setInterimInput(text)
      }
    },
  })

  // Handle speech recognition errors and show user feedback
  useEffect(() => {
    if (speechError) {
      console.warn("[Voice Input] Error:", speechError)
      // Errors are now handled by the Gladia integration
      // User can see error state through the button's disabled state and tooltip
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
            .then(async (response) => {
              if (!response.ok) {
                // Try to get error details from response
                const errorData = await response.json().catch(() => ({}))
                const error = new Error(errorData.message || `API error: ${response.status}`) as Error & { response?: Response, errorData?: any }
                error.response = response
                error.errorData = errorData
                throw error
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
              
              // Extract error details
              let errorContent = "Sorry, I encountered an error. Please try again."
              let errorSuggestion = ""
              
              // Check if error has errorData attached (from our custom error)
              if (error && typeof error === 'object' && 'errorData' in error) {
                const errorData = (error as any).errorData
                if (errorData.message) {
                  errorContent = errorData.message
                }
                if (errorData.suggestion) {
                  errorSuggestion = errorData.suggestion
                }
              } else if (error instanceof Error) {
                // Check if error message contains moderation info
                if (error.message.includes('moderation') || error.message.includes('flagged')) {
                  errorContent = error.message
                  errorSuggestion = "Please try rephrasing your question. This appears to be a false positive from the AI model's content moderation."
                } else {
                  errorContent = error.message
                }
              }
              
              const errorMessage: Message = {
                role: "assistant",
                content: errorSuggestion 
                  ? `${errorContent}\n\n💡 ${errorSuggestion}`
                  : errorContent,
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
    // Calculate final query text - include interim input if listening
    let finalQueryText = query
    if (!finalQueryText) {
      if (listening && interimInput) {
        // Combine input and interim input
        const baseText = input.replace(/ \[listening:.*?\]$/, "").trim()
        finalQueryText = baseText ? baseText + " " + interimInput : interimInput
      } else {
        finalQueryText = input.trim()
      }
    }
    
    if (!finalQueryText || isLoading) return

    // Stop voice input if active
    if (listening) {
      stopListening()
      setInterimInput("") // Clear interim input
    }

    // Add user message to UI immediately
    const userMessageId = getNextMessageId()
    const userMessage: Message = { role: "user", content: finalQueryText, id: userMessageId }
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
          query: finalQueryText,
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
        { role: "user" as const, content: finalQueryText },
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

  // Ensure component is mounted (for SSR)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!open || !mounted) return null

  const hasMessages = messages.length > 0

  const overlayContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col"
    >
      {/* Header */}
      <header className="border-b px-6 py-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {shouldReduceMotion ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 -ml-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            ) : (
              <motion.div
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (!shouldReduceMotion) play("click")
                    onClose()
                  }}
                  className="h-9 w-9 -ml-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
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
              shouldReduceMotion ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs"
                >
                  Reset
                </Button>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (!shouldReduceMotion) play("click")
                      handleReset()
                    }}
                    className="text-xs"
                  >
                    Reset
                  </Button>
                </motion.div>
              )
            )}
          </div>
        </div>
      </header>

      {/* Messages Area - Full Height */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {!hasMessages ? (
            // Starter Screen
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-center space-y-2"
              >
                <h2 className="text-2xl font-semibold">Welcome!</h2>
                <p className="text-muted-foreground max-w-md">
                  I'm Umang's AI companion. I can answer questions about his
                  experience, projects, skills, and journey. Try asking me
                  something!
                </p>
              </motion.div>

              {/* Combined disclaimer as info box */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="w-full max-w-lg"
              >
                <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50 rounded-lg px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠️</span>
                    <p className="flex-1">
                      <strong className="font-medium">Heads up:</strong> Umang's build velocity is intense. I try to stay current, but he often ships quicker than I can index.
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="w-full max-w-lg space-y-3">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-sm font-medium text-muted-foreground"
                >
                  Suggested questions:
                </motion.p>
                <div className="grid gap-2">
                  {STARTER_QUESTIONS.map((question, idx) => (
                    shouldReduceMotion ? (
                      <Button
                        key={idx}
                        variant="outline"
                        className="justify-start text-left h-auto py-3 px-4 whitespace-normal"
                        onClick={() => handleStarterQuestion(question)}
                        disabled={isLoading}
                      >
                        {question}
                      </Button>
                    ) : (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1, duration: 0.3 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="outline"
                          className="justify-start text-left h-auto py-3 px-4 whitespace-normal w-full"
                          onClick={() => {
                            if (!shouldReduceMotion) play("click")
                            handleStarterQuestion(question)
                          }}
                          disabled={isLoading}
                        >
                          {question}
                        </Button>
                      </motion.div>
                    )
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            // Chat Messages
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message, idx) => (
                  <motion.div
                    key={message.id ?? idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <MessageBubble
                      role={message.role}
                      content={message.content}
                      sources={message.sources}
                      messageId={message.id}
                      onRegenerate={handleRegenerate}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

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
              shouldReduceMotion ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (listening) {
                      // Stop listening and add any interim input to input field
                      if (interimInput) {
                        setInput((prev) => {
                          const baseText = prev.replace(/ \[listening:.*?\]$/, "").trim()
                          return baseText ? baseText + " " + interimInput : interimInput
                        })
                      }
                      stopListening()
                      setInterimInput("") // Clear interim when stopping
                    } else {
                      // Check if service is unavailable
                      if (speechError === "service-unavailable") {
                        // Don't try to start if service is unavailable
                        return
                      }
                      setInterimInput("") // Clear any previous interim
                      startListening()
                    }
                  }}
                  disabled={isLoading || speechError === "service-unavailable"}
                  className={cn(
                    "shrink-0 h-[60px] w-[60px] bg-background border border-border",
                    listening && "text-primary animate-pulse bg-primary/10 border-primary/50",
                    speechError === "service-unavailable" && "opacity-50"
                  )}
                  title={
                    listening
                      ? "Stop recording"
                      : speechError === "service-unavailable"
                      ? "Voice input service unavailable. Please use text input."
                      : speechError && speechError !== "network"
                      ? "Voice input unavailable"
                      : "Start voice input"
                  }
                >
                  <Mic className={cn("w-5 h-5", listening && "fill-current")} />
                </Button>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={listening ? {
                    scale: [1, 1.1, 1],
                    transition: {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (!shouldReduceMotion) play("click")
                      if (listening) {
                        // Stop listening and add any interim input to input field
                        if (interimInput) {
                          setInput((prev) => {
                            const baseText = prev.replace(/ \[listening:.*?\]$/, "").trim()
                            return baseText ? baseText + " " + interimInput : interimInput
                          })
                        }
                        stopListening()
                        setInterimInput("") // Clear interim when stopping
                      } else {
                        // Check if service is unavailable
                        if (speechError === "service-unavailable") {
                          // Don't try to start if service is unavailable
                          return
                        }
                        setInterimInput("") // Clear any previous interim
                        startListening()
                      }
                    }}
                    disabled={isLoading || speechError === "service-unavailable"}
                    className={cn(
                      "shrink-0 h-[60px] w-[60px] bg-background border border-border",
                      listening && "text-primary bg-primary/10 border-primary/50",
                      speechError === "service-unavailable" && "opacity-50"
                    )}
                    title={
                      listening
                        ? "Stop recording"
                        : speechError === "service-unavailable"
                        ? "Voice input service unavailable. Please use text input."
                        : speechError && speechError !== "network"
                        ? "Voice input unavailable"
                        : "Start voice input"
                    }
                  >
                    <Mic className={cn("w-5 h-5", listening && "fill-current")} />
                  </Button>
                </motion.div>
              )
            )}
            <motion.div
              className="relative flex-1"
              animate={listening ? {
                scale: [1, 1.01, 1],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              } : {}}
            >
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  setInterimInput("") // Clear interim when user types
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  isLoading
                    ? "Generating response..."
                    : listening
                    ? "Listening..."
                    : "Ask a question about Umang..."
                }
                disabled={isLoading || listening}
                className={cn(
                  "min-h-[60px] max-h-[120px] resize-none pr-4 py-4",
                  listening && "border-primary/50 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                )}
                rows={2}
              />
              {/* Show interim transcription as overlay hint */}
              {interimInput && listening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-2 left-4 text-sm text-muted-foreground pointer-events-none italic"
                >
                  {interimInput}
                </motion.div>
              )}
              {listening && !shouldReduceMotion && (
                <motion.div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{
                    border: "2px solid rgba(37, 99, 235, 0.5)",
                  }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.01, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.div>
            {shouldReduceMotion ? (
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                disabled={!input.trim() || isLoading || listening}
                className="shrink-0 h-[60px] w-[60px] bg-background border border-border hover:bg-muted transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-foreground" />
                ) : (
                  <Send className="w-5 h-5 text-foreground" />
                )}
              </Button>
            ) : (
              <motion.div
                whileHover={(!input.trim() || isLoading || listening) ? {} : { scale: 1.1, rotate: 180 }}
                whileTap={(!input.trim() || isLoading || listening) ? {} : { scale: 0.95 }}
                animate={input.trim() && !isLoading && !listening ? {
                  boxShadow: [
                    "0 0 0 0 rgba(37, 99, 235, 0.4)",
                    "0 0 0 8px rgba(37, 99, 235, 0)",
                    "0 0 0 0 rgba(37, 99, 235, 0)",
                  ],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  disabled={!input.trim() || isLoading || listening}
                  onClick={() => {
                    if (!shouldReduceMotion && input.trim() && !isLoading && !listening) {
                      play("click")
                    }
                  }}
                  className="shrink-0 h-[60px] w-[60px] bg-background border border-border hover:bg-muted transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-foreground" />
                  ) : (
                    <Send className="w-5 h-5 text-foreground" />
                  )}
                </Button>
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  )

  // Render to document.body to escape any parent containers (full-screen)
  if (typeof window === "undefined" || !document.body) {
    return null
  }
  return createPortal(overlayContent, document.body)
}

