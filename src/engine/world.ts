import type { Coordinates } from "./distance.ts";
import type { Depot, GameState } from "./state.ts";

export interface Town extends Coordinates {
  readonly id: string;
  readonly name: string;
  readonly countryCode: string;
  readonly population: number;
}

export function findTown(towns: readonly Town[], id: string): Town {
  const foundTown = towns.find((town) => town.id === id);
  if (!foundTown) {
    throw new Error(`Town not found: ${id}`);
  }
  return foundTown;
}

export function depotTowns(state: GameState): readonly Town[] {
  const towns = state.company.depots.map((depot: Depot) =>
    findTown(state.towns, depot.townId),
  );
  return towns;
}
