import type {
  Vehicle,
  VehicleModelId,
  VehicleStatus,
} from "../engine/vehicles.ts";
import type { CargoType } from "../engine/jobs.ts";

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
};

export function vehicleLabel(vehicle: Vehicle): string {
  return `${MODEL_LABELS[vehicle.modelId]} ${vehicle.id.replace("vehicle-", "")}`;
}
