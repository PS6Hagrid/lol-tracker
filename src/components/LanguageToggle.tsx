"use client";

import { useI18n } from "@/i18n/context";

export default function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "de" : "en")}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-card-hover text-xs font-bold text-text-secondary transition-colors hover:text-text-primary"
      aria-label="Toggle language"
      title={locale === "en" ? "Deutsch" : "English"}
    >
      {locale === "en" ? "DE" : "EN"}
    </button>
  );
}
