---
title: CI
description: GitHub Actions workflow triggers and checks
---

# CI

## Overview

GitHub Actions workflow for this project.

## Layout

- `.github/workflows/` owns the verify pipeline whose jobs gate every merge
- `e2e/` owns the Playwright suite the engine matrix runs, alongside the capture and inventory harnesses the review scripts drive

## Triggers

- Pull requests targeting any branch (verify only)
- Push to `main` (verify, then deploy on green)
- `workflow_dispatch` from the Actions tab (verify, then deploy on green, on whichever ref it is fired from)

## Checks

Defined in `.github/workflows/verify.yml`. All verify jobs must pass before merge. The `deploy` job runs on a push to `main` and on a manual dispatch from any ref, and gates on every verify job either way, which is six legs across four definitions once the e2e matrix fans out.

| Check     | Command                 | What it asserts                         |
| --------- | ----------------------- | --------------------------------------- |
| Format    | `bun run check:format`  | prettier and shfmt are clean            |
| Spell     | `bun run check:spell`   | cspell passes against dictionaries      |
| Shell     | `bun run check:shell`   | shellcheck passes at warning level      |
| Typecheck | `bun run typecheck`     | `astro check` passes                    |
| Lint      | `bun run lint`          | ESLint passes with zero warnings        |
| Tests     | `bun run test:coverage` | Vitest passes and coverage is reported  |
| Build     | `bun run build`         | `astro build` succeeds                  |
| E2E       | `bun run test:e2e`      | Playwright passes on one engine per job |
| Deploy    | `wrangler pages deploy` | Uploads `./dist/` to Cloudflare Pages   |

For the deploy mechanism, custom domain wiring, and secrets, see `.claude/context/deployment.md`. The build runs once, in `build-verify`: every e2e leg and `deploy` download that output rather than repeating it, covered below.

## Runtime

The workflow installs Node 22 via `actions/setup-node` before Bun. cspell v10 and several dev tools require Node ≥22.18. Bun does not satisfy this requirement on its own because it ships its own runtime, not a system Node.

## The unit lane guards a comment block that never closes

A comment in `src/components/site/experience/cast/motion.css` closed one line early, which left the prose after it as live stylesheet source. A parser reads that prose as a selector, consumes to the next brace, and swallows the rule behind it whole. The swallowed rule carried the positioning ancestor and the stacking context a shipped feature depended on, and every check stayed green, because nothing in the pipeline parses CSS and a stylesheet error-recovers rather than failing. The defect survived four branches, and a person running a parser by hand during review is what found it.

`src/test/stylesheet-comments.test.ts` counts openers against terminators across every `.css` and `.astro` file under `src/` and fails when a file does not balance. Twenty-eight files carry block comments, two stylesheets and twenty-six components, and all of them balance. The walk enumerates the tree rather than reading a list, since a list goes stale the first time somebody adds a stylesheet and going stale is silent, which is the failure this check is about.

Counting is the narrow check for the defect that shipped rather than a general parse guard. A general one has nothing to compare a parse against except the file itself, the testing standard bars a snapshot, and a heuristic rejecting a selector for looking like prose carries a false-positive risk on every stylesheet written after it. A unit test rather than a linter, because a dedicated stylesheet linter brings a configuration surface for one assertion.

Five holes are accepted and written down beside the fixtures. An opener inside a string or a `url()` is counted and is not one, the same hazard reaches JavaScript and regular expressions in a component file, a line comment has no terminator and cannot be covered at all, a block closed early and reopened later still balances, and a bare three-character opener whose closing slash doubles as its own terminator balances while closing nothing.

Cases exist beyond the balance check because the check has to be able to fail. One walks the tree and asserts every file balances, and one hands the counter the shape the defect actually had and asserts it reports the imbalance. A third guards the walk itself, since a narrowed walk passes every balance case while reading a fraction of the tree.

That third one reads a floor per extension rather than zero, and the difference is the whole guard. A walk narrowed to one stylesheet and one component satisfies mere presence on both extensions and leaves the balance check reading two files of twenty-eight, which is where the twenty-six components sit guarded at one of them. The floors carry the count each extension held when the guard was written, so a file added passes and a walk that quietly narrows fails. They are written out rather than derived, because the walk is the thing under guard and a floor read from it would move with every narrowing it exists to report. Raise a floor once the tree outgrows it, and lower one only alongside the deletion that earned it.

