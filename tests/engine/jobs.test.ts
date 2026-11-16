import { describe, it, expect } from "vitest";
import {
  jobPay,
  estimatedJobMinutes,
  jobDeadline,
  driveMinutes,
  latePay,
} from "../../src/engine/jobs.ts";
import { toCalendarMinutes } from "../../src/engine/time.ts";
import type { JobPayInput } from "../../src/engine/jobs.ts";

const awkwardJobs: JobPayInput[] = [
  { loadedKm: 8, weightKg: 55, cargo: "parcels", urgency: "standard" },
  {
    loadedKm: 37,
    weightKg: 1234,
    cargo: "buildingSupplies",
    urgency: "express",
  },
  { loadedKm: 400, weightKg: 1100, cargo: "furniture", urgency: "standard" },
  { loadedKm: 220, weightKg: 972, cargo: "groceries", urgency: "express" },
];

describe("jobPay", () => {
  it("returns correctly for known standard values", () => {
    const input: JobPayInput = {
      loadedKm: 40,
      weightKg: 200,
      cargo: "parcels",
      urgency: "standard",
    };

    expect(jobPay(input)).toBe(5500);
  });

  it("returns correctly for known express values", () => {
    const input: JobPayInput = {
      loadedKm: 40,
      weightKg: 200,
      cargo: "parcels",
      urgency: "express",
    };

    expect(jobPay(input)).toBe(7700);
  });

  it("returns correctly for a different cargo", () => {
    const input: JobPayInput = {
      loadedKm: 40,
      weightKg: 200,
      cargo: "electronics",
      urgency: "standard",
    };

    expect(jobPay(input)).toBe(6900);
  });

  it.each(awkwardJobs)("pays whole pounds for $loadedKm of $cargo", (job) => {
    expect(jobPay(job) % 100).toBe(0);
  });
});

describe("estimatedJobMinutes", () => {
  it("returns correctly for known values", () => {
    expect(estimatedJobMinutes(30, 40)).toBeCloseTo(120.769, 3);
  });
});

describe("jobDeadline", () => {
  it("returns correctly for known values", () => {
    const createdAt = toCalendarMinutes(2027, 3, 1, 8, 0);
    expect(jobDeadline(createdAt, 120.769, 2.0)).toBe(
      toCalendarMinutes(2027, 3, 1, 12, 15),
    );
  });

  it("does not round up for deadlines already on a quarter of an hour", () => {
    const createdAt = toCalendarMinutes(2027, 3, 1, 8, 0);
    expect(jobDeadline(createdAt, 60, 2.0)).toBe(
      toCalendarMinutes(2027, 3, 1, 10, 0),
    );
  });

  it("does not round up due to floating point errors", () => {
    expect(jobDeadline(0, 225, 2.2)).toBe(495);
  });
});

describe("driveMinutes", () => {
  it("correctly handling floating point numbers", () => {
    const minutes = driveMinutes(22, 55);
    expect(minutes).toBe(24);
  });
});

describe("latePay", () => {
  it("correctly returns for an early job", () => {
    expect(latePay(5500, -30)).toBe(5500);
  });

  it("correctly returns for an on time job", () => {
    expect(latePay(5500, 0)).toBe(5500);
  });

  it("correctly returns for a job finished up to 1 hour late", () => {
    expect(latePay(5500, 1)).toBe(5000);
  });

  it("correctly returns for a job on the limit of one hour", () => {
    expect(latePay(5500, 60)).toBe(5000);
  });

  it("correctly returns for a job two hours late", () => {
    expect(latePay(5500, 61)).toBe(4400);
  });

  it("correctly returns at the highest possible penalty", () => {
    expect(latePay(5500, 360)).toBe(2200);
  });

  it("does not give a value below 40% of the full pay", () => {
    expect(latePay(5500, 361)).toBe(2200);
  });
});
