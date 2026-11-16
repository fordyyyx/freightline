import type {
  Vehicle,
  VehicleModelId,
  VehicleStatus,
} from "../engine/vehicles.ts";
import type { CargoType } from "../engine/jobs.ts";
import type { GameState } from "../engine/state.ts";
import { vehicleNextStop } from "../engine/dispatch.ts";
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
  const nextStop = vehicleNextStop(game, vehicle);
  const job = game.activeJobs.find((a) => a.vehicleId === vehicle.id);
  const lines = [vehicleLabel(vehicle), STATUS_LABELS[vehicle.status]];
  if (job === undefined) {
    lines.push(findTown(game.towns, vehicle.townId).name);
    return lines;
  }
  if (nextStop === null) {
    lines.push(
      `Unloading at ${findTown(game.towns, job.job.destinationTownId).name}`,
    );
    return lines;
  }

  lines.push(`Heading to ${nextStop.name}`);
  const eta = job.plan.unloadingEndsAt;
  lines.push(`ETA ${formatShortGameTime(eta)}`);
  return lines;
}
