"use client"

import { useState, useEffect, useRef, useCallback } from "react"

const SpeechRecognition =
  typeof window !== "undefined"
    ? (window.SpeechRecognition || (window as any).webkitSpeechRecognition || null)
    : null

interface UseSpeechInputOptions {
  onResult?: (text: string, isFinal: boolean) => void
  lang?: string
}

export function useSpeechInput({ onResult, lang = "en-US" }: UseSpeechInputOptions = {}) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<"prompt" | "granted" | "denied">("prompt")
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const onResultRef = useRef(onResult)

  /**
   * Simple post-processor to capitalize & punctuate final results
   */
  function punctuate(text: string): string {
    // Capitalize first letter
    text = text.charAt(0).toUpperCase() + text.slice(1)
    // Add a period if missing
    if (!/[.!?]$/.test(text.trim())) text += "."
    return text
  }

  // Keep the ref up to date
  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  useEffect(() => {
    if (!SpeechRecognition) {
      console.warn("[useSpeechInput] Speech recognition not supported")
      setSupported(false)
      return
    }

    setSupported(true)

    const recog = new SpeechRecognition()
    recog.continuous = true
    recog.interimResults = true
    recog.lang = lang

    recog.onstart = () => setListening(true)
    recog.onend = () => setListening(false)

    recog.onresult = (evt: SpeechRecognitionEvent) => {
      // Accumulate all results (both interim and final)
      let transcript = ""
      for (let i = 0; i < evt.results.length; i++) {
        transcript += evt.results[i][0].transcript
      }
      
      const isFinal = evt.results[evt.results.length - 1].isFinal
      const text = isFinal ? punctuate(transcript.trim()) : transcript.trim()
      
      if (onResultRef.current) {
        onResultRef.current(text, isFinal)
      }
      
      if (isFinal) {
        recog.stop()
      }
    }

    recog.onerror = (e: SpeechRecognitionErrorEvent) => {
      setError(e.error)
      if (/not-allowed|service-not-allowed/.test(e.error)) {
        setPermission("denied")
      }
      recog.stop()
    }

    recognitionRef.current = recog

    // Check microphone permission once
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((status) => {
          setPermission(status.state as "prompt" | "granted" | "denied")
          status.onchange = () => {
            setPermission(status.state as "prompt" | "granted" | "denied")
          }
        })
        .catch(() => {
          // Permission API not supported or failed
        })
    }

    return () => {
      recog.abort?.()
      recog.onstart = null
      recog.onresult = null
      recog.onerror = null
      recog.onend = null
    }
  }, [lang])

  const start = useCallback(async () => {
    if (!supported || listening || !recognitionRef.current) {
      console.warn("[Voice Input] Cannot start:", { supported, listening, hasRecognition: !!recognitionRef.current })
      return
    }

    if (permission === "prompt" && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
        stream.getTracks().forEach((t) => t.stop())
        setPermission("granted")
      } catch (err: any) {
        console.error("[Voice Input] Microphone permission denied:", err)
        setPermission("denied")
        setError(err.message || "Microphone permission denied")
        return
      }
    }

    try {
      console.log("[Voice Input] Starting recognition...")
      recognitionRef.current.start()
    } catch (err: any) {
      const errorMsg = err.message || String(err)
      console.error("[Voice Input] Failed to start:", errorMsg)
      setError(errorMsg)
      // If already started, try to stop and restart
      if (err.message?.includes("already started") || err.message?.includes("started")) {
        try {
          recognitionRef.current.stop()
          setTimeout(() => {
            try {
              recognitionRef.current?.start()
            } catch (retryErr: any) {
              console.error("[Voice Input] Retry failed:", retryErr)
              setError(retryErr.message || String(retryErr))
            }
          }, 100)
        } catch (stopErr) {
          console.error("[Voice Input] Failed to stop:", stopErr)
        }
      }
    }
  }, [supported, listening, permission])

  const stop = useCallback(() => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop()
    }
  }, [listening])

  return { listening, supported, permission, error, start, stop }
}

