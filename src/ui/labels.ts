import {
  vehicleActivity,
  type Vehicle,
  type VehicleModelId,
  type VehicleStatus,
} from "../engine/vehicles.ts";
import type { CargoType } from "../engine/jobs.ts";
import type { GameState } from "../engine/state.ts";
import { findTown } from "../engine/world.ts";
import { formatShortGameTime } from "./format.ts";

const MODEL_LABELS: Record<VehicleModelId, string> = {
  compactVan: "Compact van",
  panelVan: "Panel van",
};

export const CARGO_LABELS: Record<CargoType, string> = {
  parcels: "Parcels",
  groceries: "Groceries",
  furniture: "Furniture",
  buildingSupplies: "Building supplies",
  electronics: "Electronics",
};

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  idle: "Idle",
  collecting: "Collecting",
  delivering: "Delivering",
};

export function vehicleLabel(vehicle: Vehicle): string {
  return `${MODEL_LABELS[vehicle.modelId]} ${vehicle.id.replace("vehicle-", "")}`;
}

export function vanTooltipLines(game: GameState, vehicle: Vehicle): string[] {
  const lines = [vehicleLabel(vehicle), STATUS_LABELS[vehicle.status]];
  const activity = vehicleActivity(game, vehicle);
  const townName = (id: string) => findTown(game.towns, id).name;

  switch (activity.kind) {
    case "idle":
      lines.push(townName(activity.townId));
      break;
    case "driving":
      lines.push(
        `Driving to ${townName(activity.toTownId)}, arrives ${formatShortGameTime(activity.arrivesAt)}`,
      );
      break;
    case "loading":
      lines.push(
        `Loading at ${townName(activity.townId)} until ${formatShortGameTime(activity.until)}`,
      );
      break;
    case "unloading":
      lines.push(
        `Unloading at ${townName(activity.townId)} until ${formatShortGameTime(activity.until)}`,
      );
      break;
  }

  const active = game.activeJobs.find((job) => job.vehicleId === vehicle.id);
  if (active !== undefined && activity.kind !== "unloading") {
    lines.push(
      `Delivers to ${townName(active.job.destinationTownId)}, ETA ${formatShortGameTime(active.plan.unloadingEndsAt)}`,
    );
  }

  return lines;
}
