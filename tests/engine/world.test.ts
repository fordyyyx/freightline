import { describe, it, expect } from "vitest";
import { findTown, depotTowns } from "../../src/engine/world.ts";
import type { Town } from "../../src/engine/world.ts";
import type { Scenario } from "../../src/engine/scenarios.ts";
import { plymouthSandbox } from "../../src/engine/scenarios.ts";
import { createGame } from "../../src/engine/state";

const home: Town = {
  id: "T1",
  name: "Home",
  countryCode: "GB",
  lat: 50,
  lon: -4,
  population: 10000,
};
const near: Town = { ...home, id: "T2", name: "Near", lat: 50.45 };
const far: Town = { ...home, id: "T3", name: "Far", lat: 51.5 };

const towns = [home, near, far];
const testScenario: Scenario = { ...plymouthSandbox, startTownId: "T1" };

describe("findTown", () => {
  it("returns the expected value for a matched id", () => {
    expect(findTown(towns, "T2")).toBe(near);
  });

  it("throws for an invalid id", () => {
    expect(() => {
      findTown(towns, "T6");
    }).toThrow();
  });
});

describe("depotTowns", () => {
  it("returns expected value for a single depot", () => {
    const newGame = createGame(testScenario, towns);
    expect(depotTowns(newGame)).toEqual([home]);
  });
});
