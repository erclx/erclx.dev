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

The copy is read-only here in a stronger sense than the copy rule states, because the parent checkout's pipeline decides what these files look like. All six charts are drawn on pure white, the single most common value in each at 45% to 84% of its pixels, so they suit one of the two themes and this repository cannot change that without editing an artifact its own sync overwrites. The page frames them instead, holding a light plate under a chart in both themes, which is a presentation choice this side owns and reverses on its own. Regenerating the charts per theme upstream is the durable repair and is not queued, so a chart later produced on a dark ground makes the frame wrong with nothing here reporting it. Measured at 252704a on 2026-08-16.

Two earlier designs are retired. A single `.claude/briefs/SYNC-QUEUE.md` was never created, and the briefs folder was removed on 2026-08-14. A task-file queue under `.claude/tasks/` described the carry until 2026-08-15, when the build that consumed the copy read it directly instead. Verified 2026-08-15 against the portfolio copy folder in the parent checkout.

### Critical fonts preloaded via Vite ?url imports

Variable woff2 files for Fraunces and Inter weight-axis are imported as `?url` in `base.astro` and referenced through `<link rel="preload">`. This eliminates the FOUT swap from Fontsource's default `font-display: swap`. Vite resolves the path through `node_modules`, so no manual copy to `public/` is needed.

### Editorial type pairing replaces Geist

Geist is removed. Replaced by Fraunces variable for display and headings, Inter variable for body and labels, JetBrains Mono variable for code. `.claude/DESIGN.md` is the source of truth for token values. The tokens flow into Tailwind v4 via the `@theme` block in `global.css`.

### Playwright MCP for interactive verification

`.mcp.json` registers `@playwright/mcp@latest`. Reach for it when verification needs hover, click, viewport changes, or computed-style inspection. Use the static `bun run screenshot` capture for layout review and content-vs-canonical-source diffing.

### Screenshot capture waits for lazy images

Card posters and case-study figures load lazily, so a per-section capture can shoot a slot whose image never entered the viewport and produce an empty box that reads as a rendering defect. The capture therefore walks the whole page and waits for every image to report pixels before it shoots. The wait is not fatal: an image that never loads warns and the capture proceeds, because the picture of the breakage is the evidence a reviewer came for and failing the run throws it away. Verified 2026-08-15 against the projects section, where the wait moved a card from an empty slot to its poster with no code change behind it.

### Screenshots capture per-section on the landing page and whole on a case study

`e2e/screenshot.ts` enumerates top-level `<section>` elements via the `[data-section="<id>"]` attribute and captures each one as its own image through Playwright's `locator.screenshot()`. Output lands at `.claude/review/screenshots/<section>/<viewport>--<theme>.png`. Full-page captures lose detail to compression and waste re-render time when only one surface changed. Per-section captures hand the reviewer one focused image per surface and let iteration target a single surface via `SCREENSHOT_FILTER` with comma-separated terms.

A case-study route takes the opposite treatment, added on 2026-08-15 because the three routes had never been captured at all and the surface judged weakest was the one no review tool looked at. A case study is one long prose surface rather than a stack of distinct ones, and its mid-page headings carry `id` rather than `data-section`, so per-section capture there would shoot the top bar and the footer and miss the body. Each route is captured whole to `.claude/review/screenshots/<route>/<viewport>--<theme>.png`, which keeps the label format `<dir>/<viewport>--<theme>` that `SCREENSHOT_FILTER` matches on and leaves every landing path unchanged.

The run is 56 cases: six landing sections across three viewports and two themes, plus five routes across two viewports and two themes. A route drops the 320px width, which exists to catch a landing section wrapping, because long-form prose reflows rather than breaking and the third width would add half again as much run time for that.

Reading the full-page shape here as license to capture the landing page whole is the mistake to avoid. It is the answer for a single long surface, and the decision above is the answer for a page of six.

### The toolkit's surface-capture rule is declined here

`440-surface-capture` ships with the astro stack and is deliberately not installed. It directs a session to capture the full page and not a component in isolation. That is the reverse of what the landing page does and the same as what a case-study route does. Its `**/pages/**` glob matches four files, so the rule contradicts the build on `index.astro` and agrees with it on the other three. A rule right on three files of four is worse than one that is absent, because the reader has to know which case they are in before trusting it.

