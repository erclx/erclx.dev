# Architecture

## Overview

Static Astro site that renders one page at the erclx.dev apex. The build emits HTML, CSS, and a small JS bundle for any interactive islands. Content is authored once in the parent career repo and flows here through a sync queue.

For the source and test layout, see `canon/context/development.md` § Layout.

## Key technical decisions

### Agent context split by load cost

Always-loaded context is paid on every session whatever the task, so only project-wide invariants sit in that tier. Everything else keys to a trigger: path-scoped rules load when a file matches their `paths:` glob, and per-domain narrative loads on demand through an index. `CLAUDE.md` § Context carries the tier map a session reads to place a given file.

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

The copy is read-only here in a stronger sense than the copy rule states, because the parent checkout's pipeline decides what these files look like. All six charts are drawn on pure white, the single most common value in each at 45% to 84% of its pixels, so they suit one of the two themes and this repository cannot change that without editing an artifact its own sync overwrites. The page frames them instead, holding a light plate under a chart in both themes, which is a presentation choice this side owns and reverses on its own. Regenerating the charts per theme upstream is the durable repair and is not queued, so a chart later produced on a dark ground makes the frame wrong with nothing here reporting it. Measured at 252704a on 2026-08-16. <!-- canon-keep-record-root -->

### Editorial type pairing replaces Geist

Three variable families carry the type system: Fraunces for display and headings, Inter for body and labels, JetBrains Mono for code. A single system font stack reads as generic against the editorial tone the rest of the page holds. `canon/DESIGN.md` is the source of truth for token values. The tokens flow into Tailwind v4 via the `@theme` block in `global.css`.

### Playwright MCP for interactive verification

`.mcp.json` registers `@playwright/mcp@latest`. Reach for it when verification needs hover, click, viewport changes, or computed-style inspection. Use the static `bun run screenshot` capture for layout review and content-vs-canonical-source diffing.

### Screenshot capture waits for lazy images

Card posters and case-study figures load lazily, so a per-section capture can shoot a slot whose image never entered the viewport and produce an empty box that reads as a rendering defect. The capture walks the whole page and waits for every image to report pixels before shooting, rather than a fixed pause. See `canon/context/ci.md` for the per-engine figures and the gating cases this closed.

### Screenshots capture per-section on the landing page and whole on a case study

`e2e/screenshot.ts` enumerates top-level `<section>` elements via the `[data-section="<id>"]` attribute and captures each one as its own image through Playwright's `locator.screenshot()`. Output lands at `.canon/review/screenshots/<section>/<viewport>--<theme>.png`. Full-page captures lose detail to compression and waste re-render time when only one surface changed. Per-section captures hand the reviewer one focused image per surface and let iteration target a single surface via `SCREENSHOT_FILTER` with comma-separated terms.

A case-study route takes the opposite treatment: captured whole rather than per-section, since a route is one long prose surface rather than a stack of distinct ones and its mid-page headings carry `id` rather than `data-section`, so per-section capture there would shoot the top bar and the footer and miss the body. Each route is captured whole to `.canon/review/screenshots/<route>/<viewport>--<theme>.png`, which keeps the label format `<dir>/<viewport>--<theme>` that `SCREENSHOT_FILTER` matches on and leaves every landing path unchanged.

The run is 56 cases: six landing sections across three viewports and two themes, plus five routes across two viewports and two themes. A route drops the 320px width, which exists to catch a landing section wrapping, because long-form prose reflows rather than breaking and the third width would add half again as much run time for that.

Reading the full-page shape here as license to capture the landing page whole is the mistake to avoid. It is the answer for a single long surface, and the decision above is the answer for a page of six.

### The toolkit's surface-capture rule was declined, then installed once its objection went away

`440-surface-capture` and `450-link-behavior` are installed. Neither collides with a project rule, since `.claude/rules/project/` does not exist. A rule absent from disk is not always an install gap: check the record for a deliberate decline before installing an uninstalled toolkit rule.

### A touch decision is judged on a device, not in device emulation

Three verification surfaces above read the page through a headless engine or a desktop browser, and none of them can answer what a finger does. Device emulation reproduces the events and the viewport and not the pointer hardware, the display density, or the engine, so a rule silently taking its touch branch renders identically under emulation and wrongly under a thumb. That is the same defect class the engine matrix was widened for, arriving through the one gap a matrix cannot close.

`bun run device` serves the dev site to a phone or tablet on the local network and prints a code to scan. `canon/context/development.md` § Serving to a real device carries the routing, the reboot trap, and the failure modes.

Two decisions inside it are worth stating here rather than there. A local port forward was chosen over a public tunnel, which needs no administrator and works from any network and was rejected anyway because it puts an unfinished portfolio on an address anyone holding the link can load. And the harness holds one fixed port where the other three servers derive one per worktree, because a forward covers exactly one port and a derived port would put an administrator prompt in front of every new worktree, which is the recurring cost the harness exists to remove. Reading that fixed port as an oversight against the band convention is the mistake to avoid: it is the convention traded away deliberately, for one forward that outlives every worktree.

What it gives up is two worktrees serving to a device at once, which needs two devices before it is worth anything.

