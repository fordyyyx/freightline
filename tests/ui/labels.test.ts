import { describe, it, expect } from "vitest";
import { vanTooltipLines } from "../../src/ui/labels.ts";
import type { Town } from "../../src/engine/world.ts";
import { plymouthSandbox } from "../../src/engine/scenarios.ts";
import type { Scenario } from "../../src/engine/scenarios.ts";
import { createGame } from "../../src/engine/state.ts";
import { acceptJob } from "../../src/engine/dispatch.ts";
import { makeOffer } from "../helpers/offers.ts";
import { advanceTo } from "../helpers/state";

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

const game = createGame(testScenario, towns);
const offer = makeOffer({
  id: "job-test",
  originTownId: "T2",
  destinationTownId: "T1",
  weightKg: 500,
});
const accepted = acceptJob(
  { ...game, board: [offer] },
  "job-test",
  "vehicle-1",
);
const [active] = accepted.activeJobs;

describe("vanTooltipLines", () => {
  it("returns correctly for an idle van", () => {
    expect(vanTooltipLines(game, game.company.vehicles[0])).toEqual([
      "Compact van 1",
      "Idle",
      "Home",
    ]);
  });

  it("returns correctly for a van heading somewhere", () => {
    const advanced = advanceTo(accepted, active.plan.legs[0].arrivesAt - 1);
    const van = advanced.company.vehicles[0];

    expect(vanTooltipLines(advanced, van)).toEqual([
      "Compact van 1",
      "Collecting",
      "Driving to Near, arrives Mon 09:11",
      "Delivers to Home, ETA Mon 11:02",
    ]);
  });

  it("returns correctly for a van unloading somewhere", () => {
    const advanced = advanceTo(accepted, active.plan.unloadingEndsAt - 1);
    const van = advanced.company.vehicles[0];

    expect(vanTooltipLines(advanced, van)).toEqual([
      "Compact van 1",
      "Delivering",
      "Unloading at Home until Mon 11:02",
    ]);
    expect(
      vanTooltipLines(advanced, van).some((l) => l.startsWith("ETA")),
    ).toBe(false);
  });
});
