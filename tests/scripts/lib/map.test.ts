import {
  clipAndSimplify,
  type BoundingBox,
  boundingBox,
} from "../../../scripts/lib/map.ts";
import type {
  Feature,
  FeatureCollection,
  Polygon,
  MultiPolygon,
} from "geojson";
import { describe, it, expect } from "vitest";

describe("boundingBox", () => {
  it("extends latitude equally north and south", () => {
    const centre = { lat: 50.3755, lon: -4.1427 };

    const [, minLat, , maxLat] = boundingBox(centre, 100);

    expect(minLat).toBeCloseTo(49.4772, 3);
    expect(maxLat).toBeCloseTo(51.2738, 3);
  });

  it("extends longitude further than latitude away from the equator", () => {
    const centre = { lat: 50.3755, lon: -4.1427 };

    const [minLon, , maxLon] = boundingBox(centre, 100);

    expect(minLon).toBeCloseTo(-5.5512, 3);
    expect(maxLon).toBeCloseTo(-2.7342, 3);
  });

  it("extends latitude and longitude equally at the equator", () => {
    const centre = { lat: 0, lon: 0 };

    const [minLon, minLat, maxLon, maxLat] = boundingBox(centre, 100);

    expect(minLon).toBeCloseTo(-0.8983, 3);
    expect(minLat).toBeCloseTo(-0.8983, 3);
    expect(maxLon).toBeCloseTo(0.8983, 3);
    expect(maxLat).toBeCloseTo(0.8983, 3);
  });

  it("centres the box on the input", () => {
    const centre = { lat: 50.3755, lon: -4.1427 };

    const [minLon, minLat, maxLon, maxLat] = boundingBox(centre, 100);

    expect((minLat + maxLat) / 2).toBeCloseTo(50.3755, 3);
    expect((minLon + maxLon) / 2).toBeCloseTo(-4.1427, 3);
  });

  it("stores the minimums before the maximums", () => {
    const centre = { lat: 50.3755, lon: -4.1427 };

    const [minLon, minLat, maxLon, maxLat] = boundingBox(centre, 100);

    expect(minLon).toBeLessThan(maxLon);
    expect(minLat).toBeLessThan(maxLat);
  });

  it("caps latitude at the pole", () => {
    const centre = { lat: 89.5, lon: 0 };

    const [, , , maxLat] = boundingBox(centre, 100);

    expect(maxLat).toBe(90);
  });

  it("rejects a box that reaches past |180| near the pole", () => {
    const centre = { lat: 89.8, lon: 0 };

    expect(() => boundingBox(centre, 100)).toThrow(
      "Play area crosses the 180 degree meridian, which is not supported yet",
    );
  });

  it("rejects a box that crosses the 180 degree meridian", () => {
    const centre = { lat: -17.7, lon: 179.4 };

    expect(() => boundingBox(centre, 100)).toThrow(
      "Play area crosses the 180 degree meridian, which is not supported yet",
    );
  });
});

const BOX: BoundingBox = [0, 0, 10, 10];
const TOLERANCE = 0.0001;

function square(
  minLon: number,
  minLat: number,
  maxLon: number,
  maxLat: number,
  properties: Record<string, unknown> = {},
): Feature<Polygon> {
  return {
    type: "Feature",
    properties,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [minLon, minLat],
          [maxLon, minLat],
          [maxLon, maxLat],
          [minLon, maxLat],
          [minLon, minLat],
        ],
      ],
    },
  };
}

function collection(
  ...features: Feature<Polygon>[]
): FeatureCollection<Polygon> {
  return { type: "FeatureCollection", features };
}

function twoSquares(): Feature<MultiPolygon> {
  const inside = square(2, 2, 4, 4).geometry.coordinates;
  const outside = square(20, 20, 21, 21).geometry.coordinates;
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "MultiPolygon", coordinates: [inside, outside] },
  };
}

describe("clipAndSimplify", () => {
  it("keeps a shape inside the box", () => {
    const input = collection(square(2, 2, 4, 4));

    const result = clipAndSimplify(input, BOX, TOLERANCE);

    expect(result.features).toHaveLength(1);
  });

  it("removes a shape that is outside the box", () => {
    const input = collection(square(20, 20, 21, 21));

    const result = clipAndSimplify(input, BOX, TOLERANCE);

    expect(result.features).toHaveLength(0);
  });

  it("clips a shapre that crosses the edge of the box", () => {
    const input = collection(square(5, 5, 15, 15));

    const result = clipAndSimplify(input, BOX, TOLERANCE);

    expect(result.features).toHaveLength(1);
    const geometry = result.features[0]?.geometry;
    if (geometry?.type !== "Polygon") {
      throw new Error("Expected a polygon");
    }
    const points = geometry.coordinates.flat();
    const longitudes = points.map((point) => point[0]);
    const latitudes = points.map((point) => point[1]);
    expect(Math.max(...longitudes)).toBe(10);
    expect(Math.max(...latitudes)).toBe(10);
  });

  it("drops the original properties", () => {
    const input = collection(square(2, 2, 4, 4, { name: "Test island" }));

    const result = clipAndSimplify(input, BOX, TOLERANCE);

    expect(result.features[0]?.properties).toEqual({});
  });

  it("removes empty parts left by clipping a multipolygon", () => {
    const input: FeatureCollection<MultiPolygon> = {
      type: "FeatureCollection",
      features: [twoSquares()],
    };

    const result = clipAndSimplify(input, BOX, TOLERANCE);

    const geometry = result.features[0]?.geometry;
    if (geometry?.type !== "MultiPolygon") {
      throw new Error("Expected a multipolygon");
    }
    expect(geometry.coordinates).toHaveLength(1);
  });
});
