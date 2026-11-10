import { describe, it, expect } from "vitest";
import type {
  FeatureCollection,
  LineString,
  MultiLineString,
  MultiPolygon,
  Polygon,
} from "geojson";
import { isOnLand, snapToLand } from "../../../scripts/lib/coast.ts";

const squareRing = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
  [0, 0],
];

const land: FeatureCollection<Polygon | MultiPolygon> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates: [squareRing] },
    },
  ],
};

const coast: FeatureCollection<LineString | MultiLineString> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: squareRing },
    },
  ],
};

const options = { marginKm: 0.3, maxSnapKm: 2 };

describe("isOnLand", () => {
  it("correctly returns for a point on land", () => {
    expect(isOnLand({ lat: 0.5, lon: 0.5 }, land)).toBe(true);
  });

  it("returns false for a point not on land", () => {
    expect(isOnLand({ lat: 0.5, lon: 1.5 }, land)).toBe(false);
  });
});

describe("snapToLand", () => {
  it("does not move a point already on land", () => {
    expect(snapToLand({ lat: 0.5, lon: 0.5 }, land, coast, options)).toEqual({
      lat: 0.5,
      lon: 0.5,
    });
  });

  it("moves a point in the sea on to the land", () => {
    const movedPoint = snapToLand(
      { lat: 0.5, lon: 1.005 },
      land,
      coast,
      options,
    );
    expect(isOnLand(movedPoint, land)).toBe(true);
  });

  it("moves a point in the sea to the nearest coast plus the margin", () => {
    const movedPoint = snapToLand(
      { lat: 0.5, lon: 1.005 },
      land,
      coast,
      options,
    );
    expect(movedPoint.lat).toBeCloseTo(0.5, 3);
    expect(movedPoint.lon).toBeCloseTo(1 - 0.3 / 111.2, 3);
  });

  it("throws for a town too far from the coast", () => {
    expect(() => {
      snapToLand({ lat: 0.5, lon: 1.1 }, land, coast, options);
    }).toThrow("Point too far from land");
  });

  it("throws for a town that ends up in the sea", () => {
    const stripRing = [
      [1, 0],
      [1.001, 0],
      [1.001, 1],
      [1, 1],
      [1, 0],
    ];

    const stripLand: FeatureCollection<Polygon | MultiPolygon> = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [stripRing] },
        },
      ],
    };

    const stripCoast: FeatureCollection<LineString | MultiLineString> = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: stripRing },
        },
      ],
    };

    expect(() => {
      snapToLand({ lat: 0.5, lon: 0.995 }, stripLand, stripCoast, options);
    }).toThrow("New point is not on land");
  });
});
