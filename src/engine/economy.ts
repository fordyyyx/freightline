import { balance } from "./balance.ts";
import { postEntry, type RentEntry } from "./ledger.ts";
import type { GameState } from "./state.ts";
import {
  currentCalendarMinutes,
  isStartOfDay,
  MINUTES_PER_DAY,
} from "./time.ts";

export function chargeRent(state: GameState): GameState {
  const now = currentCalendarMinutes(state);
  if (!isStartOfDay(now)) {
    return state;
  }
  let updated: GameState = state;
  for (const depot of state.company.depots) {
    const rent: RentEntry = {
      kind: "rent",
      at: now,
      amount: {
        amount: -balance.economy.depotRentPerDay,
        currency: state.company.cash.currency,
      },
      depotId: depot.id,
    };
    updated = postEntry(updated, rent);
  }
  return updated;
}

export function checkBankruptcy(state: GameState): GameState {
  const now = currentCalendarMinutes(state);
  const belowZero = state.company.cash.amount < 0;

  if (!belowZero) {
    if (state.belowZeroSince === null) {
      return state;
    }
    return { ...state, belowZeroSince: null };
  }

  if (state.belowZeroSince === null) {
    return { ...state, belowZeroSince: now };
  }

  if (
    now - state.belowZeroSince >=
    state.failureRule.daysBelowZero * MINUTES_PER_DAY
  ) {
    return { ...state, gameOver: { reason: "bankruptcy", at: now } };
  }
  return state;
}
