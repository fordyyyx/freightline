import { balance } from "./balance.ts";

export type VehicleModelId = keyof typeof balance.vehicles;

export interface VehicleModel {
  readonly mode: "road";
  readonly capacityKg: number;
  readonly speedKmh: number;
  readonly price: number; // minor units
  readonly fuelLitresPer100Km: number;
  readonly maintenancePerKm: number; // minor units per km
}

function isVehicleModelId(id: string): id is VehicleModelId {
  return Object.hasOwn(balance.vehicles, id);
}

export function findVehicleModel(id: string): VehicleModel {
  if (isVehicleModelId(id)) {
    return balance.vehicles[id];
  }
  throw new Error(`Vehicle model not found: ${id}`);
}
