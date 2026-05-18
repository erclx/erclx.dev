---
title: Development
description: Local dev workflow, scripts, and husky hooks
---

# Development

Local dev workflow for this project.

## Project layout

```plaintext
src/
├── pages/
│   └── index.astro      ← single page, composes layout and sections
├── layouts/
│   └── base.astro       ← html shell, font preload, first-paint theme script
├── components/
│   ├── site/            ← landing-page sections and primitives
│   └── ui/              ← shadcn primitives, owned by this repo
├── assets/              ← page-owned media: hero field, project posters/videos, signature
├── lib/
│   └── utils.ts         ← cn() and shared helpers
├── styles/
│   └── global.css       ← tailwind entry, theme tokens, base layer
└── test/
    └── setup.ts         ← jsdom + RTL cleanup for vitest

e2e/
├── home.spec.ts         ← playwright smoke for the apex
└── screenshot.ts        ← node script, per-section captures across desktop, mobile, narrow widths and light / dark themes

public/
└── resume.pdf           ← downloadable résumé, served at /resume.pdf

vitest.config.ts         ← jsdom + globals + coverage v8
playwright.config.ts     ← chromium + firefox + webkit, webServer auto-starts preview
tsconfig.e2e.json        ← e2e-only tsconfig with @playwright/test + node types
.mcp.json                ← Playwright MCP server registration
```

For the rationale behind these choices (Astro over Next, shadcn install path, font preload, theme toggle as static Astro), see `.claude/ARCHITECTURE.md` § Key technical decisions.

## Setup

- Install [Bun](https://bun.sh): `curl -fsSL https://bun.sh/install | bash`
- Install dependencies: `bun install`
- Install the Playwright browser used by e2e and screenshot scripts: `bunx playwright install chromium`

## Scripts

| Command                 | Purpose                                              |
| ----------------------- | ---------------------------------------------------- |
| `bun run check`         | Full verification. Auto-formats, then asserts clean. |
| `bun run format`        | Auto-fix prettier and shfmt formatting.              |
| `bun run clean`         | Wipe `node_modules/`, clear bun cache, reinstall.    |
| `bun run update`        | Interactive `bun update` followed by verification.   |
| `bun run dev`           | Start the Astro dev server on port 4321.             |
| `bun run build`         | Run `astro check` then build the static output.      |
| `bun run preview`       | Serve the built site locally.                        |
| `bun run astro`         | Expose the Astro CLI.                                |
| `bun run typecheck`     | Run `astro check`.                                   |
| `bun run lint`          | Run ESLint with zero warnings allowed.               |
| `bun run lint:fix`      | Auto-fix ESLint issues.                              |
| `bun run test`          | Run Vitest in watch mode.                            |
| `bun run test:run`      | Run Vitest once with verbose reporter.               |
| `bun run test:coverage` | Run Vitest with coverage.                            |
| `bun run test:e2e`      | Run Playwright E2E tests.                            |
| `bun run screenshot`    | Build, preview, then capture screenshots.            |

## Shell scripts

All `.sh` files live under `scripts/`. Do not place shell scripts outside `scripts/`.

## Husky hooks

- `pre-commit` runs `lint-staged`. ESLint and prettier auto-fix `.astro`, `.tsx`, `.ts`, `.jsx`, `.js` files. Prettier and cspell run on `.json`, `.css`, `.md`, `.mdc`. shfmt and shellcheck run on `.sh`.
- `commit-msg` runs `commitlint` against the conventional commit format.
- `pre-push` runs `bun run check`. After pushing, run `git status`. If files changed, commit the diff as `style(<scope>):` and push again.
