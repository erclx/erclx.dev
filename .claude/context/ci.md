---
title: CI
description: GitHub Actions workflow triggers and checks
---

# CI

## Overview

GitHub Actions workflow for this project.

## Triggers

- Pull requests targeting any branch (verify only)
- Push to `main` (verify, then deploy on green)
- `workflow_dispatch` (manual run from the Actions tab)

## Checks

Defined in `.github/workflows/verify.yml`. All verify jobs must pass before merge. The `deploy` job runs only on `push: main` and gates on every verify job, which is six legs across four definitions once the e2e matrix fans out.

| Check     | Command                 | What it asserts                         |
| --------- | ----------------------- | --------------------------------------- |
| Format    | `bun run check:format`  | prettier and shfmt are clean            |
| Spell     | `bun run check:spell`   | cspell passes against dictionaries      |
| Shell     | `bun run check:shell`   | shellcheck passes at warning level      |
| Typecheck | `bun run typecheck`     | `astro check` passes                    |
| Lint      | `bun run lint`          | ESLint passes with zero warnings        |
| Tests     | `bun run test:coverage` | Vitest passes with coverage thresholds  |
| Build     | `bun run build`         | `astro build` succeeds                  |
| E2E       | `bun run test:e2e`      | Playwright passes on one engine per job |
| Deploy    | `wrangler pages deploy` | Uploads `./dist/` to Cloudflare Pages   |

For the deploy mechanism, custom domain wiring, and secrets, see `.claude/context/deployment.md`.

## Runtime

The workflow installs Node 22 via `actions/setup-node` before Bun. cspell v10 and several dev tools require Node ≥22.18. Bun does not satisfy this requirement on its own because it ships its own runtime, not a system Node.

## The e2e job is a matrix over the three engines the config defines

`e2e-tests` fans out over chromium, firefox, and webkit, one job per engine, each passing its own name to `--project`. A failure therefore arrives already labeled with the engine it came from, and `fail-fast: false` leaves the other two legs' results readable rather than canceling them.

Three jobs rather than one job running three engines, because `playwright.config.ts` pins `workers` to 1 under CI. A combined job would run all three serially on one runner and multiply the two retries on top of that, so a red run would cost roughly three times a green one against a green single-engine baseline of 4m9s measured 2026-08-21. The matrix multiplies neither. It buys that with three runner slots per pull request instead of one, which is the trade taken.

What it buys is a defect class this project has shipped three times against a job reporting green. Two production defects in the hero handoff, found on 2026-08-19 by a three-engine run that reported four failures where the gating engine reported none, and one hover-capability defect on a project route that had already shipped. Two more of the same class were caught by hand inside a single branch on 2026-08-20, neither reachable by the gating engine.

A browser's system libraries and its binaries cache differently, so the two installs cannot share one gate. `actions/cache` restores `~/.cache/ms-playwright` and nothing apt wrote, so `playwright install --with-deps <browser>` under `if: cache-hit != 'true'` installs the libraries exactly once: the first run passes and every warm run after it fails at browser launch rather than at install, which reads as a test defect. WebKit is the leg that reaches on `ubuntu-latest`, where chromium mostly survives without them. `install-deps` runs unconditionally and only the binary download carries the cache gate.

Widening the engines closes only half of that. A rule silently taking its touch branch breaks no existing assertion, so a hover path has to be asserted reachable wherever one is written, beside the behavior it guards rather than in one shared case. `e2e/projects.spec.ts`, `e2e/employers.spec.ts`, and `e2e/contact-dock.spec.ts` each carry one.

## A media query keys on a coarse pointer, never on hover

Playwright's Firefox answers `(hover: hover)` and `(pointer: fine)` both false on a desktop that hovers perfectly well, so any branch written as a requirement for hover takes its touch path there. Pairing the two does not rescue it, since the same engine answers both false. Only a coarse pointer separates a phone from that desktop.

The settled form is `not all and (pointer: coarse)` for an exclusion and `(hover: none) and (pointer: coarse)` for a positive touch test. `src/lib/hover-video.ts`, `src/components/site/contact-dock/contact-dock.astro`, and `src/components/site/experience/employers.astro` all read one of the two. A new hover-keyed rule takes the same form.

