import type { Money } from "./money.ts";
import { toCalendarMinutes } from "./time.ts";
import type { VehicleModelId } from "./vehicles.ts";

export interface Scenario {
  readonly id: string;
  readonly companyName: string;
  readonly startTownId: string;
  readonly startTime: number;
  readonly startingCash: Money;
  readonly seed: number;
  readonly startingVehicles: readonly VehicleModelId[];
  readonly failureRule: FailureRule;
}

export type FailureRule = {
  readonly kind: "bankruptcy";
  readonly daysBelowZero: number;
};

export const plymouthSandbox: Scenario = {
  id: "plymouth-sandbox",
  companyName: "PlymFreight",
  startTownId: "Q43382",
  startTime: toCalendarMinutes(2027, 3, 1, 8, 0),
  startingCash: { amount: 150000, currency: "GBP" },
  seed: 1,
  startingVehicles: ["compactVan"],
  failureRule: { kind: "bankruptcy", daysBelowZero: 14 },
};

export const bankruptcyTest: Scenario = {
  ...plymouthSandbox,
  id: "bankruptcy-test",
  startingCash: { amount: 3000, currency: "GBP" },
  failureRule: { kind: "bankruptcy", daysBelowZero: 1 },
};

export const SCENARIOS: readonly Scenario[] = [plymouthSandbox];
