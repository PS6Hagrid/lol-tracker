import { Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import HomeSidebar from "@/components/HomeSidebar";
import StatsCounter from "@/components/StatsCounter";
import FeatureCards from "@/components/FeatureCards";
import TrendingPlayers from "@/components/TrendingPlayers";
import FloatingOrbs from "@/components/FloatingOrbs";
import ChampionSpotlight from "@/components/ChampionSpotlight";
import HeroText from "@/components/HeroText";
import AnimatedStats from "@/components/AnimatedStats";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <section className="flex min-h-[calc(100vh-3.5rem-12rem)] flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Animated particle/orb background */}
        <FloatingOrbs />

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          {/* Animated title with typing effect */}
          <HeroText />

          {/* Search bar */}
          <SearchBar />

          {/* Quick links to demo summoners */}
          <div className="flex flex-wrap justify-center gap-3 text-sm text-text-muted">
            <span>Try:</span>
            <a
              href="/summoner/kr/Faker-KR1"
              className="text-cyan/70 transition-colors duration-200 hover:text-cyan"
            >
              Faker#KR1
            </a>
            <span className="text-border-theme">|</span>
            <a
              href="/summoner/na1/Doublelift-NA1"
              className="text-cyan/70 transition-colors duration-200 hover:text-cyan"
            >
              Doublelift#NA1
            </a>
            <span className="text-border-theme">|</span>
            <a
              href="/summoner/euw1/xPeke-EUW"
              className="text-cyan/70 transition-colors duration-200 hover:text-cyan"
            >
              xPeke#EUW
            </a>
          </div>

          {/* Champion Spotlight Carousel */}
          <ChampionSpotlight />

          {/* Animated stats counters */}
          <AnimatedStats />

          {/* Favorites & Recent Searches */}
          <HomeSidebar />
        </div>
      </section>

      {/* Stats Counter (existing) */}
      <StatsCounter />

      {/* Feature Cards */}
      <FeatureCards />

      {/* Trending / Recently Searched Players */}
      <Suspense fallback={null}>
        <TrendingPlayers />
      </Suspense>
    </div>
  );
}
