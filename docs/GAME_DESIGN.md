# Freightline — Game Design

Living document · last updated 20 Oct 2026

## How to use this document

### Planning horizons

| Horizon | Level of detail | Where it lives |
| --- | --- | --- |
| Current sprint | Acceptance criteria, estimates, dependencies | Issues in Sprint Backlog |
| Next sprint | Rough issues, refined on the middle weekend | Issues in Backlog |
| Rest of v0.1 | One-line stories | Sprint tables in the plan |
| v0.2 onwards | Epics, mechanics, open questions and ideas | Epic table, plus this document |

This document holds mechanics and ideas, not tickets. When a release becomes the next one, its ideas become issues at refinement.

### How each system section is laid out

- **How it works:** the rules and rough numbers. Lines marked **Decided** are design calls that have been made. Everything else is a starting proposal for balancing to change.
- **Open questions:** things to settle before that system's stories can be Ready.
- **Ideas:** anything that comes up mid-sprint. Writing an idea here keeps it out of the current sprint without losing it.

### Guardrails

- Nothing in this document enters the current sprint. Ideas go here or to the Backlog column.
- Changing v0.1's scope is a swap. If an idea genuinely belongs in v0.1, something of similar size leaves.
- Keep design in proportion. An occasional session is healthy, but if design starts eating sprint hours, building suffers.

### Numbers and units

