import { describe, it, expect } from "vitest";
import {
  formatMoney,
  formatGameDate,
  formatShortGameTime,
} from "../../src/ui/format.ts";
import { toCalendarMinutes } from "../../src/engine/time.ts";

describe("formatMoney", () => {
  it("formats known money correctly", () => {
    expect(formatMoney({ amount: 150000, currency: "GBP" })).toEqual(
      "£1,500.00",
    );
  });
});

describe("formatGameDate", () => {
  it("formats known dates correctly", () => {
    expect(formatGameDate(toCalendarMinutes(2027, 3, 1, 8, 0))).toEqual(
      "Mon 1 Mar 2027, 08:00",
    );
  });

  it("formats advanced dates correctly", () => {
    expect(formatGameDate(toCalendarMinutes(2027, 3, 1, 8, 0) + 1440)).toEqual(
      "Tue 2 Mar 2027, 08:00",
    );
  });

  it("formats changes of months correctly", () => {
    expect(formatGameDate(toCalendarMinutes(2027, 3, 31, 23, 59) + 1)).toEqual(
      "Thu 1 Apr 2027, 00:00",
    );
  });

  it("does not jump for BST", () => {
    expect(formatGameDate(toCalendarMinutes(2027, 3, 28, 0, 59) + 1)).toEqual(
      "Sun 28 Mar 2027, 01:00",
    );
  });

  describe("formatShortGameTime", () => {
    it("correctly formats a known date", () => {
      expect(formatShortGameTime(toCalendarMinutes(2027, 3, 1, 8, 0))).toEqual(
        "Mon 08:00",
      );
    });

    it("correctly formats times across days", () => {
      expect(
        formatShortGameTime(toCalendarMinutes(2027, 3, 1, 23, 59) + 1),
      ).toEqual("Tue 00:00");
    });

    it("correctly uses UTC time format", () => {
      expect(
        formatShortGameTime(toCalendarMinutes(2027, 3, 28, 0, 59) + 1),
      ).toEqual("Sun 01:00");
    });
  });
});
