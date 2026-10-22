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