### A pointer response is gated on a device that has a pointer

One rule decides membership and it is a test rather than a list. A response keyed to a pointer _being over_ something, `:hover`, `pointerenter`, `pointerleave`, `pointermove`, is gated on a device reporting a pointer. A response keyed to a _deliberate act_, a click, a focus, an activation, never is, because touch performs those exactly as a mouse does and gating them takes the page away from the reader rather than giving it back. `src/lib/pointer.ts` holds the query and every caller reads it, so a component nobody has built yet can be judged against the same test.

The one exception the test does not settle on its own is a `pointerdown`-keyed effect, which reads a tap as a press that travels under 10px and is not claimed by a scroll, rather than as a click, since a scroll starting under `pointerdown` alone would otherwise fire the effect on every scroll a reader started.

The surface also drew below the density of the screen it was on. The cap sat at 1.5 while a tablet reported 2, so the panel interpolated the difference and softened every contour, which is why the same drawing read crisp in a desktop capture and washed out on the device. The cap matches the display now, and the frame guard is what protects a device that cannot afford it, by measuring what it actually draws rather than refusing up front.

### A shared link renders one card, and the card says what the title cannot

Every host reads the same Open Graph tags, so one 1200x630 image and one description cover all of them. `site` in the Astro config makes `Astro.site` resolve the image to an absolute URL, which a crawler needs since it fetches the image outside the page's own context. The image carries the claim (`Eric Le · AI Engineer`) and the description elaborates rather than repeats it, since a host printing both beside each other would otherwise say the same sentence twice. `bun run unfurl` renders all six pages as five hosts compose them and is the harness to check against, not the tags themselves.

The mark leads the composition at 210px, with a square crop across the mark and the last word of every line accepted as a known cost of most hosts taking the first `og:image` at whatever aspect they choose. `public/avatar/` carries a separate 1:1 asset for a host that wants one. `bun run share-card` redraws the card and `e2e/share-card.spec.ts` guards it, including that no route title carries `case study`.

The description never names an employer. Metadata says who someone is and the timeline on the page says where they have been, and a share card is the most compressed surface the site owns, so an employer costs more room than the one click to the credential buys.

### Resume PDF served from `public/`

The footer résumé link points at `/resume.pdf`, which Astro serves from `public/resume.pdf`. The canonical source is `career/assets/resumes/eric-le-cv.pdf` in the parent career repo. Upstream keeps a Swedish `eric-le-cv-sv.pdf` beside it and this site serves the English one alone, since the page it sits on is written in English and the footer holds one résumé slot. Updates land here as a binary copy via the sync queue rather than a hotlink to a GitHub raw URL. On-domain serving keeps the URL clean (`erclx.dev/resume.pdf`) and removes a third-party dependency from the footer CTA.

### Cloudflare Pages over Vercel or GitHub Pages

The apex domain already lives in Cloudflare. Pages attaches the custom domain without DNS migration and serves both the apex and `www` from the same project. Vercel and Netlify would require pointing DNS away from Cloudflare or running a CNAME-flattening dance. GitHub Pages handles static fine but offers no per-PR previews and ties the project lifecycle to the repo settings rather than a host project.

### Deploy from GitHub Actions, not the Cloudflare Git integration

`cloudflare/wrangler-action` runs after `static-checks`, `unit-tests`, `build-verify`, and `e2e-tests` pass. CF's native Git integration would deploy on every push without honoring the test gate and would build in CF's environment with a separate bun version. Direct upload from Actions keeps the test gate and the build environment unified with CI.

### The vector serves the tab, and the rasters serve the surfaces that composite

The mark is a lowercase e followed by a block cursor, drawn in this repository
rather than synced from the parent checkout. `src/assets/brand/mark.svg` is the
one drawing and `scripts/brand.ts` renders it to rasters, so the tab, the home screen,
the avatar, and the bar cannot drift.

An engine that reads the vector never requests the raster, which is why the 32-square PNG is a fallback for engines that ignore an SVG icon rather than a first choice that declaration order could protect.

Every brand raster carries a cream ground with a dark mark, so all four assets agree. The bar is the one surface that takes no ground, because it is the one surface this repository paints: a ground there would be a cream plate laid on the page, so the mark takes the theme's foreground instead. A disc was rejected in favor of a rounded square, since a circle inscribed in 16 pixels leaves about 11 for the mark and the letter reads cramped, where a square costs 16% of the drawing's scale and keeps the frame. The two other ground-carrying rasters (home screen, avatar) keep the same cream-on-dark pairing, since a dark disc dissolves into a dark host chrome such as Discord or GitHub dark, where cream stays a defined shape on both themes.

The bar's own fade stays on its ground rather than moving to the row that carries the name and the toggle. Under reduced motion the row keeps its color, so a fade on the row would show a second name through the whole hero, where a fade on the ground alone reveals nothing early.

Measured at e8d1d97 on 2026-08-22.

The stroked paths and the filled rect take separate CSS classes, since a shared class rule carrying `fill` outranks a `fill="none"` presentation attribute and silently turns an open letter into a solid disc. `e2e/favicon.spec.ts` counts enclosed holes in the rendered pixels rather than ink coverage, since a filled disc carries more ink than an open letter and a coverage-based guard would pass the broken mark.

