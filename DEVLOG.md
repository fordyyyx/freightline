# Devlog

One entry per working session, newest first: what got done, what's next, anything blocking.

## 2026-11-12 - #50, #51, #52, and #53 done: the freight market is live

- **Done:** #50: pure job maths in `jobs.ts`, with pay matching GAME_DESIGN.md's worked example (£55, or £77 as Express), the estimated time, and the deadline rounded up to the quarter hour; a test caught `225 x 2.2` giving `495.000000000000006`, which `Math.ceil` turned into an extra 15 minutes, fixed with a small tolerance (#66). #51: `generateOffer` in a new `offers.ts`, with population-weighted origins, destinations weighted by population / road distance and at least 8 km away, uniform cargo, Express on 25%, and expiry at the earlier of 8 hours and the latest a van could leave the depot; added `pickWeighted`, `randomBetween`, and `randomInt` to `random.ts`, a `nextJobId` counter in the state, and moved `currentCalendarMinutes` into `time.ts` to avoid a circular import (#67). Two of the new helpers first returned the old generator state, and a deadline test using `&&` could never fail; both caught in review. #52: new games start with 6 offers, `advance` now processes one minute at a time, expired offers are removed on the tick they expire, and offers arrive with a 1-in-40 roll while the board has fewer than 10. Reworded the arrival criterion, since the cap blocks arrivals in real play so the rate is tested on its own (#68). #53: a sortable job board beside the map, with `sortOffers` tested separately and ties broken by id compared as numbers; component styles moved into their own files next to each component (#71). Added backlog stories #69 (reverse the sort) and #70 (collapse the board).
- **Next:** #54, accepting a job and assigning a van.
- **Blocked:** Nothing.

## 2026-11-11 - Sprint 1 reviewed; sprint 2 started early; #49 done

