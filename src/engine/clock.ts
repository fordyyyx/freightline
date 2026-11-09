import { balance } from "./balance.ts";

const MAX_FRAME_MS = 250;
const MS_PER_S = 1000;
const FLOAT_TOLERANCE = 1e-9;

export type Speed = 0 | 1 | 2 | 4;

export interface FrameResult {
  readonly ticks: number;
  readonly carry: number;
}

export function ticksForFrame(
  carry: number,
  elapsedMs: number,
  speed: Speed,
): FrameResult {
  const elapsedSeconds = Math.min(elapsedMs, MAX_FRAME_MS) / MS_PER_S;
  let elapsedGameMinutes =
    elapsedSeconds * balance.time.gameMinutesPerRealSecond * speed;
  elapsedGameMinutes += carry;
  const ticks = Math.floor(elapsedGameMinutes + FLOAT_TOLERANCE);
  const newCarry = Math.max(0, elapsedGameMinutes - ticks);
  return { ticks, carry: newCarry };
}
