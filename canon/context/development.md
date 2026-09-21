---
title: Development
description: Local dev workflow, scripts, and husky hooks
---

# Development

## Overview

Local dev workflow for this project.

## Layout

- `src/pages/` owns the routes. The apex composes the landing sections, and each project route is its own file
- `src/layouts/` owns the html shell: font preload and the first-paint theme script
- `src/components/site/` owns the landing-page sections and their primitives
- `src/components/ui/` owns the shadcn primitives, vendored into this repo rather than imported from a package
- `src/assets/` owns page-owned media: the hero field, project posters and videos, the signature
- `src/lib/` owns shared helpers
- `src/styles/` owns the tailwind entry, the theme tokens, and the base layer
- `src/test/` owns the vitest environment setup
- `e2e/` owns the playwright specs, the screenshot script, and the standing instruments. `inventory.ts` groups every control by what it does under a pointer, and `reveal-inventory.ts` reports which blocks arrive and which were there all along, tracing the first screen frame by frame because the marker and the paint are different claims
- `public/` owns files served verbatim at the domain root

For the rationale behind these choices, such as Astro over Next, the shadcn install path, font preload, and the theme toggle as static Astro, see `canon/ARCHITECTURE.md` § Key technical decisions.

## What the React toolchain costs while rendering nothing

No component opts into hydration. The site ships zero `client:*` directives and holds one unreferenced `.tsx` file at `src/components/ui/button.tsx`, so the React toolchain renders nothing a visitor sees. It stays anyway, because an interactive surface is a plausible next increment and standing the integration back up costs more than carrying it does. `canon/ARCHITECTURE.md` § Key technical decisions holds that call. What belongs here is the bill.

Ten direct packages nothing exercises: `react`, `react-dom`, `@astrojs/react`, `radix-ui`, `lucide-react`, `@types/react`, `@types/react-dom`, `@testing-library/react`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`. Two of those are lint plugins scanning a file set of one, and `src/test/setup.ts` wires the React testing helpers against a suite that reports no test files.

Four more sit behind them and bring the real count to fourteen. `class-variance-authority` is imported by the unreferenced component alone, `clsx` and `tailwind-merge` are reached only through `src/lib/utils.ts`, which nothing but that component imports, and `@testing-library/user-event` is imported nowhere at all.

Count the fourteen rather than the ten when weighing a removal. The smaller number reads low against a decision that has been reopened once, and a session auditing the tree without this paragraph proposes removing the toolchain. Measured on 2026-08-15.

## New domain folders

A diff adding a new top-level folder under `src/` drafts that domain's `canon/context/<domain>.md` entry at ship time, per the context standard (`canon standards context`). `claude-docs` only refreshes an entry that already exists and never creates one on its own.

## Setup

- Install [Bun](https://bun.sh): `curl -fsSL https://bun.sh/install | bash`
- Install dependencies: `bun install`
- Install the Playwright browser used by e2e and screenshot scripts: `bunx playwright install chromium`

## Scripts

