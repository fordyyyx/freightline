import { plymouthSandbox } from "../engine/scenarios.ts";
import { advance, createGame } from "../engine/state.ts";
import type { GameState } from "../engine/state.ts";
import type { Speed } from "../engine/clock.ts";
import { create } from "zustand";
import towns from "../data/towns.json";
import { acceptJob as acceptJobCommand } from "../engine/dispatch.ts";

export interface GameStore {
  game: GameState;
  speed: Speed;
  setSpeed: (speed: Speed) => void;
  tick: (ticks: number) => void;
  acceptJob: (jobId: string, vehicleId: string) => void;
}

export const useGameStore = create<GameStore>()((set) => ({
  game: createGame(plymouthSandbox, towns),
  speed: 0,
  setSpeed: (speed: Speed) => set({ speed }),
  tick: (ticks: number) =>
    set((store) => ({ game: advance(store.game, ticks) })),
  acceptJob: (jobId, vehicleId) =>
    set((store) => ({ game: acceptJobCommand(store.game, jobId, vehicleId) })),
}));
