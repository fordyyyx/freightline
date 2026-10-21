import { type Coordinates } from "./towns.ts";
import bboxClip from "@turf/bbox-clip";
import simplify from "@turf/simplify";
import type {
  Feature,
  FeatureCollection,
  Geometry,
  Polygon,
  MultiPolygon,
  LineString,
  MultiLineString,
} from "geojson";

const KM_PER_DEGREE = 111.32;

export type ClippableGeometry =
  Polygon | MultiPolygon | LineString | MultiLineString;

function isEmpty(geometry: Geometry): boolean {
  if (!("coordinates" in geometry)) {
    return true;
  }
  return geometry.coordinates.flat(Infinity).length === 0;
}

function removeEmptyParts(geometry: Geometry): Geometry | undefined {
  switch (geometry.type) {
    case "MultiPolygon": {
      const parts = geometry.coordinates.filter(
        (part) => part.flat(Infinity).length > 0,
      );
      return parts.length > 0 ? { ...geometry, coordinates: parts } : undefined;
    }
    case "MultiLineString": {
      const parts = geometry.coordinates.filter((part) => part.length > 0);
      return parts.length > 0 ? { ...geometry, coordinates: parts } : undefined;
    }
    default:
      return isEmpty(geometry) ? undefined : geometry;
  }
}

export function clipAndSimplify(
  collection: FeatureCollection<ClippableGeometry>,
  box: BoundingBox,
  tolerance: number,
): FeatureCollection {
  const features: Feature[] = [];

  for (const feature of collection.features) {
    const clipped = bboxClip(feature, box);
    const geometry = removeEmptyParts(clipped.geometry);
    if (geometry == undefined) {
      continue;
    }
    const simplified = simplify(geometry, { tolerance, highQuality: false });
    features.push({
      type: "Feature",
      properties: {},
      geometry: simplified,
    });
  }

  return { type: "FeatureCollection", features };
}

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