A floor over the commented subset rather than the walked population is the version to avoid, and it shipped for one commit. Counting files that contain an opener and flooring that at twenty-eight left no headroom, since all twenty-eight carry one today, so deleting the last comment from a component failed a check about comment balance on a change that balanced fine. The per-extension floors already sum to that same twenty-eight, which left the subset floor asserting only that no file ever loses its comments. Floor what the walk reaches rather than what the files happen to contain.

`bun run test:coverage` reports coverage and gates on nothing. `vitest.config.ts` declares no thresholds, so the `Tests` row above states what the command asserts rather than a threshold that would be a policy decision about every future file in the lane.

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

## A guard reads the element a locator resolved, never one found by `:hover`

Firefox and WebKit apply a hover treatment to an element the driver has pointed at while `document.querySelector(':hover')` matches nothing there. Chromium matches normally, so a guard reading a hovered control through a selector carrying the pseudo-class passes on one engine and throws `nothing matches` on the other two.

Read the element the locator already resolved, through `locator.evaluate`, rather than re-finding it by selector. Measured on 2026-08-25 against two edge-color guards in `e2e/home.spec.ts`, which passed on Chromium and failed on both other engines until the selector form came out.

This is a different fact from the media-query section above it. That one is about what an engine reports its own capabilities to be, and this one is about whether a synthetic hover is visible to a selector, which the same engine can get right and wrong in turn.

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

## The landing page runs at a third of a route's frame rate

The landing page mounts the hero shader and a project route does not, so the two pages do not share a frame budget under a headless composite. Measured on 2026-08-25 with a bare `requestAnimationFrame` loop carrying no style reads, `/` holds a 44.9ms mean frame against `/jobtriage` at 16.7ms, which is 22fps against 60. The worst frame runs 66.6ms on the landing page and 16.8ms on the route.

Two things follow for anything measured on the landing page. Any scroll-driven state coalesced to a frame lands about one frame later there than on a route, which is roughly 45ms rather than 17ms, so a timing figure calibrated on a route is too tight when carried across. And any assertion sampling a value at a fixed elapsed time is betting on that budget: a `border-radius` read 120ms into the site bar's 320ms shape transition returned 0 on WebKit for both surfaces and 705 on Chromium for one, while every engine was easing correctly.

Read a landing-page animation off an event the platform emits, or off an invariant that holds whatever the cadence, rather than off a frame count or a fixed pause. `transitionrun` registered before the trigger is the form that held across all three engines. Arm it against a settled starting state, since a trigger sent while the opposite leg still runs is a reversal, and WebKit performs one in place and fires nothing.

This is a fact about a headless software composite rather than about a visitor's machine, where the shader runs on the GPU. It has not been measured on real hardware, so treat it as a constraint on the harness rather than as a performance claim about the page.

## The pull request trigger carries no branch filter

`on: pull_request:` with a `branches: [main]` filter fires no job at all on a pull request targeting anything else. Measured 2026-08-21 against a four-deep stack: the bottom pull request reported five jobs and the three above it reported no checks on their branches, so two of the four could be merged having never been checked until their base landed. The filter also serialized every run in the stack behind a merge.

The filter is off. `push` keeps its `branches: [main]`, since the deploy job gates on that ref and a push to any other branch has its pull request run already.

Read the cost of this change and the matrix as one number rather than two. The matrix takes a gated pull request from four legs to six, and removing the filter takes a four-deep stack from one gated pull request to four, so the two multiply: that stack goes from six legs to twenty-four. Both halves are worth it and the product is what a later reader weighs, since pricing the matrix alone understates the bill by the depth of the deepest stack.

## Build once, in `build-verify`, and download it everywhere else

Each engine leg ran its own `bun run build` inside Playwright's `webServer` step, and `deploy` ran a fifth. `build-verify` now uploads `dist/` as an artifact, and the three e2e legs and `deploy` download it instead of rebuilding. `playwright.config.ts` reads `DIST_PREBUILT`, an env var the e2e job sets and nothing else does, and skips `bun run build` in the `webServer` command only when it is set. An unset var means build, so a local run and any leg that skips the download both fail loud at server start against a missing `dist/`, rather than serving stale output.

Consuming the same artifact in `deploy` is the larger reason for the change: the bytes an engine tested become the bytes that ship, rather than a separate build that could silently diverge from them. Read that as the model rather than as something the pipeline has done, because it first executes on the merge that repairs the toolchain below. The artifact reaches the deploy job already, and the one run to get that far failed before shipping it. The timing is the smaller reason. Removing the copy inside each engine leg saves about 63 runner-seconds against the chromium leg's 719s mean, read from the Actions API on 2026-08-24, which is 3.7% of a run.

