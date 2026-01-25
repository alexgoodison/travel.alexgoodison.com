"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapContext } from "@/context/map-context";

type MapProviderProps = {
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  initialViewState: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch?: number;
  };
  children?: React.ReactNode;
};

export default function MapProvider({
  mapContainerRef,
  initialViewState,
  children,
}: MapProviderProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("NEXT_PUBLIC_MAPBOX_TOKEN is not set");
      return;
    }

    const styleId = process.env.NEXT_PUBLIC_MAPBOX_STYLE_ID;
    if (!styleId) {
      console.error("NEXT_PUBLIC_MAPBOX_STYLE_ID is not set");
      return;
    }

    mapboxgl.accessToken = token;

    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: styleId,
      center: [initialViewState.longitude, initialViewState.latitude],
      zoom: initialViewState.zoom,
      pitch: initialViewState.pitch ?? 0,
      minZoom: 2.5,
      attributionControl: false,
      logoPosition: "bottom-right",
      projection: "globe",
    });

    mapRef.current = mapInstance;
    setMap(mapInstance);

    mapInstance.on("load", () => {
      setLoaded(true);
    });

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        mapRef.current = null;
        setMap(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapContainerRef]);

  return (
    <MapContext.Provider value={{ map }}>
      {children}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-1000">
          <div className="text-lg font-medium">Loading map...</div>
        </div>
      )}
    </MapContext.Provider>
  );
}
