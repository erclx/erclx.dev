# erclx.dev

Personal landing site. Astro v6 static build with Tailwind v4, deployed to Cloudflare Pages at https://erclx.dev.

## Context

- Before non-trivial work in a domain, read `canon/context/<domain>.md`, and before touching a UI surface read `canon/wireframes/<surface>.md`. Pick which from the index anchors below.

@canon/REQUIREMENTS.md
@canon/ARCHITECTURE.md
@canon/context/index.md
@canon/wireframes/index.md

## Key paths

- `src/`: Astro source (pages, layouts, components, styles, assets)
- `public/`: static files served as-is
- `scripts/`: build, dev, and capture tooling
- `e2e/`: Playwright suite plus the capture and inventory harnesses
- `.github/workflows/`: CI pipelines for checks/tests/build/deploy, PR label gating, and README screenshot capture