`build-verify`'s build already runs `astro check` first, since `bun run build` is `astro check && astro build`. `static-checks` runs the same check through `bun run typecheck`, so dropping the redundant build from each engine leg costs nothing today. A later edit that lets `build` and `typecheck` diverge breaks that equivalence silently, since nothing asserts it.

`deploy` keeps `Setup Node` and `Setup Bun` even though it builds nothing, and reading those as leftovers is the mistake to avoid. `cloudflare/wrangler-action` looks for wrangler, does not find it, and installs it with whatever package manager the checked-out workspace points at. `bun.lock` sits at the repo root and `wrangler` is not a dependency in `package.json`, so the action picks bun every time and needs it on PATH. The change that first shared the artifact removed all four of deploy's steps together, which was right for the install and the build and wrong for the two setup steps, and every push to `main` after it failed on `Unable to locate executable file: bun`.

What that costs is about three runner-seconds. The install work moves rather than disappearing, which is worth knowing before anyone prices this job again, and the size of it is projected rather than measured: with no install step ahead of it, the action's own `bun i wrangler@<version>` has to populate the whole tree rather than add to a `node_modules` another step built. No run has executed that state, since the one deploy reaching it failed before installing anything. What the log does hold is the shape it replaces, from the deploy job of run `32766897378`, where `bun install --frozen-lockfile` took 1101 packages in 3.90s and the action's own install added 50 packages in 1.40s underneath it. The build is where the saving actually sits, near 15 seconds of it, and that survives intact. The alternative is pinning `packageManager` on the action and letting it use the runner's preinstalled npm, which is the smaller diff and puts a second package manager in a repository that deliberately runs one. Re-opening that trade is cheap now, since a dispatch runs the real job against Cloudflare from a feature branch and the section below covers how.

## A concurrency group cancels a superseded run, except where a deploy is riding on it

The workflow declared no concurrency group, so a force-push during a rebase cascade left the previous run to finish in full rather than yielding to the one that replaced it. `verify.yml` now groups runs by `${{ github.ref }}` and cancels the losing one, except where the run carries a deploy: a push to `refs/heads/main`, and a dispatch on whatever ref it was fired from.

The event sits in the group key rather than in the exemption alone, and the reason is the one thing about this setting that is easy to get backwards. GitHub reads `cancel-in-progress` off the run being queued, never off the run already in flight, so a dispatch cannot protect itself by declaring anything. A push landing on the branch mid-dispatch evaluates its own expression, gets `true`, and cancels the upload, leaving whatever Cloudflare had already accepted. Putting `github.event_name` in the group is what separates the two, since a dispatch and a push on one ref then hold different groups and neither can reach the other.

Exempting the dispatch from cancellation still earns its place beside that. It stops a second dispatch on the same ref from killing the first, which shares a group with it, and a queued run waits for the upload to finish rather than replacing it.

Measured against the last 100 runs on 2026-08-24, six non-main runs overlapped their own predecessor for 1343 seconds total. The cancellation clears that at the cost of the losing run's partial results, which nothing was reading before the winner replaced them either.

## A dispatch runs the deploy job before it merges, and the ref is the fence

`deploy` gated on `github.event_name == 'push' && github.ref == 'refs/heads/main'`, so no pull request run and no dispatch reached it and every change to that job first executed against production. That gap collected on 2026-08-24: #84 removed the job's two toolchain steps, merged green on every other leg, and failed on `main` until #85 restored them. The condition now admits a dispatch from any ref, which is the only trigger that can run the real job against the real endpoint ahead of a merge.

Widening the trigger and keeping `--branch=main` would hand anyone a one-command production deploy of unmerged work, so the two changes are one change. `--branch` reads `${{ github.ref_name }}`, and Cloudflare treats only `main` as production, so the fence is the ref rather than a second condition somebody has to remember to write. A dispatch from a feature branch runs all five steps and lands on `<hash>.erclx-dev.pages.dev`. A dispatch from `main` publishes to the apex, which is the existing behavior and has to survive.

A preview host puts unfinished work on a public address, which is the property `.claude/ARCHITECTURE.md` § A touch decision is judged on a device rejected a public tunnel over. State that exposure at full size rather than at the tunnel entry's, because a dispatch mints two hosts and only one of them is unguessable. The run produced `5e65eb97.erclx-dev.pages.dev` and an alias at `ci-deploy-verifiable.erclx-dev.pages.dev`, which is the branch name with its slash flattened, so anybody who knows the convention reaches a branch they can name without ever being handed a link.

What holds the trade up is that the address is not indexed and not permanent by accident. Both preview hosts answer with `x-robots-tag: noindex` and the apex sends no such header, measured on all three on 2026-08-25, so a preview stays off search results while the apex stays on them. And no address exists until somebody fires the dispatch, which is what separates this from the per-pull-request arm that mints one per branch whether or not anyone wanted it.

