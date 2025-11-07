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
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4" />
        <span>Suggested questions:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            onClick={() => onQuestionClick(question)}
            disabled={isLoading}
            className="text-xs h-auto py-2 px-3 whitespace-normal text-left"
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  )
}

