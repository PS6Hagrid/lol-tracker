"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Status = "online" | "offline" | "reconnected";

export default function OfflineBanner() {
  const [status, setStatus] = useState<Status>("online");

  useEffect(() => {
    // Initialize from current state
    if (!navigator.onLine) {
      setStatus("offline");
    }

    const goOffline = () => setStatus("offline");
    const goOnline = () => {
      setStatus("reconnected");
      // Auto-hide the "Back online!" message after 3 seconds
      const timer = setTimeout(() => setStatus("online"), 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  const visible = status !== "online";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`fixed top-[3px] left-0 right-0 z-[9998] ${
            status === "offline"
              ? "bg-amber-600/95 text-white"
              : "bg-emerald-600/95 text-white"
          }`}
          role="alert"
          aria-live="assertive"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-sm font-medium">
            {status === "offline" ? (
              <>
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728M8.464 15.536a5 5 0 010-7.072M15.536 8.464a5 5 0 010 7.072M12 12h.01"
                  />
                </svg>
                <span>
                  You are offline. Some features may be unavailable.
                </span>
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Back online!</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