A preview outlives the branch that named it, and pruning is manual. The project is Direct Upload, so Cloudflare never sees the repository and `--branch` reaches it as a label on the deployment rather than as a git ref, which leaves no mechanism by which deleting a branch could retire a deployment. Read the branch-deletion leg as reasoned rather than observed: no branch carrying a preview has been deleted yet, and this is the first preview the project has made. `wrangler@3.90.0` carries `pages deployment list`, `create`, and `tail` and no delete, so the prune runs from the Cloudflare dashboard or the REST API and falls to whoever fired the dispatch.

Read what this does not close, because it bounds what the trigger is worth. The only thing standing in for a pre-merge run last time was reading the failure log, and that worked because the error named a missing binary. A deploy failing on credentials, on a project name, or on a Cloudflare-side change gives a far less legible log, and none of those surface any earlier than production unless somebody fires the dispatch. What ships here is the run being available rather than anybody being made to take it.

Do not close any of this by asserting something about the workflow file's contents. A check reading that `deploy` carries a setup step passes on a job that cannot run, which is the instrument class `.claude/ARCHITECTURE.md` collects five instances of and which shipped again this week. The instrument here is somebody firing the dispatch and reading the deployment URL out of the run log.

Exercised on 2026-08-25 from `ci/deploy-verifiable` rather than reasoned about. Run `32796334703` reached `deploy` after all six verify legs, ran its five steps green, and reported `pages deploy ./dist --project-name=erclx-dev --branch=ci/deploy-verifiable` landing on `5e65eb97.erclx-dev.pages.dev` with an alias at `ci-deploy-verifiable.erclx-dev.pages.dev`. The apex was fetched either side of it and did not move.

Normalize Cloudflare's email obfuscation before comparing two fetches of one page. It rotates `data-cfemail` and the `email-protection#` fragment per request, so the apex hashed differently across an upload that never touched it, and the raw comparison reads as a production change on every run. Byte length is the tell, holding at 130131 across both.

Re-running that job alone answers the retention question the seven-day artifact window was widened for, and it is a recovery path rather than a rebuild. The re-run downloaded the retained `dist` and republished it in roughly ten seconds with no verify leg re-executing, which is the first time anything has confirmed that path works.

## The worker cap was raised twice and rejected twice

A pull request here waits about thirteen minutes because `workers` pins to 1
under CI, and the runner is 4 vCPU. Raising the cap looked like the obvious
saving, and it was measured rather than assumed, at 2 and at 4, on
`workflow_dispatch` runs of the full 273-test suite on pull request 100 so a
worker-count reading would not be confused with the pull request's own
changed-spec selection below.

Both counts made the gate slower and flakier at once, and the failures spread
across the codebase rather than sitting where the two known webkit timing
assertions predicted. At 2 workers, chromium ran 19.6m against a 14m01s
single-worker baseline, failing 11 tests across `cast.spec.ts`,
`focus-ring.spec.ts`, `home.spec.ts`, `pointer-gating.spec.ts`, and
`projects.spec.ts`, every one of them on the initial attempt and both retries.
Firefox and webkit stayed closer to their baseline, with firefox failing one
test and webkit passing clean. At 4 workers every engine failed: chromium ran
20.0m and failed 24 tests across nine files, firefox carried the same single
failure at a shorter 5.4m, and webkit, clean at 2 workers, failed 2 and flaked
4 at 8.0m.

Read this as the runner rather than the suite. `retries: 2` cannot mask
contention that is the steady state rather than a one-off flake, and a
population failing on every attempt across nine unrelated files is not a
population of individually flaky tests. This runner's 4 vCPU tier does not hold
two full browser contexts without starving the wall-clock timing assertions
the codebase carries throughout, which is a different and larger claim than
the `fullyParallel` finding above: that one named two specific webkit
assertions, and this one is a property of the tier that no single assertion
fix closes. `workers` stays at 1 until the timing assertions those failures hit
are rewritten against animation and transition state rather than a wall clock,
which is v7.5's own scope.

What survived the rejection is independent of the worker cap, and neither
piece is the wall-clock saving a first draft of this entry claimed for it.
`cast.spec.ts` split into itself and `e2e/cast-scheduler.spec.ts`, carrying
the three scheduler tests whose 70s of wall-clock watching had been the
file's own floor. At `workers: 1` with `fullyParallel` off, everything still
runs serially in one worker, so splitting one file into two changes no total:
the split earns its place by isolating those tests for whoever converts them
away from a wall clock, which is v7.5's own scope, not by cutting today's run.

