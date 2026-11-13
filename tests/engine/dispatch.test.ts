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
  acceptJob,
} from "../../src/engine/dispatch.ts";
import { roadKm } from "../../src/engine/distance.ts";
import type { GameState } from "../../src/engine/state.ts";
import { currentCalendarMinutes } from "../../src/engine/time.ts";
import { jobEta } from "../../src/engine/jobs.ts";

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
const testScenario: Scenario = { ...plymouthSandbox, startTownId: "T1" };
const twoVehicleScenario: Scenario = {
  ...testScenario,
  startingVehicles: ["compactVan", "panelVan"],
};

describe("eligibleVehicles", () => {
  it("correctly lists eligible vehicles", () => {
    const game = createGame(testScenario, [home, near, far]);

    const offer = makeOffer({
      originTownId: "T2",
      destinationTownId: "T1",
      weightKg: 500,
    });

    const eligible = eligibleVehicles(game, offer);

    expect(eligible.map((e) => e.vehicle.id)).toEqual(["vehicle-1"]);
    expect(eligible[0].emptyKm).toBeCloseTo(roadKm(home, near), 6);
  });

  it("returns the correct reasoning when cargo is too heavy", () => {
    const game = createGame(testScenario, [home, near, far]);

    const offer = makeOffer({
      originTownId: "T2",
      destinationTownId: "T1",
      weightKg: 800,
    });

    const blockedReason = acceptBlockedReason(game, offer);

    expect(blockedReason).toBe("tooHeavy");
  });

  it("returns the correct reasoning when no vans are idle", () => {
    const game = createGame(testScenario, [home, near, far]);

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
      [home, near, far],
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
      [home, near, far],
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

describe("acceptJob", () => {
  it("correctly accepts a valid job", () => {
    const game = createGame(testScenario, [home, near, far]);

    const offer = makeOffer({
      id: "job-test",
      originTownId: "T2",
      destinationTownId: "T1",
      weightKg: 500,
    });

    const state: GameState = { ...game, board: [offer] };
    const accepted = acceptJob(state, "job-test", "vehicle-1");
    const van = accepted.company.vehicles.find(
      (vehicle) => vehicle.id === "vehicle-1",
    );

    expect(accepted.activeJobs).toHaveLength(1);
    const [active] = accepted.activeJobs;
    expect(active.job).toEqual(offer);
    expect(active.vehicleId).toBe("vehicle-1");
    expect(active.acceptedAt).toBe(currentCalendarMinutes(state));
    expect(van?.status).toBe("collecting");
  });

  it("returns the correct ETA for a job", () => {
    const game = createGame(testScenario, [home, near, far]);

    const offer = makeOffer({
      id: "job-test",
      originTownId: "T2",
      destinationTownId: "T1",
      weightKg: 500,
    });

    const state: GameState = { ...game, board: [offer] };
    const accepted = acceptJob(state, "job-test", "vehicle-1");
    const active = accepted.activeJobs.find(
      (jobOffer) => jobOffer.job.id === "job-test",
    );

    const expectedEta = jobEta(
      currentCalendarMinutes(state),
      roadKm(home, near),
      roadKm(near, home),
      55,
    );

    expect(active?.eta).toBe(expectedEta);
  });

  it("does not change the original game state", () => {
    const game = createGame(testScenario, [home, near, far]);

    const offer = makeOffer({
      id: "job-test",
      originTownId: "T2",
      destinationTownId: "T1",
      weightKg: 500,
    });

    const state: GameState = { ...game, board: [offer] };
    const before = structuredClone(state);
    acceptJob(state, "job-test", "vehicle-1");

    expect(state).toEqual(before);
  });

  it("gives the same results for the same inputs", () => {
    const game = createGame(testScenario, [home, near, far]);

    const offer = makeOffer({
      id: "job-test",
      originTownId: "T2",
      destinationTownId: "T1",
      weightKg: 500,
    });

    const state: GameState = { ...game, board: [offer] };
    const acceptedOne = acceptJob(state, "job-test", "vehicle-1");
    const acceptedTwo = acceptJob(state, "job-test", "vehicle-1");

    expect(acceptedOne).toEqual(acceptedTwo);
  });

  const offer = makeOffer({
    id: "job-test",
    originTownId: "T2",
    destinationTownId: "T1",
    weightKg: 500,
  });
  const heavyOffer = makeOffer({
    id: "job-heavy",
    originTownId: "T2",
    destinationTownId: "T1",
    weightKg: 800,
  });

  const game = createGame(testScenario, [home, near, far]);
  const ready: GameState = { ...game, board: [offer, heavyOffer] };
  const vanBusy = acceptJob(ready, "job-test", "vehicle-1");

  const failures: {
    label: string;
    state: GameState;
    jobId: string;
    vehicleId: string;
    message: string;
  }[] = [
    {
      label: "an offer that isn't on the board",
      state: ready,
      jobId: "job-missing",
      vehicleId: "vehicle-1",
      message: "Offer not open",
    },
    {
      label: "a van that doesn't exist",
      state: ready,
      jobId: "job-test",
      vehicleId: "vehicle-9",
      message: "Vehicle not found",
    },
    {
      label: "a van that isn't idle",
      state: vanBusy,
      jobId: "job-heavy",
      vehicleId: "vehicle-1",
      message: "Vehicle not idle",
    },
    {
      label: "a load too heavy for the van",
      state: ready,
      jobId: "job-heavy",
      vehicleId: "vehicle-1",
      message: "Too heavy",
    },
  ];

  it.each(failures)(
    "throws for $label",
    ({ state, jobId, vehicleId, message }) => {
      expect(() => acceptJob(state, jobId, vehicleId)).toThrow(message);
    },
  );

  it("only updates the van taking the job", () => {
    const game = createGame(twoVehicleScenario, [home, near, far]);

    const offer = makeOffer({
      id: "job-test",
      originTownId: "T2",
      destinationTownId: "T1",
      weightKg: 500,
    });

    const state: GameState = { ...game, board: [offer] };
    const vanOneBefore = state.company.vehicles.find(
      (van) => van.id === "vehicle-1",
    );
    const vanTwoBefore = state.company.vehicles.find(
      (van) => van.id === "vehicle-2",
    );
    const accepted = acceptJob(state, "job-test", "vehicle-1");
    const vanOneAfter = accepted.company.vehicles.find(
      (van) => van.id === "vehicle-1",
    );
    const vanTwoAfter = accepted.company.vehicles.find(
      (van) => van.id === "vehicle-2",
    );

    expect(vanOneBefore).not.toEqual(vanOneAfter);
    expect(vanTwoBefore).toEqual(vanTwoAfter);
  });
});
