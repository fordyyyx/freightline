import { type Coordinates } from "./towns.ts";

const KM_PER_DEGREE = 111.32;

export type BoundingBox = [
  minLon: number,
  minLat: number,
  maxLon: number,
  maxLat: number,
];

export function boundingBox(
  centre: Coordinates,
  radiusKm: number,
): BoundingBox {
  const latDelta = radiusKm / KM_PER_DEGREE;
  const lonDelta =
    radiusKm / (KM_PER_DEGREE * Math.cos((centre.lat * Math.PI) / 180));
  const minLon = centre.lon - lonDelta;
  const maxLon = centre.lon + lonDelta;
  const minLat = Math.max(-90, centre.lat - latDelta);
  const maxLat = Math.min(90, centre.lat + latDelta);

  if (minLon < -180 || maxLon > 180) {
    throw new Error(
      "Play area crosses the 180 degree meridian, which is not supported yet",
    );
  }

  return [minLon, minLat, maxLon, maxLat];
}
