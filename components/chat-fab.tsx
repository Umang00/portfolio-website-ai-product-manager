"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { ChatOverlay } from "@/components/ai/chat-overlay"

export function ChatFAB() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg animate-pulse hover:animate-none"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Open AI chat</span>
        </Button>
      </div>
      <ChatOverlay open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
