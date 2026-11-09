import { describe, it, expect } from "vitest";
import {
  advance,
  createGame,
  currentCalendarMinutes,
} from "../../src/engine/state.ts";
import type { Scenario } from "../../src/engine/scenarios.ts";
import type { Town } from "../../src/engine/world.ts";
import { plymouthSandbox } from "../../src/engine/scenarios.ts";
import { seedRandom } from "../../src/engine/random.ts";

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
    expect(newGame.rngState).toEqual(seedRandom(testScenario.seed));
  });

  it("throws for a missing start town", () => {
    expect(() =>
      createGame({ ...plymouthSandbox, startTownId: "missing" }, towns),
    ).toThrow("Start town not found");
  });

  it("produces identical games for identical scenarios", () => {
    const newGameOne = createGame(testScenario, towns);
    const newGameTwo = createGame(testScenario, towns);

    expect(newGameOne).toEqual(newGameTwo);
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
    expect(newGame.minutes).toBe(0);
    expect(newGame.rngState).toBe(seedRandom(testScenario.seed));
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
