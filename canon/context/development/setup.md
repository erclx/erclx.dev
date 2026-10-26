---
title: Setup
description: Local toolchain, package scripts, port bands, the device harness, the scenario switcher, and husky hooks
---

# Setup

## Overview

Owns how the project runs on a developer machine, being the toolchain install, the package scripts, the local servers and their ports, and the git hooks that gate a commit or a push. CI calls the same scripts from a workflow, which `canon/context/ci.md` covers.

Install [Bun](https://bun.sh) with `curl -fsSL https://bun.sh/install | bash`, run `bun install`, then run `bunx playwright install chromium` for the e2e and capture scripts.

## Layout

### Scripts

The verify gate runs before every push and writes nothing, so a formatting failure is fixed by running `bun run format` and committing the diff.

| Command                | Purpose                                                                       |
| ---------------------- | ----------------------------------------------------------------------------- |
| `bun run check`        | Runs `scripts/verify.ts`, then the context gate and the rendered-copy tests   |
| `bun run check:record` | Runs `canon context audit --gate` through `bunx`, pinned to one canon release |
| `bun run check:shell`  | Runs shfmt and shellcheck over `scripts/`                                     |
| `bun run format`       | Formats with oxfmt, and with prettier on `.astro` files                       |
| `bun run lint`         | Runs ESLint with zero warnings allowed, and `lint:fix` fixes what it can      |
| `bun run typecheck`    | Runs `astro check`                                                            |

The servers each hold their own port band, so any two run at once.

| Command              | Purpose                                                                    |
| -------------------- | -------------------------------------------------------------------------- |
| `bun run dev`        | Serves the dev site from port 4321                                         |
| `bun run build`      | Runs `astro check`, then builds the static output                          |
| `bun run preview`    | Serves the built site                                                      |
| `bun run screenshot` | Builds, previews from port 4173, and captures every surface in both themes |
| `bun run device`     | Serves the site to a phone or tablet on the same network from port 4400    |

The test scripts split by runner, with Vitest for unit and rendered copy and Playwright for the browser.

| Command                 | Purpose                                                                      |
| ----------------------- | ---------------------------------------------------------------------------- |
| `bun run test:run`      | Runs the Vitest suite once, and `test` runs it in watch mode                 |
| `bun run test:rendered` | Runs the copy tests against `dist/`, so it needs a build first               |
| `bun run test:e2e`      | Runs the Playwright suite from port 4250. Takes a spec path or `-g '<name>'` |

The brand and preview scripts redraw generated assets, and two of them need the site served.

| Command              | Purpose                                                                             |
| -------------------- | ----------------------------------------------------------------------------------- |
| `bun run brand`      | Redraws every brand raster from the one mark source                                 |
| `bun run share-card` | Redraws the link preview card inside the built page, so it needs the site served    |
| `bun run unfurl`     | Renders each page's preview as five hosts compose it, under `.canon/review/unfurl/` |

### `scripts/`

Holds every shell and Bun script the package scripts call, since no `.sh` file belongs outside this folder. `verify.ts`, `worktree-port.sh`, `screenshot.sh`, and `lib/preview-server.sh` ship from the toolkit, so a tooling sync rewrites them.

- `worktree-port.sh` shifts every server's port by a per-worktree offset, so a linked worktree never collides with the main checkout
- `device.sh` finds the WSL address, checks the Windows port forward against it, and prints the `netsh` command that creates or re-points the forward
- `qr.ts` writes a scannable PNG per address under `.canon/review/qr/`, with a four-module quiet zone so a camera reads it against a busy background
- `unfurl.ts` reads the tags off the served page rather than the source, since a crawler reads the rendered copy

### `src/components/dev/`

Holds the scenario switcher, which serves candidate treatments of one visual decision live from the running page behind a query parameter. The `visual-batch` skill names it, since nothing in the tree references it between decisions.

- The component sits behind `import.meta.env.DEV`, so a production build carries none of it
- An arm carries CSS for a treatment, or sets an id on `documentElement.dataset` for a runtime value such as a pace
- `DEVICE_MODE=dev bun run device` serves the dev server to a device, since the built page leaves the switcher out
- `DEVICE_PATHS` takes a comma-separated list and prints one code per arm

### `.husky/`

Holds the git hooks, which call the same package scripts CI runs.

- `pre-commit` runs `lint-staged`, which formats staged `.json` and `.md` files with oxfmt and runs `canon indexes regen` on staged `.md` files
- `commit-msg` runs `commitlint` against the conventional commit format
- `pre-push` runs `bun run check`

### Other folders

Each folder below has no trap of its own, so one line covers it.

- `src/pages/` owns the routes, where the apex composes the landing sections and each project route is its own file
- `src/components/site/` owns the landing sections and their primitives, and `src/components/ui/` owns the vendored shadcn primitives
- `src/assets/` owns page media, and `src/test/` owns the Vitest setup

## Gotchas

- Two worktrees can derive the same port offset, since it is `cksum % 50 + 1` of the folder name, so set `WORKTREE_PORT_OFFSET` rather than stop a sibling's server
- The WSL address changes on every boot, so yesterday's device forward refuses connections while the Windows port still answers. Run `bun run device` to re-point it.
- `bun run device` draws no code when stdout is not a terminal, so an agent session runs `bun scripts/qr.ts <url>` and hands over the PNG
- A raw NUL byte makes every search tool read a source file as binary and return nothing, so check for one before rewriting a search that should match
- Reproduce a suite failure with a probe in `e2e/` against `astro preview` on 4250 plus the offset, since a dev-server probe misses CSS timing defects
