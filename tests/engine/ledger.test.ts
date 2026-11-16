import { describe, it, expect } from "vitest";
import { postEntry } from "../../src/engine/ledger.ts";
import type { LedgerEntry } from "../../src/engine/ledger.ts";
import type { Town } from "../../src/engine/world.ts";
import { plymouthSandbox } from "../../src/engine/scenarios.ts";
import type { Scenario } from "../../src/engine/scenarios.ts";
import { createGame } from "../../src/engine/state.ts";
import type { CurrencyCode } from "../../src/engine/money.ts";

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

const entry: LedgerEntry = {
  at: 0,
  amount: { amount: 5500, currency: "GBP" },
  kind: "jobPay",
  jobId: "job-1",
  late: false,
};

describe("postEntry", () => {
  it("correctly adds an entry and adjusts cash for known values", () => {
    const added = postEntry(game, entry);

    expect(added.ledger).toHaveLength(1);
    expect(added.company.cash.amount).toBe(155500);
  });

  it("lowers the cash for a negative value", () => {
    const negativeEntry: LedgerEntry = {
      ...entry,
      amount: { amount: -5000, currency: "GBP" },
    };
    const added = postEntry(game, negativeEntry);

    expect(added.ledger).toHaveLength(1);
    expect(added.company.cash.amount).toBe(145000);
  });

  it("can take cash below zero", () => {
    const negativeEntry: LedgerEntry = {
      ...entry,
      amount: { amount: -155000, currency: "GBP" },
    };
    const added = postEntry(game, negativeEntry);

    expect(added.company.cash.amount).toBe(-5000);
  });

  it("is the only way cash is changed", () => {
    const negativeEntry: LedgerEntry = {
      ...entry,
      amount: { amount: -5000, currency: "GBP" },
    };
    const entryTwo: LedgerEntry = {
      ...entry,
      amount: { amount: 20000, currency: "GBP" },
    };
    const entryThree: LedgerEntry = {
      ...entry,
      amount: { amount: 10000, currency: "GBP" },
    };

    const negativeAdded = postEntry(game, negativeEntry);
    const twoAdded = postEntry(negativeAdded, entryTwo);
    const threeAdded = postEntry(twoAdded, entryThree);

    expect(threeAdded.company.cash.amount).toEqual(
      game.company.cash.amount + 25000,
    );
  });

  it("throws for an invalid currency code", () => {
    const euros = { amount: 5000, currency: "EUR" as CurrencyCode };
    const euroEntry: LedgerEntry = {
      ...entry,
      amount: euros,
    };
    expect(() => postEntry(game, euroEntry)).toThrow(
      "incompatible currency - expected:",
    );
  });

  it("does not modify the original state", () => {
    const clonedGame = structuredClone(game);
    postEntry(game, entry);
    expect(game).toEqual(clonedGame);
  });
});
