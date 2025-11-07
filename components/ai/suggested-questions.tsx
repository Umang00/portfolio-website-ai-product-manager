"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface SuggestedQuestionsProps {
  questions: string[]
  onQuestionClick: (question: string) => void
  isLoading?: boolean
}

export function SuggestedQuestions({
  questions,
  onQuestionClick,
  isLoading = false,
}: SuggestedQuestionsProps) {
  if (questions.length === 0) return null

  return (
    <div className="flex flex-col gap-3 mb-6 mt-4 p-4 bg-muted/30 rounded-lg border border-border/50">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Sparkles className="w-4 h-4 text-primary" />
        <span>Here are some follow-up questions you can ask:</span>
      </div>
      <div className="flex flex-col gap-2">
        {questions.map((question, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            onClick={() => onQuestionClick(question)}
            disabled={isLoading}
            className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal hover:bg-primary/5 hover:border-primary/50 transition-colors"
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  )
}