The pull request e2e step runs `--only-changed` against the base branch, and
only when every changed file sits under `e2e/`. These specs drive a served
build rather than importing it, so a source file outside `e2e/` reaches no
spec's import graph at all. On its own that selects nothing and the fallback
runs everything, but paired with an edited spec file the selection comes back
non-empty on that spec alone, silently skipping every spec the source change
actually affects. Measured over the last 30 merged pull requests, 16 touched
`src/` and `e2e/` together against 0 touching `e2e/` alone, so the shape the
unscoped version under-selected on was the common one and the shape it
optimized for had not happened once. Scoping the selection to an `e2e/`-only
diff is what keeps it from ever under-selecting, at the cost of the
optimization firing only when a change touches nothing but specs, which by
that same count is rare. Its demonstrated value today is the safety property
rather than typical wall-clock savings: a pull request run touching only the
two cast files selects only those, and a first read of pull request 100's own
checks read that 19-test leg as a suite-wide figure until review caught the
confusion, which is what made the worker-count measurement need its own
`workflow_dispatch` instrument in the first place.
`.canon/tasks/v09.7-gate-worker-concurrency.md` carries the per-engine failure
lists this entry summarizes.

Measured at 2896e77 (workers=2, run 33954276561) and 26b6f2e (workers=4, run 33955347743) on 2026-09-05.

## A settle carries the bound the pause implied, and CPU throttling is not the only way to prove one

The gating suite's fixed pauses convert to three shapes rather than one. A read
that already sits behind a poll or a web-first assertion loses its pause
outright, since the poll was always the real settle and the pause ahead of it
was margin nobody measured. A read that has no such poll gets one, on the exact
condition the assertion checks rather than on a proxy for it. A window
asserting nothing happened stays a duration, since that claim has no condition
to poll for, with what it bounds written beside it rather than left for a
reader to infer from the number.

`305-e2e-reliability.md` names `Emulation.setCPUThrottlingRate` as the
reproduction tool, and it worked for exactly one of the four conversions this
first pass carried. `e2e/focus-ring.spec.ts`'s scripted-focus settle
(`:focus-visible` read 80ms after a `.focus()` call, which failed on Firefox on
the trunk) reproduces under throttle in the sense that matters: a direct
instrumentation harness against this machine's chromium found the real
settle already running 245 to 451ms at full speed, before any CDP session
touched it, climbing to 1.8 to 2.2s at 40x and 3.8 to 7.1s at 80x. The shipped
80ms pause was marginal from the start on this hardware. Fixed with
`page.waitForFunction` polling the same predicate the pause used to check
once, bounded at 15000ms, and verified 6 of 6 on chromium, firefox, and webkit.

The first attempt at this bound was 8000ms and it was not enough on GitHub's
own runner. Firefox failed there with the settle correctly giving up and
falling into the pre-existing Tab-walk fallback, the one this file's own
comments already document as unreliable under load, and the test's own
default 30s budget was undersized for the four controls the failing case
loops over even before that fallback ran. Both numbers moved: the settle to
15000ms, and the two four-control tests to `test.setTimeout(90_000)`, sized
so a control legitimately needing the settle's own full bound does not also
exhaust the test around it. Raising the settle's bound here is not the
pattern `305-e2e-reliability.md` bars, since nothing about the wait was
flaky at any bound: the pause it replaced could never have covered four
real settles in 30s either, and the fixed span running fast is what hid
that arithmetic rather than solving it.

A review of the CI trace, taken before trusting either number, found a
second problem riding along with the first. The timeout on Firefox landed
inside the Tab-walk fallback rather than at the settle itself, since a
caught timeout fell through to it for every engine. That walk exists for
WebKit alone, per its own comment naming a browser that never carries
keyboard modality across a scripted focus, and it has its own defect: its
per-press check reads `:focus-visible` once right after each `Tab` with no
settle of its own, so the same load that times out the settle above could
also let it walk past the right control without ever reading it as focused.
That looked like the mechanism behind this file's own recorded trunk
failure for that exact walk, reached a second way, and the walk was gated to
WebKit alone on that reading: a timeout on any other engine would throw the
settle's own `TimeoutError` instead of falling into a walk that might never
succeed for it there.

That gate turned out to answer the wrong question, and three runs of the
same test file settle which one mattered. Fixing an unrelated bug in
`e2e/scroll.ts` (below) landed in the same branch, and Firefox ran under
three configurations before this settled:

- 15000ms bound, the old broken scroll settle: red, inside the settle
  itself, on every attempt.
