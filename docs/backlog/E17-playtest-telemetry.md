# E17 Playtest telemetry: backlog draft

**Status:** Backlog, in no sprint. At v0.2 planning, decide whether it goes into v0.2, which is the only way it can feed the Steam gate. **Hosting decision:** ADR-007 in ARCHITECTURE.md.

## Why

The Steam gate asks whether playtesters "regularly play for an hour or more, come back, and ask for features". At the moment nothing measures the first two. This epic adds an **opt-in**, anonymous playtest-stats backend on AWS. That is also where Freightline gets its AWS experience: from something the product needs, not from moving a static site.

```text
Game on GitHub Pages ──(player opts in)──▶ Telemetry interface (src/platform/)
        │  HTTPS POST, JSON under 2 KB
        ▼
Lambda Function URL (eu-west-2) ──▶ DynamoDB table (rows expire after 180 days)
                                          ▲
                     npm run telemetry:report (local script, reads the table)
```

## What is sent, and what never is

| Sent (only after opt-in)                                   | Never sent or stored                     |
| ---------------------------------------------------------- | ---------------------------------------- |
| A random install id, created only when the player says yes | Names, emails or any free text           |
| Event type: `session_start` or `heartbeat`                 | IP addresses (not stored, not logged)    |
| Build version, game day reached, vans owned                | Save files                               |
| Real minutes played this session                           | Anything from before the player opted in |

A heartbeat goes out every 5 real minutes while the tab is visible and the game isn't paused.

## Keeping it free

AWS changed its free tier for accounts opened on or after 15 July 2025. New accounts pick a **Free plan** or a **Paid plan** and get $100 in credits, plus up to $100 more for completing activities. The Free plan lasts up to six months or until the credits run out. Some services also have **always-free** monthly allowances that never expire. This design keeps everything inside those allowances.

