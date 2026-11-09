import { useEffect } from "react";
import { ticksForFrame } from "../engine/clock.ts";
import { useGameStore } from "./store.ts";

export function useGameLoop(): void {
  useEffect(() => {
    let frameId = 0;
    let lastTime: number | null = null;
    let carry = 0;

    function frame(now: number) {
      if (lastTime !== null) {
        const state = useGameStore.getState();
        const ticked = ticksForFrame(carry, now - lastTime, state.speed);
        carry = ticked.carry;
        if (ticked.ticks > 0) {
          state.tick(ticked.ticks);
        }
      }
      lastTime = now;
      frameId = requestAnimationFrame(frame);
    }

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, []);
}
