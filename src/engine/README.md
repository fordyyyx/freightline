# Engine

The simulation: game clock, jobs, vans, money, and the rules that connect them.

- Pure TypeScript only. No React, no DOM (`document`, `window`) and no browser APIs.
- Deterministic: the same seed and the same commands always give the same result. Randomness comes from the seeded generator, never `Math.random()`.
- Time advances in fixed one-game-minute ticks.
- Money is stored as whole pence (integers), never floats.
- The UI reads snapshots of engine state and sends commands; it never changes engine state directly.
- Every piece of engine logic has Vitest tests in `tests/`.