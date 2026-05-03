---
title: CI
description: GitHub Actions workflow triggers and checks
---

# CI

GitHub Actions workflow for this project.

## Triggers

- Pull requests targeting `main` (verify only)
- Push to `main` (verify, then deploy on green)
- `workflow_dispatch` (manual run from the Actions tab)

## Checks

Defined in `.github/workflows/verify.yml`. All verify jobs must pass before merge. The `deploy` job runs only on `push: main` and gates on the four verify jobs.

| Check     | Command                 | What it asserts                             |
| --------- | ----------------------- | ------------------------------------------- |
| Format    | `bun run check:format`  | prettier and shfmt are clean                |
| Spell     | `bun run check:spell`   | cspell passes against dictionaries          |
| Shell     | `bun run check:shell`   | shellcheck passes at warning level          |
| Typecheck | `bun run typecheck`     | `astro check` passes                        |
| Lint      | `bun run lint`          | ESLint passes with zero warnings            |
| Tests     | `bun run test:coverage` | Vitest passes with coverage thresholds      |
| Build     | `bun run build`         | `astro build` succeeds                      |
| E2E       | `bun run test:e2e`      | Playwright passes against the built preview |
| Deploy    | `wrangler pages deploy` | Uploads `./dist/` to Cloudflare Pages       |

For the deploy mechanism, custom domain wiring, and secrets, see `docs/deployment.md`.

## Runtime

The workflow installs Node 22 via `actions/setup-node` before Bun. cspell v10 and several dev tools require Node ≥22.18. Bun does not satisfy this requirement on its own because it ships its own runtime, not a system Node.

## Running CI locally

`bun run check` runs the static and unit asserts plus auto-formats first. `bun run check:full` runs verify plus `test:e2e`. If CI fails on format, run `bun run check` locally and commit the diff.
