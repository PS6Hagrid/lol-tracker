"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const TYPING_PHRASES = [
  "Track your ranked climb",
  "Analyze match history",
  "Scout live games",
  "Master your champions",
];

export default function HeroText() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = TYPING_PHRASES[phraseIndex];

    if (!isDeleting && charIndex === currentPhrase.length) {
      // Pause at end of phrase
      const timeout = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % TYPING_PHRASES.length);
      return;
    }

    const speed = isDeleting ? 30 : 60;
    const timeout = setTimeout(() => {
      setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, speed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex]);

  const displayText = TYPING_PHRASES[phraseIndex].slice(0, charIndex);

  return (
    <div className="text-center">
      {/* Main title with staggered letter animation */}
      <motion.h1
        className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <span className="bg-gradient-to-r from-gold via-yellow-300 to-cyan bg-clip-text text-transparent">
          Trackerino
        </span>
      </motion.h1>

      {/* Subtitle with fade in */}
      <motion.p
        className="mt-4 text-lg text-text-secondary sm:text-xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Search any summoner to view their stats
      </motion.p>

      {/* Typing effect line */}
      <motion.div
        className="mt-3 h-8 text-base font-medium sm:text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <span className="bg-gradient-to-r from-cyan to-gold bg-clip-text text-transparent">
          {displayText}
        </span>
        <span className="inline-block w-[2px] animate-pulse bg-cyan text-transparent ml-0.5">
          |
        </span>
      </motion.div>
    </div>
  );
}
