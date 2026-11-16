import type { Money } from "./money.ts";
import type { GameState } from "./state.ts";

interface EntryBase {
  readonly at: number; // calendar minutes
  readonly amount: Money; //positive for money in, negative for money out
}

export interface JobPayEntry extends EntryBase {
  readonly kind: "jobPay";
  readonly jobId: string;
  readonly late: boolean;
}

export interface RentEntry extends EntryBase {
  readonly kind: "rent";
  readonly depotId: string;
}

export type LedgerEntry = JobPayEntry | RentEntry;

export function postEntry(state: GameState, entry: LedgerEntry): GameState {
  const companyCurrency = state.company.cash.currency;
  if (entry.amount.currency !== companyCurrency) {
    throw new Error(
      `incompatible currency - expected: ${companyCurrency}. got: ${entry.amount.currency}`,
    );
  }
  const ledger = [...state.ledger, entry];

  return {
    ...state,
    ledger,
    company: {
      ...state.company,
      cash: {
        ...state.company.cash,
        amount: state.company.cash.amount + entry.amount.amount,
      },
    },
  };
}