- **Done:** Sprint 1 review and retro: 19 points completed, goal met (#62). Started Sprint 2 five days early, keeping its 29 November end date, so it runs 19 days instead of 14; scaled the scope to match by adding #58-#60 from Sprint 3. Refinement found that nothing in the sprint could make cash go down, so bankruptcy couldn't happen in play: added #63, depot rent charged at midnight, and a development-only "Bankruptcy test" scenario (£30, bankrupt after 1 day below zero) to #59 and #60 so game over can be checked in minutes. Sprint goal: "Have the first full game loop: start a new scenario, earn and lose money, and go bankrupt" (33 points, #49-#60 and #63). Moved the scheduled briefs to the new dates and deleted the Sprint 1 review and Sprint 2 planning briefs. #49: Compact and Panel van models in `balance.ts` (with a transport mode, per the data model table), `findVehicleModel` with a type guard (an `in` check doesn't narrow the key, and `Object.hasOwn` rejects inherited names like `toString`), starting vehicles in the scenario, and `createGame` building an idle fleet at the start depot; ARCHITECTURE.md updated with the new state (#64).
- **Next:** #50, job pay, estimated time, and deadline.
- **Blocked:** Nothing

## 2026-11-10 - Coastline spike, #46 and #10 done; Sprint 2 refined; architecture written up

- **Done:** Spike #29: a new data test (`tests/data/towns.test.ts`) found five towns outside the land shape (Exmouth, Saltash, Dawlish, Seaton, Budleigh Salterton), Saltash visibly in the Tamar even when zoomed out. The estuaries are the right shape at play zoom, so a finer coastline isn't needed; decided to snap towns instead, recorded in GAME_DESIGN.md. #46: `snapToLand` moves a town in the sea to the nearest coastline point plus a 0.3 km inland margin, failing if it would move more than 2 km, with both values in `places.config.json`; regenerating `towns.json` changed only the five towns' coordinates (#47). Two bugs caught on the way: the converted coordinates were swapped (only the exact-position test noticed, since the swapped point was still inside the test square), and writing the file inside the loop wrote the list 66 times. Wikidata returned a 502 on the first run; a retry worked. Also fixed the `Accept` header typo. #10: depot and town markers drawn with circle markers, the depot in amber with "(depot)" in its tooltip, the map centred on the scenario's start town through `findTown` and `depotTowns`; towns and depots are read once because v0.1 never adds them mid-game (#48). Sprint 1 finished: 17 of 17 points, including #46 added mid-sprint. Refined sprint 2 into #49-#57 (23 points): a vans task, S2-1 split into job maths, offer generation, and board lifecycle, S2-4 split into an engine trip task and the map story, with stage names Collecting and Delivering, trips stored as planned stage end times, and a ledger starting with job pay. Wrote #58-#60 for Sprint 3: the new-game screen, the bankruptcy rule, and its warning and game-over screens. Added `docs/ARCHITECTURE.md` with six decision records (#61).

## 2026-11-09 - Sprint 1 planned late; #11, #39, #12, and #8 done

- **Done:** Planned Sprint 1 a week late: nothing was merged between the Sprint 0 retro and today. Refinement found two gaps: no issue built the scenario or engine world state that #10 and #12 rely on, and lint only blocked React imports in `src/engine/`, not `Date.now()`, `Math.random()` or browser globals as the 22 October entry said. Added #38 (2) and #39 (1), bringing the sprint to 15 points. #11: great-circle and road distance with `balance.ts`; an extra test from (0, 0) to (0, 90) caught the sine terms being squared in the wrong place, which the Plymouth and London tests couldn't detect at short range (#36, follow-up #37). #39: lint rules for engine determinism, with a Vitest test that lints sample code (#40). #38: scenario definition, Plymouth sandbox, calendar minutes on a UTC calendar, and `createGame` with company, depot list, and towns within the job radius (#41). #8 engin half: `ticksForFrame` converts real frame time into whole ticks; the 2x and 30 fps tests came out one minute short from floating-point error, fixed with a small tolerance (#42). #12 top bar with company name, cash, and date through shared `Intl` helpers; the UTC calendar means the 28 March clock change doesn't skip an hour; switched the game font to Nunito (OFL), recorded in CREDITS.md (#43). #8 UI half: Zustand game store, a fram loop with `requestAnimationFrame`, and pause, 1x, 2x, and 4x controls in the top bar; new games start paused.
- **Next:** #10, depot and town markers on the map, read from engine state and centred on the scenario's start town. If any town lands in the sea, settle the coastline question (#29) first.
- **Blocked:** Nothing.

## 2026-11-01 - Fixed missing # bug, added in map pan gif and sprint 0 retro

- **Done:** Fixed bug with land-fill colour missing #. Added in the map-pan gif displaying the map at the live URL. Wrote sprint 0 retro tying in all the work from this sprint
- **Next:** Sprint 1 planning
- **Blocked:** Nothing.

## 2026-10-22 - Sprint goal met, refinement and #9 pulled in

- **Done:** Finished #5: a Leaflet map of the play area is live at fordyyyx.github.io/freightline, using Leaflet directly because react-leaflet is under the Hippocratic License (2 h against 2 points). That meets the Sprint 0 goal, with all 15 planned points done. Refined Sprint 1 (#8-#12): acceptance criteria, estimates (15 points) and blocked-by relationships, and moved all five to Ready. Pulled #9 into Sprint 0 and finished it: lint now stops React and browser globals reaching `src/engine/`, a seeded random number generator (mulberry32, pinned by a known-values test), and an immutable game state advanced in whole ticks (2 h against 3 points).
- **Next:** Sprint 0 review and retrospective on Sunday 1 November; capture the backlog items from this sprint (start-anywhere town story, coastline check, pre-commit hook idea).
- **Blocked:** Nothing.

## 2026-10-21 - Town and map data, and a map data bug

- **Done:** Finished #6: a Wikidata script writes 66 towns (estimate was 30-60; threshold kept at 5,000) and a Natural Earth script writes land and coastline clipped to the play area, both driven by one settings file and unit-tested (5 h against 2 points). Found that clipped land shapes contained hundres of empty polygons, which is invalid GeoJSON; raised #24 with the new Bug template, fixed it with a regression test and regenerated the data (#25). Added #24 (1 point) mid-sprint, so the sprint total is now 15. The 1:10m coastline is smoothed and sits a little inland around estuaries such as the Tamar; recorded for checking before #10.
- **Next:** #5, the Leaflet map spike, the last item in Sprint 0.
- **Blocked:** Nothing.

## 2026-10-20 - Skeleton, templates, and CI

- **Done:** Finished the #2 spike: notes on TypeScript and React in docs/learning, practice project outside the repo (6 h against the 6-hour time-box). #3: Vite, React, and TypeScript skeleton with ESLint, Prettier, Vitest, and the src folder structure. #4: Story, Task, Spike, and Bug issue templates and a README with vision and scope. Decided the player can start anywhere in the world (Plymouth only in v0.1) and that town data comes from Wikidata; recorded both in GAME_DESIGN.md. #1: CI runs lint, format, type-check, and tests on every PR, merges deploy to GitHub Pages, and the game is live at fordyyyx.github.io/freightline. Removed the Vite starter icons and added the live link to the README (#22). Started #6.
- **Next:** Finish #6, the town and map data.
- **Blocked:** Nothing.

## 2026-10-19 - Licence decision

- **Done:** Changed licence to all rights reserved from MIT so the code cannot be sold or used by others - allowing recruiters to still view the code but protecting a future paid release.
- **Next:** #2, TypeScript and React spike.
- **Blocked:** Nothing.

## 2026-10-19 - Sprint 0 planning

- **Done:** Sprint 0 planned. Goal: "A map of Plymouth is live at a public URL, with CI guarding main". 7 issues, 14 points, moved to Sprint Backlog.
- **Next:** #15, choose the project licence.
- **Blocked:** Nothing.

## 2026-10-15 - Impromptu planning

- **Done:** Added desktop and Steam roadmap, commercial-readiness rules, and the licence task (S0-7).
- **Next:** Sprint 0 planning on Monday 19 October.
- **Blocked:** Nothing.

## 2026-10-14 - Pre-sprint setup

- **Done:** Created the repo and cloned it on the PC and laptop; installed Node 24 LTS on both; LF line endings via .gitattributes; protected main with a ruleset (PR required, squash merges only); labels, the v0.1 milestone and the project board with Status, Points, and Sprint fields; Sprint 0 issues written and moved to Ready.
- **Next:** Sprint 0 planning on Monday 19 October.
- **Blocked:** Nothing.
