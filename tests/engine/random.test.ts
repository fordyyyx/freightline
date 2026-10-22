import { describe, it, expect } from "vitest";
import { nextRandom, seedRandom } from "../../src/engine/random.ts";

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
