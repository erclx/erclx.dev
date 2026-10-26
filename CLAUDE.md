# erclx.dev

Personal landing site. Astro v6 static build with Tailwind v4, deployed to Cloudflare Pages at https://erclx.dev.

## Context

- Before non-trivial work in a domain, read its entry under `canon/context/`. Find it from the index anchor below.

@canon/REQUIREMENTS.md
@canon/context/index.md

## Commands

- Run `bun run check` to verify and `bun run format` to fix before committing. The pre-push hook runs `check`, which writes nothing.

## Key paths

### Code

What builds, tests, and deploys the site.

- `src/`: Astro source (pages, layouts, components, styles, assets)
- `public/`: static files served as-is
- `scripts/`: build, dev, and capture tooling
- `e2e/`: Playwright suite plus the capture harness
- `.github/workflows/`: CI pipelines for checks, tests, build, deploy, pull request label gating, and README screenshot capture

### Content

What describes the site rather than builds it.

- `canon/DESIGN.md`: visual intent, pointing at the stylesheet that holds the values
- `canon/design/`: accepted design references a build matches, empty until one is picked
