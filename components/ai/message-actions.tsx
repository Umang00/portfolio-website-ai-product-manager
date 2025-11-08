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

  // Handle text-to-speech with Google Cloud TTS (better quality) or fallback to browser TTS
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
      // Try Google Cloud TTS first (better quality)
      try {
        const response = await fetch('/api/ai/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: content }),
        })

        // Check for quota errors or API failures
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const isQuotaError = 
            response.status === 429 || // Too Many Requests
            response.status === 503 || // Service Unavailable
            response.status === 402 || // Payment Required
            errorData.error?.toLowerCase().includes('quota') ||
            errorData.message?.toLowerCase().includes('quota') ||
            errorData.error?.toLowerCase().includes('exceeded') ||
            errorData.message?.toLowerCase().includes('exceeded')
          
          if (isQuotaError) {
            console.warn('[TTS] API quota exceeded, falling back to browser TTS')
          } else {
            console.warn('[TTS] Google Cloud TTS failed, falling back to browser TTS:', errorData)
          }
          // Fallback to browser TTS
          useBrowserTTS()
          return
        }

        // Use Google Cloud TTS audio
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
          console.warn('[TTS] Audio playback failed, falling back to browser TTS')
          useBrowserTTS()
        }

        audioRef.current = audio
        audio.play()
        setIsSpeaking(true)
        console.log('[TTS] Using Google Cloud TTS (high quality)')
        return
      } catch (error) {
        console.warn('[TTS] Google Cloud TTS failed, falling back to browser TTS:', error)
      }

      // Fallback to browser TTS
      useBrowserTTS()
    }
  }

  // Browser TTS fallback - improved voice selection for natural sound (non-robotic)
  const useBrowserTTS = () => {
    // Select best voice for natural, non-robotic sound
    const selectBestVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
      if (voices.length === 0) return null

      // Priority order for most natural-sounding voices (non-robotic)
      const voicePriorities = [
        // 1. Google Neural voices (best quality, most natural)
        (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.name.includes('Neural'),
        // 2. Microsoft Neural voices
        (v: SpeechSynthesisVoice) => v.name.includes('Microsoft') && v.name.includes('Neural'),
        // 3. Any Neural voices
        (v: SpeechSynthesisVoice) => v.name.includes('Neural'),
        // 4. Google voices (usually good quality)
        (v: SpeechSynthesisVoice) => v.name.includes('Google'),
        // 5. Microsoft voices (usually good quality)
        (v: SpeechSynthesisVoice) => v.name.includes('Microsoft'),
        // 6. Premium voices
        (v: SpeechSynthesisVoice) => v.name.includes('Premium'),
        // 7. Natural voices
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('natural'),
        // 8. Avoid robotic-sounding voices (common robotic voice names)
        (v: SpeechSynthesisVoice) => 
          !v.name.toLowerCase().includes('robotic') && 
          !v.name.toLowerCase().includes('samantha') && // Often robotic
          !v.name.toLowerCase().includes('alex') && // Often robotic
          !v.name.toLowerCase().includes('daniel') && // Often robotic
          !v.name.toLowerCase().includes('zira') && // Often robotic
          v.lang.startsWith('en'),
        // 9. Any English voice as last resort
        (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
      ]

      // Try each priority level
      for (const priority of voicePriorities) {
        const voice = voices.find(priority)
        if (voice) {
          return voice
        }
      }

      // Fallback to first available voice
      return voices[0]
    }

    const speakWithVoice = (voices: SpeechSynthesisVoice[]) => {
      const selectedVoice = selectBestVoice(voices)
      
      // Start speaking
      const utterance = new SpeechSynthesisUtterance(content)
      
      if (selectedVoice) {
        utterance.voice = selectedVoice
        console.log(`[TTS] Using browser voice: ${selectedVoice.name} (${selectedVoice.lang})`)
      } else {
        console.warn('[TTS] No suitable voice found, using default')
      }
      
      // Optimize parameters for natural speech (non-robotic)
      utterance.rate = 0.9 // Slightly slower for more natural pace (0.1-10, default 1)
      utterance.pitch = 1.0 // Normal pitch (0-2, default 1)
      utterance.volume = 1.0 // Full volume (0-1, default 1)
      
      // Event handlers
      utterance.onend = () => {
        setIsSpeaking(false)
        utteranceRef.current = null
      }
      
      utterance.onerror = (error) => {
        console.error('[TTS] Browser TTS error:', error)
        setIsSpeaking(false)
        utteranceRef.current = null
      }
      
      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }

    // Get voices
    const voices = window.speechSynthesis.getVoices()
    
    if (voices.length > 0) {
      speakWithVoice(voices)
    } else {
      // Wait for voices to load (some browsers need this)
      const onVoicesChanged = () => {
        const loadedVoices = window.speechSynthesis.getVoices()
        if (loadedVoices.length > 0) {
          window.speechSynthesis.onvoiceschanged = null // Remove listener
          speakWithVoice(loadedVoices)
        }
      }
      
      window.speechSynthesis.onvoiceschanged = onVoicesChanged
      
      // Fallback timeout (some browsers may not fire onvoiceschanged)
      setTimeout(() => {
        const loadedVoices = window.speechSynthesis.getVoices()
        if (loadedVoices.length > 0 && !isSpeaking) {
          window.speechSynthesis.onvoiceschanged = null
          speakWithVoice(loadedVoices)
        }
      }, 100)
    }
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

