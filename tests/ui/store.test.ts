import { beforeEach, describe, it, expect } from "vitest";
import { useGameStore } from "../../src/ui/store.ts";

beforeEach(() => {
  useGameStore.setState(useGameStore.getInitialState());
});

describe("useGameStore", () => {
  it("starts paused", () => {
    expect(useGameStore.getState().game.minutes).toBe(0);
  });

  it("correctly changes speed to 2", () => {
    useGameStore.getState().setSpeed(2);

    expect(useGameStore.getState().speed).toBe(2);
  });

  it("correctly advances game minutes each tick", () => {
    useGameStore.getState().tick(5);
    expect(useGameStore.getState().game.minutes).toBe(5);
  });

  it("accepts a job through the store", () => {
    const [offer] = useGameStore.getState().game.board;
    if (offer === undefined) {
      throw new Error("expected the new game to have offers");
    }

    useGameStore.getState().acceptJob(offer.id, "vehicle-1");

    const { game } = useGameStore.getState();
    expect(game.board.map((o) => o.id)).not.toContain(offer.id);
    expect(game.activeJobs).toHaveLength(1);
  });
});
