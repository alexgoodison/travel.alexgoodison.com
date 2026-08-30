export type Coordinate = [number, number];

export type City = {
  /** [longitude, latitude] */
  coordinates: Coordinate;
  /** ISO 3166-1 alpha-2 country code the city is in */
  countryCode: string;
};

export const cities = {
  Dublin: { coordinates: [-6.2603, 53.3498], countryCode: "IE" },
  Vienna: { coordinates: [16.3713, 48.2081], countryCode: "AT" },
  Shannon: { coordinates: [-8.9215, 52.7012], countryCode: "IE" },
  London: { coordinates: [-0.1278, 51.5074], countryCode: "GB" },
  "San Francisco": { coordinates: [-122.4194, 37.7749], countryCode: "US" },
  Nice: { coordinates: [7.262, 43.7102], countryCode: "FR" },
  Chicago: { coordinates: [-87.6298, 41.8781], countryCode: "US" },
  "St. Louis": { coordinates: [-90.1994, 38.627], countryCode: "US" },
  Cork: { coordinates: [-8.4756, 51.8985], countryCode: "IE" },
  Venice: { coordinates: [12.3155, 45.4408], countryCode: "IT" },
  Milan: { coordinates: [9.19, 45.4642], countryCode: "IT" },
  "Milan Malpensa": { coordinates: [8.7281, 45.6306], countryCode: "IT" },
  "Milan Bergamo": { coordinates: [9.7042, 45.6739], countryCode: "IT" },
  Amsterdam: { coordinates: [4.9041, 52.3676], countryCode: "NL" },
  Stockholm: { coordinates: [18.0686, 59.3293], countryCode: "SE" },
  Valencia: { coordinates: [-0.75328, 39.48401], countryCode: "ES" },
  Paris: { coordinates: [2.3522, 48.8566], countryCode: "FR" },
  "Paris Orly": { coordinates: [2.3794, 48.7233], countryCode: "FR" },
  "Paris CDG": { coordinates: [2.5479, 49.0097], countryCode: "FR" },
  Copenhagen: { coordinates: [12.5683, 55.6761], countryCode: "DK" },
  Madrid: { coordinates: [-3.3655, 40.4011], countryCode: "ES" },
  Liverpool: { coordinates: [-2.97794, 53.41058], countryCode: "GB" },
  Budapest: { coordinates: [19.0402, 47.4979], countryCode: "HU" },
  Bari: { coordinates: [16.8719, 41.1177], countryCode: "IT" },
  Seville: { coordinates: [-5.9845, 37.3891], countryCode: "ES" },
  "New York": { coordinates: [-74.006, 40.7128], countryCode: "US" },
  "Punta Cana": { coordinates: [-68.4055, 18.582], countryCode: "DO" },
  Frankfurt: { coordinates: [8.6821, 50.1109], countryCode: "DE" },
  Barcelona: { coordinates: [2.1734, 41.3851], countryCode: "ES" },
  Cologne: { coordinates: [7.1427, 50.8659], countryCode: "DE" },
  "London Heathrow": { coordinates: [-0.4543, 51.47], countryCode: "GB" },
  "London Gatwick": { coordinates: [-0.1903, 51.1537], countryCode: "GB" },
  "London Stansted": { coordinates: [0.2352, 51.886], countryCode: "GB" },
  "London Luton": { coordinates: [-0.3717, 51.8747], countryCode: "GB" },
  Santorini: { coordinates: [25.4794, 36.3992], countryCode: "GR" },
  Athens: { coordinates: [23.9445, 37.9364], countryCode: "GR" },
  Brussels: { coordinates: [4.4844, 50.9014], countryCode: "BE" },
  Boston: { coordinates: [-71.0096, 42.3656], countryCode: "US" },
  Asturias: { coordinates: [-6.0344, 43.5636], countryCode: "ES" },
} satisfies Record<string, City>;

export type CityName = keyof typeof cities;
