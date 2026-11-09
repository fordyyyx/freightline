import { balance } from "./balance.ts";

const EARTH_RADIUS_KM = 6371.009;

export interface Coordinates {
  lat: number;
  lon: number;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function greatCircleKm(a: Coordinates, b: Coordinates): number {
  const aLatRadians = toRadians(a.lat);
  const aLonRadians = toRadians(a.lon);
  const bLatRadians = toRadians(b.lat);
  const bLonRadians = toRadians(b.lon);

  const dLat = bLatRadians - aLatRadians;
  const dLon = bLonRadians - aLonRadians;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLatRadians) * Math.cos(bLatRadians) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(Math.min(1, h)));
}

export function roadKm(a: Coordinates, b: Coordinates): number {
  return greatCircleKm(a, b) * balance.world.roadFactor;
}