| Command                    | Purpose                                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `bun run check`            | Full verification. Auto-formats, then asserts clean.                                                                   |
| `bun run check:record`     | Run `canon context audit --gate` through `bunx`: citations, decision cap, required sections, index drift.              |
| `bun run format`           | Auto-fix prettier and shfmt formatting.                                                                                |
| `bun run clean`            | Wipe `node_modules/`, clear bun cache, reinstall.                                                                      |
| `bun run update`           | Interactive `bun update` followed by verification.                                                                     |
| `bun run dev`              | Start the Astro dev server on port 4321.                                                                               |
| `bun run device`           | Serve the dev site to a phone or tablet on the same network, printing a QR to scan.                                    |
| `bun run brand`            | Redraw every brand raster from the one mark source. Run after editing that mark and never by hand.                     |
| `bun run share-card`       | Redraw the link preview card. Needs the site served, since it composes inside the built page to get its own type.      |
| `bun run unfurl`           | Render every page's preview as five hosts compose it. Needs the site served, since it reads the tags off the document. |
| `bun run build`            | Run `astro check` then build the static output.                                                                        |
| `bun run preview`          | Serve the built site locally.                                                                                          |
| `bun run astro`            | Expose the Astro CLI.                                                                                                  |
| `bun run typecheck`        | Run `astro check`.                                                                                                     |
| `bun run lint`             | Run ESLint with zero warnings allowed.                                                                                 |
| `bun run lint:fix`         | Auto-fix ESLint issues.                                                                                                |
| `bun run test`             | Run Vitest in watch mode.                                                                                              |
| `bun run test:run`         | Run Vitest once with verbose reporter.                                                                                 |
| `bun run test:coverage`    | Run Vitest with coverage.                                                                                              |
| `bun run test:e2e`         | Run Playwright E2E tests. Takes a spec path or `-g '<name>'` to narrow the run.                                        |
| `bun run test:e2e:changed` | Run the specs the import graph ties to the working tree, across every engine.                                          |
| `bun run screenshot`       | Build, preview, then capture screenshots. Pass `SCREENSHOT_FILTER=<term>[,<term>]` to limit capture to named surfaces. |

## What an end-to-end run costs

Scope and engines look like two ways to make a run cheaper and only one of them is. Measured on this suite, the full 273 tests run on chromium alone in about 1.9 minutes and 811 across all three engines in about 3.5, so three times the tests cost less than double the wall clock. Locally the engines fill workers that were otherwise idle.

What costs is the serial chain inside one spec, since `fullyParallel` is off. `e2e/cast.spec.ts` holds several full-field captures, and `e2e/cast-scheduler.spec.ts` holds the one scheduler test that needs a browser, the tap gate, split out of it and running about 11 seconds an engine. The other scheduler policies are fake-clock unit tests. `canon/context/ci.md` § The worker cap was raised twice and rejected twice carries why the split was made: CI pins `workers` to 1, where the two files run back to back on the one worker regardless of the split, and the seam let the scheduler tests be converted off a wall clock on their own.

Dropping to one engine therefore saves close to nothing and gives up the only thing the matrix is for. `.claude/rules/canon/lib/306-test-scope.md` states the resulting directive, and `canon/context/ci.md` § The e2e job is a matrix over the three engines the config defines carries why the matrix exists at all.

Turning `fullyParallel` on was measured rather than assumed. It took the full run from about 3:30 to 2:49 and failed two webkit tests, both timing assertions: more contexts on one machine is less processor each, and a reveal stagger read against a wall clock came back at zero. A fifth off the clock does not pay for a suite reporting failures nobody caused.

A question about the running page is answered faster by a script against `bun run dev` than by any suite invocation, since that path pays no build. The suite rebuilds the site and starts a fresh server on every run, because `webServer` runs `bun run build` under `reuseExistingServer: false`.

## Visual verification

Keep `bun run dev` running in the background during landing-page sessions so changes are visible at http://localhost:4321 as they land.

