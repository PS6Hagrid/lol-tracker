"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/i18n/context";
import changelog from "@/data/changelog.json";

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  highlights: string[];
}

interface ChangelogModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ChangelogModal({ open, onClose }: ChangelogModalProps) {
  const { t } = useI18n();
  const overlayRef = useRef<HTMLDivElement>(null);
  const entries = changelog as ChangelogEntry[];
  const latestVersion = entries[0]?.version;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={t("changelog.whatsNew")}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border-theme bg-bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-theme px-5 py-4">
              <h2 className="text-lg font-bold text-text-primary">
                {t("changelog.whatsNew")}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/10 hover:text-text-primary"
                aria-label={t("changelog.close")}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-5">
                {entries.map((entry, index) => (
                  <div
                    key={entry.version}
                    className="rounded-lg border border-border-theme bg-white/[0.02] p-4"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          entry.version === latestVersion
                            ? "bg-cyan/20 text-cyan"
                            : "bg-white/10 text-text-muted"
                        }`}
                      >
                        v{entry.version}
                      </span>
                      <span className="text-xs text-text-muted">
                        {entry.date}
                      </span>
                    </div>
                    <h3 className="mb-2 text-sm font-semibold text-text-primary">
                      {entry.title}
                    </h3>
                    <ul className="space-y-1">
                      {entry.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex items-start gap-2 text-sm text-text-muted"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border-theme px-5 py-3">
              <Link
                href="/changelog"
                onClick={onClose}
                className="text-sm font-medium text-cyan transition-colors hover:text-cyan/80"
              >
                {t("changelog.viewAll")}
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