`public/avatar/` is served at the domain root and no visitor navigates to it. It sits there because a profile host wants a file to upload rather than a URL to embed, and `public/resume.pdf` already sets that precedent.

### A figure joins the page's own family, and its vocabulary lives in its own context entry

The experience section carries a cast of small figures in its margins. `canon/context/agent-cast.md` carries the fill and palette rules, the power-versus-gear slot test, the motion and reaction vocabulary, the face-similarity measure, and the instruments guarding all of it.

### A landing-page figure sits inside the text column, and marks derive from type metrics

A figure hanging into the page margin reads as an off-center section even when the text column measures perfectly centered, so a landing-page figure sits inside the content column rather than beside it. The same principle sends the header portrait inside the content column rather than into the margin beside it, floated within the headline so its top edge is the headline's own top at any width.

A figure that must line up with type takes its position from type metrics rather than a measured constant: the origin dot centers inside a box one line-height tall, each rail segment runs from that box's center to the next row's, and the status dot centers on a box one cap-height tall resting on the label's baseline. What is banned is a literal standing in for a relationship two other values already fix, such as a nudge centering one element against another. Arithmetic over named values is the sanctioned form, which is why a rail segment spans `calc(1lh / 2)` to the next row rather than a measured offset. A value that sets something rather than relating two things stays a literal, including spacing, type sizes, and the 44px tap minimum.

The heading says landing page because the case-study routes take the opposite treatment, and the two do not conflict. What made the origin graph read as off-center was a figure sitting beside its text rather than under it, so the section's mass fell to one side of its own column. A case-study figure stays centered on the prose it interrupts and overhangs it symmetrically, measured at 0px of center offset across five widths. The landing page also varies its measure per section and has other ways to break a column, where a case study holds one measure for thousands of pixels and has none. Read the rule as barring a figure that pulls a section off its axis rather than as barring width.

### The timeline holds its rail at every width, in three tiers rather than two

The timeline rail holds at every width in three tiers rather than two. Width is not what forces the middle tier: the row measures 558px at 620 and 690px at 767, against the 455px reading column 768 is content with. The span column forces the type step instead, since the widest of the six beats needs 177px at body size against a 184px column, so its column cannot narrow at all while the span stays at body size.

Below 600 the rail moves to the section's left edge and spans the beat, since there is no room for a column beside the reading one, and the span leads a beat there where the head leads it everywhere else. The gutter takes its type from whichever line it is meeting rather than carrying an offset.

What the middle tier costs is reading width at its own bottom end: at 600 the head wraps to two lines rather than one. That trade is deliberate, since a beat wrapping is legible and a list of six paragraphs claiming to be a timeline is not.

Measured at e9f68e5 on 2026-08-22.

### A case-study route scales its measure with the viewport, and its figures overhang it

Prose runs 672px at 1280 and 832px at 1920, and the body scales with it from 17px to 22px. Both are clamps that hold today's values at 1280 and below and stop growing past 1920. Figures overhang the prose symmetrically, reaching 896px and 1216px at those widths, which takes the widest viewport from 35% content to 63%.

A route carries two prose steps. The lede scales alongside the body and runs 21px to 26px across the same range, so a route's largest prose sits 53% above the landing page's flat 17px at 1920 where the body sits 29% above it. Both surfaces match exactly at 1280 and diverge only above it. The pair is deliberate, since capping the body without capping the column lengthens the line the pair exists to hold flat.

The pair moves together because the column cannot widen alone. Widening a column while the body stays put lengthens the line, which is the failure the trap below records reaching production once. The route holds 61.1ch at 768 and 1280 and 59.4ch at 1920, so the measure stays flat while the page fills out, which is what the pair buys.

Both surfaces run about 90 characters to the line. Counted on the breaks the browser actually made, the route body averages 89 and the landing page 92, past the comfortable ceiling near 75 on both surfaces rather than one. The route's pair keeps that count flat across the range rather than bringing it down, which is what the pair is for and is not the same as settling the measure.

Count characters on real line breaks when the question is whether a surface sits inside the band, since that is the band's own unit. Read `ch` when the question is whether two columns are the same width, since it is text-independent where a character count is not. Neither reading substitutes for the other.

The scoping mechanism is a `surface` prop on the layout that stamps a class on `body`, so the tokens reach the five project routes and nothing else. That indirection exists because of the trap below.

`@theme inline` bakes a literal into the generated utility. A token declared as `--text-body: 1.0625rem` inside that block cannot be overridden by any downstream scope, because the utility carries the value rather than a reference to it. The color tokens escape this only because each resolves to a `var()` rather than to a literal, which is why `.dark .figure-plate` works. The two type steps take the same form, resolving through `--body-size` and `--lede-size` declared in `:root`.

The prose and figure clamps carry different slopes, so their ratio drifts from 1.333 at 1280 to 1.462 at 1920. That is deliberate rather than an oversight. A constant 1.4 ratio would make the figure 941px at 1024, leaving 17px of gutter each side, where the drifting pair keeps the figure safe at the narrow end and generous at the wide one. Do not replace the two clamps with one ratio without re-checking 1024.

