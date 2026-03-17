"use client";

import { useMemo } from "react";

interface Orb {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  color: "cyan" | "gold";
  opacity: number;
}

export default function FloatingOrbs() {
  const orbs = useMemo<Orb[]>(() => {
    const items: Orb[] = [];
    for (let i = 0; i < 12; i++) {
      items.push({
        id: i,
        size: 4 + (i % 5) * 8,
        x: (i * 23 + 7) % 100,
        y: (i * 17 + 13) % 100,
        duration: 12 + (i % 4) * 6,
        delay: (i % 5) * -3,
        color: i % 3 === 0 ? "gold" : "cyan",
        opacity: 0.15 + (i % 3) * 0.1,
      });
    }
    return items;
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Base ambient glow */}
      <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/5 blur-[128px] will-change-transform" />
      <div className="absolute left-1/3 top-2/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/5 blur-[96px] will-change-transform" />
      <div className="absolute right-1/4 top-1/4 h-64 w-64 rounded-full bg-cyan/3 blur-[80px] will-change-transform" />

      {/* Floating orbs */}
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full will-change-transform"
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background:
              orb.color === "cyan"
                ? "var(--color-cyan)"
                : "var(--color-gold)",
            opacity: orb.opacity,
            filter: `blur(${orb.size > 16 ? 8 : 4}px)`,
            animation: `floatOrb ${orb.duration}s ease-in-out ${orb.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
