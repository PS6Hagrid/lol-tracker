"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { useI18n } from "@/i18n/context";
import { useToast } from "@/components/Toast";
import { REGIONS } from "@/lib/constants";
import { getFavorites, clearSearchHistory } from "@/lib/local-storage";

// ── Constants ────────────────────────────────────────────────────────────────

const COOKIE_KEY = "cookie-consent";
const REGION_KEY = "default-region";
const FAVORITES_KEY = "trackerino:favorites";

// ── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  open,
  title,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3">
      <span className="text-sm font-medium text-text-primary">{title}</span>
      <div className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border-theme px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text-primary"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

// ── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-xl border border-border-theme bg-bg-card p-6">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="text-cyan">{icon}</span>
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ── Icons (inline SVG) ──────────────────────────────────────────────────────

function PaletteIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const toast = useToast();

  const [mounted, setMounted] = useState(false);
  const [defaultRegion, setDefaultRegion] = useState("");
  const [cookieStatus, setCookieStatus] = useState<"accepted" | "not-set">("not-set");

  // Confirmation dialogs
  const [confirmAction, setConfirmAction] = useState<
    "cookies" | "history" | "favorites" | null
  >(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    // Load default region
    const storedRegion = localStorage.getItem(REGION_KEY);
    if (storedRegion) setDefaultRegion(storedRegion);
    // Check cookie consent status
    const consent = localStorage.getItem(COOKIE_KEY);
    setCookieStatus(consent ? "accepted" : "not-set");
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleRegionChange = useCallback(
    (value: string) => {
      setDefaultRegion(value);
      if (value) {
        localStorage.setItem(REGION_KEY, value);
      } else {
        localStorage.removeItem(REGION_KEY);
      }
    },
    [],
  );

  const handleResetCookies = useCallback(() => {
    localStorage.removeItem(COOKIE_KEY);
    setCookieStatus("not-set");
    setConfirmAction(null);
    toast.success(t("settings.cookiesReset"));
    // Reload to trigger cookie banner
    window.location.reload();
  }, [t, toast]);

  const handleClearHistory = useCallback(() => {
    clearSearchHistory();
    setConfirmAction(null);
    toast.success(t("settings.historyCleared"));
  }, [t, toast]);

  const handleClearFavorites = useCallback(() => {
    localStorage.removeItem(FAVORITES_KEY);
    setConfirmAction(null);
    toast.success(t("settings.favoritesCleared"));
  }, [t, toast]);

  const handleExportFavorites = useCallback(() => {
    const favorites = getFavorites();
    if (favorites.length === 0) {
      toast.warning(t("settings.noFavoritesToExport"));
      return;
    }
    const json = JSON.stringify(favorites, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trackerino-favorites-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [t, toast]);

  const handleImportFavorites = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (!Array.isArray(data)) throw new Error("Invalid format");
          // Validate basic structure
          const valid = data.every(
            (item: Record<string, unknown>) =>
              typeof item.gameName === "string" &&
              typeof item.tagLine === "string" &&
              typeof item.region === "string",
          );
          if (!valid) throw new Error("Invalid structure");
          localStorage.setItem(FAVORITES_KEY, JSON.stringify(data));
          toast.success(t("settings.importSuccess", { count: data.length }));
        } catch {
          toast.error(t("settings.importError"));
        }
      };
      reader.readAsText(file);
      // Reset file input so the same file can be selected again
      e.target.value = "";
    },
    [t, toast],
  );

  if (!mounted) return null;

  const themeOptions = [
    { value: "dark", label: t("settings.dark"), icon: "\uD83C\uDF19" },
    { value: "light", label: t("settings.light"), icon: "\u2600\uFE0F" },
    { value: "system", label: t("settings.system"), icon: "\uD83D\uDCBB" },
  ];

  const languageOptions = [
    { value: "de", label: "Deutsch", flag: "DE" },
    { value: "en", label: "English", flag: "EN" },
  ];

  return (
    <div>
      {/* Page title */}
      <h1 className="mb-8 text-2xl font-bold text-text-primary sm:text-3xl">
        {t("settings.title")}
      </h1>

      {/* ── Appearance ──────────────────────────────────────────────────────── */}
      <SectionCard title={t("settings.appearance")} icon={<PaletteIcon />}>
        <div className="space-y-6">
          {/* Theme */}
          <div>
            <h3 className="mb-1 text-sm font-medium text-text-primary">
              {t("settings.theme")}
            </h3>
            <p className="mb-3 text-xs text-text-muted">
              {t("settings.themeDesc")}
            </p>
            <div className="flex flex-wrap gap-2">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTheme(opt.value)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                    theme === opt.value
                      ? "border-cyan bg-cyan/10 text-cyan"
                      : "border-border-theme text-text-muted hover:border-cyan/30 hover:text-text-primary"
                  }`}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <h3 className="mb-1 text-sm font-medium text-text-primary">
              {t("settings.languageLabel")}
            </h3>
            <p className="mb-3 text-xs text-text-muted">
              {t("settings.languageDesc")}
            </p>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLocale(opt.value as "en" | "de")}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                    locale === opt.value
                      ? "border-cyan bg-cyan/10 text-cyan"
                      : "border-border-theme text-text-muted hover:border-cyan/30 hover:text-text-primary"
                  }`}
                >
                  <span className="text-xs font-bold">{opt.flag}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Default Region ──────────────────────────────────────────────────── */}
      <SectionCard title={t("settings.defaultRegion")} icon={<GlobeIcon />}>
        <h3 className="mb-1 text-sm font-medium text-text-primary">
          {t("settings.defaultRegionLabel")}
        </h3>
        <p className="mb-3 text-xs text-text-muted">
          {t("settings.defaultRegionDesc")}
        </p>
        <select
          value={defaultRegion}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-border-theme bg-bg-page px-3 py-2.5 text-sm text-text-primary transition-colors focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan/30"
        >
          <option value="">{t("settings.selectRegion")}</option>
          {REGIONS.map((region) => (
            <option key={region.value} value={region.value}>
              {region.label} ({region.value.toUpperCase()})
            </option>
          ))}
        </select>
      </SectionCard>

      {/* ── Privacy ─────────────────────────────────────────────────────────── */}
      <SectionCard title={t("settings.privacy")} icon={<ShieldIcon />}>
        <div className="space-y-4">
          {/* Cookie status */}
          <div className="rounded-lg border border-border-theme bg-bg-page/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-text-primary">
                  {t("settings.cookieStatus")}
                </h3>
                <p className="text-xs text-text-muted">
                  {t("settings.cookieStatusDesc")}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  cookieStatus === "accepted"
                    ? "bg-green-500/10 text-green-500"
                    : "bg-yellow-500/10 text-yellow-500"
                }`}
              >
                {cookieStatus === "accepted"
                  ? t("settings.cookieAccepted")
                  : t("settings.cookieNotSet")}
              </span>
            </div>
          </div>

          {/* Reset cookies */}
          <div className="rounded-lg border border-border-theme bg-bg-page/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-text-primary">
                  {t("settings.resetCookies")}
                </h3>
                <p className="text-xs text-text-muted">
                  {t("settings.resetCookiesDesc")}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfirmAction(
                    confirmAction === "cookies" ? null : "cookies",
                  )
                }
                className="shrink-0 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
              >
                {t("settings.resetCookies")}
              </button>
            </div>
            <ConfirmDialog
              open={confirmAction === "cookies"}
              title={t("settings.confirmTitle")}
              cancelLabel={t("settings.confirmCancel")}
              confirmLabel={t("settings.confirmDelete")}
              onCancel={() => setConfirmAction(null)}
              onConfirm={handleResetCookies}
            />
          </div>

          {/* Clear search history */}
          <div className="rounded-lg border border-border-theme bg-bg-page/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-text-primary">
                  {t("settings.clearHistory")}
                </h3>
                <p className="text-xs text-text-muted">
                  {t("settings.clearHistoryDesc")}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfirmAction(
                    confirmAction === "history" ? null : "history",
                  )
                }
                className="shrink-0 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
              >
                {t("settings.clearHistory")}
              </button>
            </div>
            <ConfirmDialog
              open={confirmAction === "history"}
              title={t("settings.confirmTitle")}
              cancelLabel={t("settings.confirmCancel")}
              confirmLabel={t("settings.confirmDelete")}
              onCancel={() => setConfirmAction(null)}
              onConfirm={handleClearHistory}
            />
          </div>

          {/* Clear favorites */}
          <div className="rounded-lg border border-border-theme bg-bg-page/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-text-primary">
                  {t("settings.clearFavorites")}
                </h3>
                <p className="text-xs text-text-muted">
                  {t("settings.clearFavoritesDesc")}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfirmAction(
                    confirmAction === "favorites" ? null : "favorites",
                  )
                }
                className="shrink-0 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
              >
                {t("settings.clearFavorites")}
              </button>
            </div>
            <ConfirmDialog
              open={confirmAction === "favorites"}
              title={t("settings.confirmTitle")}
              cancelLabel={t("settings.confirmCancel")}
              confirmLabel={t("settings.confirmDelete")}
              onCancel={() => setConfirmAction(null)}
              onConfirm={handleClearFavorites}
            />
          </div>
        </div>
      </SectionCard>

      {/* ── Data Management ─────────────────────────────────────────────────── */}
      <SectionCard title={t("settings.data")} icon={<DatabaseIcon />}>
        <div className="space-y-4">
          {/* Export */}
          <div className="rounded-lg border border-border-theme bg-bg-page/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-text-primary">
                  {t("settings.exportFavorites")}
                </h3>
                <p className="text-xs text-text-muted">
                  {t("settings.exportFavoritesDesc")}
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportFavorites}
                className="shrink-0 rounded-lg border border-cyan/30 px-3 py-1.5 text-xs font-medium text-cyan transition-colors hover:bg-cyan/10"
              >
                {t("settings.exportButton")}
              </button>
            </div>
          </div>

          {/* Import */}
          <div className="rounded-lg border border-border-theme bg-bg-page/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-text-primary">
                  {t("settings.importFavorites")}
                </h3>
                <p className="text-xs text-text-muted">
                  {t("settings.importFavoritesDesc")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 rounded-lg border border-cyan/30 px-3 py-1.5 text-xs font-medium text-cyan transition-colors hover:bg-cyan/10"
              >
                {t("settings.importButton")}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportFavorites}
                className="hidden"
                aria-label={t("settings.importFavorites")}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── About ───────────────────────────────────────────────────────────── */}
      <SectionCard title={t("settings.about")} icon={<InfoIcon />}>
        <div className="space-y-4">
          {/* Version */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">{t("settings.version")}:</span>
            <span className="rounded-md bg-cyan/10 px-2 py-0.5 text-xs font-semibold text-cyan">
              1.0.0
            </span>
          </div>

          {/* Tech stack */}
          <div>
            <h3 className="mb-1 text-sm font-medium text-text-primary">
              {t("settings.techStack")}
            </h3>
            <p className="text-xs text-text-muted">
              {t("settings.techStackDesc")}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-text-primary">
              {t("settings.links")}
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/trackerino/lol-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-border-theme px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:border-cyan/30 hover:text-text-primary"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                {t("settings.github")}
              </a>
              <a
                href="https://developer.riotgames.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-border-theme px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:border-cyan/30 hover:text-text-primary"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                {t("settings.riotDev")}
              </a>
            </div>
          </div>

          {/* Credits */}
          <p className="border-t border-border-theme pt-4 text-xs text-text-muted">
            {t("settings.builtWith")}
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
