import { NextResponse } from "next/server";
import countriesData from "@/data/countries.json";

// Cache the result to avoid recalculating on every request
let cachedData: {
  coordinates: Record<string, [number, number]>;
  names: Record<string, string>;
  capitals: Record<string, string>;
  continents: Record<string, string>;
  codes: string[];
} | null = null;

export async function GET() {
  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  try {
    const coordinates: Record<string, [number, number]> = {};
    const names: Record<string, string> = {};
    const capitals: Record<string, string> = {};
    const continents: Record<string, string> = {};
    const codes: string[] = [];

    countriesData.forEach((country) => {
      if (
        country.country_code &&
        country.name &&
        country.latlng &&
        country.latlng.length >= 2
      ) {
        const [latitude, longitude] = country.latlng;
        coordinates[country.country_code] = [longitude, latitude];
        names[country.country_code] = country.name;
        if (country.capital) {
          capitals[country.country_code] = country.capital;
        }
        if (country.continent) {
          continents[country.country_code] = country.continent;
        }
        codes.push(country.country_code);
      }
    });

    const result = { coordinates, names, capitals, continents, codes };
    cachedData = result;

    console.log(`Returning ${codes.length} countries`);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching countries:", error);
    return NextResponse.json(
      {
        error: `Failed to fetch countries: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
