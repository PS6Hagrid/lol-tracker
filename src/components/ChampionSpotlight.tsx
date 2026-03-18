"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const CHAMPIONS = [
  { name: "Ahri", id: "Ahri" },
  { name: "Yasuo", id: "Yasuo" },
  { name: "Jinx", id: "Jinx" },
  { name: "Thresh", id: "Thresh" },
  { name: "Lux", id: "Lux" },
  { name: "Zed", id: "Zed" },
  { name: "LeeSin", id: "LeeSin" },
  { name: "KaiSa", id: "KaiSa" },
];

const DDRAGON_VERSION = "14.10.1";

function getSplashUrl(championId: string) {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_0.jpg`;
}

function getSquareUrl(championId: string) {
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${championId}.png`;
}

export default function ChampionSpotlight() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextChampion = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % CHAMPIONS.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextChampion, 4000);
    return () => clearInterval(interval);
  }, [isPaused, nextChampion]);

  const current = CHAMPIONS[currentIndex];

  return (
    <div
      className="relative mx-auto w-full max-w-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main splash art */}
      <div className="relative h-48 overflow-hidden rounded-2xl border border-border-theme sm:h-64 md:h-72">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 will-change-transform"
          >
            <Image
              src={getSplashUrl(current.id)}
              alt={`${current.name} splash art`}
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-cover object-top"
              priority={currentIndex === 0}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-page/90 via-bg-page/30 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Champion name */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`name-${current.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="absolute bottom-4 left-4 z-10"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-cyan">
              Champion Spotlight
            </p>
            <Link href={`/champions/${current.id}`} className="group">
              <h3 className="text-2xl font-bold text-text-primary drop-shadow-lg transition-colors group-hover:text-cyan sm:text-3xl">
                {current.name}
              </h3>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnail selector */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {CHAMPIONS.map((champ, index) => (
          <button
            key={champ.id}
            onClick={() => setCurrentIndex(index)}
            className={`relative h-9 w-9 overflow-hidden rounded-full border-2 transition-all duration-300 will-change-transform ${
              index === currentIndex
                ? "scale-110 border-cyan shadow-[0_0_12px_rgba(0,212,255,0.3)]"
                : "border-border-theme opacity-50 hover:opacity-80"
            }`}
            aria-label={`Show ${champ.name}`}
          >
            <Image
              src={getSquareUrl(champ.id)}
              alt={champ.name}
              width={36}
              height={36}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mx-auto mt-2 h-0.5 w-32 overflow-hidden rounded-full bg-border-theme">
        <motion.div
          key={`progress-${currentIndex}`}
          initial={{ width: "0%" }}
          animate={{ width: isPaused ? undefined : "100%" }}
          transition={{
            duration: 4,
            ease: "linear",
          }}
          className="h-full rounded-full bg-gradient-to-r from-gold to-cyan"
        />
      </div>
    </div>
  );
}