Measured at 502da58 on 2026-08-20.

### A promoted control is measured against the settled page

The sticky bar takes the hero's name and theme toggle rather than rendering its own. One element travels in each case, which is what keeps a single toggle wired and keeps the page's only `h1` carrying its accessible name. The cost is that both end up in fixed hosts holding a measured position, so a measurement taken against a page that has not settled is held for good.

Placement waits on `document.readyState`, the hero's own reveal transform at rest, and the reveal marker on both anchors rather than one, with a three-second timeout in case neither condition arrives. The wait is read off the reveal marker with the row's position as the tiebreak, so an unmarked row still on screen is waited for and an unmarked row scrolled past is not.

The toggle's home slot holds no size of its own, so once the control is promoted away the slot collapses to a point and every re-measure after the first reads that empty box. The control is returned to its home for the reading rather than the slot being given a reserved size, so the control's own box stays the one source of the hero position. That home is the header's own corner rather than a text row, since the greeting sits under the name and the portrait floats flush to the column's right edge, leaving no row under the name with a free right side to center a control against.

The bar's reveal keys to half the hero rather than half the viewport, since a hero shorter than half the viewport clears a viewport-keyed margin without being scrolled at all. `canon/context/section-nav.md` § Reveal gate carries the rail's own reveal derivation.

The toggle's corner sits off both the bar's slot and the name's own travel, so its own vertical distance is the wrong clock for either the toggle's crossing or the bar's arrival gate. Both instead read the name's travel, which is the one distance that describes the move a reader sees.

### The merge gate runs every engine the suite defines, as a matrix rather than one job

The e2e job runs as an engine matrix rather than one job, since `playwright.config.ts` pins `workers` to 1 under CI and a combined job would serialize every engine and multiply both retries on top. `canon/context/ci.md` carries the cache trap, the worker-count hazard, and the pointer-query form.

### The header signature is an authored shader, and the same drawing runs under the whole page

The header renders a fragment shader rather than a per-frame particle simulation, since the relief comes free from a value the contour pass already computes and the whole surface holds to one frame at a fraction of the weight. `canon/context/shader-field.md` carries the mount lifecycle, the uniform contract, and the tuning history.

The still copy mounts from the layout, so it reaches the project routes as well as the landing page. It damps inside the reading measure, tracking `--prose-column` rather than a fixed strip, since a route scales its column and a landing section does not, and the damp curve keys to viewport width rather than the column's share of the viewport. See `canon/context/page-ground.md` for the measured cost.

A click adds a disturbance to the stream function rather than to the drawn output, so the field keeps evolving underneath it, bends where it crosses, and recovers with nothing restoring it.

### The portrait sits in the field rather than under a drawing of it

The rings around the header portrait are contours of a mound added to the shader's own stream function rather than a CSS drawing, so the field's lines close around the photo and open back into the terrain where the mound runs out. `canon/context/motion.md` § Portrait rings carries the rejected CSS approaches, the amplitude guard that verifies the rings are actually visible, and the measured values.

### Contact travels with the reader, in the margin opposite the rail

The hero opens with three destinations and nothing else on the page carried them. A dock in the right margin carries them plus the resume, arriving on the same half-hero gate the sticky bar uses and holding to the bottom of the page.

The footer carries the résumé link alone. The dock is what carries the hero's contact destinations through the rest of the page.

It sits opposite the section rail so the two margins read as a pair. The rail states position and the dock offers reach, which is the split `canon/REQUIREMENTS.md` § Navigation already draws. Both hold to the bottom of the page rather than the pair breaking there: the rail's own footer gate never earned its complexity and came out rather than getting retuned a third time.

The dock mounts from the layout, so all six surfaces carry it. A route is the longest read on the site and the one a shared link lands on, which is the arrival that skips the landing page and every contact link on it. A route also reveals it at once rather than gating: the gate watches the header for a hero to scroll past, and a route's header is its sticky bar, whose intersection ratio reads 1 for the whole page. A layout mount alone would therefore have shipped a control that never arrived on five surfaces of six.

The resume is in the dock and stays in the footer, which is the one duplicated destination and is deliberate. It is the highest-intent link on a page whose job is hiring, and it previously existed once, as the last thing on the page.

`canon/context/contact-dock.md` carries the tap-target and pointer-events gotchas. Copying the rail also copied a footer gate that had never fired, since it watched a root capped to the top half of the viewport for an element that sits at the bottom of the last screen. Both controls were fixed on the one reading, which is the argument for building the second control from the first rather than beside it.

### A line is drawn where it divides, and a bound is revealed rather than drawn

The page carried an outline on every project card, a rounded plate under the hero band, a rule under the sticky bar, one over the footer, and one per row in the closing ask. All but two came out, since none of the removed lines divided anything a reader compares: they stated where a surface ended, which whitespace and a fading ground already state. The two that stay: the closing ask's rule, since a character rests against it as a ledge, and the timeline's rail, since it is the one element stating the beats are a sequence.

`canon/context/project-cards.md` § Card bounds carries the pointer-lit replacement shape and the four shared response-token values every bounded control on the site reads from. `canon/DESIGN.md` § Borders carries the three tests a line has to pass to stay.