Two further reasons hold whichever file is open. The glob overlaps `445-screenshot` on `src/pages/**` exactly, so both rules would load on one page edit. Both also name `bun run screenshot`, which the rule-authoring standard bars between siblings.

`445-screenshot` is this project's answer and stays. It is locally authored, so no sync touches it, and it carries the before-and-after discipline and the handoff rules the toolkit rule has no equivalent for.

Reading its absence as an install gap is the specific mistake to avoid: a session did exactly that on 2026-08-15 and installed it alongside two rules that were genuinely missing. What tells the two cases apart is `.claude/aitk.json`. It named `556-groundwork` and `557-intake` with no file behind them, which is a missing install, while `440-surface-capture` appeared in neither the record nor the tree, which is what a declined rule looks like.

### Resume PDF served from `public/`

The footer résumé link points at `/resume.pdf`, which Astro serves from `public/resume.pdf`. The canonical source remains `assets/resumes/eric-le-resume.pdf` in the parent career repo. Updates land here as a binary copy via the sync queue rather than a hotlink to a GitHub raw URL. On-domain serving keeps the URL clean (`erclx.dev/resume.pdf`) and removes a third-party dependency from the footer CTA.

### Cloudflare Pages over Vercel or GitHub Pages

The apex domain already lives in Cloudflare. Pages attaches the custom domain without DNS migration and serves both the apex and `www` from the same project. Vercel and Netlify would require pointing DNS away from Cloudflare or running a CNAME-flattening dance. GitHub Pages handles static fine but offers no per-PR previews and ties the project lifecycle to the repo settings rather than a host project.

### Deploy from GitHub Actions, not the Cloudflare Git integration

`cloudflare/wrangler-action` runs after `static-checks`, `unit-tests`, `build-verify`, and `e2e-tests` pass. CF's native Git integration would deploy on every push without honoring the test gate and would build in CF's environment with a separate bun version. Direct upload from Actions keeps the test gate and the build environment unified with CI.

### Small rasters serve the tab, not the stippled vector

The synced brand mark is 268 stippled dots inside a 512 disc, at a median radius near 6.7. At 16px each dot covers roughly 0.14 of a pixel in area, so a cream dot over a near-black ground averages to mid-grey. Masked to the disc, the vector peaks at luminance 129 at 16px and 148 at 32px with zero pixels above 180, while the purpose-built 32-square raster peaks at 221 and 255 with 30 and 152 such pixels. The rasters come from a pipeline tuned for small size in the parent checkout and are copied rather than generated, since this repository carries no image-processing dependency.

Declaration order does not decide which icon an engine draws. With the raster declared first carrying explicit `sizes` and the vector second, headed Chromium and Firefox both fetched `/favicon.svg` and never requested the raster. Removing the vector from the icon relation is what moved both engines onto `/favicon-32.png`. The vector still ships at `/favicon.svg` for any surface with room for it, and the 180-square raster covers the home screen through `apple-touch-icon`.

Do not restore the vector to an `icon` relation and do not replace either raster with a downsample of it. The measurement above is the whole reason the set exists. The parent checkout's sync overwrites `public/favicon.svg` and touches neither raster, so an upstream change to the vector leaves the tab as it is.

Measured at 60f1e0a on 2026-08-15.

### A landing-page figure sits inside the text column, and marks derive from type metrics

A figure hanging into the page margin reads as an off-centre section even when the text column measures perfectly centred. The origin timeline shipped a graph in the right margin, measured centred at 672px with equal gaps at four widths, and the operator still read the section as offset because the section's visual mass sat right of its text. The graph is gone and the timeline carries a rail in its own row gutter instead, which also fixed what the figure could never do: the dots sit on their rows by construction rather than at hand-placed coordinates that could not track rows running 87 to 147 pixels apart.

The same principle sends the header portrait inside the content column rather than into the margin beside it, floated within the headline so its top edge is the headline's own top at any width.