- 15000ms bound, walk ungated, scroll fix applied: green, 6m10s.
- 15000ms bound, walk gated to WebKit, scroll fix applied: green, 7m7s.

The third row is what answers the gate question, since gating removes
Firefox's only fallback: if the settle still needed the walk to pass, that
row would fail loudly rather than quietly. It passed on all three engines
(Firefox 7m7s, WebKit 9m7s, chromium 14m1s), which means the settle was
resolving inside its own bound with no fallback available. The walk was
never load-bearing for Firefox on this evidence. It stays gated to WebKit,
and the comment above the gate says this rather than blaming a narrow
settle, which is the claim the second row alone would have supported and
the third row rules out. `git diff --stat` between the first and third rows
touches one file, `e2e/scroll.ts`, confirming the gate itself nets to zero
across the diagnostic commits and the scroll fix is the single variable
that moved.

What connects a fix in one file to a passing test in another that does not
import it is not established, and a specific, plausible-sounding mechanism
was proposed here and checked against the log rather than left standing.
The proposal was retry contention: a broken scroll settle failing other
tests' first attempts, retried at roughly three times the cost of a clean
pass, inflating the shared job's wall clock enough to starve this file's own
settle. Two facts in this repository rule it out. `playwright.config.ts`
pins `workers: isCI ? 1 : undefined`, so CI runs one test at a time with
nothing to contend with. And the red run's own log (job 101308722933) shows
zero retries outside `focus-ring.spec.ts`: `case-studies.spec.ts` and
`pointer-gating.spec.ts`, the only files importing `settleScroll`, both
passed clean on the first attempt, while the tally was `1 failed, 1 flaky,
4 skipped, 267 passed` with every failing line inside `focus-ring.spec.ts`
itself. `focus-ring.spec.ts` does not import `settleScroll` at all, and its
own scroll is `window.scrollTo({ behavior: 'instant' })`, already instant and
called after the point where the red run failed. The retry-contention
mechanism is recorded here as tested and false, so a later session does not
re-propose it from the same correlation.

What the three rows establish stands regardless: the scroll fix changed
Firefox's outcome on a file it does not touch, the gate is not load-bearing
on Firefox, and one retry captured on the red run swung from 21.1s and
23.5s to 2.6s with nothing else changed, which is a machine reading load
rather than a stable measurement either way. Read a single green row here
as consistent with the gate being correct, not as proof of it, and treat
the pathway between the two files as an open question this entry flags
rather than a settled fact it doesn't have.

The other three did not reproduce that way, and each failed for a different
reason worth keeping. `Emulation.setCPUThrottlingRate` is Chromium-only, so a
Firefox-specific race has no same-engine throttled repro at all. On this
32-core sandbox, throttling a page carrying the header's own WebGL frame loop
mostly serializes ordinary interactions behind that loop's now-inflated cost
rather than widening the specific gap a race depends on: `page.goto` itself
timed out at 30s once the rate passed 150x, and a bare `target.evaluate` call
could take upward of 30s at 300x, both dominated by contention with a
continuously-ticking `requestAnimationFrame` loop rather than by the read
under test. Neither failure mode is the one the historical incidents reported.

The chip row's re-arm case (`e2e/home.spec.ts`, the trunk failure from
2026-08-25) is the clearest example. It reproduces deterministically at **zero
throttle**: removing the 400ms gap between hiding the row and showing it again
failed 3 of 10 runs at full speed on an idle machine, because the browser can
coalesce the hide-then-show pair into one `IntersectionObserver` callback that
only ever reports the row back in view, skipping the momentary left state the
component's re-arm depends on. Neither CDP throttling nor saturating all 32
cores with busy loops moved that failure rate in either direction for the
broken or the fixed version, 15 of 15 passing serialized under full
saturation for the fix. The rate this case needed was a shorter gap, not a
slower processor, which is a fact about task-queue batching rather than about
CPU speed. Fixed with two chained `requestAnimationFrame` waits, tying the
bound to the platform's own callback-timing guarantee instead of a guess.

A third shape needed no throttle and no failure to justify converting: a
400ms pause after `data-ready` in `e2e/home.spec.ts`'s reveal-threshold case
never once mattered across 20 repeats with it removed outright, since the
mark it was guessing at was already set by the time `data-ready` appeared. It
still took an explicit `page.waitForFunction` on that mark rather than a bare
deletion, since a passing repeat count is evidence for today's ordering and
not a proof it cannot reverse.

