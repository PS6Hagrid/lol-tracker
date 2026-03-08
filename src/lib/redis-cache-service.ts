import { Redis } from "@upstash/redis";
import { CacheService } from "./cache-service-interface";

/**
 * A cache service implementation using Upstash Redis.
 * It handles serialization and deserialization of JSON data.
 */
export class RedisCacheService implements CacheService {
  private redis: Redis;

  constructor() {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error("Upstash Redis environment variables are not set for Cache Service.");
    }

    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get<string>(key);
      if (data === null) {
        return null;
      }
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Error getting key ${key} from Redis cache:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.set(key, stringValue, { ex: ttlSeconds });
      } else {
        await this.redis.set(key, stringValue);
      }
    } catch (error) {
      console.error(`Error setting key ${key} in Redis cache:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Error deleting key ${key} from Redis cache:`, error);
    }
  }
}

// ── Singleton ────────────────────────────────────────────────────────────────

const globalForCache = globalThis as unknown as {
  __cacheService?: CacheService;
};

const shouldUseRedis = process.env.NODE_ENV === 'production' || 
                       (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

if (shouldUseRedis && !globalForCache.__cacheService) {
    console.log("Initializing Redis Cache Service.");
    globalForCache.__cacheService = new RedisCacheService();
} else if (!globalForCache.__cacheService) {
    console.warn("Using in-memory cache for local development. This is not suitable for production.");
    // Fallback to a simple in-memory cache for local dev if Redis is not configured.
    const memoryCache = new Map<string, any>();
    globalForCache.__cacheService = {
        async get(key) { return memoryCache.get(key) ?? null; },
        async set(key, value) { memoryCache.set(key, value); },
        async del(key) { memoryCache.delete(key); }
    };
}

export const cacheService: CacheService = globalForCache.__cacheService;