A mark that has to line up with type takes its position from type metrics rather than from a measured constant. The origin dot centres inside a box one line-height tall, each rail segment runs from that box's centre to the next row's, and the status dot centres on a box one cap-height tall resting on the label's baseline. Three literals were removed to get there, and each had encoded a relationship that a change to the type scale, the marker size, or a control's tap height would have invalidated with nothing reporting it. Both marks measure where they are meant to sit: the status dot lands 0.0px from the cap centre and the toggle 0.8px, and the rail joins its dots to the pixel down a five-row list.

What is banned is a literal standing in for a relationship two other values already fix, such as a nudge centring one element against another. Arithmetic over named values is the sanctioned form and is how the rule is kept, which is why a rail segment spans `calc(1lh / 2)` to the next row rather than a measured offset. A value that sets something rather than relating two things stays a literal, including spacing, type sizes, and the 44px tap minimum.

An earlier draft of this entry claimed a line box centres about 2.5px lower than uppercase text. That figure is not reproducible: measured against this label at 14px, the two centres disagree by 0.3px, and the visible improvement came from the restructure and the tighter leading rather than from the offset the number described. Verified at 139af4f on 2026-08-17.

The heading says landing page because the case-study routes take the opposite treatment, and the two do not conflict. What made the origin graph read as off-centre was a figure sitting beside its text rather than under it, so the section's mass fell to one side of its own column. A case-study figure stays centred on the prose it interrupts and overhangs it symmetrically, measured at 0px of centre offset across five widths. The landing page also varies its measure per section and has other ways to break a column, where a case study holds one measure for thousands of pixels and has none. Read the rule as barring a figure that pulls a section off its axis rather than as barring width.

### A case-study route scales its measure with the viewport, and its figures overhang it

Prose runs 672px at 1280 and 832px at 1920, and the body scales with it from 17px to 22px. Both are clamps that hold today's values at 1280 and below and stop growing past 1920. Figures overhang the prose symmetrically, reaching 896px and 1216px at those widths, which takes the widest viewport from 35% content to 63%.

A route carries two prose steps rather than the one this entry described until 2026-08-20. The lede scales alongside the body and runs 21px to 26px across the same range, so a route's largest prose sits 53% above the landing page's flat 17px at 1920 where the body sits 29% above it. Both surfaces match exactly at 1280 and diverge only above it. The pair is deliberate and stays, and the operator confirmed it rather than capping the ceiling, since capping the body without capping the column lengthens the line the pair exists to hold flat. What was missing was the record, not the reasoning.

The pair moves together because the column cannot widen alone. Widening a column while the body stays put lengthens the line, which is the failure the trap below records reaching production once. The route holds 61.1ch at 768 and 1280 and 59.4ch at 1920, so the measure stays flat while the page fills out, which is what the pair buys.

Both surfaces run about 90 characters to the line. Counted on the breaks the browser actually made, the route body averages 89 and the landing page 92, so the two agree within three characters and the gap an earlier draft of this entry described does not exist. What does hold is that 90 is past the comfortable ceiling near 75, on both surfaces rather than one. The route's pair keeps that count flat across the range rather than bringing it down, which is what the pair is for and is not the same as settling the measure.

Two figures reached this entry before that one and neither survives. `86 characters against 73 to 76` came from dividing a column by an advance averaged over an alphabet including capitals, which are wider than the mix prose carries, so the divisor runs large and the count low. `65.5 to 69.8ch inside a 45 to 75 band` came from reading the right instrument against the wrong band: the band counts characters, and one `ch` is the advance of a zero. Measured here, running prose fits 1.32 characters per ch on the landing page and 1.46 on the route, so a column of 69.8ch carries 92 characters rather than 70.

Count characters on real line breaks when the question is whether a surface sits inside the band, since that is the band's own unit. Read `ch` when the question is whether two columns are the same width, since it is text-independent where a character count is not. Neither reading answers the other's question, and an outcome was closed on one answering the other.

The scoping mechanism is a `surface` prop on the layout that stamps a class on `body`, so the tokens reach the five project routes and nothing else. That indirection exists because of the trap below.

