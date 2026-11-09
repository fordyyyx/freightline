import { describe, it, expect } from "vitest";
import { toCalendarMinutes } from "../../src/engine/time.ts";

describe("toCalendarMinutes", () => {
  it("matches an expected value for 1 Mar 2027 08:00", () => {
    expect(toCalendarMinutes(2027, 3, 1, 8, 0)).toBe(30064800);
  });

  it("calculates consecutive days correctly", () => {
    expect(toCalendarMinutes(2027, 3, 2, 8, 0)).toBe(
      toCalendarMinutes(2027, 3, 1, 8, 0) + 1440,
    );
  });

  it("calculates consecutive months correctly", () => {
    expect(toCalendarMinutes(2027, 3, 31, 23, 59) + 1).toBe(
      toCalendarMinutes(2027, 4, 1, 0, 0),
    );
  });

  it("correctly numbers months", () => {
    expect(
      toCalendarMinutes(2027, 3, 1, 0, 0) -
        toCalendarMinutes(2027, 2, 28, 0, 0),
    ).toBe(1440);
  });
});
