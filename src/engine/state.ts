import { seedRandom } from "./random.ts";
import type { Money } from "./money.ts";
import type { Town } from "./world.ts";
import { findTown } from "./world.ts";
import type { Scenario } from "./scenarios.ts";
import { greatCircleKm } from "./distance.ts";
import { balance } from "./balance.ts";

export interface Depot {
  readonly id: string;
  readonly townId: string;
}

export interface Company {
  readonly name: string;
  readonly cash: Money;
  readonly depots: readonly Depot[];
}

export interface GameState {
  readonly minutes: number;
  readonly rngState: number;
  readonly startTime: number;
  readonly company: Company;
  readonly towns: readonly Town[];
}

export function createGame(
  scenario: Scenario,
  towns: readonly Town[],
): GameState {
  const startTown = findTown(towns, scenario.startTownId);
  const townsInRange = towns.filter(
    (town) => greatCircleKm(startTown, town) <= balance.world.jobRadiusKm,
  );

  const startingDepot = { id: "depot-1", townId: startTown.id };
  const startingCompany = {
    name: scenario.companyName,
    cash: scenario.startingCash,
    depots: [startingDepot],
  };
  return {
    minutes: 0,
    rngState: seedRandom(scenario.seed),
    startTime: scenario.startTime,
    company: startingCompany,
    towns: townsInRange,
  };
}

export function advance(state: GameState, ticks: number): GameState {
  if (!Number.isInteger(ticks) || ticks < 0) {
    throw new Error(`ticks must be a whole number of 0 or more: ${ticks}`);
  }
  return { ...state, minutes: state.minutes + ticks };
}

export function currentCalendarMinutes(state: GameState): number {
  return state.startTime + state.minutes;
}