`@theme inline` bakes a literal into the generated utility. A token declared as `--text-body: 1.0625rem` inside that block cannot be overridden by any downstream scope, because the utility carries the value rather than a reference to it. The first attempt at this scaled the column and left the body pinned at 17px, which lengthened the line at 1920 and was worse than what it replaced. The color tokens escape this only because each resolves to a `var()` rather than to a literal, which is why `.dark .figure-plate` works. The two type steps now take the same form, resolving through `--body-size` and `--lede-size` declared in `:root`. A capture would not have caught this and the character measurement did.

The prose and figure clamps carry different slopes, so their ratio drifts from 1.333 at 1280 to 1.462 at 1920. That is deliberate rather than an oversight. A constant 1.4 ratio would make the figure 941px at 1024, leaving 17px of gutter each side, where the drifting pair keeps the figure safe at the narrow end and generous at the wide one. Do not replace the two clamps with one ratio without re-checking 1024.

Measured at 502da58 on 2026-08-20.

### A promoted control is measured against the settled page

The sticky bar takes the hero's name and theme toggle rather than rendering its own. One element travels in each case, which is what keeps a single toggle wired and keeps the page's only `h1` carrying its accessible name. The cost is that both end up in fixed hosts holding a measured position, so a measurement taken against a page that has not settled is held for good.

Three states make that measurement wrong, and all three were reached.

A `type="module"` script does not block on pending stylesheets the way a parser-blocking one does, so the handoff could run against an unstyled document. In WebKit against the built page that left the toggle at the body's default 8px margin, 868px off its row, on every load. The 8px left offset in the transform is what identified it, where the failing assertion reported the vertical error alone. Placement now waits for `document.readyState`.

The hero then reveals by translating its rows 16px into place, and a fixed copy placed at the settled position hangs off the row for the length of that. Placement waits for the transform to rest, which leaves the resize path as the one caller that can still land mid-reveal, so the reads discount the reveal's own offset.

The toggle's home slot holds no size of its own, so once the control is promoted away the slot collapses to a point and every re-measure after the first reads that empty box. The control is returned to its home for the reading rather than the slot being given a reserved size, so the control's own box stays the one source of the hero position.

That home is the header's own corner rather than a text row. The greeting moved under the name on 2026-08-19, and the portrait floats flush to the column's right edge for 160px from the heading's top, so no row under the name has a free right side to centre a control against.

Neither condition placement waits on is guaranteed to arrive. A stalled subresource holds readiness open, and the reveal is driven by an observer in `projects.astro` that does nothing without `IntersectionObserver`. The wait therefore gives up after three seconds and places the control anyway, rather than spinning a frame callback for the life of the page and leaving the bar's slot empty.

Measurement needs no scrolling. An element in flow states its position at rest as its own offset plus the current scroll, and the bar is fixed and already reports what the paint clamps against. An earlier draft scrolled the page to 0 and back on a resize listener, which fires per pixel of a window drag and once on a phone when the address bar collapses mid-scroll, so it yanked the page under the reader and cancelled the bar's own smooth scroll home.

The bar's reveal keys to half the hero rather than half the viewport. A hero shorter than half the viewport clears a viewport-keyed margin without being scrolled at all, which at 390x844 put the bar on screen carrying the name while the reader was still looking at the hero carrying it. Reading the intersection ratio keys the same moment to the hero's own height and needs nothing measured. The rail still uses the viewport-keyed form and agrees with this wherever it is visible, since the hero holds the full viewport height from md up.

Both controls run on the name's travel, and the bar's arrival gate reads that one distance. A control carries its own travel only where that travel describes the move a reader sees. The toggle's corner sits 28px above the bar's slot and 216px to the right of it, because the corner aligns to the viewport where the bar aligns to the content column, so its own vertical distance is the wrong clock twice over: driving the crossing off 28px sent the control across the page inside a thumb's worth of scroll, and gating the bar on the same 28px opened it after 28 pixels while the name was still 300 down the hero. Taking whichever control landed first was the earlier form and it fails the same way, since the nearer distance is the one that describes nothing. At 390 the column is wider than the viewport, the two anchors coincide, and nothing crosses at all.

The toggle interpolates its position rather than riding the scroll. Riding it, as the name does, lands the control after those same 28px whatever the progress clock says, which is the same defect reached by another route.

