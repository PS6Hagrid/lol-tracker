import Link from "next/link";
import SearchBar from "@/components/SearchBar";

/** Custom 404 page with a gaming theme and search functionality. */
export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-[#0a0e17] px-4">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-[128px]" />
        <div className="absolute left-1/3 top-2/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[96px]" />
      </div>

      <div className="animate-fade-in relative z-10 flex flex-col items-center text-center">
        {/* Large 404 */}
        <h1 className="text-8xl font-extrabold tracking-tight sm:text-9xl">
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            404
          </span>
        </h1>

        {/* Subtitle */}
        <h2 className="mt-4 text-2xl font-bold text-gray-100 sm:text-3xl">
          Summoner Not Found
        </h2>
        <p className="mt-3 max-w-md text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Search bar */}
        <div className="mt-8 w-full max-w-2xl">
          <p className="mb-3 text-sm text-gray-400">
            Search for a summoner instead:
          </p>
          <SearchBar />
        </div>

        {/* Back to Home */}
        <Link
          href="/"
          className="mt-6 rounded-lg border border-blue-500/60 bg-blue-500/10 px-6 py-3 text-sm font-medium text-blue-400 transition-all duration-200 hover:bg-blue-500/20 hover:shadow-[0_0_16px_rgba(59,130,246,0.25)]"
        >
          Back to Home
        </Link>

        {/* Fun flavour text */}
        <p className="mt-12 text-xs text-gray-600">
          Even Teemo couldn&apos;t find this page...
        </p>
      </div>
    </div>
  );
}
