export const airlines = {
  AegeanAirlines: "Aegean Airlines",
  AerLingus: "Aer Lingus",
  BritishAirways: "British Airways",
  Delta: "Delta",
  EasyJet: "EasyJet",
  Eurowings: "Eurowings",
  Lufthansa: "Lufthansa",
  Norwegian: "Norwegian",
  Ryanair: "Ryanair",
  SAS: "SAS",
  UnitedAirlines: "United Airlines",
  Vueling: "Vueling",
} as const;

export type Airline = (typeof airlines)[keyof typeof airlines];
