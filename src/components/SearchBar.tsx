"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REGIONS } from "@/lib/constants";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("na1");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) return;

    let gameName: string;
    let tagLine: string;

    if (trimmed.includes("#")) {
      const hashIndex = trimmed.indexOf("#");
      gameName = trimmed.slice(0, hashIndex).trim();
      tagLine = trimmed.slice(hashIndex + 1).trim();
    } else {
      gameName = trimmed;
      // Default tagLine to the region code (uppercased, digits stripped for cleanliness)
      tagLine = region.toUpperCase().replace(/[0-9]/g, "");
    }

    if (!gameName) return;
    if (!tagLine) tagLine = region.toUpperCase().replace(/[0-9]/g, "");

    router.push(
      `/summoner/${encodeURIComponent(region)}/${encodeURIComponent(gameName)}-${encodeURIComponent(tagLine)}`
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
      {/* Region selector */}
      <select
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        className="h-12 rounded-lg border border-gray-700/50 bg-gray-900/80 px-3 text-sm text-white outline-none transition-all duration-200 focus:border-cyan focus:ring-1 focus:ring-cyan/30 sm:w-44"
      >
        {REGIONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      {/* Search input + button */}
      <div className="relative flex flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search summoner... (e.g. Faker#KR1)"
          className="h-12 w-full rounded-l-lg border border-r-0 border-gray-700/50 bg-gray-900/80 px-4 text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-gold focus:ring-1 focus:ring-gold/30"
        />
        <button
          type="submit"
          className="flex h-12 items-center gap-2 rounded-r-lg border border-gold/80 bg-gold/10 px-5 font-medium text-gold transition-all duration-200 hover:bg-gold/20 hover:shadow-[0_0_12px_rgba(200,155,60,0.3)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Search
        </button>
      </div>
    </form>
  );
}
