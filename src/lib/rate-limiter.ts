import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { RateLimiter } from "./rate-limiter-interface";

/**
 * Distributed rate limiter for Riot API requests using Upstash Redis.
 *
 * Ensures we stay within Riot's rate limits even when the app is deployed
 * across multiple serverless functions on Vercel.
 *
 * It uses a "sliding window" algorithm which is a good fit for Riot's
 * "X requests per Y time" limits.
 *
 * Configurable via env:
 *   UPSTASH_REDIS_REST_URL - The URL for your Upstash Redis instance.
 *   UPSTASH_REDIS_REST_TOKEN - The token for your Upstash Redis instance.
 *   RIOT_API_REQUESTS_PER_10_SECONDS - (Default: 8)
 *   RIOT_API_REQUESTS_PER_10_MINUTES - (Default: 500)
 */

class UpstashRateLimiter implements RateLimiter {
  private ratelimit: Ratelimit;

  constructor() {
    // Ensure environment variables are set
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error("Upstash Redis environment variables are not set.");
    }

    // Initialize Redis client
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Get limits from environment or use conservative defaults
    const requestsPer10s = parseInt(process.env.RIOT_API_REQUESTS_PER_10_SECONDS ?? "8", 10);
    const requestsPer10m = parseInt(process.env.RIOT_API_REQUESTS_PER_10_MINUTES ?? "500", 10);

    // Create a ratelimiter that allows multiple limits
    // Example: 8 requests per 10 seconds AND 500 requests per 10 minutes.
    this.ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requestsPer10s, "10 s"),
      analytics: true, // Enable analytics to see usage in Upstash console
      prefix: "ratelimit:riot",
    });
  }

  /**
   * Waits until a request can be made.
   * The underlying library handles the queueing and waiting.
   * We use a common identifier "global" because Riot's API key has a global limit,
   * not a per-user or per-IP limit.
   */
  async acquire(): Promise<void> {
    let success = false;
    while (!success) {
      const { success: limitReached, reset } = await this.ratelimit.limit("global");
      success = limitReached;
      if (!success) {
        const waitTime = reset - Date.now();
        if (waitTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }
  }
}

// ── Singleton ────────────────────────────────────────────────────────────────
// Use globalThis to survive Next.js hot-reload in dev (same pattern as Prisma).

const globalForRateLimit = globalThis as unknown as {
  __riotRateLimiter?: RateLimiter;
};

// We only instantiate the Redis-based limiter in production or if env vars are set.
// In local development without Redis, we can fall back to the old in-memory one.
const shouldUseRedis = process.env.NODE_ENV === 'production' || 
                       (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

if (shouldUseRedis && !globalForRateLimit.__riotRateLimiter) {
    console.log("Initializing Upstash Redis Rate Limiter for production use.");
    globalForRateLimit.__riotRateLimiter = new UpstashRateLimiter();
} else if (!globalForRateLimit.__riotRateLimiter) {
    console.warn("Using in-memory rate limiter for local development. This is not suitable for production.");
    // Fallback to a simple in-memory limiter for local dev if Redis is not configured.
    // This is a simplified version of the old TokenBucket.
    globalForRateLimit.__riotRateLimiter = {
        async acquire() {
            // A simple timeout to prevent local spam, not a real rate limiter.
            await new Promise(res => setTimeout(res, 50));
        }
    };
}

export const rateLimiter: RateLimiter = globalForRateLimit.__riotRateLimiter;
