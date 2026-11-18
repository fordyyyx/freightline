import { describe, it, expect } from "vitest";
import towns from "../../src/data/towns.json";
import { plymouthSandbox, bankruptcyTest } from "../../src/engine/scenarios.ts";
import { createGame, advance } from "../../src/engine/state.ts";
import type { GameState } from "../../src/engine/state.ts";
import {
  currentCalendarMinutes,
  toCalendarMinutes,
} from "../../src/engine/time.ts";
const game = createGame(plymouthSandbox, towns);
const TO_FIRST_MIDNIGHT = 960;

function rentEntries(state: GameState) {
  return state.ledger.filter((entry) => entry.kind === "rent");
}

describe("chargeRent", () => {
  it("charges nothing before the first midnight", () => {
    expect(rentEntries(advance(game, TO_FIRST_MIDNIGHT - 1))).toEqual([]);
  });

  it("charges each depot at midnight", () => {
    const state = advance(game, TO_FIRST_MIDNIGHT);
    expect(rentEntries(state)).toHaveLength(1);
    expect(state.company.cash.amount).toBe(game.company.cash.amount - 4000);
  });

  it("charges rent twice over two days", () => {
    const state = advance(game, TO_FIRST_MIDNIGHT + 1440);
    expect(rentEntries(state)).toHaveLength(2);
    expect(state.company.cash.amount).toBe(game.company.cash.amount - 8000);
  });

  it("can take cash below zero", () => {
    const poorGame = createGame(
      { ...plymouthSandbox, startingCash: { amount: 3000, currency: "GBP" } },
      towns,
    );
    const state = advance(poorGame, TO_FIRST_MIDNIGHT);
    expect(rentEntries(state)).toHaveLength(1);
    expect(state.company.cash.amount).toBeLessThan(0);
  });

  it("returns the same for a single large advance and many compounded advances", () => {
    const singleAdvance = advance(game, 4320);
    let manyAdvance = game;
    for (let i = 0; i < 4320; i++) {
      manyAdvance = advance(manyAdvance, 1);
    }

    expect(singleAdvance).toEqual(manyAdvance);
  });

  it("charges every depot", () => {
    const [depot] = game.company.depots;
    const twoDepots: GameState = {
      ...game,
      company: {
        ...game.company,
        depots: [depot, { ...depot, id: "depot-2" }],
      },
    };
    const state = advance(twoDepots, TO_FIRST_MIDNIGHT);

    expect(rentEntries(state)).toHaveLength(2);
    expect(state.company.cash.amount).toBe(game.company.cash.amount - 8000);
  });
});

describe("checkBankruptcy", () => {
  it("correctly updates values for cash below zero", () => {
    const game = createGame(bankruptcyTest, towns);
    const advanced = advance(game, TO_FIRST_MIDNIGHT);

    expect(advanced.company.cash.amount).toBe(-1000);
    expect(advanced.belowZeroSince).toEqual(
      toCalendarMinutes(2027, 3, 2, 0, 0),
    );
  });

  it("does not update values for cash exactly zero", () => {
    const game = createGame(
      {
        ...bankruptcyTest,
        startingCash: { amount: 4000, currency: "GBP" },
      },
      towns,
    );
    const advanced = advance(game, TO_FIRST_MIDNIGHT);

    expect(advanced.company.cash.amount).toBe(0);
    expect(advanced.belowZeroSince).toBe(null);
  });

  it("does not end the game before the bankruptcy rule states", () => {
    const game = createGame(
      { ...plymouthSandbox, startingCash: { amount: 3000, currency: "GBP" } },
      towns,
    );
    const advanced = advance(game, TO_FIRST_MIDNIGHT + 1440);

    expect(advanced.gameOver).toEqual(null);
  });

  it("correctly ends the game when the game over condition is met", () => {
    const game = createGame(bankruptcyTest, towns);
    const advanced = advance(game, TO_FIRST_MIDNIGHT + 1440);

    expect(advanced.gameOver).toEqual({
      reason: "bankruptcy",
      at: currentCalendarMinutes(advanced),
    });
  });

  it("does not changed a game that has ended", () => {
    const game = createGame(bankruptcyTest, towns);
    const advanced = advance(game, TO_FIRST_MIDNIGHT + 1440);

    expect(advance(advanced, 1000)).toEqual(advanced);
  });

  it("stops updating at the moment of failure", () => {
    const game = createGame(bankruptcyTest, towns);
    const advanced = advance(game, 10000);

    expect(advanced.gameOver?.at).toEqual(
      game.startTime + TO_FIRST_MIDNIGHT + 1440,
    );
    expect(currentCalendarMinutes(advanced)).toEqual(
      game.startTime + TO_FIRST_MIDNIGHT + 1440,
    );
  });
});