`measure` reads the name's geometry whether or not the name flies, and the visual takeover of the real name is a separate call. The two were one function, skipped together under reduced motion, which left the distance at its default of 1 once the toggle and the gate began reading it and snapped everything on the first pixel scrolled.

Verified at 1280x800 and 390x844 across chromium, firefox, and webkit at f10cfb7 on 2026-08-19.

### Cross-engine defects ship, because CI runs one engine

The e2e job runs `--project=chromium` alone while the Playwright config defines three. A full three-engine run of the same suite on 2026-08-19 reported four failures against a green chromium run, one of which had already shipped in an earlier pull request. Two of the four were the production defects the decision above records, and neither reproduced in chromium at all.

Read a lone WebKit or Firefox failure as a candidate defect rather than as a flake. Widening the job is queued rather than done, so until it is, a local three-engine run before a pull request is the only thing that sees them.

### The header signature is an authored shader, and the same drawing runs under the whole page

The header drew a particle flow field on a 2D canvas. It is now a fragment shader rendering contours of a 3D noise stream function, lit by the gradient of its own line width. `.claude/context/shader-field.md` carries the mount lifecycle and the uniform contract.

Two things drove the replacement and neither is that the old one was broken. The particle field cost a per-frame simulation to draw a texture with no relief, and the page needed a visual language it could carry past the hero, which a field of moving points cannot be quieted into. A shader gives both: the relief comes free from a value the contour pass already computes, and the whole surface can be held to one frame at a fraction of its weight.

The medium was not the problem the first attempt solved. `.claude/DESIGN.md` rejected shader work outright until this branch, on the reading that a shader is a preset. What is actually rejected is the shortcut, and an authored field with its own stream function and its own lighting is not one. The standard now says so.

The still copy mounts from the layout, so it reaches the project routes as well as the landing page. It damps inside the reading measure, tracking `--prose-column` rather than a fixed strip, because a route scales its column and a landing section does not. See `.claude/context/page-ground.md` for the measured cost, which is 16.16:1 to 15.74:1 on body text.

Three tuning defects are recorded in that entry rather than here, because each is a fact about the field rather than a decision. The one worth carrying up is that two separate motion instruments read the field as still while it moved, and the operator's eye was right against both. A metric that reports no difference across presets that visibly differ is measuring the wrong quantity, and the fix came from finding a sheen drifting at 58px/s over a field at 15px/s rather than from raising any rate.

Measured at 502da58 on 2026-08-20, at 1280x800 and 390x844 across chromium, firefox, and webkit.

### Contact travels with the reader, in the margin opposite the rail

The hero opens with three destinations and the footer closes with them. Between the two, for the length of the page, a reader who wanted one had to pick an end. A dock in the right margin carries them plus the resume, arriving on the same half-hero gate the sticky bar uses and standing down over the footer.

It sits opposite the section rail so the two margins read as a pair. The rail states position and the dock offers reach, which is the split `.claude/REQUIREMENTS.md` § Navigation already draws.

The resume is in the dock and stays in the footer, which is the one duplicated destination and is deliberate. It is the highest-intent link on a page whose job is hiring, and it previously existed once, as the last thing on the page.

`.claude/context/contact-dock.md` carries the tap-target and pointer-events gotchas. Copying the rail also copied a footer gate that had never fired, since it watched a root capped to the top half of the viewport for an element that sits at the bottom of the last screen. Both controls were fixed on the one reading, which is the argument for building the second control from the first rather than beside it.

### A line is drawn where it divides, and a bound is revealed rather than drawn

The page carried an outline on every project card, a rounded plate under the hero band, a rule under the sticky bar, one over the footer, and one per row in the closing ask. All but the last came out, because none of them divided anything a reader compares. They stated where surfaces ended, which whitespace and a fading ground already state.

Removing an outline removes the only thing saying where a card ends, so a pointer lands on nothing. What replaces it is a shape lit under the pointer alone, inset outward from the content and drawn behind it, so the grid stays borderless at rest. That shape has to fit the gutter: at a 24px gutter its own box met the neighboring card exactly and its shadow crossed 36px into it, so pointing at one card lit the one beside it. The gutter is 48px and the shape reaches 44px.

