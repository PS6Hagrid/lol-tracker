"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/i18n/context";
import ChangelogModal from "./ChangelogModal";
import changelog from "@/data/changelog.json";

const STORAGE_KEY = "trackerino-last-seen-version";

function getLatestVersion(): string {
  return changelog[0]?.version ?? "0.0.0";
}

function isVersionNewer(current: string, stored: string): boolean {
  const parse = (v: string) => v.split(".").map(Number);
  const c = parse(current);
  const s = parse(stored);
  for (let i = 0; i < 3; i++) {
    if ((c[i] ?? 0) > (s[i] ?? 0)) return true;
    if ((c[i] ?? 0) < (s[i] ?? 0)) return false;
  }
  return false;
}

export default function WhatsNew() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);

  useEffect(() => {
    const latest = getLatestVersion();
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored || isVersionNewer(latest, stored)) {
      setHasUnseen(true);
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    const latest = getLatestVersion();
    localStorage.setItem(STORAGE_KEY, latest);
    setHasUnseen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="relative rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary"
        aria-label={t("changelog.whatsNew")}
        title={t("changelog.whatsNew")}
      >
        {/* Sparkle icon */}
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
          />
        </svg>

        {/* Pulsing dot for unseen updates */}
        {hasUnseen && (
          <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan" />
          </span>
        )}
      </button>

      <ChangelogModal open={open} onClose={handleClose} />
    </>
  );
}