- `bun run screenshot` builds, then binds its own preview server on port 4173 via `scripts/screenshot.sh`. The separate port keeps it clear of the dev server on 4321, and the script exits rather than reuse a port already serving.
- `bun run readme-screenshot` shares that same preview-server bootstrap, extracted to `scripts/lib/preview-server.sh`, and captures only the header section for `README.md`'s own hero image at `.github/evidence/readme/{light,dark}.png`. `.github/workflows/readme-screenshot.yml` runs it in CI on a pull request touching the header, and pushes the result back onto the branch when it changes.
- Three surfaces each hold their own port band so any two run at once: dev from 4321, screenshot from 4173, and Playwright from 4250. `playwright.config.ts` derives its `baseURL` from that base and passes the resolved port to `astro preview`. The device harness is the exception and holds one fixed port at 4400, for the reason in § Serving to a real device.
- `scripts/worktree-port.sh` shifts all three by the same per-worktree offset, derived from the worktree directory name. The offset caps at 50, which is what keeps the bands from overlapping, so a linked worktree never collides with the main checkout.
- Two worktrees can collide with each other, because the offset is a hash rather than an allocation. It resolves as `cksum % 50 + 1` over the directory name, which guarantees nothing about uniqueness: measured across the nine worktrees present on 2026-08-21, `ci-engine-coverage` and `page-audit-run` both derive 29, and the odds over 50 slots are past even at nine names. It surfaces as Playwright refusing to start on a port a sibling's `astro preview` still holds, sometimes hours after that session ended. Set `WORKTREE_PORT_OFFSET` to override the derivation rather than killing the other server, which may be serving work still under review.
- Running without collision is what lets several servers stay alive at once, so a reviewer handed one address can land on a sibling worktree serving work that is not under review. Stop the other `astro dev` and `astro preview` processes before handing over a URL, and read a token off the served page to confirm the change reached it. A reviewer reporting that nothing looks different is describing the wrong port as often as the wrong change.
- A dev server launched as a tracked background command is reaped when that command's task ends, which drops it shortly after the address goes out. Start a server meant to outlive the handoff detached instead.
- Captures land in the working directory's own `.canon/review/screenshots/`, which the script clears before each run. A worktree keeps its own captures and never reaches the main checkout's, so copy anything worth keeping before removing the worktree.
- `SCREENSHOT_FILTER=<term>[,<term>]` limits capture to a landing section (`header`, `about`, `experience`, `projects`, `looking-for`, `footer`) or a project route (`canon`, `jobtriage`, `diction`, `stackr`, `caret`, `annex`). A term matches against the `<dir>/<viewport>--<theme>` label, so `desktop` or `dark` narrows across every surface instead.
- A landing section covers three viewports (`desktop`, `mobile`, `narrow`) in both themes and a route covers two, dropping `narrow`. A full sweep is 56 images, a single-section filter is 6, and a single-route filter is 4.
- The capture walks the whole page and waits for every image to report pixels before it shoots, since card posters and case-study figures load lazily and a slot whose image never entered the viewport captures as an empty box. Read an empty media slot as a capture that skipped the wait before reading it as a rendering defect. An image that never loads warns and the capture proceeds, so the evidence survives.
- The wait skips an image carrying no source at all, which is the empty slot the figure dialog fills on demand. A second placeholder image added anywhere on the site needs no change, and one driven by `srcset` alone would need the check widened again.
- No capture contains a favicon, so a tab-icon change is verified by loading the built page in a headed engine and sampling the icon through a canvas. Headless Chromium requests no favicon at all, so reading which icon an engine selects needs `xvfb-run` around a headed run. `e2e/favicon.spec.ts` holds that luminance sampling as a standing guard across all three engines.

For the capture model and its output path, see `canon/context/ci.md`.

### Playwright MCP over a static capture

`.mcp.json` registers `@playwright/mcp@latest`. Reach for it when the question needs the page driven rather than photographed: a hover, a click, a viewport change, or a computed style read back off a live element. Reach for `bun run screenshot` when the question is what a surface looks like at rest, which covers layout review and diffing rendered content against the canonical source it came from.

The split matters because the two answer different questions and the static path is far cheaper. A capture that has to be driven into position is the signal to switch, not a reason to add a step to the capture script.

## Serving to a real device

`bun run device` puts the dev site on a phone or tablet on the same network and prints a code to scan. A desktop browser's device emulation is not a substitute: it reproduces the events and the viewport but not the finger, the display density, or the engine, and the interaction defects this project has shipped live in exactly that gap. A scroll that a rule reads as a hover is invisible under emulation and obvious under a thumb.

The routing has three hops and only the middle one needs setting up. The dev server runs inside WSL, which holds its own address on its own virtual network. Windows reaches it through a special case for `localhost` that nothing else on the network gets, so a tablet asking for the Windows address arrives at a host with nothing listening on that port. A port forward from Windows into WSL is what closes it, and creating one needs an administrator, which is why the script prints the command rather than running it.

