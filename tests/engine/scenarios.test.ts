import { describe, it, expect } from "vitest";
import { plymouthSandbox } from "../../src/engine/scenarios.ts";
import { toCalendarMinutes } from "../../src/engine/time.ts";

describe("plymouthSandbox", () => {
  it("contains the correct start town", () => {
    expect(plymouthSandbox.startTownId).toBe("Q43382");
  });

  it("contains the correct start time", () => {
    expect(plymouthSandbox.startTime).toBe(toCalendarMinutes(2027, 3, 1, 8, 0));
  });

  it("contains the correct starting cash", () => {
    expect(plymouthSandbox.startingCash).toEqual({
      amount: 150000,
      currency: "GBP",
    });
  });

  it("contains a company name", () => {
    expect(plymouthSandbox.companyName.length).toBeGreaterThan(0);
  });

  it("contains an integer seed", () => {
    expect(Number.isInteger(plymouthSandbox.seed)).toBe(true);
  });
});
