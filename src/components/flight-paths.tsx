"use client";

import { useEffect, useState } from "react";
import { useMap } from "@/context/map-context";
import * as turf from "@turf/turf";
import flightsData from "@/data/flights.json";

type ViewMode = "gallery" | "scratch-map" | "flights";

type FlightPathsProps = {
  viewMode: ViewMode;
  selectedYear: string;
};

export default function FlightPaths({
  viewMode,
  selectedYear,
}: FlightPathsProps) {
  const { map } = useMap();
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    cityName: string;
    origin?: string;
    destination?: string;
    x: number;
    y: number;
  }>({
    show: false,
    cityName: "",
    origin: undefined,
    destination: undefined,
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
        };

        const yearFlights =
          (flightsData as Record<string, any[]>)[selectedYear] || [];
        const flightPaths: FlightPath[] = yearFlights.map((flight: any) => ({
          origin: flight.origin as [number, number],
          destination: flight.destination as [number, number],
          originName: flight.originName,
          destinationName: flight.destinationName,
          upcoming: flight.upcoming || false,
        }));

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
        const handlePathMouseMove = (e: mapboxgl.MapLayerMouseEvent) => {
          if (!e.features || e.features.length === 0) return;

          const feature = e.features[0];
          const origin = feature.properties?.origin || "Unknown";
          const destination = feature.properties?.destination || "Unknown";

          const canvasRect = map.getCanvasContainer().getBoundingClientRect();
          setTooltip({
            show: true,
            cityName: "",
            origin,
            destination,
            x: e.point.x + canvasRect.left,
            y: e.point.y + canvasRect.top,
          });

          map.getCanvas().style.cursor = "pointer";
        };

        const handlePathMouseLeave = () => {
          setTooltip({
            show: false,
            cityName: "",
            origin: undefined,
            destination: undefined,
            x: 0,
            y: 0,
          });
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
        cityName: "",
        origin: undefined,
        destination: undefined,
        x: 0,
        y: 0,
      });
    };
  }, [map, viewMode, selectedYear]);

  return (
    <>
      {tooltip.show && (
        <div
          className="pointer-events-none fixed z-2000 rounded-md bg-black/80 px-3 py-1.5 text-sm text-white shadow-lg"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 10}px`,
            transform: "translateY(-100%)",
          }}
        >
          {tooltip.origin && tooltip.destination && (
            <div
              className="uppercase"
              style={{ fontFamily: "var(--font-space-mono), monospace" }}
            >
              {tooltip.origin} → {tooltip.destination}
            </div>
          )}
        </div>
      )}
    </>
  );
}
