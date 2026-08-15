# Architecture

## Overview

Static Astro site that renders one page at the erclx.dev apex. The build emits HTML, CSS, and a small JS bundle for any interactive islands. Content is authored once in the parent career repo and flows here through a sync queue.

For the source and test layout, see `.claude/context/development.md` § Layout.

## Key technical decisions

### Agent context split by load cost

Always-loaded context is paid on every session whatever the task, so only project-wide invariants sit in that tier. Everything else keys to a trigger: path-scoped rules load when a file matches their `paths:` glob, and per-domain narrative loads on demand through an index. `CLAUDE.md` § Context carries the tier map a session reads to place a given file.

The root `docs/`, `standards/`, and `snippets/` folders are gone. Nothing in `docs/` served a visitor, so all three moved under `.claude/`. Toolkit standards are the source of truth and are reinstalled from source rather than hand-edited, so an edit applied directly to one is lost on the next `aitk standards sync`. Project customizations are re-applied on top after each install.

### Astro over Next or a static React app

Astro renders zero JS by default. The page is mostly prose and links, so shipping React on every visit would waste bytes. React only loads where an island opts in via `client:*`. Next would force a runtime model the site does not need.

### Tailwind v4 via the Vite plugin

The v3 Astro integration is deprecated. v4 ships as a Vite plugin and reads its config from a CSS-first `@theme` block, which matches the shadcn token model. This avoids a JS-side `tailwind.config` file entirely.

### shadcn with the radix base and Nova preset

Radix primitives provide accessible interactive components without locking in a design system. Nova ships a usable starting set of tokens and Lucide icons. Components live in `src/components/ui/` under repo ownership, so the team can edit them directly without forking a package.

### Content read from the parent checkout

Page copy is canonical in the parent career repo, never authored here. This repository is a gitignored clone sitting inside that checkout, so a session here reads the published portfolio copy up the same filesystem rather than waiting for it to be delivered. No handoff message is owed in either direction. This prevents drift between Linkedin, the resume, the github profile, and the live page.

A wording correction goes to the source and is re-rendered. An upstream check compares the two, and a page-side edit is invisible to it, so fixing the string here reintroduces the drift the split exists to close.

Figures a case study references are copied into `src/assets/` rather than read across the repository boundary. A build reaching outside its own repository for an asset breaks when that tree moves, and the files are small enough that the second copy costs nothing. What it costs instead is a second place they exist, which no check watches yet.

Two earlier designs are retired. A single `.claude/briefs/SYNC-QUEUE.md` was never created, and the briefs folder was removed on 2026-08-14. A task-file queue under `.claude/tasks/` described the carry until 2026-08-15, when the build that consumed the copy read it directly instead. Verified 2026-08-15 against the portfolio copy folder in the parent checkout.

### Critical fonts preloaded via Vite ?url imports

Variable woff2 files for Fraunces and Inter weight-axis are imported as `?url` in `base.astro` and referenced through `<link rel="preload">`. This eliminates the FOUT swap from Fontsource's default `font-display: swap`. Vite resolves the path through `node_modules`, so no manual copy to `public/` is needed.

### Editorial type pairing replaces Geist

Geist is removed. Replaced by Fraunces variable for display and headings, Inter variable for body and labels, JetBrains Mono variable for code. `.claude/DESIGN.md` is the source of truth for token values. The tokens flow into Tailwind v4 via the `@theme` block in `global.css`.

### Playwright MCP for interactive verification

`.mcp.json` registers `@playwright/mcp@latest`. Reach for it when verification needs hover, click, viewport changes, or computed-style inspection. Use the static `bun run screenshot` capture for layout review and content-vs-canonical-source diffing.

### Screenshot capture waits for lazy images

Card posters and case-study figures load lazily, so a per-section capture can shoot a slot whose image never entered the viewport and produce an empty box that reads as a rendering defect. The capture therefore walks the whole page and waits for every image to report pixels before it shoots. The wait is not fatal: an image that never loads warns and the capture proceeds, because the picture of the breakage is the evidence a reviewer came for and failing the run throws it away. Verified 2026-08-15 against the projects section, where the wait moved a card from an empty slot to its poster with no code change behind it.

### Screenshots capture per-section, not full-page

`e2e/screenshot.ts` enumerates top-level `<section>` elements via the `[data-section="<id>"]` attribute and captures each one as its own image through Playwright's `locator.screenshot()`. Output lands at `.claude/review/screenshots/<section>/<viewport>--<theme>.png`. Full-page captures lose detail to compression and waste re-render time when only one surface changed. Per-section captures hand the reviewer one focused image per surface and let iteration target a single surface via `SCREENSHOT_FILTER` with comma-separated terms.

### Resume PDF served from `public/`

The footer résumé link points at `/resume.pdf`, which Astro serves from `public/resume.pdf`. The canonical source remains `assets/resumes/eric-le-resume.pdf` in the parent career repo. Updates land here as a binary copy via the sync queue rather than a hotlink to a GitHub raw URL. On-domain serving keeps the URL clean (`erclx.dev/resume.pdf`) and removes a third-party dependency from the footer CTA.

### Cloudflare Pages over Vercel or GitHub Pages

The apex domain already lives in Cloudflare. Pages attaches the custom domain without DNS migration and serves both the apex and `www` from the same project. Vercel and Netlify would require pointing DNS away from Cloudflare or running a CNAME-flattening dance. GitHub Pages handles static fine but offers no per-PR previews and ties the project lifecycle to the repo settings rather than a host project.

### Deploy from GitHub Actions, not the Cloudflare Git integration

`cloudflare/wrangler-action` runs after `static-checks`, `unit-tests`, `build-verify`, and `e2e-tests` pass. CF's native Git integration would deploy on every push without honoring the test gate and would build in CF's environment with a separate bun version. Direct upload from Actions keeps the test gate and the build environment unified with CI.

## Risks / open questions

- The first build seeds copy directly from career sources. The cutover to the queue-only model after v1 needs a clear marker so future sessions do not fall back to reading career files.