The fourth shape is the one the rule already carries and this pass confirms
by example rather than by counting: `e2e/header-shader.spec.ts`'s
lost-context test removed its leading pause on the same reasoning as the
first shape above, reading `toBeHidden()` on the fallback as though it were
already a settle. It is not. The fallback carries the `hidden` class before
any mount script runs, so the assertion passes identically whether the app
has drawn or has not started, and the removal raced the app for ownership of
the canvas's WebGL context on WebKit, failing the restore assertion at the
end of the same test with nothing wrong at the point removed. This is the
risk the plan for this sweep named ahead of writing any conversion, caught by
running the file's own suite rather than by inspection. The repair polls
`litPercent()`, the same pixel-readback helper the drawing tests already use,
which needed the shared `preserveDrawingBuffer` instrument added to this test
too since WebKit clears an undecorated WebGL buffer once it presents a frame.

Read the throttling instruction as one tool among several rather than the
whole method. What every conversion in this pass shares is a real,
independently verified reason the bound is where it is: a measured settle
time, a deterministic zero-throttle reproduction, a repeat count with the
wait removed, or a same-suite regression caught by running it. `Emulation.setCPUThrottlingRate`
answers "does this get slower under load," which is the right question for a
speed-bound race and the wrong one for a race about event ordering, a race
about which of two independent callbacks a page has run, or a pause that
never bounded anything measurable to begin with.

Two waits in `e2e/home.spec.ts` stayed as durations rather than converting,
alongside `header-shader.spec.ts`'s frame-count window. The about-flight case
asserts the craft has not flown in absent a scroll to its section, and the
bar-placement case reads an intentionally intermediate state before
`data-ready` can appear, since the test exists to check the page before that
resource-delayed marker arrives. Neither claim has a condition to poll for,
so each keeps its duration with what it bounds stated in the comment beside
it, which is what the plan's own risk section asked for rather than a forced
conversion.

Measured at 03d7a9c on 2026-09-05 with the first-pass branch applied, across
`e2e/focus-ring.spec.ts`, `e2e/header-shader.spec.ts`, and `e2e/home.spec.ts`.

## The second pass found two settles that only worked at one viewport

The remaining gating specs carried the same four shapes, and two conversions
failed the moment they met a state their author had not pictured, both caught
by running the file rather than the one case being changed.

`e2e/cast-helpers.ts`'s shared `settleCast` was rewritten to wait for
`.cast-field[data-arrived]` before polling for the spawn animation to finish,
since the field only ever spawns under that mark. `.cast-field` also carries
`display: none` below the rail's own 1280px breakpoint, where nothing ever
intersects and the mark never arrives, so the same settle hung for its full
timeout on `e2e/cast.spec.ts`'s own case for that width, one that asserts
exactly this stood-down state. The fix reads the computed `display` first and
skips the wait entirely when the field cannot arrive, which is what the poll
right behind it already handles correctly: a field that never started
spawning already reads zero running.

`e2e/page-ground.spec.ts`'s per-width reading polled for the margin carrying
ink before reading the field, on the reasoning that the mount draws its one
still frame synchronously and the poll would ordinarily return on its first
check. At 390px the reading column spans the full canvas, so the margin has
no pixels to sample and reads zero by construction rather than by the field
failing to draw, and the poll hung for its whole timeout on a case that never
asserts anything about the margin at that width. The column is what every
caller actually asserts nonzero, at every width the suite reads, so the
settle polls that instead.

Read both as one lesson rather than two. A settle correct at the width or the
state it was written against can still assume something that only holds
there, and the population these span is exactly the kind a single converted
case cannot surface: the same file's own suite, run in full, is what a
conversion in this sweep has to clear before it counts as done.

A third case needed the opposite correction: a poll where a duration was
already correct. `e2e/case-studies.spec.ts`'s wheel-lock case waited 300ms and
then read `scrollY` through `expect.poll`, which is safe only because the
wait already ran to completion first. Read on its own, `expect.poll` stops at
its first passing sample, so pairing it with no preceding wait at all would
have reported "locked" the instant a leaked scroll had not yet landed. The
fix keeps the 300ms and swaps the poll for a single read, which is the same
shape `e2e/header-shader.spec.ts`'s frame-count window already uses and the
one this file's own risk section describes: a window with nothing to poll for
gets a duration, and the read at the end of it is single rather than
retried.

Two of the remaining conversions read an existing state marker instead of a
duration. `e2e/cast-scheduler.spec.ts`'s post-tap settle now polls the tapped
member's own `data-reacting` clearing, which `cast.astro` already clears on
whichever comes first, the reaction's `animationend` or its own 1400ms
fallback, rather than guessing a span with margin over both. And a scroll
settle extracted to `e2e/scroll.ts` replaces every `scrollIntoViewIfNeeded`
pause across `e2e/pointer-gating.spec.ts` and `e2e/case-studies.spec.ts` with
a wait on two consecutive reads of `window.scrollY` agreeing, since none of
the four calls it replaces were waiting on anything else.

