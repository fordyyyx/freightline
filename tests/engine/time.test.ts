import { describe, it, expect } from "vitest";
import { toCalendarMinutes, isStartOfDay } from "../../src/engine/time.ts";

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

describe("isStartOfDay", () => {
  it("returns true for the 00:00 on any day", () => {
    expect(isStartOfDay(toCalendarMinutes(2027, 3, 2, 0, 0))).toBe(true);
  });

  it("is false one minute before or after midnight", () => {
    expect(isStartOfDay(toCalendarMinutes(2027, 3, 2, 0, 1))).toBe(false);
    expect(isStartOfDay(toCalendarMinutes(2027, 3, 1, 23, 59))).toBe(false);
  });

  it("ignore UK timezone date changes", () => {
    expect(isStartOfDay(toCalendarMinutes(2027, 3, 28, 0, 0))).toBe(true);
  });
});
