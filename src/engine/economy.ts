import { balance } from "./balance.ts";
import { postEntry, type RentEntry } from "./ledger.ts";
import type { GameState } from "./state.ts";
import { currentCalendarMinutes, isStartOfDay } from "./time.ts";

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
