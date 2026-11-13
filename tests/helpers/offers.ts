import type { JobOffer } from "../../src/engine/jobs.ts";

export function makeOffer(overrides: Partial<JobOffer>): JobOffer {
  return {
    id: "job-1",
    originTownId: "A",
    destinationTownId: "B",
    cargo: "parcels",
    weightKg: 100,
    urgency: "standard",
    pay: { amount: 5000, currency: "GBP" },
    createdAt: 0,
    expiresAt: 480,
    deadline: 300,
    ...overrides,
  };
}
