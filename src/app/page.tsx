import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/5 blur-[128px]" />
        <div className="absolute left-1/3 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/5 blur-[96px]" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-cyan bg-clip-text text-transparent">
              LoL Tracker
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-400 sm:text-xl">
            Search any summoner to view their stats
          </p>
        </div>

        {/* Search bar */}
        <SearchBar />

        {/* Quick links to demo summoners */}
        <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500">
          <span>Try:</span>
          <a
            href="/summoner/kr/Faker-KR1"
            className="text-cyan/70 transition-colors duration-200 hover:text-cyan"
          >
            Faker#KR1
          </a>
          <span className="text-gray-700">|</span>
          <a
            href="/summoner/na1/Doublelift-NA1"
            className="text-cyan/70 transition-colors duration-200 hover:text-cyan"
          >
            Doublelift#NA1
          </a>
          <span className="text-gray-700">|</span>
          <a
            href="/summoner/euw1/xPeke-EUW"
            className="text-cyan/70 transition-colors duration-200 hover:text-cyan"
          >
            xPeke#EUW
          </a>
        </div>
      </div>
    </div>
  );
}