The forward names the WSL address, and that address is assigned fresh on every boot. A forward set up yesterday therefore points into nothing today, and the failure is silent in the worst way: the port still answers on Windows and the connection is refused behind it, which reads as the dev server being down. Reading the current address and comparing it against what the forward holds is most of what the script does, and it prints `set` rather than `add` so the same command creates the forward and re-points a stale one.

The port is fixed at 4400 rather than derived per worktree the way the other three servers are, which is the one place this harness breaks the band convention above. A forward covers exactly one port, so a derived port would mean an administrator prompt for every new worktree, which is the recurring cost the script exists to remove. One fixed port means one forward that outlives every worktree and comes back only after a reboot. What it gives up is two worktrees serving to a device at once, which needs two devices before it is worth anything, and Astro refuses a held port rather than sliding to the next, so the collision is loud. `DEVICE_PORT` overrides it.

Three things the script cannot settle. A VPN on the phone may route local addresses away from the LAN, which shows as a scan that resolves and then times out, so turn it off before suspecting the forward. Several Windows adapters answer with link-local addresses that route nowhere, so the address is taken from the one holding a DHCP lease rather than the first one listed. And the firewall rule is needed once and never again, so it is printed only when no forward exists at all.

A public tunnel was the alternative and is not installed. It needs no administrator and works from any network, which is genuinely better on both counts, but it puts the dev site on an address anyone holding the link can load, and it needs the Vite host check widened to accept a hostname that changes every run. The forward keeps the page on the local network, where a portfolio still under construction belongs.

### Two flags, and the reason each exists

`DEVICE_MODE=dev` serves the dev server instead of the build. The scenario harness in `src/components/dev/` is gated on `import.meta.env.DEV` and leaves the production tree, so an interactive decision served through it is unreachable from a built page and can only be judged on the machine running it. That is the whole reason the flag exists, and the build stays the default because it is what a visitor receives.

`DEVICE_PATHS` takes a comma-separated list and renders one code per entry. A comparison served as several arms needs one code each, since a query string typed by hand on a tablet is where a live comparison stops being worth running.

```bash
DEVICE_MODE=dev DEVICE_PATHS="/?arm=0,/?arm=1" bun run device
```

The dev server serves device work. Astro resolves an optimized image through an endpoint reading the file off disk by absolute path under Vite's `/@fs/` prefix, and against the current Astro and Vite over the LAN address, and again with a foreign `Host` header, which is what a device arriving through the Windows forward actually sends, both the page and an optimized image return 200 with `content-type: image/webp`.

Read that as a server-side reading rather than a browser one. A device still losing its images is the reading that wins, and the flag is opt-in partly for that reason.

### A code a session hands over is an image, not blocks

`bun run device` draws its code with terminal block characters and skips drawing entirely when stdout is not a terminal, printing a line saying so. That is correct for a human at a prompt and useless to every agent session, which runs the script through a tool and captures its output, so a session following this entry alone reaches an address it cannot hand over in scannable form.

`bun scripts/qr.ts <url> [url...]` is the answer. It reads the matrix out of the same encoder the terminal renderer vendors, draws it as squares with a four-module quiet zone, and writes a PNG per address under `.canon/review/qr/`. A code cropped to its own edge fails against a busy background and the failure looks like a bad camera rather than a bad image, which is what the quiet zone is for.

## Serving candidate treatments the operator drives

Some decisions cannot be settled from a capture or a recording, since both are passive and the question is how a thing feels to cause: a pace read while scrolling, a gesture, whether a control is where a hand expects it. `src/components/dev/scenarios.astro` serves candidate treatments live from the running page behind one query parameter, with a switcher for moving between arms.

