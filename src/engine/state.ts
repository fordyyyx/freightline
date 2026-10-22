import { seedRandom } from "./random.ts";

export interface GameState {
  readonly minutes: number;
  readonly rngState: number;
}

export function createGameState(seed: number): GameState {
  return { minutes: 0, rngState: seedRandom(seed) };
}

export function advance(state: GameState, ticks: number): GameState {
  if (!Number.isInteger(ticks) || ticks < 0) {
    throw new Error(`ticks must be a whole number of 0 or more: ${ticks}`);
  }
  return { ...state, minutes: state.minutes + ticks };
}
