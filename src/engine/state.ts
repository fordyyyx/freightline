import { seedRandom } from "./random.ts";
import type { Money } from "./money.ts";
import type { Town } from "./world.ts";
import { findTown } from "./world.ts";
import type { FailureRule, Scenario } from "./scenarios.ts";
import type { Vehicle } from "./vehicles.ts";
import { greatCircleKm } from "./distance.ts";
import { balance } from "./balance.ts";
import type { ActiveJob, JobOffer } from "./jobs.ts";
import { arriveOffers, fillBoard, removeExpiredOffers } from "./offers.ts";
import type { CompletedJob } from "./dispatch.ts";
import { advanceTrips } from "./dispatch.ts";
import type { LedgerEntry } from "./ledger.ts";
import { chargeRent, checkBankruptcy } from "./economy.ts";
import { companyNameProblem } from "./company.ts";

export interface Depot {
  readonly id: string;
  readonly townId: string;
}

export interface Company {
  readonly name: string;
  readonly cash: Money;
  readonly depots: readonly Depot[];
  readonly vehicles: readonly Vehicle[];
}

export interface GameOver {
  readonly reason: "bankruptcy";
  readonly at: number; // calendar minutes
}

export interface GameState {
  readonly minutes: number;
  readonly rngState: number;
  readonly startTime: number;
  readonly company: Company;
  readonly towns: readonly Town[];
  readonly nextJobId: number;
  readonly board: readonly JobOffer[];
  readonly activeJobs: readonly ActiveJob[];
  readonly completedJobs: readonly CompletedJob[];
  readonly ledger: readonly LedgerEntry[];
  readonly failureRule: FailureRule;
  readonly belowZeroSince: number | null; // calendar minutes, or null if cash isn't below zero
  readonly gameOver: GameOver | null;
}

export function createGame(
  scenario: Scenario,
  towns: readonly Town[],
  companyName: string = scenario.companyName,
): GameState {
  const startTown = findTown(towns, scenario.startTownId);
  const townsInRange = towns.filter(
    (town) => greatCircleKm(startTown, town) <= balance.world.jobRadiusKm,
  );

  const startingDepot = { id: "depot-1", townId: startTown.id };
  const startingVehicles: Vehicle[] = scenario.startingVehicles.map(
    (modelId, i) => ({
      id: `vehicle-${i + 1}`,
      modelId,
      homeDepotId: startingDepot.id,
      townId: startTown.id,
      status: "idle",
    }),
  );

  const name = companyName.trim();
  const problem = companyNameProblem(name);

  if (problem !== null) {
    throw new Error(`Invalid company name (${problem}): "${name}"`);
  }
  const startingCompany = {
    name,
    cash: scenario.startingCash,
    depots: [startingDepot],
    vehicles: startingVehicles,
  };
  const newGame = {
    minutes: 0,
    rngState: seedRandom(scenario.seed),
    startTime: scenario.startTime,
    company: startingCompany,
    towns: townsInRange,
    nextJobId: 1,
    board: [],
    activeJobs: [],
    completedJobs: [],
    ledger: [],
    failureRule: scenario.failureRule,
    belowZeroSince: null,
    gameOver: null,
  };
  return fillBoard(newGame, balance.jobs.initialOffers);
}

function advanceOneMinute(state: GameState): GameState {
  const ticked = { ...state, minutes: state.minutes + 1 };
  const offersRemoved = removeExpiredOffers(ticked);
  const tripsAdvanced = advanceTrips(offersRemoved);
  const rentCharged = chargeRent(tripsAdvanced);
  const offersArrived = arriveOffers(rentCharged);
  return checkBankruptcy(offersArrived); // must stay last: sees the minute's final cash
}

export function advance(state: GameState, ticks: number): GameState {
  if (!Number.isInteger(ticks) || ticks < 0) {
    throw new Error(`ticks must be a whole number of 0 or more: ${ticks}`);
  }
  if (state.gameOver !== null) {
    return state;
  }
  let current = state;
  for (let i = 0; i < ticks; i++) {
    current = advanceOneMinute(current);
    if (current.gameOver !== null) {
      break;
    }
  }
  return current;
}
