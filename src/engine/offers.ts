import { balance } from "./balance.ts";
import { roadKm } from "./distance.ts";
import {
  estimatedJobMinutes,
  jobDeadline,
  jobPay,
  type JobOffer,
} from "./jobs.ts";
import type { CargoType, JobPayInput } from "./jobs.ts";
import type { Money } from "./money.ts";
import {
  pickWeighted,
  randomInt,
  nextRandom,
  randomBetween,
} from "./random.ts";
import type { GameState } from "./state.ts";
import { depotTowns } from "./world.ts";
import { currentCalendarMinutes } from "./time.ts";

const CARGO_TYPES = Object.keys(balance.cargo) as CargoType[];

export interface GeneratedOffer {
  readonly offer: JobOffer;
  readonly state: GameState;
}

export function generateOffer(state: GameState): GeneratedOffer {
  let rng = state.rngState;

  const [home] = depotTowns(state);
  const originPick = pickWeighted(rng, state.towns, (town) => town.population);
  rng = originPick.state;
  const origin = originPick.item;

  const possibleDestinations = state.towns.filter(
    (town) =>
      town.id !== origin.id && roadKm(town, origin) >= balance.jobs.minLoadedKm,
  );
  const destinationPick = pickWeighted(
    rng,
    possibleDestinations,
    (item) => item.population / roadKm(origin, item),
  );
  rng = destinationPick.state;
  const destination = destinationPick.item;

  const cargoPick = pickWeighted(rng, CARGO_TYPES, () => 1);
  rng = cargoPick.state;
  const cargo = cargoPick.item;

  const weightPick = randomInt(
    rng,
    balance.cargo[cargo].minWeightKg,
    balance.cargo[cargo].maxWeightKg,
  );
  rng = weightPick.state;
  const weightKg = weightPick.value;

  const urgencyDraw = nextRandom(rng);
  const urgency =
    urgencyDraw.value < balance.jobs.expressChance ? "express" : "standard";
  rng = urgencyDraw.state;

  const slackRange =
    urgency === "express"
      ? balance.jobs.expressSlack
      : balance.jobs.standardSlack;

  const slackPick = randomBetween(rng, slackRange.min, slackRange.max);
  rng = slackPick.state;
  const slack = slackPick.value;

  const createdAt = currentCalendarMinutes(state);
  const homeToOriginKm = roadKm(home, origin);
  const loadedKm = roadKm(origin, destination);
  const estimatedMinutes = estimatedJobMinutes(homeToOriginKm, loadedKm);
  const deadline = jobDeadline(createdAt, estimatedMinutes, slack);

  const payInput: JobPayInput = {
    loadedKm,
    weightKg,
    cargo,
    urgency,
  };
  const amount = jobPay(payInput);
  const pay: Money = { amount, currency: state.company.cash.currency };

  const expiry = Math.min(
    createdAt + balance.jobs.offerLifetimeMinutes,
    Math.floor(deadline - estimatedMinutes),
  );

  return {
    offer: {
      id: `job-${state.nextJobId}`,
      originTownId: origin.id,
      destinationTownId: destination.id,
      cargo,
      weightKg,
      urgency,
      pay,
      createdAt,
      expiresAt: expiry,
      deadline,
    },
    state: { ...state, rngState: rng, nextJobId: state.nextJobId + 1 },
  };
}