The exclusion admits a device reporting `pointer: none` alongside one reporting `pointer: fine`, which is a known cost rather than an oversight. Measured across all three engines on 2026-08-21, Playwright's Firefox answers `(pointer: none)` true, `(hover: none)` true, and both `(pointer: fine)` and `(pointer: coarse)` false, so it agrees with a television or a kiosk on every pointer and hover query there is. No pairing separates them, and keying a fallback on `(hover: none)` sends Firefox down the touch path the exclusion exists to keep it off. The class the fallback was written for is phones, which report a coarse pointer and are unaffected. What a no-pointer device loses is a clip that autoplays, and it still gets the poster.

## Firefox needs a software GL driver and a pref, and a red engine needs a trace

The first widened run went red on firefox alone, four cases in `e2e/header-shader.spec.ts` against 147 passing, while chromium and webkit passed on the same machine. All four are one cause: `mount.ts` reveals the fallback when it cannot draw, and `revealFallback` sets `canvas.style.display` to `none`, which fails the geometry case, the paint case, the reduced-motion case, and the case asserting the fallback is hidden at rest.

The engines differ in how they reach WebGL without a GPU. Measured locally on 2026-08-21, chromium reports `ANGLE (SwiftShader)` and webkit reports its own path, both bundled, where firefox reports `Mesa, llvmpipe` and therefore depends on a driver being installed. The firefox leg installs `libgl1-mesa-dri` and launches with `webgl.force-enabled`, which covers the driver being absent and the blocklist refusing it in turn.

Read that as two candidate causes rather than one confirmed. `mount.ts` takes the same fallback when `getContext` returns null and when the renderer fails to compile, so the log cannot separate them, and the pair above is what closes the first. A run still red after it points at the second.

The reason the log could not answer it is worth keeping. `playwright.config.ts` reported `list` alone under CI, so `playwright-report/` was never written and the failure step uploaded an artifact that did not exist. CI now runs `list` and `html` together and uploads `test-results/` beside the report, since a gate that reports a failure a reader cannot open is only half a gate.

## A local three-engine run reports failures the gate never sees

The card poster and the diction figures each fail three times of three at the default worker count and pass three times of three at `--workers=1`, measured 2026-08-21 by varying worker count alone on one commit against one build. Probing the pages directly agrees: every poster and every figure reports pixels in WebKit against both the dev server and a production build, so nothing on the page fails to load.

`playwright.config.ts` pins `workers` to 1 under CI, so the contention producing them cannot exist in the gating job. Run a local three-engine pass with `--workers=1` when the question is whether something is broken, and accept the wall clock for the answer. A pass at the default count reads a red suite as a shipped defect.

Two wrong characterizations reached the task file before worker count was varied, one calling the poster case a deterministic defect and one calling a flaked-green run a fix. Both came from comparing pass and fail counts across runs that differed in parallelism. Vary one thing before concluding from a count.

## The pull request trigger carries no branch filter

`on: pull_request:` with a `branches: [main]` filter fires no job at all on a pull request targeting anything else. Measured 2026-08-21 against a four-deep stack: the bottom pull request reported five jobs and the three above it reported no checks on their branches, so two of the four could be merged having never been checked until their base landed. The filter also serialized every run in the stack behind a merge.

The filter is off. `push` keeps its `branches: [main]`, since the deploy job gates on that ref and a push to any other branch has its pull request run already.

Read the cost of this change and the matrix as one number rather than two. The matrix takes a gated pull request from four legs to six, and removing the filter takes a four-deep stack from one gated pull request to four, so the two multiply: that stack goes from six legs to twenty-four. Both halves are worth it and the product is what a later reader weighs, since pricing the matrix alone understates the bill by the depth of the deepest stack.

## Running CI locally

`bun run check` runs the static and unit asserts plus auto-formats first. `bun run check:full` runs verify plus `test:e2e`. If CI fails on format, run `bun run check` locally and commit the diff.
