"use client";

import { useEffect, useMemo, useState } from "react";
import { Plane } from "lucide-react";
import flightsData from "@/data/flights";

type Flight = {
  origin: [number, number];
  destination: [number, number];
  originName: string;
  destinationName: string;
  upcoming?: boolean;
  airline?: string;
};

const COUNT_DURATION_MS = 1500;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// Great-circle distance in km between two [lng, lat] points.
function haversineKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

type FlightListProps = {
  active: boolean;
  selectedYear: string;
  hoveredKey: string | null;
  selectedKey: string | null;
  onHover: (key: string | null) => void;
  onSelect: (key: string) => void;
};

const monoFont = { fontFamily: "var(--font-space-mono), monospace" } as const;

// Array order is chronological, so the index uniquely and stably identifies
// a flight (even when the same route is flown more than once in a year).
export function flightKey(
  flight: { originName: string; destinationName: string },
  index: number,
) {
  return `${index}__${flight.originName}__${flight.destinationName}`;
}

export default function FlightList({
  active,
  selectedYear,
  hoveredKey,
  selectedKey,
  onHover,
  onSelect,
}: FlightListProps) {
  const flights = useMemo<Flight[]>(() => {
    return (flightsData as Record<string, Flight[]>)[selectedYear] || [];
  }, [selectedYear]);

  const totalKm = useMemo(() => {
    return Math.round(
      flights.reduce((sum, f) => sum + haversineKm(f.origin, f.destination), 0),
    );
  }, [flights]);

  const [displayKm, setDisplayKm] = useState(0);

  useEffect(() => {
    if (!active) {
      setDisplayKm(0);
      return;
    }

    let raf = 0;
    let start: number | null = null;
    const animate = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / COUNT_DURATION_MS, 1);
      setDisplayKm(Math.round(easeOutCubic(progress) * totalKm));
      if (progress < 1) raf = window.requestAnimationFrame(animate);
    };
    raf = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(raf);
  }, [active, totalKm]);

  if (!active) return null;

  return (
    <div className="pointer-events-auto absolute top-6 right-6 z-10 w-[300px]">
      <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-6 px-5 pt-4 pb-3">
          <div
            className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/60"
            style={monoFont}
          >
            <Plane className="h-3.5 w-3.5 -rotate-45" />
            Itinerary {selectedYear}
          </div>
          <span
            className="text-xs tracking-[0.12em] text-white/45 tabular-nums"
            style={monoFont}
          >
            {flights.length}
          </span>
        </div>

        {/* Perforated divider with notches */}
        <div className="relative">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white/15" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white/15" />
          <div className="border-t border-dashed border-white/20" />
        </div>

        {/* Flight list */}
        {flights.length === 0 ? (
          <div
            className="px-5 py-6 text-center text-xs uppercase tracking-[0.16em] text-white/40"
            style={monoFont}
          >
            No flights logged
          </div>
        ) : (
          <ul className="max-h-[50vh] overflow-y-auto px-3 py-3 flex flex-col gap-1">
            {flights.map((flight, index) => {
              const color = flight.upcoming ? "#f59e0b" : "#3b82f6";
              const key = flightKey(flight, index);
              const isActive = key === hoveredKey || key === selectedKey;
              return (
                <li
                  key={key}
                  className={`relative flex gap-3 rounded-md px-2 py-1.5 cursor-pointer transition-colors ${
                    isActive ? "bg-white/15" : "hover:bg-white/10"
                  }`}
                  onMouseEnter={() => onHover(key)}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => onSelect(key)}
                >
                  {/* Timeline rail */}
                  <div className="flex flex-col items-center pt-1">
                    <span
                      className="h-2.5 w-2.5 rounded-full border-2 transition-transform"
                      style={{
                        borderColor: color,
                        backgroundColor: isActive ? color : `${color}40`,
                        transform: isActive ? "scale(1.25)" : "scale(1)",
                      }}
                    />
                    {index < flights.length - 1 && (
                      <span className="mt-1 w-px flex-1 bg-white/15" />
                    )}
                  </div>

                  {/* Flight details */}
                  <div className="flex-1 pb-1">
                    <div
                      className="text-sm uppercase tracking-[0.04em] text-white leading-snug"
                      style={monoFont}
                    >
                      {flight.originName}
                      <span className="mx-1.5 text-white/40">→</span>
                      {flight.destinationName}
                    </div>
                    {flight.airline && (
                      <div
                        className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-white/45"
                        style={monoFont}
                      >
                        {flight.airline}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Distance card */}
      {flights.length > 0 && (
        <div className="mt-3 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2.5 flex items-center justify-between gap-6">
          <span
            className="text-xs uppercase tracking-[0.18em] text-white/60"
            style={monoFont}
          >
            Distance Flown
          </span>
          <span
            className="text-sm text-white tabular-nums"
            style={monoFont}
          >
            {displayKm.toLocaleString()} km
          </span>
        </div>
      )}
    </div>
  );
}
