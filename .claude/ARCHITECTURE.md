# Architecture

## Overview

Static Astro site that renders one page at the erclx.dev apex. The build emits HTML, CSS, and a small JS bundle for any interactive islands. Content is authored once in the parent career repo and flows here through a sync queue.

For the source layout, test layout, and config-file inventory, see `docs/development.md` § Project layout.

## Key technical decisions

### Astro over Next or a static React app

Astro renders zero JS by default. The page is mostly prose and links, so shipping React on every visit would waste bytes. React only loads where an island opts in via `client:*`. Next would force a runtime model the site does not need.

### Tailwind v4 via the Vite plugin

The v3 Astro integration is deprecated. v4 ships as a Vite plugin and reads its config from a CSS-first `@theme` block, which matches the shadcn token model. This avoids a JS-side `tailwind.config` file entirely.

### shadcn with the radix base and Nova preset

Radix primitives provide accessible interactive components without locking in a design system. Nova ships a usable starting set of tokens and Lucide icons. Components live in `src/components/ui/` under repo ownership, so the team can edit them directly without forking a package.

### Content sourced via SYNC-QUEUE.md

Page copy is canonical in the parent career repo, never authored here. Updates land in `.claude/SYNC-QUEUE.md` as full text. This prevents drift between Linkedin, the resume, the github profile, and the live page.

### Dark mode uses the class-based shadcn pattern

shadcn ships `@custom-variant dark (&:is(.dark *))`, which keys dark theme tokens off a `.dark` class on a parent element. `prefers-color-scheme` alone does not switch the theme. The layout runs a small inline script that reads the system preference and any localStorage override on first paint and adds `.dark` to `documentElement` before the body renders, to avoid a flash of the wrong scheme.

### Theme toggle ships as static Astro, not a React island

A React island for the toggle produced visible hydration flicker under both `client:load` and `client:only="react"`. The empty placeholder before JS replaced itself with the icon after JS, leaving a layout flash. Vanilla Astro with two inline SVGs that swap via `dark:hidden` plus a one-line `addEventListener` ships in HTML and renders in the correct state from first paint. For presentation-only toggles, the framework cost is not worth the layout shift.

### Project cards as Astro components, not React islands

Cards carry prose, name, and links. No interactivity, no state. Static Astro components consume `name`, `description`, and `links` as props and iterate over a config array. The earlier plan called for a React island. The contract did not require it.

### Critical fonts preloaded via Vite ?url imports

Variable woff2 files for Fraunces and Inter weight-axis are imported as `?url` in `base.astro` and referenced through `<link rel="preload">`. This eliminates the FOUT swap from Fontsource's default `font-display: swap`. Vite resolves the path through `node_modules`, so no manual copy to `public/` is needed.

### Editorial type pairing replaces Geist

Geist is removed. Replaced by Fraunces variable for display and headings, Inter variable for body and labels, JetBrains Mono variable for code. `.claude/DESIGN.md` is the source of truth for token values. The tokens flow into Tailwind v4 via the `@theme` block in `global.css`.

### Playwright MCP for interactive verification

`.mcp.json` registers `@playwright/mcp@latest`. Reach for it when verification needs hover, click, viewport changes, or computed-style inspection. Use the static `bun run screenshot` capture for layout review and content-vs-canonical-source diffing.

### Resume PDF served from `public/`

The footer résumé link points at `/resume.pdf`, which Astro serves from `public/resume.pdf`. The canonical source remains `assets/resumes/eric-le-resume.pdf` in the parent career repo. Updates land here as a binary copy via the sync queue rather than a hotlink to a GitHub raw URL. On-domain serving keeps the URL clean (`erclx.dev/resume.pdf`) and removes a third-party dependency from the footer CTA.

## Risks / open questions

- The first build seeds copy directly from career sources. The cutover to the queue-only model after v1 needs a clear marker so future sessions do not fall back to reading career files.
- Apex HTTPS and `www` redirect depend on a deploy target choice, tracked in `TASKS.md`.
