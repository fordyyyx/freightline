import {
  qidFromUri,
  parsePoint,
  latestPopulation,
  type PopulationFigure,
} from "../../../scripts/lib/towns.ts";
import { describe, it, expect } from "vitest";

describe("qidFromUri", () => {
  it("returns the Q-number from an entity URI", () => {
    const uri = "http://www.wikidata.org/entity/Q43382";

    const result = qidFromUri(uri);

    expect(result).toBe("Q43382");
  });

  it("throws for a property URI", () => {
    expect(() => qidFromUri("http://www.wikidata.org/entity/P625")).toThrow();
  });

  it("throws for a nonsense string", () => {
    expect(() => qidFromUri("nonsense")).toThrow();
  });

  it("throws for a URI ending in a slash", () => {
    expect(() => qidFromUri(".../entity/")).toThrow();
  });

  it("throws for a Q-number with junk after", () => {
    expect(() => qidFromUri(".../Q43382abc")).toThrow();
  });
});

describe("parsePoint", () => {
  it("returns the coordinate from a given Point", () => {
    const point = "Point(-4.1427 50.3755)";

    const result = parsePoint(point);

    expect(result).toEqual({ lat: 50.3755, lon: -4.1427 });
  });

  it("parses negative values correctly", () => {
    const point = "Point(-15.3756 -50.3755)";

    const result = parsePoint(point);

    expect(result).toEqual({ lat: -50.3755, lon: -15.3756 });
  });

  it("throws for both coordinates being empty", () => {
    expect(() => parsePoint("Point( )")).toThrow(
      "Not a valid coordinate point",
    );
  });

  it("throws for one coordinate being empty", () => {
    expect(() => parsePoint("Point(5 )")).toThrow(
      "Not a valid coordinate point",
    );
  });

  it("throws for only one part being present", () => {
    expect(() => parsePoint("Point(5)")).toThrow(
      "Not a valid coordinate point",
    );
  });

  it("throws for too many parts being present", () => {
    expect(() => parsePoint("Point(1 2 3)")).toThrow(
      "Not a valid coordinate point",
    );
  });

  it("throws for either part not being a number", () => {
    expect(() => parsePoint("Point(abc 50)")).toThrow(
      "Not a valid coordinate point",
    );
  });

  it("throws for a latitude above 90", () => {
    expect(() => parsePoint("Point(0 91)")).toThrow("Latitude out of range");
  });

  it("throws for a longitude above 180", () => {
    expect(() => parsePoint("Point(181 0)")).toThrow("Longitude out of range");
  });

  it("parses for boundary values", () => {
    expect(parsePoint("Point(180 90)")).toEqual({ lat: 90, lon: 180 });
    expect(parsePoint("Point(-180 -90)")).toEqual({ lat: -90, lon: -180 });
  });
});

describe("latestPopulation", () => {
  it("returns undefined for an empty list", () => {
    expect(latestPopulation([])).toBeUndefined();
  });

  it("returns the figure for a single figure", () => {
    expect(
      latestPopulation([{ population: 6000, date: "2011-03-27T00:00:00Z" }]),
    ).toBe(6000);
  });

  it("returns the latest population figure even if it is smaller", () => {
    const figures: PopulationFigure[] = [
      { population: 6000, date: "2011-03-27T00:00:00Z" },
      { population: 5500, date: "2021-03-21T00:00:00Z" },
    ];

    expect(latestPopulation(figures)).toBe(5500);
  });

  it("returns the same value regardless of the order", () => {
    const figures: PopulationFigure[] = [
      { population: 6000, date: "2011-03-27T00:00:00Z" },
      { population: 5500, date: "2021-03-21T00:00:00Z" },
    ];
    expect(latestPopulation(figures)).toBe(5500);
    expect(latestPopulation([...figures].reverse())).toBe(5500);
  });

  it("returns the largest figure when no dates are given", () => {
    const figures: PopulationFigure[] = [
      { population: 6000 },
      { population: 5500 },
    ];
    expect(latestPopulation(figures)).toBe(6000);
  });

  it("returns the latest dated figure even if a greater, undated figure exists", () => {
    const figures: PopulationFigure[] = [
      { population: 6000 },
      { population: 5500, date: "2021-03-21T00:00:00Z" },
    ];
    expect(latestPopulation(figures)).toBe(5500);
  });
});
