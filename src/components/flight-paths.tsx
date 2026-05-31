"use client";

import { useEffect, useState } from "react";
import { useMap } from "@/context/map-context";
import * as turf from "@turf/turf";
import flightsData from "@/data/flights";
import { flightKey } from "@/components/flight-list";

type ViewMode = "gallery" | "scratch-map" | "flights";

type FlightPathsProps = {
  viewMode: ViewMode;
  selectedYear: string;
  hoveredKey: string | null;
  selectedKey: string | null;
  onHoverChange: (key: string | null) => void;
};

export default function FlightPaths({
  viewMode,
  selectedYear,
  hoveredKey,
  selectedKey,
  onHoverChange,
}: FlightPathsProps) {
  const { map } = useMap();
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    routes: { origin: string; destination: string }[];
    x: number;
    y: number;
  }>({
    show: false,
    routes: [],
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!map || viewMode !== "flights") {
      if (map && map.isStyleLoaded && map.isStyleLoaded()) {
        try {
          if (map.getLayer("flight-paths-hover")) {
            map.removeLayer("flight-paths-hover");
          }
          if (map.getLayer("flight-paths-highlight")) {
            map.removeLayer("flight-paths-highlight");
          }
          if (map.getLayer("flight-paths")) {
            map.removeLayer("flight-paths");
          }
          if (map.getSource("flight-paths")) {
            map.removeSource("flight-paths");
          }
          if (map.getLayer("flight-path-points")) {
            map.removeLayer("flight-path-points");
          }
          if (map.getSource("flight-path-points")) {
            map.removeSource("flight-path-points");
          }
        } catch (e) {
          console.warn("Error removing flight paths:", e);
        }
      }
      return;
    }

    if (!map.isStyleLoaded()) {
      map.once("load", () => {
        addFlightPaths();
      });
      return;
    }

    const addFlightPaths = () => {
      try {
        // Use flight paths from JSON file based on selected year
        type FlightPath = {
          origin: [number, number];
          destination: [number, number];
          originName: string;
          destinationName: string;
          upcoming?: boolean;
          key: string;
        };

        const yearFlights =
          (flightsData as Record<string, any[]>)[selectedYear] || [];
        const flightPaths: FlightPath[] = yearFlights.map(
          (flight: any, index: number) => ({
            origin: flight.origin as [number, number],
            destination: flight.destination as [number, number],
            originName: flight.originName,
            destinationName: flight.destinationName,
            upcoming: flight.upcoming || false,
            key: flightKey(flight, index),
          }),
        );

        // Create GeoJSON features for all flight paths
        const features = flightPaths.map((path: FlightPath) => {
          // Create a simple line from origin to destination
          const line = turf.lineString([path.origin, path.destination]);

          // Calculate distance for creating arc points
          const distance = turf.length(line, { units: "kilometers" });
          const arc: [number, number][] = [];

          // Create curved arc points (great circle)
          const steps = Math.max(50, Math.floor(distance / 100)); // More steps for longer flights
          for (let i = 0; i <= steps; i++) {
            const along = turf.along(line, (distance * i) / steps, {
              units: "kilometers",
            });
            arc.push(along.geometry.coordinates as [number, number]);
          }

          return {
            type: "Feature" as const,
            properties: {
              origin: path.originName,
              destination: path.destinationName,
              upcoming: path.upcoming || false,
              key: path.key,
            },
            geometry: {
              type: "LineString" as const,
              coordinates: arc,
            },
          };
        });

        const geojson: GeoJSON.FeatureCollection = {
          type: "FeatureCollection",
          features,
        };

        // Create points for origins and destinations
        const pointFeatures: GeoJSON.Feature[] = [];
        flightPaths.forEach((path: FlightPath) => {
          // Origin point
          pointFeatures.push({
            type: "Feature",
            properties: {
              type: "origin",
              name: path.originName,
              upcoming: path.upcoming || false,
            },
            geometry: {
              type: "Point",
              coordinates: path.origin,
            },
          });
          // Destination point
          pointFeatures.push({
            type: "Feature",
            properties: {
              type: "destination",
              name: path.destinationName,
              upcoming: path.upcoming || false,
            },
            geometry: {
              type: "Point",
              coordinates: path.destination,
            },
          });
        });

        const pointsGeojson: GeoJSON.FeatureCollection = {
          type: "FeatureCollection",
          features: pointFeatures,
        };

        // Remove existing sources and layers if they exist
        if (map.getLayer("flight-paths-hover")) {
          map.removeLayer("flight-paths-hover");
        }
        if (map.getLayer("flight-paths-highlight")) {
          map.removeLayer("flight-paths-highlight");
        }
        if (map.getLayer("flight-paths")) {
          map.removeLayer("flight-paths");
        }
        if (map.getSource("flight-paths")) {
          map.removeSource("flight-paths");
        }
        if (map.getLayer("flight-path-points")) {
          map.removeLayer("flight-path-points");
        }
        if (map.getSource("flight-path-points")) {
          map.removeSource("flight-path-points");
        }

        // Add line source
        map.addSource("flight-paths", {
          type: "geojson",
          data: geojson,
        });

        // Add points source
        map.addSource("flight-path-points", {
          type: "geojson",
          data: pointsGeojson,
        });

        // Add invisible wider line layer for easier hover detection
        map.addLayer({
          id: "flight-paths-hover",
          type: "line",
          source: "flight-paths",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "transparent",
            "line-width": 18, // Wide invisible line for hover
            "line-opacity": 0,
          },
        });

        // Add visible line layer with conditional color based on upcoming status
        map.addLayer({
          id: "flight-paths",
          type: "line",
          source: "flight-paths",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": [
              "case",
              ["get", "upcoming"],
              "#f59e0b", // Amber/orange for upcoming flights
              "#3b82f6", // Blue for regular flights
            ],
            "line-width": 3.2,
            "line-opacity": 0.7,
          },
        });

        // Add highlight layer (emphasizes hovered/selected route)
        map.addLayer({
          id: "flight-paths-highlight",
          type: "line",
          source: "flight-paths",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          filter: ["in", ["get", "key"], ["literal", []]],
          paint: {
            "line-color": "#ffffff",
            "line-width": 5,
            "line-opacity": 1,
          },
        });

        // Add circle layer for points with conditional color
        map.addLayer({
          id: "flight-path-points",
          type: "circle",
          source: "flight-path-points",
          paint: {
            "circle-radius": 4,
            "circle-color": [
              "case",
              ["get", "upcoming"],
              "#f59e0b", // Amber/orange for upcoming flights
              "#3b82f6", // Blue for regular flights
            ],
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 0.9,
          },
        });

        // Add hover event listeners for tooltips on flight paths (routes)
        // Chronological order of each flight (array order is chronological).
        const orderByKey = new Map<string, number>(
          flightPaths.map((p, i) => [p.key, i]),
        );

        const handlePathMouseMove = (e: mapboxgl.MapLayerMouseEvent) => {
          if (!e.features || e.features.length === 0) return;

          // Collect every flight under the cursor (reversed routes overlap),
          // deduping by key so each journey appears once.
          const seen = new Set<string>();
          const routes: {
            origin: string;
            destination: string;
            key: string;
          }[] = [];
          for (const feature of e.features) {
            const key = (feature.properties?.key as string) || "";
            if (key) {
              if (seen.has(key)) continue;
              seen.add(key);
            }
            routes.push({
              origin: feature.properties?.origin || "Unknown",
              destination: feature.properties?.destination || "Unknown",
              key,
            });
          }

          // Oldest flight first, based on chronological array order.
          routes.sort(
            (a, b) =>
              (orderByKey.get(a.key) ?? Infinity) -
              (orderByKey.get(b.key) ?? Infinity),
          );

          const canvasRect = map.getCanvasContainer().getBoundingClientRect();
          setTooltip({
            show: true,
            routes,
            x: e.point.x + canvasRect.left,
            y: e.point.y + canvasRect.top,
          });

          onHoverChange(routes[0]?.key || null);
          map.getCanvas().style.cursor = "pointer";
        };

        const handlePathMouseLeave = () => {
          setTooltip({
            show: false,
            routes: [],
            x: 0,
            y: 0,
          });
          onHoverChange(null);
          map.getCanvas().style.cursor = "";
        };

        // Use the wider hover layer for easier interaction
        map.on("mousemove", "flight-paths-hover", handlePathMouseMove);
        map.on("mouseleave", "flight-paths-hover", handlePathMouseLeave);

        // Store handlers for cleanup
        (map as any)._flightPathHandlers = {
          pathMousemove: handlePathMouseMove,
          pathMouseleave: handlePathMouseLeave,
        };
      } catch (e) {
        console.warn("Error adding flight paths:", e);
      }
    };

    addFlightPaths();

    return () => {
      if (map && map.isStyleLoaded && map.isStyleLoaded()) {
        try {
          // Remove event listeners
          const handlers = (map as any)._flightPathHandlers;
          if (handlers) {
            map.off("mousemove", "flight-paths-hover", handlers.pathMousemove);
            map.off(
              "mouseleave",
              "flight-paths-hover",
              handlers.pathMouseleave,
            );
            delete (map as any)._flightPathHandlers;
          }

          if (map.getLayer("flight-paths-hover")) {
            map.removeLayer("flight-paths-hover");
          }
          if (map.getLayer("flight-paths-highlight")) {
            map.removeLayer("flight-paths-highlight");
          }
          if (map.getLayer("flight-paths")) {
            map.removeLayer("flight-paths");
          }
          if (map.getSource("flight-paths")) {
            map.removeSource("flight-paths");
          }
          if (map.getLayer("flight-path-points")) {
            map.removeLayer("flight-path-points");
          }
          if (map.getSource("flight-path-points")) {
            map.removeSource("flight-path-points");
          }
        } catch (e) {
          console.warn("Error cleaning up flight paths:", e);
        }
      }
      setTooltip({
        show: false,
        routes: [],
        x: 0,
        y: 0,
      });
    };
  }, [map, viewMode, selectedYear]);

  // Update the highlight layer when hovered/selected route changes
  useEffect(() => {
    if (!map || viewMode !== "flights") return;
    const keys = [selectedKey, hoveredKey].filter(Boolean) as string[];
    try {
      if (map.getLayer("flight-paths-highlight")) {
        map.setFilter("flight-paths-highlight", [
          "in",
          ["get", "key"],
          ["literal", keys],
        ]);
      }
    } catch (e) {
      console.warn("Error updating flight highlight:", e);
    }
  }, [map, viewMode, selectedYear, hoveredKey, selectedKey]);

  // Fly the camera to the selected route
  useEffect(() => {
    if (!map || viewMode !== "flights" || !selectedKey) return;
    const yearFlights =
      (flightsData as Record<string, any[]>)[selectedYear] || [];
    const flight = yearFlights.find(
      (f: any, index: number) => flightKey(f, index) === selectedKey,
    );
    if (!flight) return;

    const origin = flight.origin as [number, number];
    const destination = flight.destination as [number, number];
    const sw: [number, number] = [
      Math.min(origin[0], destination[0]),
      Math.min(origin[1], destination[1]),
    ];
    const ne: [number, number] = [
      Math.max(origin[0], destination[0]),
      Math.max(origin[1], destination[1]),
    ];

    try {
      map.fitBounds([sw, ne], {
        padding: { top: 120, bottom: 120, left: 120, right: 360 },
        maxZoom: 5,
        duration: 1400,
      });
    } catch (e) {
      console.warn("Error flying to flight:", e);
    }
  }, [map, viewMode, selectedYear, selectedKey]);

  return (
    <>
      {tooltip.show && tooltip.routes.length > 0 && (
        <div
          className="pointer-events-none fixed z-2000 rounded-md bg-black/80 px-3 py-1.5 text-sm text-white shadow-lg flex flex-col gap-0.5"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 10}px`,
            transform: "translateY(-100%)",
          }}
        >
          {tooltip.routes.map((route, index) => (
            <div
              key={`${route.origin}-${route.destination}-${index}`}
              className="uppercase"
              style={{ fontFamily: "var(--font-space-mono), monospace" }}
            >
              {route.origin} → {route.destination}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
