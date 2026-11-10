import type {
  FeatureCollection,
  Polygon,
  MultiPolygon,
  LineString,
  MultiLineString,
} from "geojson";
import { booleanPointInPolygon } from "@turf/boolean-point-in-polygon";
import nearestPointOnLine from "@turf/nearest-point-on-line";
import bearing from "@turf/bearing";
import destination from "@turf/destination";
import type { Coordinates } from "./towns.ts";

export function isOnLand(
  point: Coordinates,
  land: FeatureCollection<Polygon | MultiPolygon>,
): boolean {
  return land.features.some((feature) =>
    booleanPointInPolygon([point.lon, point.lat], feature),
  );
}

export function snapToLand(
  point: Coordinates,
  land: FeatureCollection<Polygon | MultiPolygon>,
  coast: FeatureCollection<LineString | MultiLineString>,
  options: { marginKm: number; maxSnapKm: number },
): Coordinates {
  if (isOnLand(point, land)) {
    return point;
  }
  const start: [number, number] = [point.lon, point.lat];
  let closest: ReturnType<typeof nearestPointOnLine> | undefined;
  for (const line of coast.features) {
    const nearest = nearestPointOnLine(line, start, {
      units: "kilometers",
    });
    if (
      closest === undefined ||
      nearest.properties.pointDistance < closest.properties.pointDistance
    ) {
      closest = nearest;
    }
  }
  if (closest === undefined) {
    throw new Error("Coastline has no features");
  }
  if (closest.properties.pointDistance + options.marginKm > options.maxSnapKm) {
    throw new Error(`Point too far from land: (${point.lat}, ${point.lon})`);
  }
  const direction = bearing(start, closest.geometry.coordinates);

  const moved = destination(
    start,
    closest.properties.pointDistance + options.marginKm,
    direction,
    { units: "kilometers" },
  );
  const [lon, lat] = moved.geometry.coordinates;
  const snapped = { lat, lon };
  if (!isOnLand(snapped, land)) {
    throw new Error(
      `New point is not on land: (${snapped.lat}, ${snapped.lon})`,
    );
  }

  return snapped;
}
