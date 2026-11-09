import { describe, it, expect } from "vitest";
import { ticksForFrame } from "../../src/engine/clock";
import type { Speed } from "../../src/engine/clock";

function runFrames(frameMs: number, count: number, speed: Speed) {
  let carry: number = 0;
  let totalTicks: number = 0;
  for (let i = 0; i < count; i++) {
    const frameResult = ticksForFrame(carry, frameMs, speed);
    totalTicks += frameResult.ticks;
    carry = frameResult.carry;
  }
  return totalTicks;
}

describe("ticksForFrame", () => {
  it("runs correctly at 1x speed 60 fps", () => {
    expect(runFrames(1000 / 60, 600, 1)).toBe(24);
  });

  it("runs correctly at 2x speed 60 fps", () => {
    expect(runFrames(1000 / 60, 600, 2)).toBe(48);
  });

  it("runs correctly at 4x speed 60 fps", () => {
    expect(runFrames(1000 / 60, 600, 4)).toBe(96);
  });

  it("runs correctly at 1x speed 30 fps", () => {
    expect(runFrames(1000 / 30, 300, 1)).toBe(24);
  });

  it("does not tick when time is paused", () => {
    expect(runFrames(1000 / 60, 600, 0)).toBe(0);
  });

  it("runs correctly at compounded different speeds", () => {
    const fiveSecsAtOne = runFrames(1000 / 60, 300, 1);
    const fiveSecsAtFour = runFrames(1000 / 60, 300, 4);
    expect(fiveSecsAtOne + fiveSecsAtFour).toBe(60);
  });

  it("does not tick when the game is hidden for more than the maximum frame length", () => {
    expect(runFrames(300000, 1, 1)).toBe(0);
  });
});
