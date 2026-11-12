import { describe, it, expect } from "vitest";
import {
  nextRandom,
  seedRandom,
  pickWeighted,
} from "../../src/engine/random.ts";

function draw(seed: number, count: number): number[] {
  return drawFrom(seedRandom(seed), count).values;
}

function drawFrom(
  state: number,
  count: number,
): { values: number[]; state: number } {
  const values: number[] = [];
  let current = state;
  for (let i = 0; i < count; i++) {
    const result = nextRandom(current);
    values.push(result.value);
    current = result.state;
  }
  return { values, state: current };
}

function pickMany<T>(
  state: number,
  items: readonly T[],
  weightOf: (item: T) => number,
  count: number,
): T[] {
  const picks: T[] = [];
  let current = state;
  for (let i = 0; i < count; i++) {
    const result = pickWeighted(current, items, weightOf);
    picks.push(result.item);
    current = result.state;
  }
  return picks;
}

interface TestItem {
  readonly name: string;
  readonly weight: number;
}

const light: TestItem = { name: "light", weight: 1 };
const heavy: TestItem = { name: "heavy", weight: 9 };
const zero: TestItem = { name: "zero", weight: 0 };

const badInputs: { label: string; items: TestItem[] }[] = [
  { label: "an empty list", items: [] },
  { label: "all zero weights", items: [zero, zero, zero, zero] },
  {
    label: "a negative weight",
    items: [light, heavy, { name: "negative", weight: -1 }],
  },
  {
    label: "an infinite weight",
    items: [light, heavy, { name: "infinity", weight: Infinity }],
  },
];

describe("nextRandom", () => {
  it("produces only values greater than or equal to 0 and less than 1", () => {
    const values = draw(123, 1000);

    expect(values).toHaveLength(1000);
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThan(1);
  });

  it("produces the same values when given the same seed", () => {
    const valuesOne = draw(123, 1000);
    const valuesTwo = draw(123, 1000);

    expect(valuesOne).toHaveLength(1000);
    expect(valuesTwo).toHaveLength(1000);
    expect(valuesOne).toEqual(valuesTwo);
    expect(new Set(valuesOne).size).toBeGreaterThan(1);
  });

  it("produces different values when given a different seed", () => {
    const valuesOne = draw(1, 10);
    const valuesTwo = draw(2, 10);

    expect(valuesOne).toHaveLength(10);
    expect(valuesTwo).toHaveLength(10);
    expect(valuesOne).not.toEqual(valuesTwo);
    expect(valuesOne[0]).not.toEqual(valuesTwo[0]);
  });

  it("continues the same sequence after the state is saved and restored", () => {
    const first = drawFrom(seedRandom(123), 5);
    const savedState = first.state;

    const original = drawFrom(savedState, 5);
    const restored = drawFrom(savedState, 5);

    expect(original.values).toHaveLength(5);
    expect(restored.values).toEqual(original.values);
  });

  it("throws for a non-integer seed", () => {
    expect(() => seedRandom(1.5)).toThrow("Seed must be an integer");
  });

  it("generates expected values for known seeds", () => {
    const values = drawFrom(seedRandom(42), 3);

    expect(values.values).toHaveLength(3);
    expect(values.values[0]).toBe(0.6011037519201636);
    expect(values.values[1]).toBe(0.44829055899754167);
    expect(values.values[2]).toBe(0.8524657934904099);
  });
});

describe("pickWeightes", () => {
  it("returns the same pick when given the same state", () => {
    const pickOne = pickWeighted(
      seedRandom(1),
      [light, heavy],
      (item) => item.weight,
    );
    const pickTwo = pickWeighted(
      seedRandom(1),
      [light, heavy],
      (item) => item.weight,
    );

    expect(pickOne).toEqual(pickTwo);
  });

  it("moves the state on when called", () => {
    const inputState = seedRandom(1);
    const pick = pickWeighted(
      inputState,
      [light, heavy],
      (item) => item.weight,
    );

    expect(pick.state === inputState).toBe(false);
  });

  it("never picks a 0 weighted item", () => {
    const picks = pickMany(
      seedRandom(1),
      [zero, light],
      (item) => item.weight,
      1000,
    );
    expect(picks).not.toContain(zero);
  });

  it("picks proportionally according to weights", () => {
    const picks = pickMany(
      seedRandom(1),
      [light, heavy],
      (item) => item.weight,
      1000,
    );
    const heavyPicks = picks.filter((pick) => pick === heavy);

    expect(heavyPicks.length).toBeGreaterThanOrEqual(850);
    expect(heavyPicks.length).toBeLessThanOrEqual(950);
  });

  it.each(badInputs)("throws for $label", ({ items }) => {
    expect(() =>
      pickWeighted(seedRandom(1), items, (item) => item.weight),
    ).toThrow("pickWeighted");
  });

  it("stays in range on a single item", () => {
    const five: TestItem = { name: "five", weight: 5 };
    const picks = pickMany(seedRandom(1), [five], (item) => item.weight, 500);
    const fivePicks = picks.filter((pick) => pick === five);

    expect(picks).toEqual(fivePicks);
  });
});