It leaves slower than it arrives, 520ms out against 130ms in. A reader moving between two cards sees the one behind them still lit, which reads as a trail rather than as a lag.

Two lines stay and neither is an exception left behind. The closing ask keeps the rule above its criteria because a character is occluded by it, which makes it a ledge a drawing rests on. The timeline keeps its rail because it is the one element stating the beats are a sequence, and the active-row highlight attaches to its dots.

`.claude/DESIGN.md` § Borders carries the three tests a line has to pass to stay. Measured at 502da58 on 2026-08-20, at 1280, 1024, and 390.

### One ground for two bars, and the shape moves while the row does not

The landing bar and a route's bar diverged the moment the first was rebuilt, so a reader crossing between them met a thinned ground with no rule on one side and a near-opaque ground under a hard line on the other. Both now render one shared ground rule rather than a copy per component.

The ground has to separate from the page, which a ground taken from the page cannot do. Drawn from the background token it measured 1.002:1 against what sat behind it in light and 1.003:1 in dark, which is to say the page laid on the page, and only the text inside it said a bar was there. Blur cannot rescue that, since blurring a flat field returns the same flat field. It takes the elevated surface token, and the detached shape carries an edge and a shadow.

Two values pull against each other and were settled together. Prose passing under a lightly tinted bar reads through it as letterforms, which is what a near-opaque ground used to answer, and a wider blur answers it instead by destroying the letterforms while the backdrop still reads as a wash. Widening it further is not free: at 40px the radius averages in the dark gaps between project cards, which darkens the ground under near-black text and drops the light theme to 4.35:1. The pair sits at 0.85 over 24px, holding 5.02:1 in light and 8.16:1 in dark on the landing page and 4.83:1 and 8.30:1 on the densest route.

The shape contracts and the row inside it does not. The hero flies its name and its theme toggle into that row's slots at measured positions, and the three defects the decision above records all came from measuring against a bar that had not settled. Measured at 1280, the name slot holds left 256 and top 12 in both states while the ground goes from 1280 wide with square corners to 832 with a full radius. What moves is the one thing nothing is measured against.

The contrast figure that nearly settled this measured the wrong thing. Sampling a fixed strip of the bar read 3.66:1 and moved to 3.70:1 under a near-opaque scrim, because the bar's contents sit in a centred column and the glyph a reader sees is painted by a separate element, so the reading was the ground against itself. A contrast number that barely moves when the ground is replaced is measuring something other than text.

Measured at 502da58 on 2026-08-20, at 320, 375, 425, 768, 1280, 1600, 1920, and 2560.

## Risks / open questions

- The first build seeds copy directly from career sources. The cutover to the queue-only model after v1 needs a clear marker so future sessions do not fall back to reading career files.
- `.claude/aitk.json` records a governance commit that lives only on an unmerged toolkit branch, because the Astro glob fix was synced from a local checkout rather than a release. Running `aitk gov sync` against released 0.98.0 before erclx/aitk#1006 merges reverts all four `ui/` globs and rewrites the four hashes to match, so the record stays internally consistent while the fix disappears with nothing reporting it. Re-sync from a released build once that pull request ships, and check the four `paths:` blocks carry `'**/*.astro'` before trusting a sync run in the meantime.
- The governance install carried two stack members short until 2026-08-15: `556-groundwork` and `557-intake`, both shipped by the base stack and both named in `.claude/aitk.json` while absent from disk. `aitk gov sync` refreshes rules already present and adds none, so the gap survived every sync and closed only under `aitk gov install`. A sync alone does not prove the install is complete, and the signal to read is a recorded path with no file behind it rather than the rule count on its own. A recorded path whose file exists with a different hash is a separate state and not that signal: `.claude/standards/context.md`, `prose.md`, and `wireframes.md` all mismatch today, which is the project customization § Agent context split by load cost describes rather than a defect.
- `aitk gov install` re-adds `440-surface-capture` every time it runs, and the decision below declines it. No mechanism exists to opt a project out of one rule its stack ships, so the decline holds only while each install is followed by removing that file and its record entry. Check for it after any install.
