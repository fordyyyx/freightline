import { balance } from "./balance.ts";
import type { GameState } from "./state.ts";
import { currentCalendarMinutes } from "./time.ts";

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

export function findVehicle(vehicles: readonly Vehicle[], id: string): Vehicle {
  const vehicle = vehicles.find((candidate) => candidate.id === id);

  if (!vehicle) {
    throw new Error(`Vehicle not found: ${id}`);
  }
  return vehicle;
}

export type VehicleStatus = "idle" | "collecting" | "delivering";

export type VehicleActivity =
  | { readonly kind: "idle"; readonly townId: string }
  | {
      readonly kind: "driving";
      readonly toTownId: string;
      readonly arrivesAt: number;
    }
  | {
      readonly kind: "loading";
      readonly townId: string;
      readonly until: number;
    }
  | {
      readonly kind: "unloading";
      readonly townId: string;
      readonly until: number;
    };

export function vehicleActivity(
  state: GameState,
  vehicle: Vehicle,
): VehicleActivity {
  const active = state.activeJobs.find((a) => a.vehicleId === vehicle.id);
  if (active === undefined) {
    return { kind: "idle", townId: vehicle.townId };
  }
  const now = currentCalendarMinutes(state);
  const legs = active.plan.legs;
  const current = legs.find(
    (leg) => leg.departsAt <= now && now < leg.arrivesAt,
  );

  if (current !== undefined) {
    return {
      kind: "driving",
      toTownId: current.toTownId,
      arrivesAt: current.arrivesAt,
    };
  }

  if (now < active.plan.loadingEndsAt) {
    return {
      kind: "loading",
      townId: active.job.originTownId,
      until: active.plan.loadingEndsAt,
    };
  }

  return {
    kind: "unloading",
    townId: active.job.destinationTownId,
    until: active.plan.unloadingEndsAt,
  };
}

export interface Vehicle {
  readonly id: string;
  readonly modelId: VehicleModelId;
  readonly homeDepotId: string;
  readonly townId: string;
  readonly status: VehicleStatus;
}
