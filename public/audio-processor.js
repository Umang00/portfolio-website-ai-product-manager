// AudioWorklet processor for converting audio to PCM
// This replaces the deprecated ScriptProcessorNode
// Sends audio data in real-time for low-latency transcription

class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    // Send data immediately for real-time processing (no buffering delay)
    // Buffer size matches ScriptProcessorNode for consistency
    this.bufferSize = 4096
    this.buffer = new Float32Array(this.bufferSize)
    this.bufferIndex = 0
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0]
    
    if (input && input.length > 0) {
      const inputChannel = input[0]
      
      // Copy input data to buffer
      for (let i = 0; i < inputChannel.length; i++) {
        this.buffer[this.bufferIndex++] = inputChannel[i]
        
        // When buffer is full, send it to the main thread immediately
        if (this.bufferIndex >= this.bufferSize) {
          // Send a copy of the buffer to avoid issues with shared memory
          this.port.postMessage({
            type: 'audioData',
            data: new Float32Array(this.buffer)
          })
          this.bufferIndex = 0
        }
      }
    }
    
    // Return true to keep the processor alive
    return true
  }
}

registerProcessor('audio-processor', AudioProcessor)