### The focus ring is the site's own, and its shape comes from the control

The focus ring takes the accent color rather than the component library's default blue, measuring 5.48:1 in light and 5.42:1 in dark against a 3:1 floor for a non-text indicator. `--light-ring` resolves to the light accent, so a control focused inside a chart plate carries the site's ring too. `e2e/focus-inventory.ts` sweeps every control's focus state, since a pointer response is checked on every visual pass while a focus ring only answers a Tab.

An outline follows its element's own radius, and a control declaring none draws a rectangular ring around a rounded shape. A radius floor in `@layer base` fixes that without a list of components, since an unlayered component rule and a Tailwind utility both outrank a layered declaration, so a control carrying a shape keeps it and only the shapeless ones take the floor.

The glow lands on the same test that decides the card's hover glow: a control with bounds takes it, an inline link keeps its underline instead, since a focus indicator has to reach every control while a hover response can afford to be selective.

Two instrument gotchas came out of writing the guard. `outline: none` resets the width to `medium`, which engines report as 3px while drawing nothing, so a check reading `outlineWidth` sees a ring on a control that has none, read the style rather than the computed width. And a rule stripping a ring has to win a cascade against a layered declaration and a user-agent default, so the strip is written inline, where nothing outranks it.

Measured at 63bfea1 on 2026-08-22, at 1440x900 across chromium, firefox, and webkit.

### One ground for two bars, and the shape moves while the row does not

The landing bar and a route's bar share one ground rule rather than each declaring its own, drawn from the elevated-surface token with a 0.88 alpha over a 24px blur, holding 5.02:1 and 8.16:1 contrast in light and dark on the landing page and 4.83:1 and 8.30:1 on the densest route. A ground taken from the page's own background token cannot separate from it (it measured 1.002:1 and 1.003:1, the page laid on the page), and blur alone cannot rescue that either, since blurring a flat field returns the same flat field.

The shape contracts on scroll and the row inside it does not: the hero flies its name and its theme toggle into the row's slots at measured positions, so a measurement of either has to be taken against a settled shape.

A shared declaration is not shared until nothing can replace it. The shape's transition, `inset 320ms ease, border-radius 320ms ease`, sits on `[data-bar-ground]` rather than inside either bar's own component, since `transition` is a shorthand and a component-level rule setting only `transition: opacity` would reset `transition-property` to that one property rather than adding to the list. The edge and the shadow stay out of that list deliberately: they arrive at once on both bars, marking the instant the bar detaches from the viewport, where an edge fading up would read as the bar being unsure whether it has.

Measured at 10c511a on 2026-08-25 with this branch applied, at 1280 across chromium, firefox, and webkit.

### Two token sets carry elevation and response, and every control reads them

Two token sets, elevation and response, sit in `:root` and every floating or interactive control resolves them from there rather than declaring its own.

The elevation set has a ceiling worth knowing before reaching for it. In light the page sits at `oklch(0.968)` and white is 0.032 away, so a fill can barely separate at all: read off painted pixels rather than off composited tokens, a white ground measures 1.038:1 against what sits behind it, where dark reaches 1.105:1. Anything further has to come from the edge or the shadow, and the two themes want different levers: in light the shadow does the work, in dark the edge does. A `backdrop-filter` samples what sits behind the element, so no arithmetic over token values reproduces what a reader sees, read this ceiling off pixels rather than composited tokens. The set carries `--surface-elevated` rather than `--card`, since `--card` also grounds the white chart plates on a project route and the two roles needed separating before either could move.

The response set answers a question the site had never asked in one place. A control with bounds takes the card's own glow, and a link sitting inline in a paragraph keeps its underline instead, since a ground behind a word reads as a highlighter and fights the sentence around it. The card is the source rather than one more surface to match: its four values moved out of it unchanged and every other control reads them back. Where a control already carries a ground at rest, the glow stacks on top rather than replacing it, since swapping one shadow for the other makes a lit control appear to drop as it lights.

The response set has a ceiling too, and it is lower than the token values suggest: held at one edge color, a pointer's effect on fill and shadow sits inside the noise a ground's own drift already produces, so the border color is carrying nearly all of the response set's visible weight. A proposal separating two states by fill or shadow alone will not read.

The palette has no headroom below its muted token, which is a constraint on every future treatment. Muted measures 4.82:1 in light, so a third step lightened beneath it fails the 4.5:1 text floor at any value visible enough to do a job. Separate two text layers by weight, size, or the space between them, and read lightness as already spent.

Two measurement errors are cheap to repeat and worth watching for. A patch sampled at the corner of a bounding box misses a circular control and reads the page behind it instead. A color carrying alpha read as opaque reports a color nobody sees.

Measured at c5f17e4 on 2026-08-20, with the elevation ceiling re-read off painted pixels at 1440x900 on 2026-08-22.

### The rail states position by moving, and a control that scrolls owns the URL it leaves

The section rail gives only the active row the dock's ground, rather than all four, since four grounded labels read as a navigation menu rather than a position indicator. The active row steps via a transform rather than the margin it visually undoes, so the rail never reflows. Movement carries the position signal because the rail sits in a reader's peripheral vision while they read the column beside it, and movement is what peripheral vision detects where color is not. `canon/context/section-nav.md` carries the rail's own step and ground mechanics.

