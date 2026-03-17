"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function TopLoadingBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"idle" | "loading" | "completing">("idle");
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathRef = useRef(pathname + searchParams.toString());

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Intercept link clicks to start the bar before navigation begins
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        anchor.target === "_blank" ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey
      ) {
        return;
      }

      const current = pathname + searchParams.toString();
      // Only trigger for actual navigation (different path)
      if (href !== current && href !== pathname) {
        cleanup();
        setProgress(0);
        setState("loading");

        // Quickly animate to ~15%, then trickle toward 80%
        let p = 0;
        intervalRef.current = setInterval(() => {
          p += p < 30 ? 8 : p < 60 ? 3 : p < 80 ? 0.5 : 0;
          if (p >= 80) {
            p = 80;
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
          setProgress(p);
        }, 50);
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, searchParams, cleanup]);

  // When pathname/searchParams change, navigation is complete
  useEffect(() => {
    const current = pathname + searchParams.toString();
    if (current === prevPathRef.current) return;
    prevPathRef.current = current;

    cleanup();

    if (state === "loading" || progress > 0) {
      // Complete the bar
      setProgress(100);
      setState("completing");

      timerRef.current = setTimeout(() => {
        setState("idle");
        setProgress(0);
      }, 400);
    }
  }, [pathname, searchParams, state, progress, cleanup]);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  if (state === "idle" && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      style={{ height: "3px" }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-cyan"
        style={{
          width: `${progress}%`,
          transition:
            state === "completing"
              ? "width 200ms ease-out, opacity 300ms ease-out 200ms"
              : "width 200ms ease-out",
          opacity: state === "completing" ? 0 : 1,
          boxShadow: "0 0 8px rgba(0, 212, 255, 0.5), 0 0 4px rgba(0, 212, 255, 0.3)",
        }}
      />
    </div>
  );
}

export default function TopLoadingBar() {
  return (
    <Suspense fallback={null}>
      <TopLoadingBarInner />
    </Suspense>
  );
}
