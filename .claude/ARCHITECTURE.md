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

### React kept as a capability with no rendered island

No component opts into hydration. The site ships zero `client:*` directives and holds one unreferenced `.tsx` file at `src/components/ui/button.tsx`, so the React toolchain renders nothing a visitor sees. It stays anyway. An interactive surface is a plausible next increment, and standing the integration back up costs more than carrying it does.

The cost is ten direct React packages nothing exercises: `react`, `react-dom`, `@astrojs/react`, `radix-ui`, `lucide-react`, `@types/react`, `@types/react-dom`, `@testing-library/react`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`. Two of those are lint plugins that scan a file set of one, and `src/test/setup.ts` wires the React testing helpers against a suite that reports no test files.

Four more sit behind them and bring the real count to fourteen. `class-variance-authority` is imported by the unreferenced component alone, `clsx` and `tailwind-merge` are reached only through `src/lib/utils.ts`, which nothing but that component imports, and `@testing-library/user-event` is imported nowhere at all. Count the fourteen rather than the ten when weighing a removal, since the smaller number reads low against a decision this entry exists to inform.

Read this as settled rather than as an oversight. A session auditing the tree without it proposes removing the toolchain, which has happened once. The stack lines in `.claude/REQUIREMENTS.md`, this file, and `README.md` are accurate as written and stay. Measured at fcf5f6c on 2026-08-15.

### Tailwind v4 via the Vite plugin

The v3 Astro integration is deprecated. v4 ships as a Vite plugin and reads its config from a CSS-first `@theme` block, which matches the shadcn token model. This avoids a JS-side `tailwind.config` file entirely.

### shadcn with the radix base and Nova preset

Radix primitives provide accessible interactive components without locking in a design system. Nova ships a usable starting set of tokens and Lucide icons. Components live in `src/components/ui/` under repo ownership, so the team can edit them directly without forking a package.

### Content read from the parent checkout

Page copy is canonical in the parent career repo, never authored here. This repository is a gitignored clone sitting inside that checkout, so a session here reads the published portfolio copy up the same filesystem rather than waiting for it to be delivered. No handoff message is owed in either direction. This prevents drift between Linkedin, the resume, the github profile, and the live page.

A wording correction goes to the source and is re-rendered. Nothing compares the two: the upstream check reads a destination table, the portfolio rows name no destination, and it reports them unverifiable rather than diffing anything. A page-side edit therefore reintroduces the drift the split exists to close and no run reports it. Do not close that gap by giving those rows a page path, which would byte-compare markdown against Astro output and fail the upstream pre-push hook on every run.

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

### The toolkit's surface-capture rule is declined here

`440-surface-capture` ships with the astro stack and is deliberately not installed. It directs a session to capture the full page and not a component in isolation, which is the reverse of the decision above, and its `**/pages/**` glob overlaps `445-screenshot` on `src/pages/**` exactly, so both would load on one page edit stating opposite things. Both also name `bun run screenshot`, which the rule-authoring standard bars between siblings.

`445-screenshot` is this project's answer and stays. It is locally authored, so no sync touches it, and it carries the before-and-after discipline and the handoff rules the toolkit rule has no equivalent for.

Reading its absence as an install gap is the specific mistake to avoid: a session did exactly that on 2026-08-15 and installed it alongside two rules that were genuinely missing. What tells the two cases apart is `.claude/aitk.json`. It named `556-groundwork` and `557-intake` with no file behind them, which is a missing install, while `440-surface-capture` appeared in neither the record nor the tree, which is what a declined rule looks like.

### Resume PDF served from `public/`

The footer résumé link points at `/resume.pdf`, which Astro serves from `public/resume.pdf`. The canonical source remains `assets/resumes/eric-le-resume.pdf` in the parent career repo. Updates land here as a binary copy via the sync queue rather than a hotlink to a GitHub raw URL. On-domain serving keeps the URL clean (`erclx.dev/resume.pdf`) and removes a third-party dependency from the footer CTA.

### Cloudflare Pages over Vercel or GitHub Pages

The apex domain already lives in Cloudflare. Pages attaches the custom domain without DNS migration and serves both the apex and `www` from the same project. Vercel and Netlify would require pointing DNS away from Cloudflare or running a CNAME-flattening dance. GitHub Pages handles static fine but offers no per-PR previews and ties the project lifecycle to the repo settings rather than a host project.

### Deploy from GitHub Actions, not the Cloudflare Git integration

`cloudflare/wrangler-action` runs after `static-checks`, `unit-tests`, `build-verify`, and `e2e-tests` pass. CF's native Git integration would deploy on every push without honoring the test gate and would build in CF's environment with a separate bun version. Direct upload from Actions keeps the test gate and the build environment unified with CI.

## Risks / open questions

- The first build seeds copy directly from career sources. The cutover to the queue-only model after v1 needs a clear marker so future sessions do not fall back to reading career files.
- `.claude/aitk.json` records a governance commit that lives only on an unmerged toolkit branch, because the Astro glob fix was synced from a local checkout rather than a release. Running `aitk gov sync` against released 0.98.0 before erclx/aitk#1006 merges reverts all four `ui/` globs and rewrites the four hashes to match, so the record stays internally consistent while the fix disappears with nothing reporting it. Re-sync from a released build once that pull request ships, and check the four `paths:` blocks carry `'**/*.astro'` before trusting a sync run in the meantime.
- The governance install carried two stack members short until 2026-08-15: `556-groundwork` and `557-intake`, both shipped by the base stack and both named in `.claude/aitk.json` while absent from disk. `aitk gov sync` refreshes rules already present and adds none, so the gap survived every sync and closed only under `aitk gov install`. A sync alone does not prove the install is complete, and the signal to read is a recorded path with no file behind it rather than the rule count on its own. A recorded path whose file exists with a different hash is a separate state and not that signal: `.claude/standards/context.md`, `prose.md`, and `wireframes.md` all mismatch today, which is the project customization the first decision above describes rather than a defect.
- `aitk gov install` re-adds `440-surface-capture` every time it runs, and the decision below declines it. No mechanism exists to opt a project out of one rule its stack ships, so the decline holds only while each install is followed by removing that file and its record entry. Check for it after any install.