- From Sprint 1, `src/engine/balance.ts` is the source of truth for numbers. The constants table at the end gives each value's `balance.ts` name. Any PR that changes a number in code updates this file too.
- The engine stores time as whole game minutes, distance in kilometres, and money as whole minor units (pence, cents) together with a currency code. Formatting for display happens only in the UI, through the single `Intl`-based helper that formats numbers, dates and money (see the plan's "Text and numbers"), so currency and locale changes happen in one place.

## Design direction (decided 14 Oct 2026)

| Topic | Decision |
| --- | --- |
| Long-term goal | Open-ended sandbox, with milestones to aim for and scenarios with set starts and targets |
| Starting location (decided 20 Oct 2026) | The player chooses their starting town anywhere in the world, and the network grows outward from there. v0.1 starts in Plymouth only |
| Where vehicles end up | They stay where they finish a delivery; the next job starts from there |
| Vehicle ownership | Every vehicle has a home depot |
| Currency | Real currencies. The company keeps its books in the currency of its home depot's country: GBP for a Plymouth start, with an override in settings |
| Running out of money | Each scenario sets its own rule. Sandbox: bankrupt after 14 days below zero |
| Pace | At 1×, a game day lasts about 10 real minutes |
| v0.1 vehicles | Two van models |
| Drivers (v0.2) | Named people with skill and experience, fatigue and hours, wages and morale, licences and specialities |

## Data model decisions (made now to protect v0.2 onwards)

These cost little in v0.1 but would be expensive to change once saves exist. The state shapes themselves belong in ARCHITECTURE.md; this table records the design reason for each.

This table extends the plan's "Keeping a paid release possible" rules, which cover depots as a list, integer pence, the general vehicle type and the game-minute tick. The plan holds the reasons linked to a paid release, and this table holds the detail. If they disagree, update both in the same PR.

A row earns its place only if adding it later would mean rewriting code or breaking saves. Anything that only adds a new field waits for its release, and a save migration handles it then.

| Area | Decision | Why now |
| --- | --- | --- |
| Depots | The company has a **list** of depots, which contains one in v0.1 | v0.2 adds depots instead of rewriting everything that assumes one |
| Company headquarters | One depot is the headquarters, and it sets the company's currency | Scenarios can start anywhere, and the currency follows |
| Vehicle location | A vehicle is either **at a place** (any town) or **travelling a leg** between two places | Vehicles staying where they finish needs this from v0.1 |
| Vehicle home depot | Every vehicle stores a `homeDepotId` | Servicing, driver bases and per-depot fleets in v0.2 |
| Vehicle models | A general model: transport mode (road, sea or air), capacity, speed, price, fuel use, maintenance, and the licence needed | Trucks, ships and planes are new data, not new code |
| Trips | A trip is a **list of legs**, each with a mode, start and end. In v0.1 a job has two road legs: empty to the pickup, then loaded to the destination | Ferries, tunnels and sea or air legs slot in later |
| Places | Every town carries a country code. Port and airport flags are added later | Borders and currencies hang off the country |
| Money | Integer minor units plus a currency code, never floats | Totals never drift, and currencies arrive in v0.3 without a migration |
| Books | An append-only ledger of transactions. Each entry records the amount, the currency, the amount converted into the company's currency, and what it was for (job, vehicle, km) | The finance panel, statistics and milestones are all worked out from it, so every total has one source |
| Time | 1 tick = 1 game minute on a real calendar. The engine raises day, week and month boundary events | Weekly wages and monthly loans plug in without touching the clock |
| New game | A new game is built from a **scenario** definition: start town, date, cash, vehicles, seed and failure rule. v0.1 has one built-in scenario, Plymouth sandbox | Scenarios become data, not code |
| Start town in code | Nothing hard-codes Plymouth. The start town, first depot and map centre always come from the scenario | A player-chosen start town later is new data, not a rewrite |
| Saves | Each save has a version number and a migration function per version, and stores the random-number generator's state | Already in the plan. Loading a save reproduces the game exactly |

## Systems

### 1. Time — v0.1

**How it works**

- **Decided:** a game day lasts about 10 real minutes at 1×.
- 1 tick = 1 game minute. At 1×, 2.4 game minutes pass per real second, so a game hour takes 25 s and a game day 10 min. A day takes 5 min at 2× and 2½ min at 4×.
- The UI loop measures real time and hands the engine whole ticks, carrying the fraction over to the next frame. The engine never reads the system clock.
- The sandbox game starts on Monday 1 March 2027 at 08:00. A day starts at 00:00, a week at Monday 00:00, and month boundaries follow the calendar.
- In v0.1, vehicles run around the clock. Driving-hours limits arrive with drivers.

**Open questions**

- Should job offers slow down overnight, or keep coming around the clock?

**Ideas**

- Seasons: busier freight before Christmas, quieter in January.
- Weekends with fewer jobs but higher pay.
- An "auto-pause on event" setting (delivery late, cash below zero).

### 2. World and places — v0.1

**How it works**

- **Places:** GeoNames towns in the UK within 100 km of the depot in a straight line, with a population of at least 5,000. Each place has an id, name, country code, coordinates and population.
- The script that builds the places data takes the centre point and radius as settings, not values written into the code, so a different start town is a re-run rather than a code change.
- **Distance:** great-circle distance (haversine) × a road factor of 1.3, always computed from coordinates.
- **On the map**, vehicles move along the straight line between places.

**Open questions**

- Does a population threshold of 5,000 give a sensible 30–60 towns? Confirm once the S0-6 data is in.

**Ideas**

- Use a road factor per region, since moorland and coastal routes are less direct.
- Draw the route as a curved arc rather than a straight line.
- Show town size on the map by marker size.

### 3. Jobs and cargo — v0.1

**How it works**

- **A job contains:** an id, origin, destination, cargo type, weight (kg), urgency, pay, created time, offer expiry and deadline.
- **Board:** up to 10 open offers, with 6 at the start of a game. A new offer arrives on average every 40 game minutes, as a 1-in-40 chance each tick from the seeded random-number generator.
- **Where jobs appear:** both origin and destination lie within the depot's 100 km radius.
  - The origin is weighted by population.
  - The destination is a different town, weighted by population ÷ road distance from the origin, and at least 8 km away by road.
- **Urgency:** 25 % of jobs are Express and the rest Standard.
- **Offer expiry:** 8 game hours, or sooner if a vehicle leaving the depot could no longer arrive on time.

| Cargo | Weight range | Pay multiplier |
| --- | --- | --- |
| Parcels | 50–300 kg | ×1.00 |
| Groceries | 100–600 kg | ×1.00 |
| Furniture | 200–700 kg | ×1.15 |
| Building supplies | 400–1,250 kg | ×0.95 |
| Electronics | 100–400 kg | ×1.25 |

**Pay**

```
pay = (basePay + payPerKm × loadedKm)
      × cargoMultiplier × urgencyMultiplier
      × (1 + weightBonusPerTonne × weightKg / 1000)
```

- Base pay is £20, plus 80p per loaded km and a weight bonus of 0.3 per tonne. Express pays ×1.4, and the total is rounded to £1.
- **Only the loaded leg is paid.** The empty drive from wherever the vehicle is to the pickup is the cost of choosing that job, so the same offer is a good deal for one vehicle and a poor one for another.

**Deadlines**

- **Estimated time** = (depot → origin + loaded distance) ÷ 52 km/h, plus 20 minutes loading and 20 minutes unloading. The estimate is measured from the depot, so the deadline is the same whichever vehicle takes the job.
- **Deadline** = created time + estimate × slack, rounded up to 15 minutes. Standard jobs get a slack of 2.0–3.0 and Express jobs 1.3–1.6.
- **Late delivery:** pay drops 10 % for each started hour late, down to a floor of 40 %. Jobs can't be cancelled in v0.1.

**Open questions**

- The job board is centred on the depot, but vehicles roam within its radius. Should the board show the empty distance for the nearest idle vehicle, so the player can judge each offer at a glance?

**Ideas**

- Contracts: a regular run between two towns at a fixed rate.
- Return loads: offers that start where a vehicle is about to finish.
- Fragile cargo that loses pay if the driver's skill is low (v0.2).
- Refrigerated and hazardous cargo, gated by licences (v0.2).

### 4. Vehicles — v0.1, general from day one

**How it works**

- **Decided:** vehicles stay where they finish, belong to a home depot, and v0.1 has two van models.

| Model | Mode | Capacity | Speed | Price | Fuel | Maintenance | ≈ Cost per km |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Compact van | Road | 750 kg | 55 km/h | £3,500 | 7.5 L/100 km | 6p/km | 17p |
| Panel van | Road | 1,300 kg | 52 km/h | £6,000 | 9.5 L/100 km | 8p/km | 22p |

- A new sandbox game starts with one Compact van at the start town (Plymouth in v0.1).
- **Lifecycle:**
  1. **Idle** at a town.
  2. **Collecting:** drives to the origin, then loads for 20 minutes.
  3. **Delivering:** drives to the destination, then unloads for 20 minutes. The job is paid at this point.
  4. **Idle** at the destination.
- If the vehicle is already at the origin, the Collecting drive is 0 km.
- **Accept** is enabled only when some idle vehicle can carry the weight. The vehicle picker lists only those vehicles, each with its empty distance to the pickup.
- A newly bought vehicle appears idle at its home depot.

**Open questions**

- What should the status label say? S2-3's acceptance criteria use "En route". Either show that for both Collecting and Delivering, or change the criteria to the stage names at refinement.
- Should a player be able to send an idle vehicle to a town, for example back to the depot? There is no story for this yet.

**Ideas**

- Servicing every so many km at the vehicle's home depot.
- Vehicle wear, so older vans cost more to run and resell for less.
- Selling vehicles, and a second-hand market.
- Rigid trucks and articulated lorries (v0.2), then ships and planes (v1.0).

### 5. Money and economy — v0.1, currencies in v0.3

**How it works**

- **Decided:** money uses real currencies. The company's books are kept in the currency of its headquarters' country, GBP for Plymouth, and settings can override it.
- **Starting cash:** £1,500 plus one Compact van.
- **Revenue:** a job's pay, credited when unloading finishes.
- **Running costs:** fuel and maintenance for every km driven, loaded or empty, charged at the end of each drive leg.
- **Diesel:** 145p per litre, fixed in v0.1.
- **Depot rent:** £40 per game day, charged at 00:00.
- **Buying a vehicle:** the price is deducted immediately. A vehicle can't be bought if cash is below its price.
- **Ledger:** every payment and cost is a ledger entry. The finance panel (S3-3) groups entries by week, from Monday to Sunday.
- **From v0.3:** foreign pay and costs are converted into the company's currency at the day's exchange rate, and the ledger keeps both the original and the converted amount.

**Open questions**

- Can the currency override in settings be changed mid-game, or only when starting a new game? Changing it mid-game means either re-denominating the balance or converting values only for display.
- Where do exchange rates come from in v0.3: fixed rates, a simulated drift, or both?

**Ideas**

- Fuel price swings (E13).
- Tolls and congestion charges.
- Insurance as a weekly cost that rises with incidents.

### 6. Depots — v0.2

**How it works**

- Each depot has its own job radius, rent and fleet of vehicles that call it home.
- The headquarters depot sets the company currency.
- In v0.1 there is exactly one depot, but it is stored as a list.

**Open questions**

- What does opening a depot cost: a one-off fee, rent, a minimum company level, or all three?
- Can a vehicle take a job from another depot's board, or only from its home depot's board?
- Can the headquarters move?

**Ideas**

- Depot upgrades: more parking, a workshop for cheaper servicing, a warehouse to hold cargo.
- Transferring vehicles between depots.

### 7. Staff — v0.2

**How it works**

- **Decided:** drivers are named people with skill and experience, fatigue and hours, wages and morale, and licences and specialities.
- In v0.1, driving is abstract. Vehicles gain a driver field in v0.2, added by a save migration, and from then on a vehicle with no driver can't take a job.
- Fatigue and hours follow a simplified version of the real drivers' hours rules, such as a 45-minute break after 4½ hours of driving.

**Open questions**

- Are wages paid weekly or monthly?
- How does a player hire: from a pool of candidates at each depot, or one at a time?
- What does morale actually affect: whether drivers quit, how late they run, or what wages they ask for?
- Do drivers belong to a depot, or follow a vehicle?

**Ideas**

- Experience levels, earned from km driven, that unlock better pay and lower incident risk.
- Licence training as an investment: van → rigid truck → articulated lorry, plus hazardous goods and international work.
- Drivers who prefer home runs and lose morale on long international trips.
- Driver names generated with the seeded random-number generator, from a regional name list. The list is third-party data, so it needs a licence that allows commercial use and an entry in `CREDITS.md`.

### 8. Progression — v0.2

**How it works**

- **Decided:** progression comes through milestones, alongside open-ended play.
- Milestones are worked out from the ledger, so anything since the start of the game counts.

**Open questions**

- Do milestones unlock things (vehicle models, depots, cargo types), or are they recognition only?
- How do reputation and company level relate? Are they one number or two?
- What loan terms apply: interest, length, and borrowing limits tied to company level?

**Ideas**

- Example milestones: first second vehicle, 100 deliveries, first new depot, first international job, first container ship.
- If the Steam gate says go, milestones could double as Steam achievements through `PlatformServices`. Working milestones out from the ledger makes that possible without engine changes.
- Reputation that rises with on-time deliveries and unlocks better-paying clients.

### 9. Scenarios and failure — sandbox in v0.1, scenarios later

**How it works**

- **Decided:** each scenario sets its own failure rule. Sandbox ends in bankruptcy after 14 days below zero.
- **Decided (20 Oct 2026):** in sandbox, the player chooses their starting town anywhere in the world, and the network grows outward from that first depot. The start town also sets the company's currency through the headquarters depot. v0.1 offers Plymouth only; the choice arrives once worldwide town data exists, no earlier than the international release.
- A scenario defines the start town, date, cash, vehicles, seed, failure rule and any targets.
- v0.1 ships one scenario, Plymouth sandbox, built through this same structure. A player-chosen start is the same structure with the start town filled in by the player.
- **Bankruptcy:** when cash goes below zero, a countdown appears in the top bar. Getting back above zero resets it. If the countdown reaches 14 days, the game ends with a summary screen.

**Open questions**

- Bankruptcy has no story in v0.1 yet. See "Knock-on changes to the plan" below.
- How does the player pick a start town: by searching for a name, by clicking the map, or both?
- Is every town a valid start, or only towns above a population threshold, so there are enough jobs nearby?

**Ideas**

- Example scenarios:
  - "Glasgow to the Continent": reach a depot in Rotterdam within two years.
  - "Tight margins": high fuel prices and low starting cash.
- Scores and par times for scenarios.

### 10. Borders and international — v0.3

**How it works**

- Countries come from each place's country code.
- Ferries and the Channel Tunnel are fixed links: legs with a crossing time, a fee and a timetable.
- Customs adds a delay at each border.

**Open questions**

- How much of Europe does v0.3 include? A handful of countries keeps the city data and balancing manageable.
- Which side of the road do vehicles drive on? Probably nothing more than flavour.

**Ideas**

- International work as a driver speciality.
- Paperwork mistakes that cause long customs delays.

### 11. Global freight — v1.0

**How it works**

- Ports and airports are places with flags.
- Ships and planes are vehicle models with a sea or air mode.
- Intermodal trips chain legs: road → sea → road.

**Open questions**

- Are ships and planes owned, leased, or bought as capacity on someone else's service?

**Ideas**

- Containers as a cargo unit, alongside weight.
- Port congestion events.

### 12. Events and polish — ongoing

**Ideas**

- Breakdowns, traffic and weather delays.
- Fuel-price swings.
- A tutorial.
- Sound and a day/night tint on the map.

## Balancing — v0.1

**Targets**

- A second Compact van becomes affordable after **6–8 game days** of attentive play, about 30–40 minutes at 2×. This replaces S3-5's "about 15 minutes".
- A well-chosen job earns about twice as much per hour as a poor one. The cost of a bad choice is lost time, not ruin.
- Express jobs pay about 40 % more but have tight deadlines. A late Express job pays roughly the same as an on-time Standard one.

**Worked example**

A Compact van drives 30 km empty to the pickup, then 40 km loaded, carrying 200 kg of Standard parcels.

| Item | Working | Result |
| --- | --- | --- |
| Pay | (£20 + 40 × 80p) × 1.06 | £55 |
| Running costs | 70 km × 16.9p | £11.81 |
| Profit | | £43.19 |
| Time | 70 km ÷ 55 km/h + 40 min | 1 h 56 m (48 s at 1×) |

Compare a poor job: 60 km empty and 20 km loaded pays £38 for 2 h 7 m, which is about £12 an hour against about £22 for the job above.

If a van is busy 60 % of the day on jobs like the first one, it clears about £280 a day after rent. Starting from £1,500, the extra £2,000 needed for the second van then takes about 7 days, which is on target.

**Measuring it**

Because the engine is pure and seeded, a headless bot could play many seeds and report how many game days it takes to afford the second van. This is a candidate story for S3-5.

## Constants — v0.1 starting values

| `balance.ts` name | Value | Unit |
| --- | --- | --- |
| `time.gameMinutesPerRealSecond` | 2.4 | game minutes per second at 1× |
| `time.speedMultipliers` | 1, 2, 4 | × |
| `world.jobRadiusKm` | 100 | km, straight line |
| `world.minTownPopulation` | 5,000 | people |
| `world.roadFactor` | 1.3 | × |
| `jobs.maxOpenOffers` | 10 | offers |
| `jobs.initialOffers` | 6 | offers |
| `jobs.meanMinutesBetweenOffers` | 40 | game minutes |
| `jobs.offerLifetimeMinutes` | 480 | game minutes |
| `jobs.minLoadedKm` | 8 | km |
| `jobs.expressChance` | 0.25 | probability |
| `jobs.basePay` | 2,000 | minor units |
| `jobs.payPerKm` | 80 | minor units per km |
| `jobs.weightBonusPerTonne` | 0.3 | × per tonne |
| `jobs.expressPayMultiplier` | 1.4 | × |
| `jobs.standardSlack` | 2.0–3.0 | × |
| `jobs.expressSlack` | 1.3–1.6 | × |
| `jobs.referenceSpeedKmh` | 52 | km/h |
| `jobs.latePenaltyPerHour` | 0.10 | fraction of pay |
| `jobs.minLatePayFraction` | 0.40 | fraction of pay |
| `handling.loadingMinutes` | 20 | game minutes |
| `handling.unloadingMinutes` | 20 | game minutes |
| `vehicles.compactVan` | 750 kg, 55 km/h, 350,000, 7.5 L/100 km, 6 per km | — |
| `vehicles.panelVan` | 1,300 kg, 52 km/h, 600,000, 9.5 L/100 km, 8 per km | — |
| `economy.dieselPerLitre` | 145 | minor units |
| `economy.depotRentPerDay` | 4,000 | minor units |
| `cargo.*` | see the cargo table | — |

All money values are in GBP minor units, because v0.1 is GBP only. Scenario values (start town, start date, cash and failure rule) live in the scenario definition, not in `balance.ts`.

## Knock-on changes to the plan

These should be made at refinement, not in the middle of a sprint.

- **S2-3 acceptance criteria:** "an idle van at the depot" becomes "an idle van", and the status label needs settling (see Vehicles).
- **S2-4:** the ETA now runs to the delivery only, because there is no return leg.
- **S3-5:** "about 15 minutes of play" becomes "6–8 game days (about 30–40 minutes at 2×)".
- **Bankruptcy has no story.** It needs a countdown, a game-over summary and a way to start again, roughly 3 points. Under the guardrails, either:
  - it replaces something of similar size in Sprint 3, or
  - v0.1 tracks days below zero and shows the warning, and the game-over screen moves to v0.2.
- **New-game setup has no story.** The company name in the S1-5 top bar and the Plymouth sandbox scenario both need one. Candidate story: a new-game screen with a company name field, using the scenario structure.
- **Choosing a start town (decided 20 Oct 2026):** add a backlog story outside v0.1: "As a player, I want to choose my starting town anywhere in the world, so that I can grow my network from a place I know." It depends on worldwide town data, so it belongs with the international or global releases. Until then, the new-game screen offers Plymouth only.
- **S0-6 (#6):** the places script should take the centre and radius as settings, so another start town is a re-run. Add this to #6's acceptance criteria before it starts.
- **S1-3 (#10):** the map centre comes from the scenario's start town, not hard-coded Plymouth coordinates. The S0-5 spike (#5) can still centre on Plymouth directly, because it is throwaway learning code.