| Piece    | Choice                                                                                      | Why it's cheap                                                                                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Endpoint | Lambda **Function URL**, not API Gateway                                                    | No charge for the URL itself, only for Lambda. API Gateway's free calls are a 12-month offer for new customers, and Free plan accounts don't get it.                                |
| Compute  | Lambda on arm64, 128 MB, 3-second timeout                                                   | Always free: 1 million requests and 400,000 GB-seconds a month                                                                                                                      |
| Storage  | DynamoDB, **provisioned** at 1 read and 1 write unit, Standard table class, no auto-scaling | Always free: 25 GB and 25 read and write units, **on provisioned capacity only** (on-demand isn't covered). Past its limit, provisioned capacity throttles instead of billing more. |
| Old data | DynamoDB TTL deletes rows after 180 days                                                    | TTL deletes are free and keep the table small                                                                                                                                       |
| Logs     | CloudWatch log group kept for 7 days; log errors only, never the raw request                | Keeps the log volume tiny, and keeps IP addresses out of the logs                                                                                                                   |
| Network  | No VPC, no NAT gateway                                                                      | A forgotten NAT gateway is the classic surprise bill                                                                                                                                |
| Deploys  | GitHub Actions with OIDC (short-lived credentials, no stored keys)                          | Actions minutes are free for public repos                                                                                                                                           |
| Region   | eu-west-2 (London)                                                                          | Players' data stays in the UK                                                                                                                                                       |

**Realistic usage:** 30 playtesters × 10 hours a month × 12 heartbeats an hour is about 3,600 requests a month. That's under 0.5% of Lambda's free million, and about 1 MB of data.

**What isn't free:**

- **S3.** CDK keeps deployment assets in an S3 bucket, and new accounts have no always-free S3 allowance, so this comes out of credits. It's pennies a month.
- **The Free plan ends.** After six months, or once the credits are used up, the account has to move to the Paid plan. Usage inside the always-free allowances still costs nothing, apart from those pennies of S3.

**Open the account when the spike starts, not now.** If you open it then, the Free plan's six months cover the v0.2 playtests. If you open it today, it runs out around May 2027.

## Guardrails (set up in the spike, before anything is deployed)

1. Turn on MFA for the root user, then stop using root. Create an admin user through IAM Identity Center.
2. Stay on the Free plan while it lasts: while you're on it, charges come out of the credits, not your card.
3. In AWS Budgets, set a monthly budget of $1 with email alerts at 50% and 100% of actual spend, and at 100% of forecast spend.
4. AWS began rolling out a new sign-up experience in September 2026 that lets Paid plan accounts set a monthly spend limit. If your account has it, set a limit.
5. Write a kill switch into `infra/README.md`: set the function's reserved concurrency to 0 (this stops every invocation), or delete the Function URL. Stretch goal: have the budget alert trigger it automatically.
6. Check Cost Explorer at each sprint review, and add that step to the review checklist.

**Abuse:** the Function URL has to be public (auth type `NONE`), because browsers can't sign IAM requests. CORS set to the Pages origin stops other websites calling it from a browser, but not scripts. The handler rejects bodies over 2 KB and anything that fails validation, and provisioned DynamoDB throttles writes. Lambda still bills each request, though, so the budget alert and the kill switch are the backstop. New accounts can have a low Lambda concurrency quota, which may stop you reserving concurrency at all; the spike finds out.

## How it fits the architecture

- **`src/platform/telemetry.ts`:** a `Telemetry` interface with `record(event)`, built the same way as `SaveStore`. `NoopTelemetry` is the default; `HttpTelemetry` is swapped in only after consent.
- **Engine untouched:** the store builds events from snapshots. The engine never knows telemetry exists.
- **The endpoint URL lives in the one config,** following the plan's no-hard-coded-URLs rule.
- **`infra/`:** a CDK app in TypeScript with its own `tsconfig.infra.json`, like `scripts/`. The handler goes in `infra/lambda/`, with Vitest tests for its validation. The game never imports `infra/`.

**Privacy:** the plan already says no telemetry without explicit opt-in consent. In the UK, storing an id on a player's device for analytics needs consent under PECR. A pseudonymous id still counts as personal data under UK GDPR, so you'll also need a short privacy notice and a way to turn it off that deletes the id. This is a practical summary, not legal advice.

## Stories

Total: 13 points, a whole sprint at your current velocity. It competes with v0.2 features, so prioritise it against them deliberately.

### Spike: AWS account, guardrails and a first CDK deploy

`type:spike` · 3 points · time-box 6 hours

- [ ] Account on the Free plan, root MFA, an Identity Center admin user, and a $1 budget with alerts
- [ ] CDK bootstrapped in eu-west-2; a hello-world Lambda with a Function URL deployed from `infra/`, then removed with `cdk destroy`
- [ ] Notes in `docs/learning/aws.md`: what each guardrail does, the account's Lambda concurrency quota, and whether reserved concurrency can be set
- [ ] The findings confirm or change the estimates below

### Story: telemetry endpoint

`type:story` · 5 points · blocked by the spike

As the product owner, I want playtest sessions recorded in a database, so that I can measure how long people play and whether they come back.

- [ ] Given a valid event under 2 KB, when it's posted to the endpoint, then it's stored with a server timestamp and a 180-day expiry, and the response is 204
- [ ] Given an invalid or oversized body, then the response is 400 and nothing is stored
- [ ] Given any request, then no IP address is stored or logged
- [ ] The CDK stack matches the "Keeping it free" table, including CORS set to the Pages origin
- [ ] Deployed by GitHub Actions through OIDC when `infra/` changes on main
- [ ] The handler's validation is covered by Vitest

### Story: opt-in prompt and client

`type:story` · 3 points · end-to-end check blocked by the endpoint story

As a player, I want to choose whether to share anonymous play statistics, so that nothing leaves my device without my say-so.

- [ ] Given first launch, then a prompt asks; nothing is sent until I answer, and "No" means nothing is ever sent
- [ ] Given I said yes, then an install id is created, and `session_start` and heartbeats are sent through `HttpTelemetry`
- [ ] Given I turn sharing off in settings, then sending stops and the install id is deleted
- [ ] The prompt links to a short privacy notice
- [ ] A network failure is silent and never affects the game

### Task: playtest report

`type:task` · 2 points · blocked by the endpoint story

- [ ] `npm run telemetry:report` reads the table and prints the number of players, the median session length, the share who played for an hour or more, and the share who came back on a later day
- [ ] The output is quoted in the Steam gate review

## Before this becomes issues

- Add E17 "Playtest telemetry" to the plan's epics table, and create the `epic:playtest-telemetry` label once work begins.
- Confirm the free-tier figures on AWS's pricing pages when the spike starts; AWS changes them often.
