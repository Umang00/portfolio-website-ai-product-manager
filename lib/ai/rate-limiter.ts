// lib/ai/rate-limiter.ts
import Bottleneck from 'bottleneck'

/**
 * Rate limiter for OpenRouter API calls
 * Handles rate limiting, queuing, and automatic retries for 429 errors
 */
class OpenRouterRateLimiter {
  private limiter: Bottleneck

  constructor() {
    // Configure rate limiter for free tier models
    // Free models typically allow ~1-2 requests per second
    this.limiter = new Bottleneck({
      // Maximum 1 concurrent request to avoid overwhelming the API
      maxConcurrent: 1,
      
      // Minimum 2 seconds between requests (conservative for free tier)
      minTime: 2000,
      
      // Queue up to 10 requests
      highWater: 10,
      
      // Strategy: Drop oldest low-priority jobs if queue is full
      strategy: Bottleneck.strategy.LEAK,
      
      // Retry configuration for 429 errors
      // Jobs will be retried automatically with exponential backoff
    })

    // Handle retries for rate limit errors (429)
    // Bottleneck's 'failed' event: return a number (ms delay) to retry, or null/undefined to fail
    this.limiter.on('failed', async (error: any, jobInfo) => {
      const isRateLimit = error?.status === 429 || 
                         error?.response?.status === 429 ||
                         error?.message?.includes('429') ||
                         error?.message?.includes('rate limit')

      // Retry up to 3 times (retryCount: 0, 1, 2)
      if (isRateLimit && jobInfo.retryCount < 3) {
        // Exponential backoff: 5s, 10s, 20s
        const delay = Math.min(5000 * Math.pow(2, jobInfo.retryCount), 20000)
        console.log(`[Rate Limiter] Rate limited (429), retrying in ${delay}ms (attempt ${jobInfo.retryCount + 1}/3)`)
        return delay // Return delay to trigger retry
      }
      
      // Don't retry for other errors or if max retries reached
      if (isRateLimit) {
        console.warn(`[Rate Limiter] Rate limit exceeded after ${jobInfo.retryCount} retries, giving up`)
      }
      return null // Don't retry
    })

    // Log retry attempts
    this.limiter.on('retry', (error: any, jobInfo) => {
      console.log(`[Rate Limiter] Retrying job (attempt ${jobInfo.retryCount + 1})`)
    })

    // Log when queue is empty
    this.limiter.on('empty', () => {
      console.log('[Rate Limiter] Queue is empty')
    })

    // Log errors
    this.limiter.on('error', (error) => {
      console.error('[Rate Limiter] Error:', error)
    })
  }

  /**
   * Schedule an API call with rate limiting and automatic retries
   * @param fn Function that returns a Promise (the API call)
   * @param priority Priority of the job (higher = more important, default: 0)
   * @returns Promise that resolves with the result
   */
  async schedule<T>(fn: () => Promise<T>, priority: number = 0): Promise<T> {
    return this.limiter.schedule({ priority }, fn)
  }

  /**
   * Wrap a function to automatically rate limit it
   * @param fn Function to wrap
   * @returns Wrapped function that respects rate limits
   */
  wrap<T extends (...args: any[]) => Promise<any>>(fn: T): T {
    return this.limiter.wrap(fn) as T
  }

  /**
   * Get current queue status
   */
  getStatus() {
    return {
      running: this.limiter.running(),
      done: this.limiter.done(),
      queued: this.limiter.queued(),
    }
  }

  /**
   * Stop the limiter (useful for cleanup)
   */
  async stop() {
    return this.limiter.stop({
      dropWaitingJobs: false, // Don't drop jobs, let them complete
    })
  }
}

// Singleton instance for follow-up questions API calls
export const followUpQuestionsLimiter = new OpenRouterRateLimiter()

/**
 * Rate limiter for main LLM queries (if needed in the future)
 * Can be configured with different limits
 */
export const mainQueryLimiter = new Bottleneck({
  maxConcurrent: 2,
  minTime: 1000, // 1 request per second for main queries
  highWater: 20,
  strategy: Bottleneck.strategy.LEAK,
})

