---
title: Deployment
description: Cloudflare Pages deploy pipeline, domain setup, and secret rotation
---

# Deployment

erclx.dev runs on Cloudflare Pages, project name `erclx-dev`. Every push to `main` builds in GitHub Actions and uploads `./dist/` to the project via `cloudflare/wrangler-action`. The apex domain `erclx.dev` and `www.erclx.dev` are both attached as custom domains on the same Pages project.

## Why Cloudflare Pages

The apex domain is registered and zoned on Cloudflare. Pages attaches the custom domain without DNS migration and serves static output with no cold start. The free tier covers unlimited bandwidth and 500 builds per month, well beyond what a single-page site needs.

## Why deploy from GitHub Actions, not the Cloudflare Git integration

The Pages project is a Direct Upload type. CI builds and runs the full verify suite (`static-checks`, `unit-tests`, `build-verify`, `e2e-tests`) before the `deploy` job uploads `./dist/` via wrangler. Cloudflare's native Git integration deploys on every push without honoring the test gate and runs builds in CF's environment with a separate bun version.

## Deploy job

Defined in `.github/workflows/verify.yml`. Triggered only on `push: main` and gated on the four verify jobs. The job runs `bun run build` and then:

```
wrangler pages deploy ./dist --project-name=erclx-dev --branch=main
```

`--branch=main` marks the upload as a production deployment. Preview branches go to `<hash>.erclx-dev.pages.dev` only and are not aliased to the apex.

## Manual deploy

For one-off deploys outside CI, from the repo root:

```
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