A control that scrolls the reader within the page it is already on replaces the URL entry rather than pushing one, so a reader does not press back twice to leave a control that never navigated anywhere. The bar's home control is one such case: it clears any fragment a timeline chip left behind.

### A figure is sized against its own shape, and a defect can be held up by another

A portrait figure's plate follows its content rather than a fixed length chosen for a different aspect ratio, and its image takes a ceiling that scales with the plate. A figure sized against a length chosen for something else drifts apart from its content as soon as either one moves. A magnifier on a figure fits it on arrival and opens to the figure's own pixels on a second click, which is the first size at which a portrait chart's axis labels can be read.

A defect can be masked by a second one, so repairing either exposes the other, and a session that fixes one without re-checking around it ships both. Assert that a surface is where a reader would see it, not only that it has the right shape and size, since a correctly sized panel positioned off screen still passes a check that never asks whether it is visible.

### A dev-only component serves candidate treatments the operator drives

Some decisions cannot be settled from a capture or a recording, since both are passive and the question is how a thing feels to cause: a pace read while scrolling, a gesture, whether a control is where a hand expects it. `src/components/dev/scenarios.astro` serves candidate treatments live from the running page behind one query parameter, with a switcher for moving between arms.

It renders nothing in a production build, since the whole component is behind `import.meta.env.DEV` rather than gating itself at runtime, and nothing in development either until the page is asked for an arm by name. An arm carries CSS where the decision is a treatment. Where the decision is a runtime value, a pace or a shader uniform, the arm carries none and the module holding that value reads the active id off `documentElement.dataset`, which is what lets one component serve a stylesheet decision and a runtime decision without knowing about either.

It is unreferenced by default, since it is scaffolding a visual decision reaches for and removes again, and a branch with no open visual decision holds no call site. An unreferenced component is only safe while something tells a session it exists, so the `visual-batch` skill names it explicitly rather than leaving discovery to a tree search.

### The rail carries looking-for through the footer rather than hiding near it

The section rail carries no footer-hiding gate. It behaves on the landing page exactly as it always did on a project route: revealed once the hero is scrolled past, visible through the rest of the page, hidden again only on scrolling back into the hero. The rail sits in the empty left margin at the footer's own width, clear of the signature, the résumé link, and the colophon, so hiding it there was never buying anything a reader would notice losing.

### The avatar answers to a host, and the OG card answers to the same field it always should have

`public/avatar/` carries six files: a naked light and dark pair and a streamline dark pair, each at 1024 and 2048px. Discord's own cropper renders a smaller source visibly soft at the sizes it displays an avatar. The dark ground is the site's own `--card` in dark, lifted one step from `--background` rather than the mark's near-black ink inverted, since a literal invert reads as flat black on a dark host's own chrome.

The streamline variant is drawn from the hero's own live `[data-shader-field]` canvas rather than the static `page-ground` copy, since `page-ground` mounts with `animate: false` and draws exactly once, so a simulated pointer against it can never produce the accent-gradient reveal a real hover shows.

Two sizes come from one CSS-pixel geometry captured at `deviceScaleFactor` 1 and 2 rather than from two different capture widths, since the field's own spatial scale is driven by the canvas's CSS width alone and widening the capture viewport would change the field's density along with the resolution.

`scripts/lib/capture-field.ts` navigates to a real page first and injects the composed markup with `page.evaluate`, rather than rendering a page that never navigates, since a page holding a large embedded image and never navigating crashes the screenshot protocol in this environment. The favicon and the home-screen icon are untouched.

### A route's rail leads with the route, and a runtime row takes no styles

A project route's rail shows a first row on first paint, pointing at the section carrying the `h1` and labelled with the project name, rather than staying empty until the reader scrolls past the opening section. A route's opening section is proportionally far larger than the landing hero, so copying the landing page's reveal gate would leave the rail absent for a large share of a route's read.

Read the divergence from the landing page as deliberate rather than as an oversight. The landing rail tracks position through sections a reader meets by scrolling anyway. A route's rail is a contents list for a long-form read, and showing it on arrival says how long the read is and what is in it, which are different jobs.

The cost is the project name beside the `h1` on the opening screen, which `[data-route-here]` hides itself to avoid. Accepted, since a rail row is a position mark in the margin at label size rather than a title in the same band, and past the `h1` the bar's name fades in as the rail hands off, so the name is stated exactly once at every other scroll position.

A state a component sets and a treatment the stylesheet paints are two separate claims, and reading the first says nothing about the second. An element built with `document.createElement` never carries Astro's `data-astro-cid-*` scope attribute, so a component's own CSS rule never matches it even while the element's `data-active` state reads correctly.

### One declaration decides how the page travels, and every caller resolves it

`scroll-behavior: smooth` sits on the root under `prefers-reduced-motion: no-preference`, and every scroll-triggering caller passes no explicit behavior, so the motion preference is read in one place. A timeline chip is a plain anchor rather than a click handler, which keeps the fragment a reader can copy, keeps focus landing on the card rather than the body, and covers an anchor nobody has written yet.

