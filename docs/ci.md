---
title: CI
description: GitHub Actions workflow triggers and checks
---

# CI

GitHub Actions workflow for this project.

## Triggers

- Pull requests targeting `main`
- `workflow_dispatch` (manual run from the Actions tab)

## Checks

Defined in `.github/workflows/verify.yml`. All jobs must pass before merge.

| Check  | Command                | What it asserts                    |
| ------ | ---------------------- | ---------------------------------- |
| Format | `bun run check:format` | prettier and shfmt are clean       |
| Spell  | `bun run check:spell`  | cspell passes against dictionaries |
| Shell  | `bun run check:shell`  | shellcheck passes at warning level |

## Runtime

The workflow installs Node 22 via `actions/setup-node` before Bun. cspell v10 and several dev tools require Node ≥22.18. Bun does not satisfy this requirement on its own because it ships its own runtime, not a system Node.

## Running CI locally

`bun run check` runs the same three asserts plus auto-formats first. If CI fails on format, run `bun run check` locally and commit the diff.

## Reference

Toolkit conventions behind this workflow live in `tooling/base.md` and `tooling/astro.md`.
