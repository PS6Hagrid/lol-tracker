"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n/context";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
  timestamp: number;
}

const STORAGE_KEY = "cookie-consent";

function loadConsent(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookiePreferences;
  } catch {
    return null;
  }
}

function saveConsent(prefs: CookiePreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : ""
      } ${checked ? "bg-cyan" : "bg-white/20"}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function CookieConsent() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [preferences, setPreferences] = useState(false);

  useEffect(() => {
    const existing = loadConsent();
    if (!existing) {
      setVisible(true);
    }
  }, []);

  const handleAccept = useCallback((prefs: CookiePreferences) => {
    saveConsent(prefs);
    setVisible(false);
  }, []);

  const acceptAll = useCallback(() => {
    handleAccept({
      necessary: true,
      analytics: true,
      preferences: true,
      timestamp: Date.now(),
    });
  }, [handleAccept]);

  const acceptNecessary = useCallback(() => {
    handleAccept({
      necessary: true,
      analytics: false,
      preferences: false,
      timestamp: Date.now(),
    });
  }, [handleAccept]);

  const acceptCustom = useCallback(() => {
    handleAccept({
      necessary: true,
      analytics,
      preferences,
      timestamp: Date.now(),
    });
  }, [handleAccept, analytics, preferences]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:flex sm:justify-center sm:pb-6"
        >
          <div className="w-full max-w-2xl rounded-xl border border-border-theme bg-bg-card/95 shadow-2xl backdrop-blur-lg sm:mx-auto">
            <div className="p-5 sm:p-6">
              {/* Header */}
              <div className="mb-3 flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-cyan"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                <h2 className="text-base font-semibold text-text-primary">
                  {t("cookies.title")}
                </h2>
              </div>

              {/* Description */}
              <p className="mb-4 text-sm leading-relaxed text-text-muted">
                {t("cookies.description")}
              </p>

              {/* Settings Panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-4 space-y-3 rounded-lg border border-border-theme bg-white/[0.03] p-4">
                      {/* Necessary */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {t("cookies.necessary")}
                          </p>
                          <p className="text-xs text-text-muted">
                            {t("cookies.necessaryDesc")}
                          </p>
                        </div>
                        <Toggle checked disabled />
                      </div>

                      <div className="border-t border-border-theme" />

                      {/* Analytics */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {t("cookies.analytics")}
                          </p>
                          <p className="text-xs text-text-muted">
                            {t("cookies.analyticsDesc")}
                          </p>
                        </div>
                        <Toggle
                          checked={analytics}
                          onChange={setAnalytics}
                        />
                      </div>

                      <div className="border-t border-border-theme" />

                      {/* Preferences */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {t("cookies.preferences")}
                          </p>
                          <p className="text-xs text-text-muted">
                            {t("cookies.preferencesDesc")}
                          </p>
                        </div>
                        <Toggle
                          checked={preferences}
                          onChange={setPreferences}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buttons */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowSettings((v) => !v)}
                  className="rounded-lg border border-border-theme px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-cyan/30 hover:text-text-primary"
                >
                  {showSettings
                    ? t("cookies.saveSettings")
                    : t("cookies.settings")}
                </button>
                <button
                  type="button"
                  onClick={
                    showSettings ? acceptCustom : acceptNecessary
                  }
                  className="rounded-lg border border-border-theme px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-cyan/30 hover:bg-white/5"
                >
                  {t("cookies.necessaryOnly")}
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan/80"
                >
                  {t("cookies.acceptAll")}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
