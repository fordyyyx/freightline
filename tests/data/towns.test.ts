import { describe, it, expect } from "vitest";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import towns from "../../src/data/towns.json";
import landText from "../../src/data/land.geojson?raw";

const land = JSON.parse(landText) as FeatureCollection<Polygon | MultiPolygon>;

function isOnLand(lat: number, lon: number): boolean {
  return land.features.some((feature) =>
    booleanPointInPolygon([lon, lat], feature),
  );
}

describe("towns.json", () => {
  it("has every town on land", () => {
    const notOnLand = towns.filter((town) => !isOnLand(town.lat, town.lon));
    expect(notOnLand.map((town) => town.name)).toEqual([]);
  });
});