`e2e/screenshot.ts`'s two capture-side pauses converted as well, since the
task named it as an exception: the capture is close to a reviewer-facing
artifact rather than a hand-run instrument. Neither wait was guarding what it
looked like. The context captures under `reducedMotion: 'reduce'`, which
gates both the reveal fade and `scroll-behavior: smooth` behind the same media
query this codebase already keys them to, so there was no transition and no
smooth scroll left to wait out. What both pauses actually sat in front of was
`document.fonts.ready`, which now runs once per case, and the section variant
keeps the same scroll settle as the two spec files above.

Verified with the full three-engine suite passing at one worker: 273 on
chromium, 269 on firefox (4 skipped), and 270 on webkit (3 skipped).

Measured at 03d7a9c on 2026-09-05 with the second-pass branch applied.

## The chromium leg splits across two shards

Chromium's per-spec table reads a gap spread across nearly the whole test
population rather than concentrated in one file, which rules out a suite edit
as the fix and leaves the leg's own runner as the lever. It now runs as two
matrix jobs, `chromium-1` and `chromium-2`, splitting the 273 tests by count
with `--shard` rather than one job holding all of them.

Splitting by count rather than by a hand-picked file list is what the
measurement supports. `bunx playwright test --shard=1/2 --list` and
`--shard=2/2 --list` put 138 tests across nine files in the first half and 135
across eight in the second. Mapping the per-spec table's chromium durations
onto that split puts 385s of named specs in shard one against 262s in shard
two, with 193s unattributed across the smaller files, so the worse shard lands
near 7.6 minutes. That clears webkit's 9.1-minute floor either way, which is
what makes the count-based balance good enough without a hand-assigned list.

`home.spec.ts` is why a third shard would mostly idle rather than help
further. It holds 75 tests and 221s of chromium time in one file, and
sharding never splits a file, so it sets a floor near 3.7 minutes for
whichever shard holds it whatever the shard count.

Two mechanical points follow from adding a shard rather than an engine. The
Playwright browser cache stays keyed on `matrix.browser` alone, so the two
chromium shards share one warm cache rather than each fetching its own copy.
And the failure-artifact name now carries a `slug` field, `chromium-1`,
`chromium-2`, `firefox`, `webkit`, rather than `matrix.browser`, since an
artifact name cannot hold the `/` a shard value like `1/2` carries and two
legs uploading under one name fails the upload.

`--pass-with-no-tests` sits on the `--only-changed` invocation alone. A pull
request diff touching one spec can put every selected test in a single shard,
and Playwright exits non-zero on an empty selection without the flag. The
full-suite fallback carries no such flag, since an empty selection there is a
real defect the gate should fail on rather than pass through.

Per-run job count goes from six to seven, which the worker-cap entry above
already prices this repository's own trigger shape against: four dispatches
holding nine runner jobs at once, and the gate running twice on one commit
whenever a dispatch fires on a branch already carrying an open pull request.
Read the extra job as a further draw against that same cost rather than as a
separate one the split introduces.

Measured against `1f0aeff` on 2026-09-05, from the per-spec table taken at
`f0b076b` and confirmed unchanged in the interval.

## A hand-run instrument needs its own timeout on a shared sandbox

`e2e/engine-latency.ts` times five primitive actions per engine, navigate,
evaluate, click, hover, and Tab, to say which one carries the chromium
excess rather than only that the excess exists. It bounds every action
against an external timer rather than trusting Playwright's own defaults,
which is not a defensive habit so much as a requirement on the sandbox this
was built against.

That sandbox runs several concurrent Claude Code sessions, editors, and
background builds at once, and a stall from that contention can hold a bare
`page.goto` past Playwright's own 30s default with nothing wrong in the
browser under test. Two of the five actions this instrument drives,
`evaluate` and a single `Tab` press, carry no native `timeout` option at
all, so the bound has to come from racing the action against a timer rather
than from a parameter Playwright exposes. A rep that loses the race is
dropped and counted rather than crashing the whole probe, and a short settle
between engine launches keeps one engine's contention from reading as the
next engine's own defect.

## Running CI locally

`bun run check` runs the static and unit asserts plus auto-formats first. `bun run check:full` runs verify plus `test:e2e`. If CI fails on format, run `bun run check` locally and commit the diff.
