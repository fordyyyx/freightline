import { describe, it, expect } from "vitest";
import {
  generateOffer,
  offerArrives,
  offerLoadedKm,
  eligibleVehicles,
  acceptBlockedReason,
} from "../../src/engine/offers.ts";
import { makeOffer } from "../helpers/offers.ts";
import towns from "../../src/data/towns.json";
import { balance } from "../../src/engine/balance.ts";
import { plymouthSandbox } from "../../src/engine/scenarios.ts";
import { createGame } from "../../src/engine/state.ts";
import { roadKm } from "../../src/engine/distance.ts";
import { depotTowns, findTown } from "../../src/engine/world.ts";
import type { GeneratedOffer } from "../../src/engine/offers.ts";
import type { GameState } from "../../src/engine/state.ts";
import type { Town } from "../../src/engine/world.ts";
import { currentCalendarMinutes } from "../../src/engine/time.ts";
import { estimatedJobMinutes } from "../../src/engine/jobs.ts";
import type { JobOffer } from "../../src/engine/jobs.ts";
import type { Scenario } from "../../src/engine/scenarios.ts";
import { seedRandom } from "../../src/engine/random.ts";
import type { Vehicle } from "../../src/engine/vehicles.ts";

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

function generateMany(state: GameState, count: number): GeneratedOffer[] {
  const offers: GeneratedOffer[] = [];
  let current = state;
  for (let i = 0; i < count; i++) {
    const result = generateOffer(current);
    offers.push(result);
    current = result.state;
  }
  return offers;
}

const plymouthGame = createGame(plymouthSandbox, towns);
const big: Town = {
  id: "B",
  name: "Big",
  countryCode: "GB",
  lat: 50,
  lon: -4,
  population: 100000,
};
const small: Town = {
  ...big,
  id: "S",
  name: "Small",
  lat: 50.2,
  population: 10000,
};
const third: Town = {
  ...big,
  id: "T",
  name: "Third",
  lat: 50.4,
  population: 10000,
};
const nearSmall: Town = {
  ...big,
  id: "N",
  name: "NearSmall",
  lat: 50.3,
  population: 10000,
};

const weightingGame = createGame({ ...plymouthSandbox, startTownId: "B" }, [
  big,
  small,
  third,
]);

const [home] = depotTowns(plymouthGame);

function estimateFor(offer: JobOffer): number {
  const origin = findTown(plymouthGame.towns, offer.originTownId);
  const destination = findTown(plymouthGame.towns, offer.destinationTownId);
  return estimatedJobMinutes(roadKm(home, origin), roadKm(origin, destination));
}

function rollMany(rng: number, count: number) {
  const rolls: boolean[] = [];
  let current = rng;
  for (let i = 0; i < count; i++) {
    const result = offerArrives(current);
    current = result.state;
    rolls.push(result.arrives);
  }
  return rolls;
}

describe("generateOffer", () => {
  it("correctly creates the first offer", () => {
    const offer = generateOffer(plymouthGame);

    expect(offer.offer.id).toBe("job-7");
    expect(offer.offer.createdAt).toBe(currentCalendarMinutes(plymouthGame));
  });

  it("correctly returns a new state without altering the old one", () => {
    const inputState = plymouthGame;
    const offer = generateOffer(inputState);

    expect(offer.state).not.toEqual(inputState);
    expect(inputState).toEqual(plymouthGame);
  });

  it("returns equal offers for the same state", () => {
    const inputState = plymouthGame;
    const offerOne = generateOffer(inputState);
    const offerTwo = generateOffer(inputState);

    expect(offerOne).toEqual(offerTwo);
  });

  it("never generates the origin as a destination", () => {
    const offers = generateMany(plymouthGame, 1000);
    const nonOriginDestinations = offers.filter(
      (offer) => offer.offer.destinationTownId !== offer.offer.originTownId,
    );

    expect(offers).toEqual(nonOriginDestinations);
  });

  it("always chooses a destination at least 8km away by road", () => {
    const offers = generateMany(plymouthGame, 1000);
    const over8kmDestinations = offers.filter(
      (offer) =>
        roadKm(
          findTown(towns, offer.offer.destinationTownId),
          findTown(towns, offer.offer.originTownId),
        ) > 8,
    );

    expect(offers).toEqual(over8kmDestinations);
  });

  it("correctly assigns weights within the specified cargo's range", () => {
    const offers = generateMany(plymouthGame, 1000);

    const outOfRange = offers.filter((offer) => {
      const range = balance.cargo[offer.offer.cargo];
      return (
        offer.offer.weightKg < range.minWeightKg ||
        offer.offer.weightKg > range.maxWeightKg
      );
    });

    expect(outOfRange).toEqual([]);
  });

  it("correctly generates each type of cargo over enough draws", () => {
    const offers = generateMany(plymouthGame, 1000);

    const differentCargos = new Set(offers.map((o) => o.offer.cargo));

    expect(differentCargos.size).toBe(5);
  });

  it("correctly distributes express and standard jobs", () => {
    const offers = generateMany(plymouthGame, 1000);

    const expressJobs = offers.filter(
      (offer) => offer.offer.urgency === "express",
    );

    expect(expressJobs.length).toBeGreaterThanOrEqual(200);
    expect(expressJobs.length).toBeLessThanOrEqual(300);
  });

  it("correctly assigns deadlines", () => {
    const offers = generateMany(plymouthGame, 1000);

    const outOfRange = offers.filter((offer) => {
      const slackRange =
        offer.offer.urgency === "express"
          ? balance.jobs.expressSlack
          : balance.jobs.standardSlack;
      const estimate = estimateFor(offer.offer);
      const earliest = offer.offer.createdAt + estimate * slackRange.min;
      const latest = offer.offer.createdAt + estimate * slackRange.max + 15;
      return offer.offer.deadline < earliest || offer.offer.deadline > latest;
    });

    expect(outOfRange).toEqual([]);
  });

  it("correctly assigns expiry times", () => {
    const offers = generateMany(plymouthGame, 1000);

    const outOfRange = offers.filter((offer) => {
      return (
        offer.offer.expiresAt > offer.offer.createdAt + 480 ||
        offer.offer.expiresAt > offer.offer.deadline - estimateFor(offer.offer)
      );
    });

    expect(outOfRange).toEqual([]);
  });

  it("correctly assigns jobs based on weights", () => {
    const offers = generateMany(weightingGame, 1000);

    const bigCount = offers.filter(
      (offer) => offer.offer.originTownId === "B",
    ).length;
    const smallCount = offers.filter(
      (offer) => offer.offer.originTownId === "S",
    ).length;

    expect(bigCount).toBeGreaterThanOrEqual(780);
    expect(bigCount).toBeLessThanOrEqual(880);
    expect(smallCount).toBeGreaterThanOrEqual(50);
    expect(smallCount).toBeLessThanOrEqual(120);
  });
});

describe("offerArrives", () => {
  it("returns true around 2.5% of the time", () => {
    const rolls = rollMany(seedRandom(1), 10000);
    const arrivals = rolls.filter((roll) => roll === true);

    expect(arrivals.length).toBeGreaterThanOrEqual(200);
    expect(arrivals.length).toBeLessThanOrEqual(300);
  });
});

describe("offerLoadedKm", () => {
  it("returns the expected value for two known locations", () => {
    const towns = [small, nearSmall];
    const newGame = createGame({ ...plymouthSandbox, startTownId: "S" }, towns);
    const offer = generateOffer(newGame);
    const loadedKm = offerLoadedKm(towns, offer.offer);

    expect(loadedKm).toBeCloseTo(roadKm(small, nearSmall));
  });
});

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
