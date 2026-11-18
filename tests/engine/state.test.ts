import { describe, it, expect } from "vitest";
import { advance, createGame } from "../../src/engine/state.ts";
import { currentCalendarMinutes } from "../../src/engine/time.ts";
import type { Scenario } from "../../src/engine/scenarios.ts";
import type { Town } from "../../src/engine/world.ts";
import { plymouthSandbox } from "../../src/engine/scenarios.ts";
import { makeOffer } from "../helpers/offers.ts";
import { acceptJob, planTrip } from "../../src/engine/dispatch.ts";
import { vanIn, advanceTo } from "../helpers/state.ts";
import { latePay } from "../../src/engine/jobs.ts";

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

const twoVehicleScenario: Scenario = {
  ...testScenario,
  startingVehicles: ["compactVan", "panelVan"],
};

const game = createGame(testScenario, [home, near, far]);
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
const start = currentCalendarMinutes(game);

describe("createGame", () => {
  it("produces the correct company from the scenario", () => {
    const newGame = createGame(testScenario, towns);
    const startingCompany = newGame.company;

    expect(startingCompany.name).toBe(testScenario.companyName);
    expect(startingCompany.cash).toEqual(testScenario.startingCash);
  });

  it("produces one depot in the starting town", () => {
    const newGame = createGame(testScenario, towns);
    const startingCompany = newGame.company;

    expect(startingCompany.depots).toHaveLength(1);
    expect(startingCompany.depots[0].townId).toBe("T1");
  });

  it("produces the correct towns within the radius", () => {
    const newGame = createGame(testScenario, towns);

    expect(newGame.towns.map((t) => t.id)).toEqual(["T1", "T2"]);
    expect(newGame.towns).toHaveLength(2);
  });

  it("produces the correct starting time and state", () => {
    const newGame = createGame(testScenario, towns);

    expect(newGame.startTime).toEqual(testScenario.startTime);
    expect(newGame.minutes).toBe(0);
  });

  it("throws for a missing start town", () => {
    expect(() =>
      createGame({ ...plymouthSandbox, startTownId: "missing" }, towns),
    ).toThrow("Town not found");
  });

  it("produces identical games for identical scenarios", () => {
    const newGameOne = createGame(testScenario, towns);
    const newGameTwo = createGame(testScenario, towns);

    expect(newGameOne).toEqual(newGameTwo);
  });

  it("starts a game with exactly one vehicle", () => {
    const newGame = createGame(testScenario, towns);

    expect(newGame.company.vehicles).toHaveLength(1);
  });

  it("starts a game with the correct vehicle", () => {
    const newGame = createGame(testScenario, towns);
    const vehicle = newGame.company.vehicles[0];

    expect(vehicle.id).toBe("vehicle-1");
    expect(vehicle.modelId).toBe("compactVan");
    expect(vehicle.homeDepotId).toBe("depot-1");
    expect(vehicle.status).toBe("idle");
  });

  it("gives multiple starting vehicles different ids", () => {
    const newGame = createGame(twoVehicleScenario, towns);
    const [vehicleOne, vehicleTwo] = newGame.company.vehicles;

    expect(vehicleOne === vehicleTwo).toBe(false);
  });

  it("gives the correct starting job id", () => {
    const newGame = createGame(testScenario, towns);

    expect(newGame.nextJobId).toBe(7);
  });

  it("draws its randomness from the scenario's seed", () => {
    const gameA = createGame({ ...testScenario, seed: 1 }, towns);
    const gameB = createGame({ ...testScenario, seed: 2 }, towns);

    expect(gameA.board).not.toEqual(gameB.board);
  });

  it("generates 6 jobs for a new game", () => {
    const newGame = createGame(testScenario, towns);

    expect(newGame.board).toHaveLength(6);
  });

  it("has the correct failure rules", () => {
    const newGame = createGame(testScenario, towns);

    expect(newGame.failureRule).toEqual({
      kind: "bankruptcy",
      daysBelowZero: 14,
    });
    expect(newGame.belowZeroSince).toBe(null);
    expect(newGame.gameOver).toBe(null);
  });

  it("correctly names a game with a non-default name", () => {
    const newGame = createGame(testScenario, towns, "Acme");

    expect(newGame.company.name).toEqual("Acme");
  });

  it("correctly trims company names", () => {
    const newGame = createGame(testScenario, towns, "  Acme  ");

    expect(newGame.company.name).toEqual("Acme");
  });

  it("throws for an empty name", () => {
    expect(() => createGame(testScenario, towns, "")).toThrow(
      "Invalid company name",
    );
  });

  it("uses the default company name when one is not specified", () => {
    const newGame = createGame(testScenario, towns);

    expect(newGame.company.name).toEqual("PlymFreight");
  });
});

