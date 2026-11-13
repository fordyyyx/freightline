import { describe, it, expect } from "vitest";
import { makeOffer } from "../helpers/offers.ts";
import type { Vehicle } from "../../src/engine/vehicles.ts";
import type { Scenario } from "../../src/engine/scenarios.ts";
import type { Town } from "../../src/engine/world.ts";
import { plymouthSandbox } from "../../src/engine/scenarios.ts";
import { createGame } from "../../src/engine/state.ts";
import {
  eligibleVehicles,
  acceptBlockedReason,
} from "../../src/engine/dispatch.ts";
import { roadKm } from "../../src/engine/distance.ts";
import type { GameState } from "../../src/engine/state.ts";

const nearest: Town = {
  id: "T1",
  name: "Home",
  countryCode: "GB",
  lat: 50,
  lon: -4,
  population: 10000,
};
const near: Town = { ...nearest, id: "T2", name: "Near", lat: 50.45 };
const far: Town = { ...nearest, id: "T3", name: "Far", lat: 51.5 };
const testScenario: Scenario = { ...plymouthSandbox, startTownId: "T1" };

describe("eligibleVehicles", () => {
  it("correctly lists eligible vehicles", () => {
    const game = createGame(testScenario, [nearest, near, far]);

    const offer = makeOffer({
      originTownId: "T2",
      destinationTownId: "T1",
      weightKg: 500,
    });

    const eligible = eligibleVehicles(game, offer);

    expect(eligible.map((e) => e.vehicle.id)).toEqual(["vehicle-1"]);
    expect(eligible[0].emptyKm).toBeCloseTo(roadKm(nearest, near), 6);
  });

  it("returns the correct reasoning when cargo is too heavy", () => {
    const game = createGame(testScenario, [nearest, near, far]);

    const offer = makeOffer({
      originTownId: "T2",
      destinationTownId: "T1",
      weightKg: 800,
    });

    const blockedReason = acceptBlockedReason(game, offer);

    expect(blockedReason).toBe("tooHeavy");
  });

  it("returns the correct reasoning when no vans are idle", () => {
    const game = createGame(testScenario, [nearest, near, far]);

    const [van] = game.company.vehicles;
    const busyGame: GameState = {
      ...game,
      company: {
        ...game.company,
        vehicles: [{ ...van, status: "collecting" }],
      },
    };
    const offer = makeOffer({
      originTownId: "T2",
      destinationTownId: "T1",
      weightKg: 500,
    });

    const blockedReason = acceptBlockedReason(busyGame, offer);

    expect(blockedReason).toBe("noIdleVan");
  });

  it("returns a closer eligible van first", () => {
    const twoVanGame = createGame(
      { ...testScenario, startingVehicles: ["compactVan", "compactVan"] },
      [nearest, near, far],
    );
    const movedVans = twoVanGame.company.vehicles.map((vehicle) =>
      vehicle.id === "vehicle-2" ? { ...vehicle, townId: "T2" } : vehicle,
    );

    const state: GameState = {
      ...twoVanGame,
      company: { ...twoVanGame.company, vehicles: movedVans },
    };

    const offer = makeOffer({
      originTownId: "T2",
      destinationTownId: "T1",
      weightKg: 500,
    });
    const eligible = eligibleVehicles(state, offer);

    expect(eligible.map((e) => e.vehicle.id)).toEqual([
      "vehicle-2",
      "vehicle-1",
    ]);
    expect(eligible[0].emptyKm).toBe(0);
  });

  it("does not count non-idle vans as potentially eligible", () => {
    const twoVanGame = createGame(
      { ...testScenario, startingVehicles: ["compactVan", "panelVan"] },
      [nearest, near, far],
    );
    const collectingVans = twoVanGame.company.vehicles.map(
      (vehicle): Vehicle =>
        vehicle.id === "vehicle-2"
          ? { ...vehicle, status: "collecting" }
          : vehicle,
    );
    const state: GameState = {
      ...twoVanGame,
      company: { ...twoVanGame.company, vehicles: collectingVans },
    };
    const offer = makeOffer({
      originTownId: "T2",
      destinationTownId: "T1",
      weightKg: 800,
    });

    const eligible = eligibleVehicles(state, offer);

    expect(eligible.length).toBe(0);
    expect(acceptBlockedReason(state, offer)).toBe("tooHeavy");
  });
});
