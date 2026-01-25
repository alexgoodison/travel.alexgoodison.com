"use client";

import { useRef, useState } from "react";
import MapProvider from "@/lib/mapbox/provider";
import LocationMarkers from "@/components/location-markers";
import FlightPaths from "@/components/flight-paths";
import ScratchMapLayer from "@/components/scratch-map-layer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plane, Map, Images, Gamepad2 } from "lucide-react";
import { useRouter } from "next/navigation";

type ViewMode = "gallery" | "scratch-map" | "flights";

export default function Home() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const [selectedYear, setSelectedYear] = useState<string>("2025");

  const handleTabChange = (value: string) => {
    if (value === "game") {
      router.push("/game");
    } else {
      setViewMode(value as ViewMode);
    }
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1/3 z-10 pointer-events-auto">
        {/* Mode Tabs */}
        <div className="p-6 flex items-center gap-2">
          <Tabs
            value={viewMode}
            onValueChange={handleTabChange}
            className="w-auto"
          >
            <TabsList className="bg-black/40 backdrop-blur-sm border border-white/20">
              <TabsTrigger
                value="gallery"
                className="text-white/80 hover:text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                <Images className=" h-4 w-4" />
                Gallery
              </TabsTrigger>
              <TabsTrigger
                value="scratch-map"
                className="text-white/80 hover:text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                <Map className="h-4 w-4" />
                Scratch Map
              </TabsTrigger>
              <TabsTrigger
                value="flights"
                className="text-white/80 hover:text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                <Plane className="h-4 w-4" />
                Flights
              </TabsTrigger>
              <TabsTrigger
                value="game"
                className="text-white/80 hover:text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                <Gamepad2 className="h-4 w-4" />
                Game
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {viewMode === "flights" && (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-9! w-[120px] bg-black/40! backdrop-blur-sm border-white/20! text-white/80 hover:text-white data-placeholder:text-white/80 px-2 py-1 [&_svg]:text-white/80">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className="bg-black/40 backdrop-blur-sm border border-white/20">
                <SelectItem
                  value="2026"
                  className="text-white/80 hover:text-white hover:bg-white/20 focus:bg-white/20"
                >
                  2026
                </SelectItem>
                <SelectItem
                  value="2025"
                  className="text-white/80 hover:text-white hover:bg-white/20 focus:bg-white/20"
                >
                  2025
                </SelectItem>
                <SelectItem
                  value="2024"
                  className="text-white/80 hover:text-white hover:bg-white/20 focus:bg-white/20"
                >
                  2024
                </SelectItem>
                <SelectItem
                  value="2023"
                  className="text-white/80 hover:text-white hover:bg-white/20 focus:bg-white/20"
                >
                  2023
                </SelectItem>
                <SelectItem
                  value="2022"
                  className="text-white/80 hover:text-white hover:bg-white/20 focus:bg-white/20"
                >
                  2022
                </SelectItem>
                <SelectItem
                  value="2021"
                  className="text-white/80 hover:text-white hover:bg-white/20 focus:bg-white/20"
                >
                  2021
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Globe map - full screen container, globe positioned lower */}
      <div
        id="map-container"
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full"
      />
      <MapProvider
        mapContainerRef={mapContainerRef}
        initialViewState={{
          longitude: 4,
          latitude: 60,
          zoom: 3.2,
          pitch: 45,
        }}
      >
        <LocationMarkers viewMode={viewMode} />
        <FlightPaths viewMode={viewMode} selectedYear={selectedYear} />
        <ScratchMapLayer viewMode={viewMode} />
      </MapProvider>
    </div>
  );
}
