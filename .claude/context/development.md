---
title: Development
description: Local dev workflow, scripts, and husky hooks
---

# Development

## Overview

Local dev workflow for this project.

## Layout

- `src/pages/` owns the routes. The apex composes the landing sections, and each case study is its own file
- `src/layouts/` owns the html shell: font preload and the first-paint theme script
- `src/components/site/` owns the landing-page sections and their primitives
- `src/components/ui/` owns the shadcn primitives, vendored into this repo rather than imported from a package
- `src/assets/` owns page-owned media: the hero field, project posters and videos, the signature
- `src/lib/` owns shared helpers
- `src/styles/` owns the tailwind entry, the theme tokens, and the base layer
- `src/test/` owns the vitest environment setup
- `e2e/` owns the playwright smoke spec and the per-section screenshot script
- `public/` owns files served verbatim at the domain root

For the rationale behind these choices, such as Astro over Next, the shadcn install path, font preload, and the theme toggle as static Astro, see `.claude/ARCHITECTURE.md` § Key technical decisions.

## Setup

- Install [Bun](https://bun.sh): `curl -fsSL https://bun.sh/install | bash`
- Install dependencies: `bun install`
- Install the Playwright browser used by e2e and screenshot scripts: `bunx playwright install chromium`

## Scripts

| Command                 | Purpose                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `bun run check`         | Full verification. Auto-formats, then asserts clean.                                                                            |
| `bun run format`        | Auto-fix prettier and shfmt formatting.                                                                                         |
| `bun run clean`         | Wipe `node_modules/`, clear bun cache, reinstall.                                                                               |
| `bun run update`        | Interactive `bun update` followed by verification.                                                                              |
| `bun run dev`           | Start the Astro dev server on port 4321.                                                                                        |
| `bun run build`         | Run `astro check` then build the static output.                                                                                 |
| `bun run preview`       | Serve the built site locally.                                                                                                   |
| `bun run astro`         | Expose the Astro CLI.                                                                                                           |
| `bun run typecheck`     | Run `astro check`.                                                                                                              |
| `bun run lint`          | Run ESLint with zero warnings allowed.                                                                                          |
| `bun run lint:fix`      | Auto-fix ESLint issues.                                                                                                         |
| `bun run test`          | Run Vitest in watch mode.                                                                                                       |
| `bun run test:run`      | Run Vitest once with verbose reporter.                                                                                          |
| `bun run test:coverage` | Run Vitest with coverage.                                                                                                       |
| `bun run test:e2e`      | Run Playwright E2E tests.                                                                                                       |
| `bun run screenshot`    | Build, preview, then capture screenshots. Pass `SCREENSHOT_FILTER=<section>[,<section>]` to limit capture to specific sections. |

## Visual verification

Keep `bun run dev` running in the background during landing-page sessions so changes are visible at http://localhost:4321 as they land.

- `bun run screenshot` builds, then binds its own preview server on port 4173 via `scripts/screenshot.sh`. The separate port keeps it clear of the dev server on 4321, and the script exits rather than reuse a port already serving.
- `SCREENSHOT_FILTER=<section>[,<section>]` limits capture to `header`, `origin`, `projects`, `looking-for`, or `footer`.
- Each run covers three viewports (`desktop`, `mobile`, `narrow`) in both themes, so a full sweep is 30 images and a single-section filter is 6.

For the per-section capture model and its output path, see `.claude/ARCHITECTURE.md` § Screenshots capture per-section, not full-page. For when to reach for Playwright MCP over a static capture, see § Playwright MCP for interactive verification in the same file.

## Shell scripts

All `.sh` files live under `scripts/`. Do not place shell scripts outside `scripts/`.

## Husky hooks

- `pre-commit` runs `lint-staged`. ESLint and prettier auto-fix `.astro`, `.tsx`, `.ts`, `.jsx`, `.js` files. Prettier and cspell run on `.json`, `.css`, `.md`, `.mdc`. shfmt and shellcheck run on `.sh`.
- `commit-msg` runs `commitlint` against the conventional commit format.
- `pre-push` runs `bun run check`. After pushing, run `git status`. If files changed, commit the diff as `style(<scope>):` and push again.
