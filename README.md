# Freightline

A browser-based logistics tycoon: grow a one-van courier in Plymouth into a worldwide freight network, run entirely from a map and dashboard.

> **Status:** in development, Sprint 0. The first playable release, v0.1 "Local Courier", is planned for December 2026.
> **Play it:** live link coming soon.

_"Freightline" is a working title._

## Vision

Pick a job, assign a vehicle, watch it run and reinvest the profit. Freightline starts small, with one van and local deliveries around Plymouth, and grows step by step: national depots, then Europe, then ports and airports linking continents.

It is also a portfolio project, so engineering quality matters as much as the game: a tested simulation engine kept separate from the UI, built in the open with Scrum.

## Scope of v0.1 "Local Courier"

| In v0.1                                  | Later releases                     |
| ---------------------------------------- | ---------------------------------- |
| One home depot in Plymouth, vans only    | Depots in other cities             |
| Local jobs within about 100 km           | Hiring drivers and paying wages    |
| Time controls, cash, fuel and running costs | Borders, ferries and currencies |
| Save and load in the browser             | Sea and air freight                |
| Free to play in the browser              | Desktop build                      |

## How it's built

- **TypeScript, React and Leaflet**, built with Vite.
- **The simulation engine** (`src/engine/`) is pure TypeScript with no React or DOM code, and is unit-tested with Vitest.
- **The UI** (`src/ui/`) only reads snapshots from the engine and sends it commands.

## How it's run

Solo Scrum in two-week sprints, tracked on the [project board](https://github.com/users/fordyyyx/projects/1). Progress is logged in [DEVLOG.md](DEVLOG.md), and retrospectives are in [docs/retros](docs/retros).

## Running it locally

Requires Node 24.

```
npm install
npm run dev      # start the dev server
npm test         # run the tests
npm run lint     # check the code
npm run build    # type-check and build
```

## Licence

© 2026 William Ford. All rights reserved. The source is public to read; see [LICENSE](LICENSE).