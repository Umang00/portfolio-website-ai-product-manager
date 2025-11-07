"use client"

import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface MessageBubbleProps {
  role: "user" | "assistant"
  content: string
  sources?: string[]
}

export function MessageBubble({ role, content, sources }: MessageBubbleProps) {
  const isUser = role === "user"

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col gap-2 max-w-[80%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm"
          )}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                ),
                li: ({ children }) => <li className="text-sm">{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Sources */}
        {!isUser && sources && sources.length > 0 && (
          <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
            <span className="font-medium">Sources:</span>
            {sources.map((source, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-muted/50 rounded-md"
              >
                {source}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

