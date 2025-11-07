"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageBubble } from "./message-bubble"
import { SuggestedQuestions } from "./suggested-questions"
import { Send, Loader2, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
  sources?: string[]
}

interface ChatModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STARTER_QUESTIONS = [
  "What did Umang work on at Hunch?",
  "Tell me about Umang's journey and career decisions",
  "What technical projects has Umang built?",
  "What skills has Umang developed from his experiences?",
]

export function ChatModal({ open, onOpenChange }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      // Optionally keep conversation history for next time
      // For now, we'll reset it
      // setMessages([])
      // setConversationHistory([])
      // setSuggestedQuestions([])
    }
  }, [open])

  const handleSendMessage = async (query?: string) => {
    const queryText = query || input.trim()
    if (!queryText || isLoading) return

    // Add user message to UI immediately
    const userMessage: Message = { role: "user", content: queryText }
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
      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
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
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
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

  const hasMessages = messages.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle>AI Companion</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Ask me anything about Umang
                </p>
              </div>
            </div>
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
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!hasMessages ? (
            // Starter Screen
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Welcome!</h3>
                <p className="text-sm text-muted-foreground max-w-md">
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
                  key={idx}
                  role={message.role}
                  content={message.content}
                  sources={message.sources}
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

        {/* Input Area */}
        <div className="border-t px-6 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex gap-2"
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isLoading
                  ? "Generating response..."
                  : "Ask a question about Umang..."
              }
              disabled={isLoading}
              className="min-h-[60px] max-h-[120px] resize-none"
              rows={2}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
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
      </DialogContent>
    </Dialog>
  )
}

