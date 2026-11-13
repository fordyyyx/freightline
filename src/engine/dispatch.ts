import type { Vehicle } from "./vehicles.ts";
import type { GameState } from "./state.ts";
import type { JobOffer } from "./jobs.ts";
import { balance } from "./balance.ts";
import { findTown } from "./world.ts";
import { roadKm } from "./distance.ts";

export interface EligibleVehicle {
  readonly vehicle: Vehicle;
  readonly emptyKm: number; // road km from van's town to pickup
}

export function eligibleVehicles(
  state: GameState,
  offer: JobOffer,
): EligibleVehicle[] {
  const eligibleVans = state.company.vehicles.filter(
    (vehicle) =>
      vehicle.status === "idle" &&
      balance.vehicles[vehicle.modelId].capacityKg >= offer.weightKg,
  );
  const originTown = findTown(state.towns, offer.originTownId);
  return eligibleVans
    .map((vehicle) => ({
      vehicle,
      emptyKm: roadKm(findTown(state.towns, vehicle.townId), originTown),
    }))
    .sort((a, b) => a.emptyKm - b.emptyKm);
}

export type AcceptBlock = "noIdleVan" | "tooHeavy";

export function acceptBlockedReason(
  state: GameState,
  offer: JobOffer,
): AcceptBlock | null {
  if (eligibleVehicles(state, offer).length > 0) {
    return null;
  }
  const anyIdle = state.company.vehicles.some(
    (vehicle) => vehicle.status === "idle",
  );
  return anyIdle ? "tooHeavy" : "noIdleVan";
}
