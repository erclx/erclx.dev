---
title: Deployment
description: Cloudflare Pages deploy pipeline, domain setup, and secret rotation
---

# Deployment

## Overview

erclx.dev runs on Cloudflare Pages, project name `erclx-dev`. Every push to `main` builds once in GitHub Actions and uploads `./dist/` to the project via `cloudflare/wrangler-action`. The apex domain `erclx.dev` and `www.erclx.dev` are both attached as custom domains on the same Pages project.

The reasoning behind Cloudflare Pages and behind deploying from Actions rather than the Cloudflare Git integration lives in `.claude/ARCHITECTURE.md` § Key technical decisions.

## Decisions

- The Pages project is a Direct Upload type. Wrangler pushes a built `./dist/`, so Cloudflare never runs a build and never needs a bun version pinned on its side.
- The free tier covers unlimited bandwidth and 500 builds per month. A single-page site stays well inside both, so no billing alarm is wired.
- CLI over the dashboard for inspection, redeploy, env-var, and domain changes. Confirm before a destructive operation: deleting the project, force-pushing a production deploy, changing live DNS.

## Deploy job

Defined in `.github/workflows/verify.yml`. Triggered on a push to `main` and on a manual dispatch from any ref, gated on the four verify jobs (`static-checks`, `unit-tests`, `build-verify`, `e2e-tests`) either way. `build-verify` is the only job that runs `bun run build`. `deploy` downloads that same `dist/` artifact rather than building its own, so the bytes every engine leg tested are the bytes that ship. See `.claude/context/ci.md` for the mechanism and for why a dispatch reaches this job at all. Then:

```yaml
command: pages deploy ./dist --project-name=erclx-dev --branch=${{ github.ref_name }}
```

`github.ref_name` is an Actions expression rather than a shell variable, so that line runs only inside the workflow. § Manual deploy below carries the shell form.

The ref supplies the branch, so only a run on `main` marks its upload as a production deployment. Every other ref goes to `<hash>.erclx-dev.pages.dev` and is not aliased to the apex, which is what lets a dispatch exercise the whole job without touching what a visitor sees.

## Pruning a preview

A dispatch from a branch leaves a deployment that nothing retires on its own. Direct Upload means Cloudflare holds no git ref, so deleting the branch leaves both the hash host and the branch alias serving, and `wrangler@3.90.0` offers no delete for a Pages deployment. Remove one from **Workers & Pages → erclx-dev → Deployments** in the dashboard, or through the REST API, and treat it as owed by whoever fired the dispatch.

Both preview hosts carry `x-robots-tag: noindex` and the apex carries none, so a stale preview stays out of search results while it waits. That bounds the cost of forgetting one rather than removing it.

## A failed deploy on `main` reaches an inbox

GitHub emails the actor when a run fails on the default branch, and that channel is confirmed working: the deploy that broke on 2026-08-24 sent its mail, and the five hours and twenty minutes it sat broken were hours the operator was asleep rather than hours nothing announced it. No notifier is wired here for that reason, and building one would add a second channel answering a question the first already answers.

What the channel cannot do is escalate. A failure arriving overnight waits for morning whatever sends it, so the number to weigh before adding anything is how long the apex can serve stale output, not how the failure is announced.

## Manual deploy

For one-off deploys outside CI, from the repo root:

```bash
bun run build
bunx wrangler pages deploy ./dist --project-name=erclx-dev --branch=main
```

Wrangler reads `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` from `.env` if present, otherwise it falls back to OAuth via browser. OAuth fails inside WSL because the localhost callback can't reach the Linux network namespace from the Windows browser, so prefer the env-var path on WSL.

## Custom domains

Both `erclx.dev` and `www.erclx.dev` are attached to the `erclx-dev` Pages project under the **Custom domains** tab. Cloudflare auto-issues TLS certs for both. The apex resolves via a CNAME record (Name `@`, Target `erclx-dev.pages.dev`) flattened by Cloudflare's CNAME-at-apex support.

## www to apex redirect

A Redirect Rule on the `erclx.dev` zone sends `www.erclx.dev/*` to `https://erclx.dev/$1` with a 301. The rule lives at **Domains → erclx.dev → Rules → Redirect Rules**, not on the Pages project. Without this rule both hosts would serve the same page and split SEO.

## Secrets

Two secrets in the GitHub repo (`Settings → Secrets and variables → Actions`):

| Secret                  | Value                                                   |
| ----------------------- | ------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID from the Workers & Pages sidebar             |
| `CLOUDFLARE_API_TOKEN`  | Custom token, scope `Account → Cloudflare Pages → Edit` |

The token must be scoped to Pages: Edit only. A global API key would let an attacker rewrite DNS for the whole zone if leaked.

## Rotating the token

1. Cloudflare → My Profile → API Tokens → delete the old token
2. Create a new Custom Token with the same scope
3. Update `CLOUDFLARE_API_TOKEN` in GitHub Actions secrets
4. Update `.env` locally if you keep one

Rotate any time the token leaves the local machine (pasted into chat, captured in a screenshot, copied into a non-secrets file).

## First-time setup

Done once and not repeated:

1. `wrangler pages project create erclx-dev` (or via the first `wrangler pages deploy` call, which prompts to create)
2. Attach `erclx.dev` and `www.erclx.dev` under the project's Custom domains tab
3. Add the `www → apex` Redirect Rule on the zone
4. Add the two secrets to GitHub Actions

After that, every push to `main` ships.
