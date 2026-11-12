import { describe, it, expect } from "vitest";
import { jobPay } from "../../src/engine/jobs.ts";
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
