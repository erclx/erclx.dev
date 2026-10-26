---
title: CI
description: The verify workflow's jobs and triggers, the evidence and README capture workflows, the e2e suite, and the screenshot harness
---

# CI

## Overview

Owns the GitHub Actions workflows that gate a merge and keep the committed screenshots current. `verify.yml` runs on every pull request with no branch filter, on a push to `main`, and on a manual dispatch. `build-verify` builds once, and the rendered-copy, e2e, preview, and deploy jobs all download that `dist/` artifact.

The workflows install Node 22 before Bun, since Astro 6 and Vitest 5 need Node 22.12 or later and the `astro` binary runs under a system Node. `bun run check` runs the same asserts locally and writes nothing.

## Layout

### `.github/workflows/`

Holds the workflows. `verify.yml` carries the jobs below, and `deploy` ships only from a push to `main` behind every other job.

| Job             | What it runs                                            |
| --------------- | ------------------------------------------------------- |
| `static-checks` | Typecheck, lint, format, and the context gate           |
| `unit-tests`    | `bun run test:coverage`                                 |
| `build-verify`  | `bun run build`, uploaded as the `dist` artifact        |
| `rendered-copy` | `bun run test:rendered` against the built pages         |
| `e2e-tests`     | `bun run test:e2e`, one leg per engine                  |
| `preview`       | A dispatch-only deploy to a preview host                |
| `deploy`        | A push to `main`, uploading `dist/` to Cloudflare Pages |

The other workflows each own one job.

- `shell.yml` runs shfmt and shellcheck, and `phase-label-gate.yml` rejects a phase label in a pull request body
- `pr-local-preview.yml` drops the local preview line from the evidence comment when a pull request closes
- A concurrency group cancels a superseded run, except a push to `main` or a dispatch, since either may carry a deploy

### `e2e/`

Holds the Playwright suite and the screenshot harness. The specs cover only what a browser proves, being clean routes at 320px, the way home and back to the top, one bar width, and the theme choice.

- `playwright.config.ts` runs all three engines under reduced motion and serves the build on 4250 plus the offset, clear of `astro dev`
- `screenshot.ts` is customized for one blank line the toolkit's own import-sort rule demands, and `capture/cases.ts` is the capture file this project edits
- A case flagged `evidence` writes 320 and 1280 frames under `.github/evidence/surfaces/`, and the full sweep goes to the ignored `screenshots/`
- `cases.ts` loads lazy images eagerly and drops an empty `src`, since the harness waits on every image and two kinds never complete
- The home cases mask `[data-updated]`, the footer's build date, so a rebuild alone shows no diff

## Gotchas

- A dispatch from a feature branch deploys to a preview host, since `--branch` reads the ref, so only `main` reaches the apex
- `deploy` keeps its Node and Bun setup though it builds nothing, since wrangler-action installs wrangler with the lockfile's package manager
- A commit pushed by `github-actions[bot]` holds its pull request's runs for a maintainer's approval, so no workflow here pushes commits
- Run `bun run pr-evidence-screenshot` after a visual change, and `bun run readme-screenshot` after a header change, then commit the frames
- `bun run test:e2e` runs all three engines locally, so pass `--project` only to reproduce a failure an engine reported