describe("advance", () => {
  it("adds exactly 1 minute when advancing by 1 tick", () => {
    const newGame = createGame(testScenario, towns);
    const tickOnce = advance(newGame, 1);

    expect(tickOnce.minutes).toBe(1);
  });

  it("adds exactly 90 minutes when advancing by 90 ticks", () => {
    const newGame = createGame(testScenario, towns);
    const tickNinety = advance(newGame, 90);

    expect(tickNinety.minutes).toBe(90);
  });

  it("gives an equal state when advancing by 0 ticks", () => {
    const newGame = createGame(testScenario, towns);
    const tickZero = advance(newGame, 0);

    expect(tickZero).toEqual(newGame);
  });

  it("does not change the original state after advance()", () => {
    const newGame = createGame(testScenario, towns);
    const tickSixty = advance(newGame, 60);

    expect(tickSixty.minutes).toBe(60);
    expect(newGame).toEqual(createGame(testScenario, towns));
  });

  it("produces equal results when advancing equal games", () => {
    const newGameOne = createGame(testScenario, towns);
    const newGameTwo = createGame(testScenario, towns);

    const tickOneOne = advance(newGameOne, 1);
    const tickOneTwo = advance(newGameTwo, 1);

    expect(tickOneOne).toEqual(tickOneTwo);
  });

  it("throws for negative ticks", () => {
    const newGame = createGame(testScenario, towns);

    expect(() => advance(newGame, -1)).toThrow(
      "ticks must be a whole number of 0 or more",
    );
  });

  it("throws for fractional ticks", () => {
    const newGame = createGame(testScenario, towns);

    expect(() => advance(newGame, 1.5)).toThrow(
      "ticks must be a whole number of 0 or more",
    );
  });

  it("produces the same game when compounding advances as advancing as one", () => {
    const newGame = createGame(testScenario, towns);

    const tickThirty = advance(newGame, 30);
    const tickSixtyAfter = advance(tickThirty, 60);

    const tickNinety = advance(newGame, 90);

    expect(tickNinety).toEqual(tickSixtyAfter);
  });

  it("removes offers on the correct tick", () => {
    const newGame = createGame(testScenario, towns);
    const earliestExpiry = Math.min(
      ...newGame.board.map((offer) => offer.expiresAt),
    );
    const earliest = newGame.board.find(
      (offer) => offer.expiresAt === earliestExpiry,
    );

    const laterIds = newGame.board
      .filter((offer) => offer.expiresAt > earliestExpiry)
      .map((offer) => offer.id);

    const ticksToExpiry = earliestExpiry - currentCalendarMinutes(newGame);
    const justBefore = advance(newGame, ticksToExpiry - 1);
    expect(justBefore.board.map((offer) => offer.id)).toContain(earliest?.id);

    const atExpiry = advance(newGame, ticksToExpiry);
    expect(atExpiry.board.map((offer) => offer.id)).not.toContain(earliest?.id);

    const remainingIds = atExpiry.board.map((offer) => offer.id);
    expect(remainingIds).toEqual(expect.arrayContaining(laterIds));
  });

  it("never has more than 10 offers on the board", () => {
    const newGame = createGame(testScenario, towns);
    let current = newGame;

    for (let i = 0; i < 10000; i += 100) {
      current = advance(current, 100);
      expect(current.board.length).toBeLessThanOrEqual(10);
    }
  });

  it("reaches 10 offers at some point", () => {
    const newGame = createGame(testScenario, towns);
    let current = newGame;
    let maximumOffers = 0;

    for (let i = 0; i < 10000; i += 100) {
      current = advance(current, 100);
      if (current.board.length > maximumOffers) {
        maximumOffers = current.board.length;
      }
    }
    expect(maximumOffers).toBe(10);
  });

  it("produces the same game for 1000 ticks at once and for 1000 single ticks", () => {
    const newGameOne = createGame(testScenario, towns);
    let newGameTwo = createGame(testScenario, towns);

    const advanced1000 = advance(newGameOne, 1000);

    for (let i = 0; i < 1000; i++) {
      newGameTwo = advance(newGameTwo, 1);
    }

    expect(advanced1000).toEqual(newGameTwo);
  });

  it("is still collecting a minute before loading ends", () => {
    const state = advanceTo(accepted, active.plan.loadingEndsAt - 1);
    expect(vanIn(state).status).toBe("collecting");
  });

  it("starts delivering when loading ends", () => {
    const state = advanceTo(accepted, active.plan.loadingEndsAt);
    expect(vanIn(state).status).toBe("delivering");
  });

  it("completes the job when unloading ends", () => {
    const state = advanceTo(accepted, active.plan.unloadingEndsAt);
    expect(vanIn(state).status).toBe("idle");
    expect(vanIn(state).townId).toBe("T1");
    expect(state.activeJobs).toEqual([]);
    expect(state.completedJobs).toHaveLength(1);
    expect(state.completedJobs[0].completedAt).toBe(
      active.plan.unloadingEndsAt,
    );
  });

  it("is still delivering a minuted before unloading ends", () => {
    const state = advanceTo(accepted, active.plan.unloadingEndsAt - 1);
    expect(vanIn(state).status).toBe("delivering");
  });

  it("stores the history of completed jobs", () => {
    const state = advanceTo(accepted, active.plan.unloadingEndsAt + 1);
    expect(state.completedJobs).toHaveLength(1);
  });

  it("can take a new job after one is completed", () => {
    const state = advanceTo(accepted, active.plan.unloadingEndsAt);
    const newOffer = makeOffer({
      id: "new-job-test",
      originTownId: "T2",
      destinationTownId: "T1",
      weightKg: 500,
    });
    const newState = { ...state, board: [newOffer] };

    expect(() =>
      acceptJob(newState, "new-job-test", "vehicle-1"),
    ).not.toThrow();
  });

  it("correctly updates the ledger for an on time job", () => {
    const newOffer = { ...offer, deadline: start + 10000 };
    const newGame = { ...game, board: [newOffer] };
    const accepted = acceptJob(newGame, "job-test", "vehicle-1");
    const advanced = advanceTo(
      accepted,
      accepted.activeJobs[0].plan.unloadingEndsAt,
    );
    const payEntries = advanced.ledger.filter((e) => e.kind === "jobPay");

    expect(advanced.ledger).toHaveLength(1);
    expect(payEntries[0].late).toBe(false);
    expect(payEntries[0].amount.amount).toBe(5000);
    expect(payEntries[0].jobId).toBe("job-test");
    expect(advanced.company.cash.amount).toBe(155000);
  });

  it("correctly updates the ledger for a late delivery", () => {
    const newOffer = { ...offer, deadline: start + 1 };
    const newGame = { ...game, board: [newOffer] };
    const accepted = acceptJob(newGame, "job-test", "vehicle-1");
    const advanced = advanceTo(
      accepted,
      accepted.activeJobs[0].plan.unloadingEndsAt,
    );

    const payEntries = advanced.ledger.filter((e) => e.kind === "jobPay");

    expect(advanced.ledger).toHaveLength(1);
    expect(payEntries[0].late).toBe(true);
    expect(payEntries[0].amount.amount).toEqual(
      latePay(
        newOffer.pay.amount,
        currentCalendarMinutes(advanced) - newOffer.deadline,
      ),
    );
  });

  it("only pays jobs once", () => {
    const newOffer = { ...offer, deadline: start + 10000 };
    const newGame = { ...game, board: [newOffer] };
    const accepted = acceptJob(newGame, "job-test", "vehicle-1");
    const advanced = advanceTo(
      accepted,
      accepted.activeJobs[0].plan.unloadingEndsAt,
    );
    const another = advance(advanced, 60);

    expect(another.ledger).toEqual(advanced.ledger);
  });

  it("returns as early even for 1 minute early", () => {
    const [van] = game.company.vehicles;
    const plan = planTrip(game.towns, van, offer, currentCalendarMinutes(game));

    const onTime = makeOffer({
      id: "job-on-time",
      originTownId: "T2",
      destinationTownId: "T1",
      weightKg: 500,
      deadline: plan.unloadingEndsAt,
    });

    const accepted = acceptJob(
      { ...game, board: [onTime] },
      "job-on-time",
      "vehicle-1",
    );
    const done = advanceTo(accepted, plan.unloadingEndsAt);

    const payEntries = done.ledger.filter((e) => e.kind === "jobPay");

    expect(accepted.activeJobs[0].plan).toEqual(plan);

    expect(payEntries[0].late).toBe(false);
    expect(payEntries[0].amount.amount).toBe(5000);
  });
});

describe("currentCalendarMinutes", () => {
  it("returns startTime for a new game", () => {
    const newGame = createGame(testScenario, towns);

    expect(currentCalendarMinutes(newGame)).toEqual(newGame.startTime);
  });

  it("returns the correct time after advancing a new game", () => {
    const newGame = createGame(testScenario, towns);
    const advancedGame = advance(newGame, 1440);

    expect(currentCalendarMinutes(advancedGame)).toEqual(
      newGame.startTime + 1440,
    );
  });
});
