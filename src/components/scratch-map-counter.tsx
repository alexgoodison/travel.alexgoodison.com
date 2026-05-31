"use client";

import { useEffect, useState } from "react";
import { Plane } from "lucide-react";
import visitedCountries from "@/data/visited-countries.json";

const TOTAL_COUNTRIES = 195;
const VISITED_COUNT = visitedCountries.length;
const COUNT_DURATION_MS = 1800;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

type ScratchMapCounterProps = {
  active: boolean;
};

export default function ScratchMapCounter({ active }: ScratchMapCounterProps) {
  const [displayCount, setDisplayCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setDisplayCount(0);
      setVisible(false);
      return;
    }

    setVisible(false);
    const revealTimer = window.setTimeout(() => setVisible(true), 50);

    let raf = 0;
    let start: number | null = null;

    const animate = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / COUNT_DURATION_MS, 1);
      setDisplayCount(Math.round(easeOutCubic(progress) * VISITED_COUNT));

      if (progress < 1) {
        raf = window.requestAnimationFrame(animate);
      }
    };

    raf = window.requestAnimationFrame(animate);

    return () => {
      window.clearTimeout(revealTimer);
      window.cancelAnimationFrame(raf);
    };
  }, [active]);

  if (!active) return null;

  const percent = (displayCount / TOTAL_COUNTRIES) * 100;

  return (
    <div
      className={`pointer-events-none transition-all duration-500 ease-out ${
        visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
      }`}
    >
      <div className="relative bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden min-w-[280px]">
        {/* Header */}
        <div className="flex items-center justify-between gap-6 px-6 pt-4 pb-3">
          <div
            className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/60 whitespace-nowrap"
            style={{ fontFamily: "var(--font-space-mono), monospace" }}
          >
            <Plane className="h-3.5 w-3.5 -rotate-45" />
            Countries Visited
          </div>
          <span
            className="text-xs tracking-[0.12em] text-white/45 tabular-nums"
            style={{ fontFamily: "var(--font-space-mono), monospace" }}
          >
            {percent.toFixed(1)}%
          </span>
        </div>

        {/* Perforated divider with notches */}
        <div className="relative">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-black/60" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-black/60" />
          <div className="border-t border-dashed border-white/20" />
        </div>

        {/* Counter */}
        <div className="px-6 pt-4 pb-3">
          <div
            className="text-5xl leading-none tracking-tight text-white tabular-nums"
            style={{ fontFamily: "var(--font-space-mono), monospace" }}
          >
            <span>{displayCount}</span>
            <span className="mx-2 text-3xl text-white/35">/</span>
            <span className="text-3xl text-white/55">{TOTAL_COUNTRIES}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-5">
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-white/80 transition-[width] duration-100 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
