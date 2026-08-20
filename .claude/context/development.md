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
- `e2e/` owns the playwright specs and the screenshot script
- `public/` owns files served verbatim at the domain root

For the rationale behind these choices, such as Astro over Next, the shadcn install path, font preload, and the theme toggle as static Astro, see `.claude/ARCHITECTURE.md` § Key technical decisions.

## Setup

- Install [Bun](https://bun.sh): `curl -fsSL https://bun.sh/install | bash`
- Install dependencies: `bun install`
- Install the Playwright browser used by e2e and screenshot scripts: `bunx playwright install chromium`

## Scripts

| Command                 | Purpose                                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `bun run check`         | Full verification. Auto-formats, then asserts clean.                                                                   |
| `bun run format`        | Auto-fix prettier and shfmt formatting.                                                                                |
| `bun run clean`         | Wipe `node_modules/`, clear bun cache, reinstall.                                                                      |
| `bun run update`        | Interactive `bun update` followed by verification.                                                                     |
| `bun run dev`           | Start the Astro dev server on port 4321.                                                                               |
| `bun run build`         | Run `astro check` then build the static output.                                                                        |
| `bun run preview`       | Serve the built site locally.                                                                                          |
| `bun run astro`         | Expose the Astro CLI.                                                                                                  |
| `bun run typecheck`     | Run `astro check`.                                                                                                     |
| `bun run lint`          | Run ESLint with zero warnings allowed.                                                                                 |
| `bun run lint:fix`      | Auto-fix ESLint issues.                                                                                                |
| `bun run test`          | Run Vitest in watch mode.                                                                                              |
| `bun run test:run`      | Run Vitest once with verbose reporter.                                                                                 |
| `bun run test:coverage` | Run Vitest with coverage.                                                                                              |
| `bun run test:e2e`      | Run Playwright E2E tests.                                                                                              |
| `bun run screenshot`    | Build, preview, then capture screenshots. Pass `SCREENSHOT_FILTER=<term>[,<term>]` to limit capture to named surfaces. |

## Visual verification

Keep `bun run dev` running in the background during landing-page sessions so changes are visible at http://localhost:4321 as they land.

- `bun run screenshot` builds, then binds its own preview server on port 4173 via `scripts/screenshot.sh`. The separate port keeps it clear of the dev server on 4321, and the script exits rather than reuse a port already serving.
- Three surfaces each hold their own port band so any two run at once: dev from 4321, screenshot from 4173, and Playwright from 4250. `playwright.config.ts` derives its `baseURL` from that base and passes the resolved port to `astro preview`.
- `scripts/worktree-port.sh` shifts all three by the same per-worktree offset, derived from the worktree directory name. The offset caps at 50, which is what keeps the bands from overlapping. A linked worktree therefore runs every surface without colliding with the main checkout or with a sibling worktree.
- Running without collision is what lets several servers stay alive at once, so a reviewer handed one address can land on a sibling worktree serving work that is not under review. Stop the other `astro dev` and `astro preview` processes before handing over a URL, and read a token off the served page to confirm the change reached it. A reviewer reporting that nothing looks different is describing the wrong port as often as the wrong change.
- A dev server launched as a tracked background command is reaped when that command's task ends, which drops it shortly after the address goes out. Start a server meant to outlive the handoff detached instead.
- Captures land in the working directory's own `.claude/review/screenshots/`, which the script clears before each run. A worktree keeps its own captures and never reaches the main checkout's, so copy anything worth keeping before removing the worktree.
- `SCREENSHOT_FILTER=<term>[,<term>]` limits capture to a landing section (`header`, `about`, `experience`, `projects`, `looking-for`, `footer`) or a project route (`aitk`, `jobtriage`, `diction`, `stackr`, `caret`). A term matches against the `<dir>/<viewport>--<theme>` label, so `desktop` or `dark` narrows across every surface instead.
- A landing section covers three viewports (`desktop`, `mobile`, `narrow`) in both themes and a route covers two, dropping `narrow`. A full sweep is 56 images, a single-section filter is 6, and a single-route filter is 4.
- The capture walks the whole page and waits for every image to report pixels before it shoots, since card posters and case-study figures load lazily and a slot whose image never entered the viewport captures as an empty box. Read an empty media slot as a capture that skipped the wait before reading it as a rendering defect. An image that never loads warns and the capture proceeds, so the evidence survives.
- The wait skips an image carrying no source at all, which is the empty slot the figure dialog fills on demand. A second placeholder image added anywhere on the site needs no change, and one driven by `srcset` alone would need the check widened again.
- No capture contains a favicon, so a tab-icon change is verified by loading the built page in a headed engine and sampling the icon through a canvas. Headless Chromium requests no favicon at all, so reading which icon an engine selects needs `xvfb-run` around a headed run. `e2e/favicon.spec.ts` holds that luminance sampling as a standing guard across all three engines.

For the capture model and its output path, see `.claude/ARCHITECTURE.md` § Screenshots capture per-section on the landing page and whole on a case study. For when to reach for Playwright MCP over a static capture, see § Playwright MCP for interactive verification in the same file.

## Reproduce a suite failure against the suite's own target

The Playwright config's `webServer` runs `bun run build` and serves the result with `astro preview`, so the suite exercises the built output rather than the dev server. A probe written to reproduce a suite failure has to point at that preview, not at `bun run dev`.

The two differ in ways that decide whether a defect appears at all. The dev server delivers styles through the Vite client, where the built page links a stylesheet, so any timing that depends on when CSS applies exists only in the build. A startup-measurement defect chased on 2026-08-19 reproduced on every run against the preview and never once against dev, and several probe cycles were spent on the wrong target before that was noticed.

Start the preview on the same band the config uses, `4250` plus the worktree offset, and pass its address to the probe.

Write the probe into `e2e/` and delete it when the question is answered. Playwright's `testDir` is that folder, so a spec anywhere else is reported as no tests found, and the scratch location `CLAUDE.md` directs temporary files to is worse than useless here: vitest globs `.claude/.tmp/`, so a Playwright spec parked there is collected by `bun run test:run` and fails the whole `check` on a `test.use()` call outside a Playwright runner. The two rules contradict each other on this one file type and the test folder is the side that works.

A suite failure reproduced under the full run and not alone is contention rather than a defect. Re-run the failing spec files on their own engine before classifying one, since the full three-engine run loads the machine enough that image-loading assertions time out while passing in isolation.

## Shell scripts

All `.sh` files live under `scripts/`. Do not place shell scripts outside `scripts/`.

## Husky hooks

- `pre-commit` runs `lint-staged`. ESLint and prettier auto-fix `.astro`, `.tsx`, `.ts`, `.jsx`, `.js` files. Prettier and cspell run on `.json`, `.css`, `.md`, `.mdc`. shfmt and shellcheck run on `.sh`.
- `commit-msg` runs `commitlint` against the conventional commit format.
- `pre-push` runs `bun run check`. After pushing, run `git status`. If files changed, commit the diff as `style(<scope>):` and push again.
