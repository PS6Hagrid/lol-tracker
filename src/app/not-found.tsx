import Link from "next/link";

/** Custom 404 page with a gaming theme. */
export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-loss/5 blur-[128px]" />
      </div>

      <div className="animate-fade-in relative z-10 flex flex-col items-center text-center">
        {/* Large 404 */}
        <h1 className="text-8xl font-extrabold tracking-tight sm:text-9xl">
          <span className="bg-gradient-to-r from-loss via-red-400 to-gold bg-clip-text text-transparent">
            404
          </span>
        </h1>

        {/* Subtitle */}
        <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
          Lost in the Fog of War
        </h2>
        <p className="mt-3 max-w-md text-gray-400">
          The page you are looking for does not exist. Perhaps the summoner has
          disconnected, or the map has not been warded here yet.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-lg border border-gold/60 bg-gold/10 px-6 py-3 text-sm font-medium text-gold transition-all duration-200 hover:bg-gold/20 hover:shadow-[0_0_16px_rgba(200,155,60,0.25)]"
          >
            Return to Base
          </Link>
        </div>

        {/* Fun flavour text */}
        <p className="mt-12 text-xs text-gray-600">
          &quot;A summoner has disconnected.&quot;
        </p>
      </div>
    </div>
  );
}
