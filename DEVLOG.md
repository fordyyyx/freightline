# Devlog

One entry per working session, newest first: what got done, what's next, anything blocking.

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
