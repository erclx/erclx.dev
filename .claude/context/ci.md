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

For the deploy mechanism, custom domain wiring, and secrets, see `.claude/context/deployment.md`. The build runs once, in `build-verify`: every e2e leg and `deploy` download that output rather than repeating it, covered below.

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

Headless firefox creates no GL context without an X display, and the firefox leg runs under `xvfb-run` for that reason. Chromium carries SwiftShader and webkit its own path, so both draw on a runner with no display and neither needs the wrapper.

Reproduced locally rather than inferred, by unsetting `DISPLAY` on a machine whose firefox otherwise reports `Mesa, llvmpipe`: the spec fails four of six, the same four and the same count CI reported, and adding `xvfb-run` alone returns all six to passing. That also retires two earlier candidates. A missing Mesa driver is not the cause, since the runner already carries `libgl1-mesa-dri` and an install step for it reported the package as current. `webgl.force-enabled` is not the fix either, since the four cases fail with it set and pass without it once a display exists.

The compile path stays untested rather than ruled out. `mount.ts` reveals the same fallback when `getContext` returns null and when the renderer fails to compile, and no run has separated them, so what the display repair establishes is that a context is now granted rather than that compilation was never at fault.

The reason the log could not answer it is worth keeping. `playwright.config.ts` reported `list` alone under CI, so `playwright-report/` was never written and the failure step uploaded an artifact that did not exist. CI now runs `list` and `html` together and uploads `test-results/` beside the report, since a gate that reports a failure a reader cannot open is only half a gate.

## The walk outran WebKit's lazy fetch, and worker count stood in for machine load

`scrollThroughPage` paused a fixed 100ms per step, which is a guess at how much lead an engine needs before it issues a lazy fetch. The engines disagree on that lead by an order of magnitude. Measured on `/diction` at 1280x720 by varying the pause alone, chromium loads all seven figures at no pause at all, firefox drops one, and webkit drops one at 20ms, four at 10ms, and six at 0ms.

The page is not the defect. Walking the same route in webkit at reading pace, half a viewport every 700ms, reports all seven figures. A visitor on that engine has never been served an incomplete page, so the gate was holding against the harness rather than against the site.

Nothing recovers a figure the walk outran. Dropping the `scrollTo(0, 0)` that ends the walk still leaves webkit reading three of seven at no pause while parked at the bottom, so the return home is neither the cause nor the place to repair it. An image the viewport has left behind has no later event to fetch it.

Worker count moved these cases because it moved machine load, which moved how far the walk outran the fetch. A full local suite at the default count reproduces both CI failures on the pristine tree, and the webkit leg alone passes on the same commit against the same build. Four earlier characterizations were counting that contention without naming it.

A step now holds until the images standing in the viewport report themselves loaded, rather than for a fixed span. Waiting on what sits inside the viewport rather than on a band around it keeps the timeout off the ordinary path, since every engine agrees to fetch an image a reader can see. The walk costs less where nothing is pending and more only where the waiting is the point, running 947ms against 1507ms on chromium and 1765ms against 1547ms on webkit.

The reveal case is the same defect rather than a second one. `a route reveals its prose as the reader arrives at it` reads a marker `src/lib/reveal.ts` writes on intersection, which is driven off the viewport and equally unrecoverable once the walk has gone past. A step waits on the markers its own geometry says are due, so one change repairs all three cases.

Every step of that walk states `behavior: 'instant'`, and the walk breaks silently without it. The root carries `scroll-behavior: smooth` for a reader, and a bare `scrollTo` inherits it, so a step settles against a viewport still in transit and the images it is waiting on are never the ones a reader can see. That reintroduces exactly the outrunning this section repaired, by a route no engine figure above would show, and the capture still reports success because an image that was never asked for is indistinguishable from one the walk correctly skipped. The same reading covers the capture harness in `e2e/variants.ts`, which otherwise shoots its frame part-way to the offset it asked for.

Playwright's own scroll is the case with nothing to pass. It brings an off-screen target into view before it can be clicked or tapped, a minimal scroll puts that target at the top of the viewport under the sticky bar, and the hit test then lands on the bar. Bring the element the interaction is about into view explicitly, rather than leaving the driver to do it.

Verified 2026-08-21 at one worker, the count `playwright.config.ts` pins under CI: three consecutive green webkit legs, plus chromium and firefox. Run a local leg one engine at a time at `--workers=1` when the question is whether something is broken, because the default count adds contention this repair does not remove. The shader paint case fails under a three-engine parallel run and passes at one worker, which is that contention rather than a defect in the surface it reads.

