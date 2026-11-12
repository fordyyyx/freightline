export interface RandomResult {
  value: number;
  state: number;
}

export function seedRandom(seed: number): number {
  if (!Number.isInteger(seed)) {
    throw new Error(`Seed must be an integer: ${seed}`);
  }
  return seed | 0;
}

export function nextRandom(state: number): RandomResult {
  const next = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(next ^ (next >>> 15), 1 | next);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, state: next };
}

export interface WeightedPick<T> {
  readonly item: T;
  readonly state: number;
}

export function pickWeighted<T>(
  state: number,
  items: readonly T[],
  weightOf: (item: T) => number,
): WeightedPick<T> {
  let total = 0;
  const weights = items.map(weightOf);
  if (weights.some((weight) => !Number.isFinite(weight) || weight < 0)) {
    throw new Error(
      "pickWeighted: every weight must be a finite number of 0 or more",
    );
  }
  for (const weight of weights) {
    total += weight;
  }
  if (total <= 0) {
    throw new Error("pickWeighted: total weight must be greater than zero");
  }
  const draw = nextRandom(state);
  let point = total * draw.value;
  let lastPositive = 0;
  for (let i = 0; i < items.length; i++) {
    if (weights[i] > 0) {
      lastPositive = i;
    }
    point -= weights[i];
    if (point < 0) {
      return { item: items[i], state: draw.state };
    }
  }
  return { item: items[lastPositive], state: draw.state };
}
