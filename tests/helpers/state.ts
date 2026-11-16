import type { GameState } from "../../src/engine/state.ts";
import { advance } from "../../src/engine/state.ts";
import type { Vehicle } from "../../src/engine/vehicles.ts";
import { findVehicle } from "../../src/engine/vehicles.ts";
import { currentCalendarMinutes } from "../../src/engine/time.ts";

export function vanIn(state: GameState): Vehicle {
  return findVehicle(state.company.vehicles, "vehicle-1");
}

export function advanceTo(state: GameState, time: number): GameState {
  return advance(state, time - currentCalendarMinutes(state));
}
