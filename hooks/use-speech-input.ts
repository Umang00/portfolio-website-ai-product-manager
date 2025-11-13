"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface UseSpeechInputOptions {
  onResult?: (text: string, isFinal: boolean) => void
  lang?: string
}

export function useSpeechInput({ onResult, lang = "en-US" }: UseSpeechInputOptions = {}) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<"prompt" | "granted" | "denied">("prompt")
  const [error, setError] = useState<string | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null)
  const onResultRef = useRef(onResult)
  const sessionIdRef = useRef<string | null>(null)
  const isConnectingRef = useRef(false)

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

  // Check browser support
  useEffect(() => {
    const hasMediaRecorder = typeof MediaRecorder !== "undefined"
    const hasWebSocket = typeof WebSocket !== "undefined"
    const hasGetUserMedia = !!navigator.mediaDevices?.getUserMedia
    
    if (hasMediaRecorder && hasWebSocket && hasGetUserMedia) {
      setSupported(true)
    } else {
      setSupported(false)
      console.warn("[useSpeechInput] Browser does not support required APIs:", {
        MediaRecorder: hasMediaRecorder,
        WebSocket: hasWebSocket,
        getUserMedia: hasGetUserMedia,
      })
    }

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
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop()
    }
  }, [])

  const stop = useCallback(() => {
    // Stop audio processing
    if (audioWorkletNodeRef.current) {
      try {
        audioWorkletNodeRef.current.disconnect()
        audioWorkletNodeRef.current.port.close()
      } catch (err) {
        console.warn("[Voice Input] Error disconnecting AudioWorklet:", err)
      }
      audioWorkletNodeRef.current = null
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch((err) => {
        console.warn("[Voice Input] Error closing AudioContext:", err)
      })
      audioContextRef.current = null
    }

    // Stop audio stream
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop())
      audioStreamRef.current = null
    }

    // Close WebSocket
    if (wsRef.current) {
      try {
        wsRef.current.close()
      } catch (err) {
        console.warn("[Voice Input] Error closing WebSocket:", err)
      }
      wsRef.current = null
    }

    sessionIdRef.current = null
    isConnectingRef.current = false
    setListening(false)
  }, [])

  const start = useCallback(async () => {
    // Prevent multiple simultaneous starts
    if (!supported || listening || isConnectingRef.current) {
      console.warn("[Voice Input] Cannot start:", { supported, listening, isConnecting: isConnectingRef.current })
      return
    }

    // Clean up any existing connections first (without calling stop to avoid circular dependency)
    if (wsRef.current) {
      try {
        wsRef.current.close()
      } catch (err) {
        // Ignore
      }
      wsRef.current = null
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close()
      } catch (err) {
        // Ignore
      }
      audioContextRef.current = null
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop())
      audioStreamRef.current = null
    }
    audioWorkletNodeRef.current = null
    sessionIdRef.current = null
    setListening(false)
    isConnectingRef.current = false // Reset connecting state during cleanup

    // Request microphone permission if needed
    if (permission === "prompt" && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000, // Match Gladia's expected sample rate
            channelCount: 1, // Mono
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
        // Stop the stream immediately - we just needed permission
        stream.getTracks().forEach((t) => t.stop())
        setPermission("granted")
      } catch (err: any) {
        setPermission("denied")
        setError(err.message || "Microphone permission denied")
        isConnectingRef.current = false
        return
      }
    }

    if (permission === "denied") {
      setError("Microphone permission denied")
      isConnectingRef.current = false
      return
    }

    isConnectingRef.current = true
    setError(null)

    // Safety timeout: reset isConnecting if something goes wrong
    const connectionTimeout = setTimeout(() => {
      if (isConnectingRef.current && !listening) {
        console.warn("[Voice Input] Connection timeout - resetting state")
        isConnectingRef.current = false
      }
    }, 10000) // 10 second timeout

    try {
      // Step 1: Request session from backend
      const sessionResponse = await fetch("/api/ai/gladia/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json().catch(() => ({}))
        clearTimeout(connectionTimeout)
        isConnectingRef.current = false
        throw new Error(errorData.error || "Failed to initiate Gladia session")
      }

      const sessionData = await sessionResponse.json()
      
      if (!sessionData.success || !sessionData.websocketUrl) {
        clearTimeout(connectionTimeout)
        isConnectingRef.current = false
        throw new Error("Invalid session response from server")
      }

      sessionIdRef.current = sessionData.sessionId

      // Step 2: Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      audioStreamRef.current = stream

      // Step 3: Connect to Gladia WebSocket first
      const wsUrl = sessionData.websocketUrl
      const ws = new WebSocket(wsUrl)

      wsRef.current = ws

      ws.onopen = () => {
        console.log("[Voice Input] WebSocket connected")
        
        // Small delay to ensure WebSocket is fully ready
        setTimeout(async () => {
          if (ws.readyState !== WebSocket.OPEN) {
            console.warn("[Voice Input] WebSocket not ready after delay")
            return
          }
          
          // Step 4: Create AudioContext to capture raw PCM audio after WebSocket is ready
          // Note: AudioContext sampleRate may not be respected - we'll resample if needed
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          audioContextRef.current = audioContext
          
          const targetSampleRate = 16000
          const actualSampleRate = audioContext.sampleRate
          const needsResampling = actualSampleRate !== targetSampleRate
          
          console.log(`[Voice Input] AudioContext sample rate: ${actualSampleRate}Hz, target: ${targetSampleRate}Hz, resampling: ${needsResampling}`)

          // Create source from microphone stream
          const source = audioContext.createMediaStreamSource(stream)
          
          // Load and use AudioWorklet instead of deprecated ScriptProcessorNode
          try {
            // Load the AudioWorklet processor
            await audioContext.audioWorklet.addModule('/audio-processor.js')
            
            // Create AudioWorkletNode
            const workletNode = new AudioWorkletNode(audioContext, 'audio-processor')
            audioWorkletNodeRef.current = workletNode

            // Resample audio if needed (simple linear interpolation)
            function resampleAudio(input: Float32Array, fromRate: number, toRate: number): Float32Array {
              if (fromRate === toRate) return input
              
              const ratio = fromRate / toRate
              const outputLength = Math.round(input.length / ratio)
              const output = new Float32Array(outputLength)
              
              for (let i = 0; i < outputLength; i++) {
                const srcIndex = i * ratio
                const srcIndexFloor = Math.floor(srcIndex)
                const srcIndexCeil = Math.min(srcIndexFloor + 1, input.length - 1)
                const t = srcIndex - srcIndexFloor
                
                // Linear interpolation
                output[i] = input[srcIndexFloor] * (1 - t) + input[srcIndexCeil] * t
              }
              
              return output
            }

            // Convert Float32Array to Int16 PCM
            function floatTo16BitPCM(float32Array: Float32Array): Int16Array {
              const int16Array = new Int16Array(float32Array.length)
              for (let i = 0; i < float32Array.length; i++) {
                // Clamp to [-1, 1] and convert to 16-bit integer
                const s = Math.max(-1, Math.min(1, float32Array[i]))
                int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
              }
              return int16Array
            }

            // Process audio chunks from AudioWorklet and send to WebSocket
            let isProcessing = false
            workletNode.port.onmessage = (event) => {
              // Prevent concurrent processing
              if (isProcessing || ws.readyState !== WebSocket.OPEN) {
                return
              }
              
              try {
                isProcessing = true
                let inputData = event.data.data as Float32Array
                
                // Resample if needed
                if (needsResampling) {
                  inputData = resampleAudio(inputData, actualSampleRate, targetSampleRate)
                }
                
                const pcmData = floatTo16BitPCM(inputData)
                
                // Send PCM data as JSON with base64 (more reliable than binary)
                // Based on Gladia docs: can send as binary OR JSON with base64
                if (ws.readyState === WebSocket.OPEN) {
                  try {
                    // Convert Int16Array to base64 (chunked to avoid stack overflow)
                    const uint8Array = new Uint8Array(pcmData.buffer)
                    let binaryString = ''
                    const chunkSize = 8192 // Process in chunks
                    for (let i = 0; i < uint8Array.length; i += chunkSize) {
                      const chunk = uint8Array.slice(i, i + chunkSize)
                      binaryString += String.fromCharCode(...chunk)
                    }
                    const base64 = btoa(binaryString)
                    
                    const audioMessage = {
                      type: "audio_chunk",
                      data: {
                        chunk: base64,
                      },
                    }
                    
                    ws.send(JSON.stringify(audioMessage))
                  } catch (sendErr) {
                    console.error("[Voice Input] Error sending audio chunk:", sendErr)
                    // Don't stop on send error, just log it
                  }
                }
              } catch (err) {
                console.error("[Voice Input] Error processing audio:", err)
              } finally {
                isProcessing = false
              }
            }

            // Connect audio processing chain
            // Use a GainNode with gain 0 to prevent audio playback
            const gainNode = audioContext.createGain()
            gainNode.gain.value = 0
            source.connect(workletNode)
            workletNode.connect(gainNode)
            gainNode.connect(audioContext.destination) // Required for AudioWorklet to work, but gain is 0 so no sound
            
            console.log("[Voice Input] Audio processing started with AudioWorklet")
          } catch (workletError) {
            console.error("[Voice Input] Failed to load AudioWorklet, falling back to ScriptProcessorNode:", workletError)
            // Fallback to ScriptProcessorNode if AudioWorklet fails (for older browsers)
            const bufferSize = 4096
            const scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1)
            
            // Resample and convert functions (same as above)
            function resampleAudio(input: Float32Array, fromRate: number, toRate: number): Float32Array {
              if (fromRate === toRate) return input
              const ratio = fromRate / toRate
              const outputLength = Math.round(input.length / ratio)
              const output = new Float32Array(outputLength)
              for (let i = 0; i < outputLength; i++) {
                const srcIndex = i * ratio
                const srcIndexFloor = Math.floor(srcIndex)
                const srcIndexCeil = Math.min(srcIndexFloor + 1, input.length - 1)
                const t = srcIndex - srcIndexFloor
                output[i] = input[srcIndexFloor] * (1 - t) + input[srcIndexCeil] * t
              }
              return output
            }

            function floatTo16BitPCM(float32Array: Float32Array): Int16Array {
              const int16Array = new Int16Array(float32Array.length)
              for (let i = 0; i < float32Array.length; i++) {
                const s = Math.max(-1, Math.min(1, float32Array[i]))
                int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
              }
              return int16Array
            }

            let isProcessing = false
            scriptProcessor.onaudioprocess = (event) => {
              if (isProcessing || ws.readyState !== WebSocket.OPEN) return
              try {
                isProcessing = true
                let inputData = event.inputBuffer.getChannelData(0)
                if (needsResampling) {
                  inputData = resampleAudio(inputData, actualSampleRate, targetSampleRate)
                }
                const pcmData = floatTo16BitPCM(inputData)
                if (ws.readyState === WebSocket.OPEN) {
                  try {
                    const uint8Array = new Uint8Array(pcmData.buffer)
                    let binaryString = ''
                    const chunkSize = 8192
                    for (let i = 0; i < uint8Array.length; i += chunkSize) {
                      const chunk = uint8Array.slice(i, i + chunkSize)
                      binaryString += String.fromCharCode(...chunk)
                    }
                    const base64 = btoa(binaryString)
                    ws.send(JSON.stringify({
                      type: "audio_chunk",
                      data: { chunk: base64 },
                    }))
                  } catch (sendErr) {
                    console.error("[Voice Input] Error sending audio chunk:", sendErr)
                  }
                }
              } catch (err) {
                console.error("[Voice Input] Error processing audio:", err)
              } finally {
                isProcessing = false
              }
            }

            const gainNode = audioContext.createGain()
            gainNode.gain.value = 0
            source.connect(scriptProcessor)
            scriptProcessor.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            console.log("[Voice Input] Audio processing started with ScriptProcessorNode (fallback)")
          }
          
          clearTimeout(connectionTimeout)
          setListening(true)
          isConnectingRef.current = false
        }, 100) // 100ms delay to ensure WebSocket is ready
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data.toString())
          
          // Log all messages for debugging (can be removed in production)
          console.log("[Voice Input] Received message:", message)
          
          // Handle transcript messages from Gladia
          // Gladia API v2 can send messages in different formats:
          // 1. { type: "transcript", data: { utterance: { text: "...", is_final: true } } }
          // 2. { type: "transcript", data: { text: "...", is_final: true } }
          // 3. { type: "partial_transcript", data: { text: "..." } }
          // 4. { type: "final_transcript", data: { text: "..." } }
          
          let transcript: string | null = null
          let isFinal = false
          
          // Check for different message formats
          // IMPORTANT: Always send partial transcripts immediately for live feedback
          if (message.type === "transcript" || message.type === "partial_transcript" || message.type === "final_transcript" || message.type === "transcript_partial" || message.type === "transcript_final") {
            // Format 1: message.data.utterance.text
            if (message.data?.utterance?.text) {
              transcript = message.data.utterance.text
              isFinal = message.data.utterance.is_final || message.data.is_final || message.type === "final_transcript" || message.type === "transcript_final"
            }
            // Format 2: message.data.text
            else if (message.data?.text) {
              transcript = message.data.text
              isFinal = message.data.is_final || message.type === "final_transcript" || message.type === "transcript_final"
            }
            // Format 3: message.text (direct)
            else if (message.text) {
              transcript = message.text
              isFinal = message.is_final || message.type === "final_transcript" || message.type === "transcript_final"
            }
            
            // Always send transcript if we have text, even if empty (to clear interim)
            if (transcript !== null) {
              const trimmedText = transcript.trim()
              // Send even empty partial transcripts to clear interim input
              if (trimmedText || isFinal) {
                const text = isFinal && trimmedText ? punctuate(trimmedText) : trimmedText
                
                console.log(`[Voice Input] Transcript (${isFinal ? "final" : "partial"}):`, text || "(empty)")
                
                if (onResultRef.current) {
                  onResultRef.current(text, isFinal)
                }
              }
            }
          } else if (message.type === "error") {
            console.error("[Voice Input] Gladia error:", message)
            setError(message.message || message.error || message.data?.error || "Transcription error")
            stop()
          } else if (message.type === "lifecycle") {
            // Handle lifecycle events (connection status, etc.)
            console.log("[Voice Input] Lifecycle event:", message)
          } else {
            // Log unknown message types for debugging
            console.log("[Voice Input] Unknown message type:", message.type, message)
          }
        } catch (err) {
          console.warn("[Voice Input] Error parsing WebSocket message:", err, event.data)
        }
      }

      ws.onerror = (event) => {
        // Only log if there's actual error information
        if (event && Object.keys(event).length > 0) {
          console.error("[Voice Input] WebSocket error:", event)
        } else {
          // Silently handle empty error events (common with WebSocket close/disconnect)
          console.warn("[Voice Input] WebSocket connection issue")
        }
        clearTimeout(connectionTimeout)
        setError("WebSocket connection error")
        isConnectingRef.current = false
        stop()
      }

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout)
        
        // Code 1005 with wasClean=true is normal - server closed gracefully
        // Code 1005 with wasClean=false indicates abnormal closure
        if (event.code === 1005 && !event.wasClean) {
          console.warn("[Voice Input] WebSocket closed abnormally (1005). This may indicate:")
          console.warn("  - Audio format mismatch")
          console.warn("  - Network issues")
          console.warn("  - Server-side error")
        } else if (event.code === 1006) {
          console.warn("[Voice Input] WebSocket closed abnormally (1006) - connection lost")
        } else if (event.code !== 1005 || !event.wasClean) {
          // Log other close codes, but 1005 with wasClean=true is normal
          console.log(`[Voice Input] WebSocket closed: code ${event.code}, clean: ${event.wasClean}`)
        }
        
        setListening(false)
        isConnectingRef.current = false
        
        // Clean up audio context if it exists
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          audioContextRef.current.close().catch(console.warn)
          audioContextRef.current = null
        }
      }

      // Audio is now being sent via scriptProcessor.onaudioprocess above

    } catch (err: any) {
      console.error("[Voice Input] Error starting transcription:", err)
      clearTimeout(connectionTimeout)
      setError(err.message || "Failed to start voice input")
      isConnectingRef.current = false
      // Clean up on error
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close()
        } catch (e) {
          // Ignore
        }
        audioContextRef.current = null
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop())
        audioStreamRef.current = null
      }
      audioWorkletNodeRef.current = null
      setListening(false)
    }
  }, [supported, listening, permission])

  return {
    listening,
    supported,
    permission,
    error,
    start,
    stop,
  }
}
