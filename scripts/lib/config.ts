import { type Coordinates } from "./towns.ts";

export interface PlacesConfig {
  centre: Coordinates;
  radiusKm: number;
  minPopulation: number;
}

function isNumber(x: unknown): x is number {
  return typeof x === "number" && !Number.isNaN(x);
}

export function parseConfig(value: unknown): PlacesConfig {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("config must be an object");
  }

  const config = value as Record<string, unknown>;

  const centre = config.centre;
  if (typeof centre !== "object" || centre === null) {
    throw new Error("centre must be an object with lat and lon");
  }
  const centreFields = centre as Record<string, unknown>;

  const lat = centreFields.lat;
  const lon = centreFields.lon;
  if (!isNumber(lat) || !isNumber(lon)) {
    throw new Error("centre.lat and centre.lon must be numbers");
  }

  const radiusKm = config.radiusKm;
  if (!isNumber(radiusKm) || radiusKm <= 0) {
    throw new Error("radiusKm must be a number greater than 0");
  }
  const minPopulation = config.minPopulation;
  if (!isNumber(minPopulation) || minPopulation < 0) {
    throw new Error("minPopulation must be a number of 0 or more");
  }

  return { centre: { lat, lon }, radiusKm, minPopulation };
}
