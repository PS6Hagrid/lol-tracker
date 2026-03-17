import type { Metadata } from "next";
import changelog from "@/data/changelog.json";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "See what's new in Trackerino — version history, feature updates, and improvements.",
};

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  highlights: string[];
}

export default function ChangelogPage() {
  const entries = changelog as ChangelogEntry[];
  const latestVersion = entries[0]?.version;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary">Changelog</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Version history and release notes for Trackerino.
      </p>

      <div className="mt-8 space-y-6">
        {entries.map((entry) => (
          <article
            key={entry.version}
            className="rounded-xl border border-border-theme bg-bg-card p-5 sm:p-6"
          >
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  entry.version === latestVersion
                    ? "bg-cyan/20 text-cyan"
                    : "bg-white/10 text-text-muted"
                }`}
              >
                v{entry.version}
              </span>
              <time className="text-sm text-text-muted" dateTime={entry.date}>
                {entry.date}
              </time>
              {entry.version === latestVersion && (
                <span className="rounded-full bg-cyan/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan">
                  Latest
                </span>
              )}
            </div>

            <h2 className="mb-3 text-lg font-semibold text-text-primary">
              {entry.title}
            </h2>

            <ul className="space-y-2">
              {entry.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-text-muted"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
                  {highlight}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
