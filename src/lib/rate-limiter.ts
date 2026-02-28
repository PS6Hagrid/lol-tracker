/**
 * Token-bucket rate limiter for Riot API requests.
 *
 * Ensures we stay within Riot's rate limits even when multiple users
 * hit the app simultaneously. Uses a token bucket that refills at a
 * steady rate; excess requests are queued and processed in order.
 *
 * Configurable via env:
 *   RATE_LIMIT_PER_SECOND – burst capacity / refill rate (default 18)
 *
 * Defaults are conservative for a development key (20 req/s, 100 req/2 min).
 * Bump the env var once you have a production key.
 */

class TokenBucket {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per ms
  private lastRefill: number;

  /** Queue of callers waiting for a token. */
  private pending: Array<() => void> = [];
  private draining = false;

  constructor(tokensPerSecond: number) {
    this.maxTokens = tokensPerSecond;
    this.tokens = tokensPerSecond;
    this.refillRate = tokensPerSecond / 1000;
    this.lastRefill = Date.now();
  }

  /** Refill tokens based on elapsed time. */
  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(
      this.maxTokens,
      this.tokens + elapsed * this.refillRate,
    );
    this.lastRefill = now;
  }

  /**
   * Wait until a token is available, then consume it.
   * If a token is available immediately, resolves instantly (zero delay).
   */
  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // No token available — queue and wait
    return new Promise<void>((resolve) => {
      this.pending.push(resolve);
      if (!this.draining) this.drain();
    });
  }

  /** Drains the queue one-by-one as tokens become available. */
  private async drain(): Promise<void> {
    this.draining = true;

    while (this.pending.length > 0) {
      this.refill();

      if (this.tokens >= 1) {
        this.tokens -= 1;
        const next = this.pending.shift();
        next?.();
      } else {
        // Wait just long enough for 1 token to refill
        const waitMs = Math.ceil((1 - this.tokens) / this.refillRate);
        await new Promise((r) => setTimeout(r, waitMs));
      }
    }

    this.draining = false;
  }
}

// ── Singleton ────────────────────────────────────────────────────────────────
// Use globalThis to survive Next.js hot-reload in dev (same pattern as Prisma).

const globalForRateLimit = globalThis as unknown as {
  __riotRateLimiter?: TokenBucket;
};

const perSecond = parseInt(process.env.RATE_LIMIT_PER_SECOND ?? "18", 10);

export const rateLimiter: TokenBucket =
  globalForRateLimit.__riotRateLimiter ??
  (globalForRateLimit.__riotRateLimiter = new TokenBucket(perSecond));