Three callers that meant "be there" rather than "travel there" pass `instant` explicitly, since the root declaration would otherwise catch them too: the lazy-image walk, whose per-step settling depends on the viewport not still being in transit, the variant capture, and the driver's own scroll into view.

What holds across chromium, firefox, and webkit is asserting whether the page ever occupies a position strictly between where it started and where it landed, rather than a frame-exact or distance-threshold check, since each engine's own glide curve differs enough in timing and step count to fail either of those on at least one engine. The curve itself is the engine's and not the site's, since CSSOM-View requires the smooth scroll and defines no timing function for it.

### A control gets an arrival where decoration gets a schedule

Decoration may be given a schedule, and a control is given an arrival instead. The timeline's project chips wave once, 90ms apart across five chips, when the row first enters view, and cannot re-arm until the row has left the viewport entirely. `canon/context/motion.md` § The chip row's arrival carries the membership test, the re-arm hysteresis, and the timing that separates an unattended arrival from a pointer's own answer.

### Visitor analytics runs at the edge, with no code in this repository

Cloudflare Web Analytics already tracked erclx.dev before this branch existed.
The zone was added to Cloudflare on 2026-04-11, and Web Analytics ran on
automatic setup the whole time, with EU visitors excluded under the dashboard's
own toggle: the edge injects the tracking beacon into every HTML response
outside that exclusion, and no script tag lives anywhere in this repository. A
fetch from a Swedish vantage point therefore carries no beacon by design rather
than by defect, which `erclx.dev/cdn-cgi/trace` confirms by reporting `loc=SE`
for that same request.

Automatic setup delivers a visit recorded with a timestamp and a rough country, with no cookies and no backend of this project's own. A manual snippet would add a script this repository has to maintain for no capability automatic setup lacks. `canon/REQUIREMENTS.md` records why analytics left the non-goals list.

### The closing rule is a contour, and what clips the dog is the line itself

The looking-for section's rule is a curved contour drawn at the hero field's own peak weight rather than a flat 1px hairline, since a hairline matching the page ground actually behind it would be invisible, and matching the field's peak contour instead makes the rule louder rather than subtler, which is the direction the section wanted.

The dog perched on the rule is clipped by a `clip-path` polygon generated from the same path geometry as the drawn curve, rather than a rectangular `overflow: hidden`, since a flat clip drops the character's grip everywhere the curve leaves its midline, and the two clipping mechanisms cannot both stay active without the tighter one winning.

Amplitude is read off the stage's own width rather than fixed, ramping 5px to 16px across a 342px to 768px stage. A fixed amplitude reads as terrain at 1280 and visibly tips the figure at 390, since the dog spans a larger share of a narrower stage and the curve compresses under him exactly where there is least room. The curve itself sums three incommensurate sines rather than one, since the field's own adjacent-contour gaps vary continuously and a regular period would read as not belonging to it.

Measured at 10c511a on 2026-08-25 with this branch applied, at 390, 768, 1024, 1280, 1440, and 1920.

### A case-study prose link takes the site's accent, and the tap-target guard learns what an inline link is

A case-study prose link is accent-colored text with an always-on underline, applied as Tailwind utilities per link rather than a named CSS class, matching how the header and footer links are styled directly. An always-on underline rather than a pointer-hover-only one, since WCAG's caution against color as the only visual means of conveying information means a link within a paragraph has to identify itself without relying on color perception alone, which a hover-only treatment fails for a keyboard or touch reader.

An inline element is exempt from the site's 44px tap-target minimum when its computed `display` resolves to `inline`, since a word sized to its own text inside a sentence cannot clear that floor without inflating the line it sits in, which is exactly the case WCAG's own criterion exempts.

The guard asserts the exempt set by reading each element's class list for `min-h-11`, `min-w-11`, or `size-11` alongside a box-display class, rather than trusting computed `display` alone, since a flex parent blockifies a child's computed display and would silently exempt a control that regressed from `inline-flex` to plain `inline`.

### The gallery is one carousel rendered twice, and every end of it is a scroll the box has to reserve

The diction route opens on five screenshots in a peek carousel, and clicking the centred one opens the same carousel larger in a dialog. One track component serves both mounts rather than two, since the chart dialog forces a light plate for charts drawn on white paper and pages through every figure on the route as one sequence, where a screenshot gallery wants the page's own dark card and a sequence of its own.

The track takes `width: max-content` with the slides sized in `cqw` against the scroller, rather than padding on the track, so the first and last slides land at exactly `scrollLeft: 0` and `maxScrollLeft` by construction. A wobbling `maxScrollLeft` between readings is the tell that scrollable overflow is coming from transformed content rather than from the box, since a fixed border box cannot produce that wobble and a set of scaled children can.

The centred slide is read back from an `IntersectionObserver` as the largest share of any slide showing, never as the first intersecting entry in a batch, since a step can cross two slides at once with the batch unordered by how centred each is. A control's destination outranks that reading until the scroll reaches it: geometry is the right authority for a swipe, where nothing declared an intent, and the wrong one for a click, where waiting to infer the answer makes it depend on the scroll finishing. A reader touching the track clears the pending destination, so a scroll interrupted by a swipe cannot leave the observer deferring to a destination nothing is traveling to.