- It renders nothing in a production build, because the whole component sits behind `import.meta.env.DEV` rather than gating itself at runtime. It renders nothing in development either until the page is asked for an arm by name.
- An arm carries CSS where the decision is a treatment. Where the decision is a runtime value, a pace or a shader uniform, the arm carries none and the module holding that value reads the active id off `documentElement.dataset`. That indirection is what lets one component serve a stylesheet decision and a runtime decision without knowing about either.
- It is unreferenced by default, since it is scaffolding a visual decision reaches for and removes again, and a branch with no open visual decision holds no call site.
- An unreferenced component is only safe while something tells a session it exists. The `visual-batch` skill names it explicitly rather than leaving discovery to a tree search, which is the arrangement to preserve if either side moves.

`DEVICE_MODE=dev` above exists to get these arms onto a real device, since a production build leaves the whole harness out.

## Reading a link preview without pasting one

`bun run unfurl` renders all six pages as Discord, LinkedIn, X, Slack, and a Notion bookmark compose them, one sheet per page under `.canon/review/unfurl/`. It reads the tags off the served document rather than out of the source, since a crawler reads the rendered page and that is the copy that can be wrong, and it fetches the declared image the same way and embeds it so a sheet survives the server going away.

Three failures make it throw rather than draw. A page missing any of the five tags names them. A relative `og:image` is rejected outright, which is the defect the record already carries as the one that fails silently in production. An image the server will not return names the status.

Read a sheet as evidence about this card and never as a screenshot of that app. The chrome is drawn to each host's published shape, so what the sheet proves is what the card does under a given crop and a given line clamp, which is the half that belongs to this repository. A host redesigning its own embed is the half it cannot see, and the caveat under each frame names what that host is known to vary on.

The apex is where it pays. Every host except LinkedIn renders the description, and the card image draws the claim, so a description opening on that same claim prints one sentence twice in a single unfurl. The five route pages carry their own descriptions and never hit it. `src/test/rendered-copy.test.ts` guards the description against the title and does not guard it against the image, which is the gap this found.

## Reproduce a suite failure against the suite's own target

The Playwright config's `webServer` runs `bun run build` and serves the result with `astro preview`, so the suite exercises the built output rather than the dev server. A probe written to reproduce a suite failure has to point at that preview, not at `bun run dev`.

The two differ in ways that decide whether a defect appears at all. The dev server delivers styles through the Vite client, where the built page links a stylesheet, so any timing that depends on when CSS applies exists only in the build. A startup-measurement defect chased on 2026-08-19 reproduced on every run against the preview and never once against dev, and several probe cycles were spent on the wrong target before that was noticed.

Start the preview on the same band the config uses, `4250` plus the worktree offset, and pass its address to the probe.

Write the probe into `e2e/` and delete it when the question is answered. Playwright's `testDir` is that folder, so a spec anywhere else is reported as no tests found, and the scratch location `CLAUDE.md` directs temporary files to is worse than useless here: vitest globs `.canon/tmp/`, so a Playwright spec parked there is collected by `bun run test:run` and fails the whole `check` on a `test.use()` call outside a Playwright runner. The two rules contradict each other on this one file type and the test folder is the side that works.

A suite failure reproduced under the full run and not alone is contention rather than a defect. Re-run the failing spec files on their own engine before classifying one, since the full three-engine run loads the machine enough that image-loading assertions time out while passing in isolation.

## A search that comes back empty against a file that should match

A raw NUL byte anywhere in a source file makes every text tool classify the whole file as binary, so a search returns an honest empty result against a file holding exactly what was searched for. Nothing reports the cause, and the natural next move is to doubt the search term rather than the file.

Check for one whenever a search comes back empty against a file that should not be empty, before rewriting the pattern a third time.

## Shell scripts

All `.sh` files live under `scripts/`. Do not place shell scripts outside `scripts/`.

## Husky hooks

- `pre-commit` runs `lint-staged`. ESLint and prettier auto-fix `.astro`, `.tsx`, `.ts`, `.jsx`, `.js` files. Prettier and cspell run on `.json`, `.css`, `.md`, `.mdc`. shfmt and shellcheck run on `.sh`.
- `commit-msg` runs `commitlint` against the conventional commit format.
- `pre-push` runs `bun run check`. After pushing, run `git status`. If files changed, commit the diff as `style(<scope>):` and push again.
