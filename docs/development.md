---
title: Development
description: Local dev workflow, scripts, and husky hooks
---

# Development

Local dev workflow for this project.

## Setup

- Install [Bun](https://bun.sh): `curl -fsSL https://bun.sh/install | bash`
- Use Node 22.18 or later. cspell and other dev tools enforce this floor via `engines`.
- Install dependencies: `bun install`
- Install the Playwright browser used by e2e and screenshot scripts: `bunx playwright install chromium`

## Scripts

| Command          | Purpose                                              |
| ---------------- | ---------------------------------------------------- |
| `bun run check`  | Full verification. Auto-formats, then asserts clean. |
| `bun run format` | Auto-fix prettier and shfmt formatting.              |
| `bun run clean`  | Wipe `node_modules/`, clear bun cache, reinstall.    |
| `bun run update` | Interactive `bun update` followed by verification.   |

## Shell scripts

All `.sh` files live under `scripts/`. Do not place shell scripts outside `scripts/`.

## Husky hooks

- `pre-commit` runs `lint-staged`. ESLint and prettier auto-fix `.astro`, `.tsx`, `.ts`, `.jsx`, `.js` files. Prettier and cspell run on `.json`, `.css`, `.md`, `.mdc`. shfmt and shellcheck run on `.sh`.
- `commit-msg` runs `commitlint` against the conventional commit format.
- `pre-push` runs `bun run check`. After pushing, run `git status`. If files changed, commit the diff as `style(<scope>):` and push again.

## Reference

Toolkit conventions behind these commands live in `tooling/base.md` and `tooling/astro.md`.
