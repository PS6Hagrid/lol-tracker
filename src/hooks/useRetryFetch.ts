"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseRetryFetchOptions extends RequestInit {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Whether to fetch immediately on mount (default: true) */
  immediate?: boolean;
}

interface UseRetryFetchResult<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  retry: () => void;
}

const BASE_DELAY_MS = 1000;

/**
 * Custom hook wrapping fetch with automatic retry on failure.
 * Uses exponential backoff (1s, 2s, 4s) and respects 429 Retry-After headers.
 */
export function useRetryFetch<T = unknown>(
  url: string | null,
  options: UseRetryFetchOptions = {},
): UseRetryFetchResult<T> {
  const { maxRetries = 3, immediate = true, ...fetchOptions } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  // Track the latest url/options to avoid stale closures
  const urlRef = useRef(url);
  const optionsRef = useRef(fetchOptions);
  urlRef.current = url;
  optionsRef.current = fetchOptions;

  // Abort controller ref for cleanup
  const abortRef = useRef<AbortController | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const execute = useCallback(async () => {
    const currentUrl = urlRef.current;
    if (!currentUrl) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    clearRetryTimer();

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    let attempt = 0;

    while (attempt <= maxRetries) {
      if (controller.signal.aborted) return;

      try {
        const res = await fetch(currentUrl, {
          ...optionsRef.current,
          signal: controller.signal,
        });

        if (res.ok) {
          const json = (await res.json()) as T;
          if (!controller.signal.aborted) {
            setData(json);
            setError(null);
            setLoading(false);
          }
          return;
        }

        // Handle rate limiting
        if (res.status === 429) {
          const retryAfter = res.headers.get("Retry-After");
          const delaySeconds = retryAfter ? parseInt(retryAfter, 10) : NaN;
          const delay = !isNaN(delaySeconds)
            ? delaySeconds * 1000
            : BASE_DELAY_MS * Math.pow(2, attempt);

          if (attempt < maxRetries) {
            await new Promise<void>((resolve, reject) => {
              const timer = setTimeout(resolve, delay);
              controller.signal.addEventListener("abort", () => {
                clearTimeout(timer);
                reject(new DOMException("Aborted", "AbortError"));
              });
            });
            attempt++;
            continue;
          }

          throw new Error(`429: Too many requests`);
        }

        // Non-retryable client errors (except 429 handled above)
        if (res.status === 404) {
          throw new Error(`404: Not found`);
        }

        if (res.status >= 400 && res.status < 500) {
          throw new Error(`${res.status}: Client error`);
        }

        // Server errors are retryable
        if (res.status >= 500) {
          if (attempt < maxRetries) {
            const delay = BASE_DELAY_MS * Math.pow(2, attempt);
            await new Promise<void>((resolve, reject) => {
              const timer = setTimeout(resolve, delay);
              controller.signal.addEventListener("abort", () => {
                clearTimeout(timer);
                reject(new DOMException("Aborted", "AbortError"));
              });
            });
            attempt++;
            continue;
          }

          throw new Error(`${res.status}: Server error`);
        }

        throw new Error(`${res.status}: Unexpected response`);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        // Network errors are retryable
        const isNetworkError =
          err instanceof TypeError && /fetch|network/i.test(err.message);

        if (isNetworkError && attempt < maxRetries) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          try {
            await new Promise<void>((resolve, reject) => {
              const timer = setTimeout(resolve, delay);
              controller.signal.addEventListener("abort", () => {
                clearTimeout(timer);
                reject(new DOMException("Aborted", "AbortError"));
              });
            });
          } catch {
            return; // aborted
          }
          attempt++;
          continue;
        }

        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
        return;
      }
    }
  }, [maxRetries, clearRetryTimer]);

  // Fetch on mount if immediate
  useEffect(() => {
    if (immediate && url) {
      execute();
    }

    return () => {
      abortRef.current?.abort();
      clearRetryTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, immediate]);

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  return { data, error, loading, retry };
}
