import { describe, it, expect } from "vitest";
import { createGameState, advance } from "../../src/engine/state.ts";
import { seedRandom } from "../../src/engine/random.ts";

describe("createGameState", () => {
  it("starts a new game at minute 0 with rngState equal to seedRandom(seed)", () => {
    const newGame = createGameState(1);
    const seedOne = seedRandom(1);

    expect(newGame.minutes).toBe(0);
    expect(newGame.rngState).toEqual(seedOne);
  });

  it("adds exactly 1 minute when advancing by 1 tick", () => {
    const newGame = createGameState(1);
    const tickOnce = advance(newGame, 1);

    expect(tickOnce.minutes).toBe(1);
  });

  it("adds exactly 90 minutes when advancing by 90 ticks", () => {
    const newGame = createGameState(1);
    const tickNinety = advance(newGame, 90);

    expect(tickNinety.minutes).toBe(90);
  });

  it("gives an equal state when advancing by 0 ticks", () => {
    const newGame = createGameState(1);
    const tickZero = advance(newGame, 0);

    expect(tickZero).toEqual(newGame);
  });

  it("does not change the original state after advance()", () => {
    const newGame = createGameState(1);
    const tickSixty = advance(newGame, 60);

    expect(tickSixty.minutes).toBe(60);
    expect(newGame.minutes).toBe(0);
    expect(newGame.rngState).toBe(seedRandom(1));
  });

  it("produces identical games when the seed is equal", () => {
    const newGameOne = createGameState(1);
    const newGameTwo = createGameState(1);

    const tickOneOne = advance(newGameOne, 1);
    const tickOneTwo = advance(newGameTwo, 1);

    expect(tickOneOne).toEqual(tickOneTwo);
  });

  it("throws for negative ticks", () => {
    const newGame = createGameState(1);

    expect(() => advance(newGame, -1)).toThrow(
      "ticks must be a whole number of 0 or more",
    );
  });

  it("throws for fractional ticks", () => {
    const newGame = createGameState(1);

    expect(() => advance(newGame, 1.5)).toThrow(
      "ticks must be a whole number of 0 or more",
    );
  });

  it("produces the same game when compounding advances as advancing as one", () => {
    const newGame = createGameState(1);

    const tickThirty = advance(newGame, 30);
    const tickSixtyAfter = advance(tickThirty, 60);

    const tickNinety = advance(newGame, 90);

    expect(tickNinety).toEqual(tickSixtyAfter);
  });
});
