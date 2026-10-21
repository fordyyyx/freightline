import {
  qidFromUri,
  parsePoint,
  latestPopulation,
  type PopulationFigure,
  type WikidataRow,
  buildTowns,
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

function row(options: {
  qid: string;
  name: string;
  population?: string;
  date?: string;
  countryCode?: string;
  noCountry?: boolean;
  location?: string;
}): WikidataRow {
  const result: WikidataRow = {
    place: { value: `http://www.wikidata.org/entity/${options.qid}` },
    placeLabel: { value: options.name },
    location: { value: options.location ?? "Point(-4.1427 50.3755)" },
  };

  if (!options.noCountry) {
    result.countryCode = { value: options.countryCode ?? "GB" };
  }
  if (options.population !== undefined) {
    result.population = { value: options.population };
  }
  if (options.date !== undefined) {
    result.popDate = { value: options.date };
  }

  return result;
}

describe("buildTowns", () => {
  it("combines several rows for one place into one town", () => {
    const rows: WikidataRow[] = [
      row({
        qid: "Q1",
        name: "Alpha",
        population: "6000",
        date: "2001-04-29T00:00:00Z",
      }),
      row({
        qid: "Q1",
        name: "Alpha",
        population: "7000",
        date: "2011-03-27T00:00:00Z",
      }),
      row({
        qid: "Q1",
        name: "Alpha",
        population: "8000",
        date: "2021-03-21T00:00:00Z",
      }),
    ];

    const { towns, missingPopulation } = buildTowns(rows, 5000);

    expect(towns).toHaveLength(1);
    expect(towns[0]?.population).toEqual(8000);
    expect(missingPopulation).toEqual([]);
  });

  it("uses the latest figure even when it is smaller", () => {
    const rows: WikidataRow[] = [
      row({
        qid: "Q1",
        name: "Alpha",
        population: "6000",
        date: "2011-03-27T00:00:00Z",
      }),
      row({
        qid: "Q1",
        name: "Alpha",
        population: "5500",
        date: "2021-03-21T00:00:00Z",
      }),
    ];

    const { towns, missingPopulation } = buildTowns(rows, 5000);

    expect(towns).toHaveLength(1);
    expect(towns[0]?.population).toEqual(5500);
    expect(missingPopulation).toEqual([]);
  });

  it("keeps separate places separate", () => {
    const rows: WikidataRow[] = [
      row({ qid: "Q1", name: "Alpha", population: "6000" }),
      row({ qid: "Q2", name: "Beta", population: "7000" }),
    ];

    const { towns, missingPopulation } = buildTowns(rows, 5000);

    expect(towns).toHaveLength(2);
    expect(missingPopulation).toEqual([]);
  });

  it("returns empty lists for no rows", () => {
    const { towns, missingPopulation } = buildTowns([], 5000);

    expect(towns).toEqual([]);
    expect(missingPopulation).toEqual([]);
  });

  it("drops a place below the minimum", () => {
    const rows: WikidataRow[] = [
      row({ qid: "Q1", name: "Alpha", population: "4999" }),
    ];

    const { towns, missingPopulation } = buildTowns(rows, 5000);

    expect(towns).toEqual([]);
    expect(missingPopulation).toEqual([]);
  });

  it("includes a place exactly at the minimum", () => {
    const rows: WikidataRow[] = [
      row({ qid: "Q1", name: "Alpha", population: "5000" }),
    ];

    const { towns, missingPopulation } = buildTowns(rows, 5000);

    expect(towns).toHaveLength(1);
    expect(missingPopulation).toEqual([]);
  });

  it("reports a place with no population", () => {
    const rows: WikidataRow[] = [row({ qid: "Q1", name: "Alpha" })];

    const { towns, missingPopulation } = buildTowns(rows, 5000);

    expect(towns).toEqual([]);
    expect(missingPopulation).toHaveLength(1);
    expect(missingPopulation).toEqual(["Alpha (Q1)"]);
  });

  it("ignores an invalid figure and uses a valid one", () => {
    const rows: WikidataRow[] = [
      row({
        qid: "Q1",
        name: "Alpha",
        population: "abc",
        date: "2021-01-01T00:00:00Z",
      }),
      row({
        qid: "Q1",
        name: "Alpha",
        population: "6000",
        date: "2011-01-01T00:00:00Z",
      }),
    ];

    const { towns, missingPopulation } = buildTowns(rows, 5000);

    expect(towns).toHaveLength(1);
    expect(towns[0]?.population).toEqual(6000);
    expect(missingPopulation).toEqual([]);
  });

  it("reports a place whose only figure is invalid", () => {
    const rows: WikidataRow[] = [
      row({ qid: "Q1", name: "Alpha", population: "abc" }),
    ];

    const { towns, missingPopulation } = buildTowns(rows, 5000);

    expect(towns).toEqual([]);
    expect(missingPopulation).toHaveLength(1);
    expect(missingPopulation).toEqual(["Alpha (Q1)"]);
  });

  it("throws for a qualifying place with no country code", () => {
    const rows: WikidataRow[] = [
      row({ qid: "Q1", name: "Alpha", population: "6000", noCountry: true }),
    ];

    expect(() => buildTowns(rows, 5000)).toThrow("No country code for");
  });

  it("ignores a missing country code on a small place", () => {
    const rows: WikidataRow[] = [
      row({ qid: "Q1", name: "Alpha", population: "100", noCountry: true }),
    ];

    const { towns, missingPopulation } = buildTowns(rows, 5000);

    expect(towns).toEqual([]);
    expect(missingPopulation).toEqual([]);
  });

  it("throws for a qualifying place with no name", () => {
    const rows: WikidataRow[] = [
      row({ qid: "Q999", name: "Q999", population: "6000" }),
    ];

    expect(() => buildTowns(rows, 5000)).toThrow("Place has no name");
  });

  it("ignores a missing name on a small place", () => {
    const rows: WikidataRow[] = [
      row({ qid: "Q999", name: "Q999", population: "100" }),
    ];

    const { towns, missingPopulation } = buildTowns(rows, 5000);

    expect(towns).toEqual([]);
    expect(missingPopulation).toEqual([]);
  });

  it("builds a town with all six fields", () => {
    const rows: WikidataRow[] = [
      row({
        qid: "Q12193",
        name: "Brest",
        population: "142346",
        date: "2023-01-01T00:00:00Z",
        countryCode: "FR",
        location: "Point(-4.4861 48.3905)",
      }),
    ];

    const { towns, missingPopulation } = buildTowns(rows, 5000);

    expect(towns).toEqual([
      {
        id: "Q12193",
        name: "Brest",
        countryCode: "FR",
        lat: 48.3905,
        lon: -4.4861,
        population: 142346,
      },
    ]);
    expect(missingPopulation).toEqual([]);
  });

  it("sorts towns by population, largest first", () => {
    const rows: WikidataRow[] = [
      row({ qid: "Q1", name: "Alpha", population: "6000" }),
      row({ qid: "Q2", name: "Beta", population: "9000" }),
      row({ qid: "Q3", name: "Gamma", population: "7000" }),
    ];

    const { towns, missingPopulation } = buildTowns(rows, 5000);

    expect(towns).toHaveLength(3);
    expect(towns[0]?.population).toBe(9000);
    expect(towns[1]?.population).toBe(7000);
    expect(towns[2]?.population).toBe(6000);
    expect(missingPopulation).toEqual([]);
  });
});
