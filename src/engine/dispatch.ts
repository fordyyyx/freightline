import { findVehicle, type Vehicle } from "./vehicles.ts";
import type { GameState } from "./state.ts";
import type { JobOffer, ActiveJob } from "./jobs.ts";
import type { Town } from "./world.ts";
import { balance } from "./balance.ts";
import { findTown } from "./world.ts";
import { roadKm, type Coordinates } from "./distance.ts";
import { driveMinutes } from "./jobs.ts";
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
  const plan = planTrip(state.towns, vehicle, offer, now);

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
      plan,
    },
  ];
  return {
    ...state,
    board: newBoard,
    company: { ...state.company, vehicles: newVehicles },
    activeJobs: newActiveJobs,
  };
}

export interface Leg {
  readonly fromTownId: string;
  readonly toTownId: string;
  readonly departsAt: number; // calendar minutes
  readonly arrivesAt: number; // calendar minutes
}

export interface TripPlan {
  readonly legs: readonly Leg[]; // v0.1: [empty, loaded]
  readonly loadingEndsAt: number;
  readonly unloadingEndsAt: number;
}

export function planTrip(
  towns: readonly Town[],
  vehicle: Vehicle,
  offer: JobOffer,
  now: number,
): TripPlan {
  const emptyKm = roadKm(
    findTown(towns, vehicle.townId),
    findTown(towns, offer.originTownId),
  );
  const vanSpeed = balance.vehicles[vehicle.modelId].speedKmh;
  const empty: Leg = {
    fromTownId: vehicle.townId,
    toTownId: offer.originTownId,
    departsAt: now,
    arrivesAt: now + driveMinutes(emptyKm, vanSpeed),
  };
  const loadingEndsAt = empty.arrivesAt + balance.handling.loadingMinutes;
  const loaded: Leg = {
    fromTownId: offer.originTownId,
    toTownId: offer.destinationTownId,
    departsAt: loadingEndsAt,
    arrivesAt:
      loadingEndsAt + driveMinutes(offerLoadedKm(towns, offer), vanSpeed),
  };
  const unloadingEndsAt = loaded.arrivesAt + balance.handling.unloadingMinutes;

  return {
    legs: [empty, loaded],
    loadingEndsAt,
    unloadingEndsAt,
  };
}

export interface CompletedJob {
  readonly job: JobOffer;
  readonly vehicleId: string;
  readonly acceptedAt: number; // calendar minutes
  readonly completedAt: number; // calendar minutes
}

export function advanceTrips(state: GameState): GameState {
  const now = currentCalendarMinutes(state);

  const vehicles = state.company.vehicles.map((van): Vehicle => {
    const active = state.activeJobs.find((a) => a.vehicleId === van.id);
    if (active === undefined) {
      return van;
    }
    if (now >= active.plan.unloadingEndsAt) {
      return { ...van, status: "idle", townId: active.job.destinationTownId };
    }
    if (now >= active.plan.loadingEndsAt) {
      return { ...van, status: "delivering" };
    }
    return van;
  });

  const finishedJobs = state.activeJobs.filter(
    (a) => now >= a.plan.unloadingEndsAt,
  );
  const newlyCompleted = finishedJobs.map((active): CompletedJob => ({
    job: active.job,
    vehicleId: active.vehicleId,
    acceptedAt: active.acceptedAt,
    completedAt: active.plan.unloadingEndsAt,
  }));
  const activeJobs = state.activeJobs.filter(
    (a) => now < a.plan.unloadingEndsAt,
  );

  return {
    ...state,
    completedJobs: [...state.completedJobs, ...newlyCompleted],
    company: { ...state.company, vehicles },
    activeJobs,
  };
}

export function vehiclePositionAt(
  state: GameState,
  vehicle: Vehicle,
): Coordinates {
  const activeJob = state.activeJobs.find(
    (job) => job.vehicleId === vehicle.id,
  );
  if (activeJob === undefined) {
    return findTown(state.towns, vehicle.townId);
  }
  const now = currentCalendarMinutes(state);
  const legs = activeJob.plan.legs;
  const current = legs.find(
    (leg) => leg.departsAt <= now && now < leg.arrivesAt,
  );
  if (current !== undefined) {
    const from = findTown(state.towns, current.fromTownId);
    const to = findTown(state.towns, current.toTownId);
    const fraction =
      (now - current.departsAt) / (current.arrivesAt - current.departsAt);
    return {
      lat: from.lat + (to.lat - from.lat) * fraction,
      lon: from.lon + (to.lon - from.lon) * fraction,
    };
  }

  const arrived = legs.filter((leg) => leg.arrivesAt <= now);
  const last = arrived[arrived.length - 1];
  return findTown(
    state.towns,
    last === undefined ? vehicle.townId : last.toTownId,
  );
}
