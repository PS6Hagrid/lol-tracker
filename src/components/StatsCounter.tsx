"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  animate: boolean;
}

const stats: StatItem[] = [
  { value: 168, suffix: "+", label: "Champions Tracked", animate: true },
  { value: 16, suffix: "", label: "Regions Covered", animate: true },
  { value: 1, suffix: "M+", label: "Matches Analyzed", animate: true },
  { value: 0, suffix: "24/7", label: "Real-Time Updates", animate: false },
];

function useCountUp(target: number, shouldAnimate: boolean, isVisible: boolean) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current || !shouldAnimate) return;
    hasAnimated.current = true;

    const duration = 2000;
    let startTime: number | null = null;

    function step(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }, [isVisible, target, shouldAnimate]);

  return shouldAnimate ? count : target;
}

function StatCard({ stat, isVisible }: { stat: StatItem; isVisible: boolean }) {
  const count = useCountUp(stat.value, stat.animate, isVisible);

  const displayValue = stat.animate
    ? `${count}${stat.suffix}`
    : stat.suffix;

  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border-theme p-6">
      <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
        {displayValue}
      </span>
      <span className="text-sm text-text-secondary">{stat.label}</span>
      <div className="mt-2 h-0.5 w-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-40" />
    </div>
  );
}

export default function StatsCounter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      threshold: 0.2,
    });

    const el = sectionRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [handleIntersect]);

  return (
    <section ref={sectionRef} className="mx-auto w-full max-w-4xl px-4 py-16">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} isVisible={isVisible} />
        ))}
      </div>
    </section>
  );
}
