import { balance } from "./balance.ts";

const MAX_FRAME_MS = 250;
const MS_PER_SECOND = 1000;
const FLOAT_TOLERANCE = 1e-9; // floats cannot be stored exactly so anything within FLOAT_TOLERANCE is treated as exact

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
  const elapsedSeconds =
    Math.min(Math.max(elapsedMs, 0), MAX_FRAME_MS) / MS_PER_SECOND;
  const totalMinutes =
    carry + elapsedSeconds * balance.time.gameMinutesPerRealSecond * speed;
  const ticks = Math.floor(totalMinutes + FLOAT_TOLERANCE);
  const newCarry = Math.max(0, totalMinutes - ticks);
  return { ticks, carry: newCarry };
}
