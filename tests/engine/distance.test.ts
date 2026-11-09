import { describe, it, expect } from "vitest";
import {
  greatCircleKm,
  roadKm,
  EARTH_RADIUS_KM,
} from "../../src/engine/distance.ts";
import { balance } from "../../src/engine/balance.ts";
import type { Coordinates } from "../../src/engine/distance.ts";

const plymouth: Coordinates = { lat: 50.371388888, lon: -4.142222222 };
const exeter: Coordinates = { lat: 50.725555555, lon: -3.526944444 };
const london: Coordinates = { lat: 51.507222, lon: -0.1275 };
const paris: Coordinates = { lat: 48.856667, lon: 2.352222 };
const eqOne: Coordinates = { lat: 0, lon: 0 };
const eqTwo: Coordinates = { lat: 0, lon: 90 };

describe("greatCircleKm", () => {
  it("is 0 between a point and itself", () => {
    expect(greatCircleKm(plymouth, plymouth)).toBe(0);
  });

  it("matches an independent value for Plymouth to Exeter", () => {
    expect(greatCircleKm(plymouth, exeter)).toBeCloseTo(58.66, 1);
  });

  it("is the same between two points in either direction", () => {
    expect(greatCircleKm(plymouth, exeter)).toBe(
      greatCircleKm(exeter, plymouth),
    );
  });

  it("matches an independent value for London to Paris", () => {
    expect(greatCircleKm(london, paris)).toBeCloseTo(343.52, 0);
  });

  it("matches an expected output for very large distances", () => {
    expect(greatCircleKm(eqOne, eqTwo)).toBeCloseTo(
      (Math.PI / 2) * EARTH_RADIUS_KM,
      0,
    );
  });
});

describe("roadKm", () => {
  it("is 0 between a point and itself", () => {
    expect(roadKm(plymouth, plymouth)).toBe(0);
  });

  it("matches an expected value for Plymouth to Exeter", () => {
    expect(roadKm(plymouth, exeter)).toBeCloseTo(
      greatCircleKm(plymouth, exeter) * balance.world.roadFactor,
      1,
    );
  });

  it("is the same between two points in either direction", () => {
    expect(roadKm(plymouth, exeter)).toBe(roadKm(exeter, plymouth));
  });

  it("matches an expected value for London to Paris", () => {
    expect(roadKm(london, paris)).toBeCloseTo(
      greatCircleKm(london, paris) * balance.world.roadFactor,
      0,
    );
  });
});
