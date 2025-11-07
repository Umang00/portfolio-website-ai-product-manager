"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Volume2, RefreshCw, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageActionsProps {
  content: string
  messageId: number
  onRegenerate?: (messageId: number) => void
}

export function MessageActions({ content, messageId, onRegenerate }: MessageActionsProps) {
  const [copied, setCopied] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [thumbsUpActive, setThumbsUpActive] = useState(false)
  const [thumbsDownActive, setThumbsDownActive] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  // Handle thumbs up/down
  const handleThumb = (up: boolean) => {
    if (up) {
      setThumbsUpActive(!thumbsUpActive)
      setThumbsDownActive(false)
      console.log("👍 Thumbs up")
    } else {
      setThumbsDownActive(!thumbsDownActive)
      setThumbsUpActive(false)
      console.log("👎 Thumbs down")
    }
  }

  // Handle text-to-speech with OpenAI TTS (better quality) or fallback to browser TTS
  const handleReadAloud = async () => {
    if (isSpeaking) {
      // Stop speaking
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      utteranceRef.current = null
    } else {
      // Try OpenAI TTS first (better quality)
      try {
        const response = await fetch('/api/ai/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: content }),
        })

        if (response.ok) {
          // Use OpenAI TTS audio
          const audioBlob = await response.blob()
          const audioUrl = URL.createObjectURL(audioBlob)
          const audio = new Audio(audioUrl)
          
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl)
            setIsSpeaking(false)
            audioRef.current = null
          }

          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl)
            setIsSpeaking(false)
            audioRef.current = null
            // Fallback to browser TTS
            useBrowserTTS()
          }

          audioRef.current = audio
          audio.play()
          setIsSpeaking(true)
          console.log('[TTS] Using OpenAI TTS (high quality)')
          return
        }
      } catch (error) {
        console.warn('[TTS] OpenAI TTS failed, falling back to browser TTS:', error)
      }

      // Fallback to browser TTS
      useBrowserTTS()
    }
  }

  // Browser TTS fallback
  const useBrowserTTS = () => {
    // Get available voices
    const voices = window.speechSynthesis.getVoices()
    
    // Try to find a more natural-sounding voice
    // Prefer: Google voices, Microsoft voices, or any "neural" voices
    let selectedVoice = voices.find(
      (voice) =>
        voice.name.includes("Google") ||
        voice.name.includes("Microsoft") ||
        voice.name.includes("Neural") ||
        voice.name.includes("Premium") ||
        (voice.lang.startsWith("en") && voice.name.toLowerCase().includes("natural"))
    )
    
    // Fallback to first English voice if no preferred voice found
    if (!selectedVoice) {
      selectedVoice = voices.find((voice) => voice.lang.startsWith("en"))
    }
    
    // Start speaking
    const utterance = new SpeechSynthesisUtterance(content)
    
    if (selectedVoice) {
      utterance.voice = selectedVoice
      console.log(`[TTS] Using browser voice: ${selectedVoice.name} (${selectedVoice.lang})`)
    }
    
    // Adjust parameters for more natural speech
    utterance.rate = 0.95 // Slightly slower for more natural pace
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onend = () => {
      setIsSpeaking(false)
      utteranceRef.current = null
    }

    utterance.onerror = (error) => {
      console.error("[TTS] Error:", error)
      setIsSpeaking(false)
      utteranceRef.current = null
    }

    // Load voices if not already loaded (some browsers need this)
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        const updatedVoices = window.speechSynthesis.getVoices()
        const betterVoice = updatedVoices.find(
          (voice) =>
            voice.name.includes("Google") ||
            voice.name.includes("Microsoft") ||
            voice.name.includes("Neural")
        )
        if (betterVoice) {
          utterance.voice = betterVoice
        }
        window.speechSynthesis.speak(utterance)
      }
    } else {
      window.speechSynthesis.speak(utterance)
    }
    
    utteranceRef.current = utterance
    setIsSpeaking(true)
  }

  // Handle regenerate
  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate(messageId)
    }
  }

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel()
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return (
    <div className="flex items-center gap-1 mt-2">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7",
          copied && "text-green-600"
        )}
        onClick={handleCopy}
        title="Copy message"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7",
          thumbsUpActive && "text-primary"
        )}
        onClick={() => handleThumb(true)}
        title="Thumbs up"
      >
        <ThumbsUp className={cn("h-3.5 w-3.5", thumbsUpActive && "fill-current")} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7",
          thumbsDownActive && "text-destructive"
        )}
        onClick={() => handleThumb(false)}
        title="Thumbs down"
      >
        <ThumbsDown className={cn("h-3.5 w-3.5", thumbsDownActive && "fill-current")} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7",
          isSpeaking && "text-primary"
        )}
        onClick={handleReadAloud}
        title={isSpeaking ? "Stop reading" : "Read aloud"}
      >
        <Volume2 className={cn("h-3.5 w-3.5", isSpeaking && "fill-current")} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleRegenerate}
        title="Regenerate response"
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

