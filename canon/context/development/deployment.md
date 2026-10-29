---
title: Deployment
description: Cloudflare Pages Direct Upload, production and preview deploys, custom domains, the API token, and edge analytics
---

# Deployment

## Overview

Owns how a built site reaches erclx.dev. The `deploy` job in `.github/workflows/verify.yml` uploads the `dist/` artifact `build-verify` produced to the Direct Upload Pages project `erclx-dev`, so Cloudflare never builds. A push to `main` deploys to production, and a dispatch from any other ref deploys to a `<hash>.erclx-dev.pages.dev` preview.

The apex and `www` are custom domains on that project, and a Redirect Rule on the zone sends `www` to the apex with a 301. Cloudflare Web Analytics runs from the zone, so no beacon code lives in this repository. A deploy by hand reads `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` from `.env`.

```bash
bun run build
bunx wrangler pages deploy ./dist --project-name=erclx-dev --branch=main
```

## Layout

### `public/`

Holds files served verbatim at the domain root, so a file placed here is a public URL the moment it ships.

- `resume.pdf` serves at `erclx.dev/resume.pdf`, and readers reach it through the `/resume` route, whose tab carries the site's icon where the bare PDF cannot
- The résumé is an exported copy, so it goes stale silently when the source changes
- The route draws the PDF's pages from images in `src/assets/resume/`, so a sync reruns `bun run resume-pages`, which needs `pdftoppm` from `poppler-utils`
- The rendered suite fails on a PDF whose hash differs from the one that run recorded
- One résumé ships, in English, since the page is English and the closing ask holds one résumé control

## Gotchas

- The API token carries `Account → Cloudflare Pages → Edit` alone, since a leaked global key rewrites DNS for the zone. Rotate it whenever it leaves the machine.
- A dispatch preview never retires on its own, since Direct Upload holds no git ref. Delete it under Workers & Pages, then erclx-dev, then Deployments.
- Wrangler's OAuth callback cannot reach WSL from the Windows browser, so deploy by hand with the two variables in `.env`
- A fetch from Sweden carries no analytics beacon by design, since EU visitors are excluded, and `/cdn-cgi/trace` reporting `loc=SE` tells the two apart
- A change to redirects, headers, or DNS needs a live preview check, since the e2e suite runs against `astro preview` and never reaches the edge
