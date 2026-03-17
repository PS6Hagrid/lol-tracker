"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import en from "./en.json";
import de from "./de.json";

type Locale = "en" | "de";
type Translations = typeof en;

const translations: Record<Locale, Translations> = { en, de };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("trackerino-locale") as Locale) ?? "en";
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("trackerino-locale", newLocale);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: unknown = translations[locale];
    for (const k of keys) {
      if (value && typeof value === "object") {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // fallback to key
      }
    }
    if (typeof value !== "string") return key;
    if (!params) return value;
    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(`{${k}}`, String(v)),
      value,
    );
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
