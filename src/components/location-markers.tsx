"use client";

import { useEffect, useRef, useState } from "react";
import { useMap } from "@/context/map-context";
import mapboxgl from "mapbox-gl";
import { markersData } from "@/data/travel";
import { cityToImages } from "@/data/city-images";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ShuffleText from "@/components/shuffle-text";

type ViewMode = "gallery" | "scratch-map" | "flights";

type LocationMarkersProps = {
  viewMode: ViewMode;
};

export default function LocationMarkers({ viewMode }: LocationMarkersProps) {
  const { map } = useMap();
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    images: string[];
  } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCardVisible, setIsCardVisible] = useState(false);

  useEffect(() => {
    if (!map) return;

    const addMarkers = () => {
      // Only create markers if they don't exist yet
      if (markersRef.current.length > 0) return;

      // Create markers for each location using default Mapbox marker
      const newMarkers: mapboxgl.Marker[] = [];
      markersData.forEach((markerData) => {
        const marker = new mapboxgl.Marker()
          .setLngLat([markerData.lng, markerData.lat])
          .addTo(map);

        // Add click handler
        const element = marker.getElement();
        if (element) {
          element.style.cursor = "pointer";
          element.addEventListener("click", () => {
            const images = cityToImages[markerData.text] || [];
            setSelectedLocation({
              name: markerData.text,
              images,
            });
            setCurrentImageIndex(0);
          });
        }

        newMarkers.push(marker);
      });

      markersRef.current = newMarkers;
    };

    // Wait for map to be fully loaded
    if (map.loaded()) {
      addMarkers();
    } else {
      map.once("load", addMarkers);
    }

    return () => {
      // Only cleanup on unmount, not on viewMode change
      // Markers will be reused and visibility toggled instead
    };
  }, [map]);

  // Toggle marker visibility based on viewMode
  useEffect(() => {
    markersRef.current.forEach((marker) => {
      const element = marker.getElement();
      if (element) {
        if (viewMode === "gallery") {
          element.style.display = "block";
        } else if (viewMode === "flights" || viewMode === "scratch-map") {
          element.style.display = "none";
        }
      }
    });
  }, [viewMode]);

  // Reset image index and animate card when location changes
  useEffect(() => {
    if (selectedLocation) {
      setCurrentImageIndex(0);
      setIsCardVisible(true);
    } else {
      setIsCardVisible(false);
    }
  }, [selectedLocation]);

  // Handle click outside to close card
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!selectedLocation || viewMode !== "gallery") return;

    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setSelectedLocation(null);
      }
    };

    // Add event listener after a short delay to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedLocation, viewMode]);

  if (viewMode !== "gallery" || !selectedLocation) return null;

  const currentImage = selectedLocation.images[currentImageIndex];
  const hasImages = selectedLocation.images.length > 0;
  const canGoLeft = currentImageIndex > 0;
  const canGoRight = currentImageIndex < selectedLocation.images.length - 1;

  const handlePrevious = () => {
    if (canGoLeft) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoRight) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  return (
    <div
      className={`fixed top-6 right-6 z-3000 pointer-events-auto transition-all duration-300 ${
        isCardVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
      }`}
    >
      <div
        ref={cardRef}
        className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl w-[500px] max-w-[90vw] overflow-hidden"
      >
        {currentImage ? (
          <img
            src={currentImage}
            alt={`${selectedLocation.name} ${currentImageIndex + 1}`}
            className="w-full h-[400px] object-cover"
          />
        ) : (
          <div className="w-full h-[400px] bg-gray-50 border-b border-white/20 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image available</span>
          </div>
        )}
        <div className="flex items-center justify-between pl-6 pr-4 py-4">
          <h2 className="text-3xl font-bold text-white uppercase">
            <ShuffleText
              text={selectedLocation.name}
              style={{ fontFamily: "var(--font-space-mono), monospace" }}
            />
          </h2>
          {hasImages && selectedLocation.images.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={!canGoLeft}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={!canGoRight}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