## The pull request trigger carries no branch filter

`on: pull_request:` with a `branches: [main]` filter fires no job at all on a pull request targeting anything else. Measured 2026-08-21 against a four-deep stack: the bottom pull request reported five jobs and the three above it reported no checks on their branches, so two of the four could be merged having never been checked until their base landed. The filter also serialized every run in the stack behind a merge.

The filter is off. `push` keeps its `branches: [main]`, since the deploy job gates on that ref and a push to any other branch has its pull request run already.

Read the cost of this change and the matrix as one number rather than two. The matrix takes a gated pull request from four legs to six, and removing the filter takes a four-deep stack from one gated pull request to four, so the two multiply: that stack goes from six legs to twenty-four. Both halves are worth it and the product is what a later reader weighs, since pricing the matrix alone understates the bill by the depth of the deepest stack.

## Build once, in `build-verify`, and download it everywhere else

Each engine leg ran its own `bun run build` inside Playwright's `webServer` step, and `deploy` ran a fifth. `build-verify` now uploads `dist/` as an artifact, and the three e2e legs and `deploy` download it instead of rebuilding. `playwright.config.ts` reads `DIST_PREBUILT`, an env var the e2e job sets and nothing else does, and skips `bun run build` in the `webServer` command only when it is set. An unset var means build, so a local run and any leg that skips the download both fail loud at server start against a missing `dist/`, rather than serving stale output.

Consuming the same artifact in `deploy` is the larger reason for the change: the bytes an engine tested become the bytes that ship, rather than a separate build that could silently diverge from them. The timing is the smaller reason. Removing the copy inside each engine leg saves about 63 runner-seconds against the chromium leg's 719s mean, read from the Actions API on 2026-08-24, which is 3.7% of a run.

`build-verify`'s build already runs `astro check` first, since `bun run build` is `astro check && astro build`. `static-checks` runs the same check through `bun run typecheck`, so dropping the redundant build from each engine leg costs nothing today. A later edit that lets `build` and `typecheck` diverge breaks that equivalence silently, since nothing asserts it.

`deploy` keeps `Setup Node` and `Setup Bun` even though it builds nothing, and reading those as leftovers is the mistake to avoid. `cloudflare/wrangler-action` looks for wrangler, does not find it, and installs it with whatever package manager the checked-out workspace points at. `bun.lock` sits at the repo root and `wrangler` is not a dependency in `package.json`, so the action picks bun every time and needs it on PATH. The change that first shared the artifact removed all four of deploy's steps together, which was right for the install and the build and wrong for the two setup steps, and every push to `main` after it failed on `Unable to locate executable file: bun`.

What that costs is about three runner-seconds. The install work moved rather than disappearing, which is worth knowing before anyone prices this job again: with no install step ahead of it, the action's own `bun i wrangler@<version>` populates the whole tree rather than adding to a `node_modules` another step built, measured at 1101 packages in 2.47s on the runner. The build is where the saving actually sits, near 15 seconds of it, and that survives intact. The alternative is pinning `packageManager` on the action and letting it use the runner's preinstalled npm, which is the smaller diff and puts a second package manager in a repository that deliberately runs one. That trade is worth re-opening once a deploy change can be exercised before it merges, and today it cannot: `deploy` is gated on a push to `refs/heads/main`, so no pull request run and no `workflow_dispatch` reaches it and every change to it first executes against production. The failure direction is safe, since a broken deploy fails the job and nothing reaches Cloudflare, but nothing announces that `main` is sitting un-deployed either.

## A concurrency group cancels a superseded run, except on `main`

The workflow declared no concurrency group, so a force-push during a rebase cascade left the previous run to finish in full rather than yielding to the one that replaced it. `verify.yml` now groups runs by `${{ github.ref }}` and cancels the losing one, except on `refs/heads/main`, the ref `deploy` gates on, where a run is never voluntarily interrupted.

Measured against the last 100 runs on 2026-08-24, six non-main runs overlapped their own predecessor for 1343 seconds total. The cancellation clears that at the cost of the losing run's partial results, which nothing was reading before the winner replaced them either.

## Running CI locally

`bun run check` runs the static and unit asserts plus auto-formats first. `bun run check:full` runs verify plus `test:e2e`. If CI fails on format, run `bun run check` locally and commit the diff.
