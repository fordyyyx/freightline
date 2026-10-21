import { parseConfig } from "../../../scripts/lib/config.ts";
import { describe, it, expect } from "vitest";

describe("parseConfig", () => {
  it("returns the right object for a valid config", () => {
    const input = {
      centre: { lat: 50.3755, lon: -4.1427 },
      radiusKm: 100,
      minPopulation: 5000,
    };

    const config = parseConfig(input);

    expect(config).toEqual({
      centre: { lat: 50.3755, lon: -4.1427 },
      radiusKm: 100,
      minPopulation: 5000,
    });
  });

  it("returns a valid object for a config with extra fields", () => {
    const input = {
      centre: { lat: 50.3755, lon: -4.1427 },
      radiusKm: 100,
      minPopulation: 5000,
      colour: "blue",
    };

    const config = parseConfig(input);

    expect(config).toEqual({
      centre: { lat: 50.3755, lon: -4.1427 },
      radiusKm: 100,
      minPopulation: 5000,
    });
  });

  it("throws if the config is null", () => {
    expect(() => parseConfig(null)).toThrow("config must be an object");
  });

  it("throws if the config is a string", () => {
    expect(() => parseConfig("Plymouth")).toThrow("config must be an object");
  });

  it("throws if the config is an array", () => {
    expect(() => parseConfig([])).toThrow("config must be an object");
  });

  it("throws if the config is missing a centre", () => {
    const input = { radiusKm: 100, minPopulation: 5000 };

    expect(() => parseConfig(input)).toThrow(
      "centre must be an object with lat and lon",
    );
  });

  it("throws if the centre is not an object", () => {
    const input = { centre: "Plymouth", radiusKm: 100, minPopulation: 5000 };

    expect(() => parseConfig(input)).toThrow(
      "centre must be an object with lat and lon",
    );
  });

  it("throws if lat is not a number", () => {
    const input = {
      centre: { lat: "50.3755", lon: -4.1427 },
      radiusKm: 100,
      minPopulation: 5000,
    };

    expect(() => parseConfig(input)).toThrow(
      "centre.lat and centre.lon must be numbers",
    );
  });

  it("throws if lon is missing", () => {
    const input = {
      centre: { lat: 50.3755 },
      radiusKm: 100,
      minPopulation: 5000,
    };

    expect(() => parseConfig(input)).toThrow(
      "centre.lat and centre.lon must be numbers",
    );
  });

  it("throws if radiusKm is a string", () => {
    const input = {
      centre: { lat: 50.3755, lon: -4.1427 },
      radiusKm: "100",
      minPopulation: 5000,
    };

    expect(() => parseConfig(input)).toThrow(
      "radiusKm must be a number greater than 0",
    );
  });

  it("throws if radiusKm is 0", () => {
    const input = {
      centre: { lat: 50.3755, lon: -4.1427 },
      radiusKm: 0,
      minPopulation: 5000,
    };

    expect(() => parseConfig(input)).toThrow(
      "radiusKm must be a number greater than 0",
    );
  });

  it("throws if radiusKm is negative", () => {
    const input = {
      centre: { lat: 50.3755, lon: -4.1427 },
      radiusKm: -10,
      minPopulation: 5000,
    };

    expect(() => parseConfig(input)).toThrow(
      "radiusKm must be a number greater than 0",
    );
  });

  it("builds correctly with a minPopulation of 0", () => {
    const input = {
      centre: { lat: 50.3755, lon: -4.1427 },
      radiusKm: 100,
      minPopulation: 0,
    };

    const config = parseConfig(input);

    expect(config).toEqual({
      centre: { lat: 50.3755, lon: -4.1427 },
      radiusKm: 100,
      minPopulation: 0,
    });
  });

  it("throws for a negative minPopulation", () => {
    const input = {
      centre: { lat: 50.3755, lon: -4.1427 },
      radiusKm: 100,
      minPopulation: -1,
    };

    expect(() => parseConfig(input)).toThrow(
      "minPopulation must be a number of 0 or more",
    );
  });

  it("throws for a missing minPopulation", () => {
    const input = { centre: { lat: 50.3755, lon: -4.1427 }, radiusKm: 100 };

    expect(() => parseConfig(input)).toThrow(
      "minPopulation must be a number of 0 or more",
    );
  });
});
