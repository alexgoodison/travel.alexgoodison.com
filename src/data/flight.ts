import { cities, type CityName, type Coordinate } from "./cities";

/**
 * A single flight leg. Coordinates and the destination country are
 * derived automatically from the shared `cities` constants.
 */
export class Flight {
  readonly origin: Coordinate;
  readonly destination: Coordinate;
  readonly originName: string;
  readonly destinationName: string;
  readonly countryCode: string;
  readonly airline: string;
  readonly upcoming: boolean;

  constructor(
    originName: CityName,
    destinationName: CityName,
    airline: string = "",
    upcoming: boolean = false,
  ) {
    const from = cities[originName];
    const to = cities[destinationName];
    this.origin = from.coordinates;
    this.destination = to.coordinates;
    this.originName = originName;
    this.destinationName = destinationName;
    this.countryCode = to.countryCode;
    this.airline = airline;
    this.upcoming = upcoming;
  }
}
