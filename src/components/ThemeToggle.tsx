"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700/50"
        aria-label="Toggle theme"
      >
        <span className="text-sm">🌙</span>
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("system");
    } else {
      setTheme("dark");
    }
  };

  const icon = theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "💻";
  const label =
    theme === "light"
      ? "Light mode (click for system)"
      : theme === "dark"
        ? "Dark mode (click for light)"
        : "System mode (click for dark)";

  return (
    <button
      onClick={cycleTheme}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700/50 transition-colors hover:bg-gray-600/50"
      aria-label={label}
      title={label}
    >
      <span className="text-sm">{icon}</span>
    </button>
  );
}
