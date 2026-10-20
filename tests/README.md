# Tests

Vitest unit tests. Run `npm test` once, or `npm run test:watch` while developing.

- Mirror the `src/` structure, for example `tests/engine/clock.test.ts` for `src/engine/clock.ts`.
- Engine logic must be tested before it is merged.
- Tests run in Node, with no DOM, which matches the engine's no-DOM rule.