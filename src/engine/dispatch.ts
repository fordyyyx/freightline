import { findVehicle, type Vehicle } from "./vehicles.ts";
import type { GameState } from "./state.ts";
import type { JobOffer, ActiveJob } from "./jobs.ts";
import { balance } from "./balance.ts";
import { findTown } from "./world.ts";
import { roadKm } from "./distance.ts";
import { jobEta } from "./jobs.ts";
import { currentCalendarMinutes } from "./time.ts";
import { offerLoadedKm } from "./offers.ts";

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

export function acceptJob(
  state: GameState,
  jobId: string,
  vehicleId: string,
): GameState {
  const vehicles = state.company.vehicles;
  const offer = state.board.find((job) => job.id === jobId);
  if (!offer) {
    throw new Error(`Offer not open: ${jobId}`);
  }
  const vehicle = findVehicle(vehicles, vehicleId);
  if (!vehicle) {
    throw new Error(`Vehicle not found: ${vehicleId}`);
  }
  if (vehicle.status !== "idle") {
    throw new Error(`Vehicle not idle: ${vehicleId}`);
  }
  const model = balance.vehicles[vehicle.modelId];
  if (model.capacityKg < offer.weightKg) {
    throw new Error(`Too heavy for ${vehicleId}: ${offer.weightKg} kg`);
  }

  const now = currentCalendarMinutes(state);
  const emptyKm = roadKm(
    findTown(state.towns, vehicle.townId),
    findTown(state.towns, offer.originTownId),
  );
  const eta = jobEta(
    now,
    emptyKm,
    offerLoadedKm(state.towns, offer),
    model.speedKmh,
  );

  const newBoard = state.board.filter((job) => job.id !== jobId);
  const newVehicles = vehicles.map((van): Vehicle =>
    van.id === vehicleId ? { ...van, status: "collecting" } : van,
  );
  const newActiveJobs: ActiveJob[] = [
    ...state.activeJobs,
    {
      job: offer,
      vehicleId,
      acceptedAt: now,
      eta,
    },
  ];
  return {
    ...state,
    board: newBoard,
    company: { ...state.company, vehicles: newVehicles },
    activeJobs: newActiveJobs,
  };
}
