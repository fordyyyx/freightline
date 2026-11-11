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
}

export const plymouthSandbox: Scenario = {
  id: "plymouth-sandbox",
  companyName: "PlymFreight",
  startTownId: "Q43382",
  startTime: toCalendarMinutes(2027, 3, 1, 8, 0),
  startingCash: { amount: 150000, currency: "GBP" },
  seed: 1,
  startingVehicles: ["compactVan"],
};
