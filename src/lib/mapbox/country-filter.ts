import type { FilterSpecification } from "mapbox-gl";

// country-boundaries-v1 ships overlapping polygons per worldview, so without
// pinning one, disputed areas (e.g. Morocco/Western Sahara) get drawn twice.
export function countryFilter(codes: string[]): FilterSpecification {
  return [
    "all",
    ["match", ["get", "iso_3166_1"], codes.length ? codes : [""], true, false],
    [
      "any",
      ["==", ["get", "worldview"], "all"],
      ["in", "US", ["get", "worldview"]],
    ],
  ];
}
