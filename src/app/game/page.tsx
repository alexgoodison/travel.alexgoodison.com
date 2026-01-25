"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MapProvider from "@/lib/mapbox/provider";
import { useMap } from "@/context/map-context";
import { ArrowLeft } from "lucide-react";

export default function GamePage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [currentCountry, setCurrentCountry] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [countryData, setCountryData] = useState<{
    coordinates: Record<string, [number, number]>;
    names: Record<string, string>;
    codes: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load country data on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("/api/countries");
        const data = await response.json();

        if (response.ok) {
          if (data.error) {
            setError(data.error);
            console.error("API returned error:", data.error);
          } else if (data.codes && data.codes.length > 0) {
            setCountryData(data);
            setError(null);
            console.log(`Loaded ${data.codes.length} countries`);
          } else {
            setError("No countries returned from API");
            console.error("No countries returned from API. Data:", data);
          }
        } else {
          setError(
            data.error || `Failed to fetch countries: ${response.status}`,
          );
          console.error("Failed to fetch countries:", response.status, data);
        }
      } catch (error) {
        setError("Error fetching countries. Please try refreshing the page.");
        console.error("Error fetching countries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const selectRandomCountry = () => {
    if (!countryData || countryData.codes.length === 0) return;
    const randomIndex = Math.floor(Math.random() * countryData.codes.length);
    const countryCode = countryData.codes[randomIndex];
    setCurrentCountry(countryCode);
    setUserAnswer("");
    setIsCorrect(null);
    setRound((prev) => prev + 1);
  };

  useEffect(() => {
    if (
      countryData &&
      !loading &&
      countryData.codes &&
      countryData.codes.length > 0 &&
      !currentCountry
    ) {
      selectRandomCountry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryData, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCountry || !countryData) return;

    const correctName = countryData.names[currentCountry];
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectName = correctName.toLowerCase();

    const correct = normalizedUserAnswer === normalizedCorrectName;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
    }

    // Move to next country after 2 seconds regardless of correct/incorrect
    setTimeout(() => {
      selectRandomCountry();
    }, 2000);
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1/3 z-10 pointer-events-auto">
        <div className="p-6 flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="h-9 px-2 py-1 bg-black/40 backdrop-blur-sm border border-white/20 rounded-md text-white/80 hover:text-white hover:bg-white/20 transition-colors text-sm font-medium flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
          <div className="text-white/80 text-sm">
            Score: {score} | Round: {round}
          </div>
        </div>
      </div>

      <div
        id="map-container"
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full"
      />
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-1000">
          <div className="text-lg font-medium text-white">
            Loading countries...
          </div>
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-1000">
          <div className="text-center">
            <div className="text-lg font-medium text-red-400 mb-2">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      ) : (
        <MapProvider
          mapContainerRef={mapContainerRef}
          initialViewState={{
            longitude: 4,
            latitude: 60,
            zoom: 3.2,
            pitch: 60,
          }}
        >
          <GameMap
            currentCountry={currentCountry}
            countryCoordinates={countryData?.coordinates || null}
          />
        </MapProvider>
      )}

      {/* Input form */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-3000 pointer-events-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-4 flex items-center gap-4"
        >
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Enter country name..."
            className="bg-transparent border border-white/20 rounded-md px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 min-w-[300px]"
            disabled={isCorrect === true}
          />
          <button
            type="submit"
            disabled={!userAnswer || isCorrect === true}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
          {isCorrect === true && (
            <span className="text-green-400 font-semibold">Correct!</span>
          )}
          {isCorrect === false && (
            <span className="text-red-400 font-semibold">
              Wrong! The answer is{" "}
              {currentCountry && countryData
                ? countryData.names[currentCountry]
                : ""}
            </span>
          )}
        </form>
      </div>
    </div>
  );
}

function GameMap({
  currentCountry,
  countryCoordinates,
}: {
  currentCountry: string | null;
  countryCoordinates: Record<string, [number, number]> | null;
}) {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;

    const hideLabels = () => {
      try {
        const style = map.getStyle();
        if (!style || !style.layers) return;

        style.layers.forEach((layer) => {
          if (
            layer.type === "symbol" &&
            layer.id &&
            (layer.id.includes("country") ||
              layer.id.includes("place-label") ||
              layer.id.includes("country-label"))
          ) {
            try {
              map.setLayoutProperty(layer.id, "visibility", "none");
            } catch (e) {
              // Layer might not exist or already be hidden
            }
          }
        });
      } catch (e) {
        console.warn("Error hiding labels:", e);
      }
    };

    if (!map.isStyleLoaded()) {
      map.once("load", () => {
        hideLabels();
      });
    } else {
      hideLabels();
    }
  }, [map]);

  useEffect(() => {
    if (!map || !currentCountry) return;

    const setupCountryHighlight = () => {
      try {
        // Remove existing layers
        if (map.getLayer("game-country-border")) {
          map.removeLayer("game-country-border");
        }
        if (map.getLayer("game-country-highlight")) {
          map.removeLayer("game-country-highlight");
        }
        if (map.getSource("game-countries")) {
          map.removeSource("game-countries");
        }

        // Add source
        map.addSource("game-countries", {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        });

        const filter: any[] = ["==", "iso_3166_1", currentCountry];

        // Add border layer
        map.addLayer({
          id: "game-country-border",
          type: "line",
          source: "game-countries",
          "source-layer": "country_boundaries",
          filter: filter,
          paint: {
            "line-color": "#f59e0b",
            "line-width": 1.5,
            "line-opacity": 1,
          },
        });
      } catch (e) {
        console.warn("Error setting up country highlight:", e);
      }
    };

    const focusOnCountry = () => {
      if (!countryCoordinates) return;
      const coords = countryCoordinates[currentCountry];
      if (!coords) return;

      map.flyTo({
        center: coords,
        zoom: 4,
        duration: 2000,
      });
    };

    if (!map.isStyleLoaded()) {
      map.once("load", () => {
        setupCountryHighlight();
        focusOnCountry();
      });
      return;
    }

    setupCountryHighlight();
    focusOnCountry();

    return () => {
      try {
        if (map.getLayer("game-country-border")) {
          map.removeLayer("game-country-border");
        }
        if (map.getSource("game-countries")) {
          map.removeSource("game-countries");
        }
      } catch (e) {
        console.warn("Error cleaning up game layers:", e);
      }
    };
  }, [map, currentCountry]);

  return null;
}
