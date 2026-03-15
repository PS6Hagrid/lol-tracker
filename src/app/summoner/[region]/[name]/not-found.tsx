import Link from "next/link";

/** 404 page shown when a specific summoner cannot be found. */
export default function SummonerNotFound() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-[#0a0e17] px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-700/50 bg-[#111827] p-8 text-center">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-700/50 bg-gray-800/40">
          <svg
            className="h-8 w-8 text-gray-400"
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
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-100">
          Summoner Not Found
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          We couldn&apos;t find a summoner with that name in this region. Please
          check the spelling and region, then try again.
        </p>

        {/* Action */}
        <div className="mt-6">
          <Link
            href="/"
            className="inline-block rounded-lg border border-blue-500/50 bg-blue-500/10 px-6 py-2.5 text-sm font-medium text-blue-400 transition-all duration-200 hover:bg-blue-500/20 hover:shadow-[0_0_12px_rgba(59,130,246,0.2)]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