Focus and centring are one state: slides take a roving tabindex, focus follows the carousel whenever a slide already holds it, and the arrow keys move focus onto the track, since a browser blurs an element as it becomes disabled and an arrow disabling at the ends would otherwise drop focus to `body` and stall the carousel.

The preview panel takes a fixed width rather than fitting its content, since a fitted width reads off whichever slide is centred and resizes under the reader as they step. The five screenshots are captured at one viewport rather than full page, since the app's sidebar is `fixed inset-y-0 h-svh` and a full-page capture of a longer screen renders it stopping partway down.

### Equal gaps are not a center, and the name nobody could press was the only way back

A route's bar centers its name using three columns with equal outer widths rather than `justify-between` across three items of unequal width, since equal free-space gaps only center the middle item when its two neighbors weigh the same. A 17.5px offset nudge would have encoded the lockup and toggle's current widths and gone wrong the moment either moved, which is the literal-standing-in-for-a-relationship this file already bars.

The name is a button that scrolls to the route's top, since it is the only back-to-top control in the band below 1280 where the section rail is hidden. Opacity was the only thing withholding it: a control hidden by opacity alone still costs a tab stop and a 44px target while painting nothing, so it takes `inert` on the same clock as its visible marker.

A raw NUL byte in a source file makes every text tool classify the file as binary, so a search can return an honest empty result against a file that holds exactly what was searched for, worth checking for when a search comes back empty against a file that should not be.

Measured at 4577565 on 2026-08-26 with this branch applied, at 320, 390, 640, 768, 1024, 1280, 1440, and 1920 across all five routes.

### The standards corpus is resolved rather than installed, and the readers were the load-bearing half

No standard installs into a project. The corpus resolves through the toolkit at `aitk standards <name>`. `.claude/rules/project/` does not exist, so no project-specific rule or hook enforces a policy written only there, it stays visible in git history rather than in a checked-out file.

A guard keyed to a file's existence reports success the moment that file stops existing, rather than failing loudly. Two hooks read the standards tree at run time this way and both went silently inert when the tree was deleted, until each was rewired to call the toolkit directly and run against a probe carrying known violations before being trusted.

A tooling sync report is a list of decisions to re-take rather than drift to clear, since the sync has no way to tell a deliberate customization from a lag. `playwright.config.ts`'s own port band, the three-engine CI matrix, and `e2e/screenshot.ts`'s per-section capture are all customizations this document defends elsewhere, not drift.

A move retargets what names the moved folder and what the moved files name from where they now sit, and only the first can be found by searching for the old name, since a link one level deeper than expected resolves to nothing with no search for the old spelling ever finding it.

### The root README is a portfolio page, and its hero opts into the toolkit's own evidence convention

The root `README.md` reads as a portfolio page: a themed mark, the site's own share-card claim as the tagline, a full, uncropped capture of the header, and a short About excerpt, with no install or run instructions and no link into `canon/`. A visitor arriving at the repository from a shared link is exactly the reader `canon/REQUIREMENTS.md` already writes the whole site for, and no session-facing technical summary serves that reader.

The bio it quotes is not authored twice. `src/components/site/about/bio-copy.ts`
holds the two paragraphs the README and the site's own About section share
verbatim, `about.astro` reads from it, and
`src/components/site/about/bio-copy.test.ts` fails if the two drift apart, the
same shape `scripts/card-copy.ts` already holds for the OG share-card claim.

The hero screenshot is regenerated in CI rather than hand-maintained.
`.github/workflows/readme-screenshot.yml` re-captures
`src/components/site/header/**` on a pull request and pushes the result back
onto the PR's own branch when the bytes differ. A push made with the default
`GITHUB_TOKEN` starts no workflow run, so nothing recaptures or re-verifies the
pushed commit. `canon/context/ci.md` § A pull request comment depends on a path
convention nobody had adopted carries what that leaves unverified. `scripts/lib/preview-server.sh` is the
preview-build-and-serve bootstrap `scripts/screenshot.sh` already carried,
extracted so the new capture script does not hold a second copy of it.

The images sit at `.github/evidence/readme/{light,dark}.png` rather than beside the README, since the installed `canon` CLI's `canon pr evidence` renders a before/after comparison comment for any changed image whose path carries a literal `evidence` segment, run by `git-pr`/`git-followup` on every pull request. `canon/context/ci.md` carries the mechanism itself.

## Risks / open questions

- The first build seeds copy directly from career sources. The cutover to the queue-only model after v1 needs a clear marker so future sessions do not fall back to reading career files.
- `caret.astro` and `stackr.astro` sync against `career/assets/portfolio/caret.md` and `stackr.md`, which do not exist on the career repository's `main` today. Both files, along with the two opening sentences and the `Fix Session Timeout` example they carry, are added by `erclx/career#210`, still open. Until that pull request merges, the sync target for those two routes can still move, and a reword to either file on its branch arrives as fresh drift here with nothing reporting it. Re-check both files against `main` once `erclx/career#210` lands, and until then read the branch it ships from rather than assuming it is `main`.
