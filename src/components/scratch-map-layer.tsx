"use client";

import { useEffect } from "react";
import { useMap } from "@/context/map-context";
import visitedCountries from "@/data/visited-countries.json";

type ViewMode = "gallery" | "scratch-map" | "flights";

type ScratchMapLayerProps = {
  viewMode: ViewMode;
};

export default function ScratchMapLayer({ viewMode }: ScratchMapLayerProps) {
  const { map } = useMap();

  useEffect(() => {
    if (!map || viewMode !== "scratch-map") {
      // Remove layer and source if not in scratch-map mode
      if (map && map.isStyleLoaded && map.isStyleLoaded()) {
        try {
          if (map.getLayer("country-highlight-border")) {
            map.removeLayer("country-highlight-border");
          }
          if (map.getLayer("country-highlight")) {
            map.removeLayer("country-highlight");
          }
          if (map.getSource("countries")) {
            map.removeSource("countries");
          }
        } catch (e) {
          console.warn("Error removing country highlight layer:", e);
        }
      }
      return;
    }

    if (!map.isStyleLoaded()) {
      map.once("load", () => {
        addCountryLayer();
      });
      return;
    }

    const addCountryLayer = () => {
      try {
        // Remove existing layers if they exist
        if (map.getLayer("country-highlight-border")) {
          map.removeLayer("country-highlight-border");
        }
        if (map.getLayer("country-highlight")) {
          map.removeLayer("country-highlight");
        }
        if (map.getSource("countries")) {
          map.removeSource("countries");
        }

        map.addSource("countries", {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        });

        const filter: any[] = ["in", "iso_3166_1", ...visitedCountries];

        // Add the fill layer
        map.addLayer({
          id: "country-highlight",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          filter: filter,
          paint: {
            "fill-color": "#243154",
            "fill-opacity": 0.7,
          },
        });

        // Add border layer for white borders
        map.addLayer({
          id: "country-highlight-border",
          type: "line",
          source: "countries",
          "source-layer": "country_boundaries",
          filter: filter,
          paint: {
            "line-color": "#ffffff",
            "line-width": 0.9,
            "line-opacity": 0.7,
          },
        });
      } catch (e) {
        console.warn("Error adding country highlight layer:", e);
      }
    };

    addCountryLayer();

    return () => {
      if (map && map.isStyleLoaded && map.isStyleLoaded()) {
        try {
          if (map.getLayer("country-highlight-border")) {
            map.removeLayer("country-highlight-border");
          }
          if (map.getLayer("country-highlight")) {
            map.removeLayer("country-highlight");
          }
          if (map.getSource("countries")) {
            map.removeSource("countries");
          }
        } catch (e) {
          console.warn("Error cleaning up country highlight layer:", e);
        }
      }
    };
  }, [map, viewMode]);

  return null;
}
