# Architecture

## Overview

Static Astro site that renders one page at the erclx.dev apex. The build emits HTML, CSS, and a small JS bundle for any interactive islands. Content is authored once in the parent career repo and flows here through a sync queue.

For the source and test layout, see `.claude/context/development.md` § Layout.

## Key technical decisions

### Agent context split by load cost

Always-loaded context is paid on every session whatever the task, so only project-wide invariants sit in that tier. Everything else keys to a trigger: path-scoped rules load when a file matches their `paths:` glob, and per-domain narrative loads on demand through an index. `CLAUDE.md` § Context carries the tier map a session reads to place a given file.

The root `docs/`, `standards/`, and `snippets/` folders are gone. Nothing in `docs/` served a visitor, so all three moved under `.claude/`. Both `.claude/standards/` and `.claude/snippets/` have since been retired outright, and the decision below records why.

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

Two earlier designs are retired. A single `.claude/briefs/SYNC-QUEUE.md` was never created, and the briefs folder was removed on 2026-08-14. A task-file queue under `.claude/tasks/` described the carry until 2026-08-15, when the build that consumed the copy read it directly instead. Verified 2026-08-15 against the portfolio copy folder in the parent checkout. <!-- canon-keep-record-root -->

### Critical fonts preloaded via Vite ?url imports

Variable woff2 files for Fraunces and Inter weight-axis are imported as `?url` in `base.astro` and referenced through `<link rel="preload">`. This eliminates the FOUT swap from Fontsource's default `font-display: swap`. Vite resolves the path through `node_modules`, so no manual copy to `public/` is needed.

### Editorial type pairing replaces Geist

Geist is removed. Replaced by Fraunces variable for display and headings, Inter variable for body and labels, JetBrains Mono variable for code. `.claude/DESIGN.md` is the source of truth for token values. The tokens flow into Tailwind v4 via the `@theme` block in `global.css`.

### Playwright MCP for interactive verification

`.mcp.json` registers `@playwright/mcp@latest`. Reach for it when verification needs hover, click, viewport changes, or computed-style inspection. Use the static `bun run screenshot` capture for layout review and content-vs-canonical-source diffing.

### Screenshot capture waits for lazy images

Card posters and case-study figures load lazily, so a per-section capture can shoot a slot whose image never entered the viewport and produce an empty box that reads as a rendering defect. The capture therefore walks the whole page and waits for every image to report pixels before it shoots. The wait is not fatal: an image that never loads warns and the capture proceeds, because the picture of the breakage is the evidence a reviewer came for and failing the run throws it away. Verified 2026-08-15 against the projects section, where the wait moved a card from an empty slot to its poster with no code change behind it.

Each step of that walk settles where it stands rather than pausing a fixed span and leaving the waiting until the end. A fixed pause is a guess at how much lead an engine needs to issue a lazy fetch, and the engines disagree on it by an order of magnitude, so a walk tuned against one strands images on another with nothing recovering them once the viewport has moved on. The step waits on the reveal markers as well, since those are driven off the viewport and stranded the same way. `.claude/context/ci.md` carries the per-engine figures and the three gating cases one change repaired. Measured at 07e7c9b on 2026-08-21 with this branch applied.

### Screenshots capture per-section on the landing page and whole on a case study

`e2e/screenshot.ts` enumerates top-level `<section>` elements via the `[data-section="<id>"]` attribute and captures each one as its own image through Playwright's `locator.screenshot()`. Output lands at `.canon/review/screenshots/<section>/<viewport>--<theme>.png`. Full-page captures lose detail to compression and waste re-render time when only one surface changed. Per-section captures hand the reviewer one focused image per surface and let iteration target a single surface via `SCREENSHOT_FILTER` with comma-separated terms.

A case-study route takes the opposite treatment, added on 2026-08-15 because the three routes had never been captured at all and the surface judged weakest was the one no review tool looked at. A case study is one long prose surface rather than a stack of distinct ones, and its mid-page headings carry `id` rather than `data-section`, so per-section capture there would shoot the top bar and the footer and miss the body. Each route is captured whole to `.canon/review/screenshots/<route>/<viewport>--<theme>.png`, which keeps the label format `<dir>/<viewport>--<theme>` that `SCREENSHOT_FILTER` matches on and leaves every landing path unchanged.

The run is 56 cases: six landing sections across three viewports and two themes, plus five routes across two viewports and two themes. A route drops the 320px width, which exists to catch a landing section wrapping, because long-form prose reflows rather than breaking and the third width would add half again as much run time for that.

Reading the full-page shape here as license to capture the landing page whole is the mistake to avoid. It is the answer for a single long surface, and the decision above is the answer for a page of six.

### The toolkit's surface-capture rule is declined here

`440-surface-capture` ships with the astro stack and is deliberately not installed. It directs a session to capture the full page and not a component in isolation. That is the reverse of what the landing page does and the same as what a case-study route does. Its `**/pages/**` glob matches four files, so the rule contradicts the build on `index.astro` and agrees with it on the other three. A rule right on three files of four is worse than one that is absent, because the reader has to know which case they are in before trusting it.

Two further reasons hold whichever file is open. The glob overlaps `445-screenshot` on `src/pages/**` exactly, so both rules would load on one page edit. Both also name `bun run screenshot`, which the rule-authoring standard bars between siblings.

`445-screenshot` is this project's answer and stays. It carries the before-and-after discipline and the handoff rules the toolkit rule has no equivalent for. It sits at `.claude/rules/project/ui/445-screenshot.md` since 2026-08-28, which is where the toolkit now asks a target to keep what it authored itself, and a sync names it rather than passing over it silently.

Reading its absence as an install gap is the specific mistake to avoid: a session did exactly that on 2026-08-15 and installed it alongside two rules that were genuinely missing. What tells the two cases apart is the install stamp, now at `.claude/aitk/config.json`. It named `556-groundwork` and `557-intake` with no file behind them, which is a missing install, while `440-surface-capture` appeared in neither the record nor the tree, which is what a declined rule looks like.

### A touch decision is judged on a device, not in device emulation

Three verification surfaces above read the page through a headless engine or a desktop browser, and none of them can answer what a finger does. Device emulation reproduces the events and the viewport and not the pointer hardware, the display density, or the engine, so a rule silently taking its touch branch renders identically under emulation and wrongly under a thumb. That is the same defect class the engine matrix was widened for, arriving through the one gap a matrix cannot close.

`bun run device` serves the dev site to a phone or tablet on the local network and prints a code to scan. `.claude/context/development.md` § Serving to a real device carries the routing, the reboot trap, and the failure modes.

Two decisions inside it are worth stating here rather than there. A local port forward was chosen over a public tunnel, which needs no administrator and works from any network and was rejected anyway because it puts an unfinished portfolio on an address anyone holding the link can load. And the harness holds one fixed port where the other three servers derive one per worktree, because a forward covers exactly one port and a derived port would put an administrator prompt in front of every new worktree, which is the recurring cost the harness exists to remove. Reading that fixed port as an oversight against the band convention is the mistake to avoid: it is the convention traded away deliberately, for one forward that outlives every worktree.

What it gives up is two worktrees serving to a device at once, which needs two devices before it is worth anything.

### A pointer response is gated on a device that has a pointer

The site answered a pointer twenty times across six pages and asked whether one existed three of those times. A finger dragged down the page therefore tilted every project card it crossed and left them tilted, walked the experience timeline to whichever beat it last touched, ducked the closing ask's character, marked the bar's name, and dropped a disturbance into the field on every scroll a reader started.

One rule decides membership and it is a test rather than a list. A response keyed to a pointer _being over_ something, `:hover`, `pointerenter`, `pointerleave`, `pointermove`, is gated on a device reporting a pointer. A response keyed to a _deliberate act_, a click, a focus, an activation, never is, because touch performs those exactly as a mouse does and gating them takes the page away from the reader rather than giving it back. `src/lib/pointer.ts` holds the query and every caller reads it, so a component nobody has built yet can be judged against the same test.

The field's disturbance is the case that test does not settle on its own. It listened on `pointerdown`, which is contact rather than intent, so it fired on every scroll. Moving it to a window-level `click` looked correct and failed on the device: WebKit does not dispatch a click to the window for a tap on an element that is not natively interactive, so the response worked on every desktop and did nothing at all on a phone. It now reads a tap off the pointer itself, a press that travels under 10px and is not taken over by a scroll, which the browser signals by firing `pointercancel` the moment it claims the gesture. That works on every engine and keeps the response for touch rather than gating it away.

The surface also drew below the density of the screen it was on. The cap sat at 1.5 while a tablet reported 2, so the panel interpolated the difference and softened every contour, which is why the same drawing read crisp in a desktop capture and washed out on the device. The cap matches the display now, and the frame guard is what protects a device that cannot afford it, by measuring what it actually draws rather than refusing up front.

Nothing headless caught any of this. Two of the three defects reproduce only under a real finger on a real engine, which is what `bun run device` exists for, and both were found within a minute of the page reaching the operator's own hardware.

Measured at 12eb2d0 on 2026-08-21, across twenty pointer responses on six pages, of which three were gated before this and seven after.

### A shared link renders one card, and the card says what the title cannot

Six pages declared nothing for a link preview, so every share of this domain was
rendered from whatever the host guessed. Pinned to a professional profile it came
back as the operator's own avatar beside a bare title.

Every host reads the same Open Graph tags and differs only in what it renders
from them, so there is one image and one set of copy rather than a variant per
network. `public/og.png` at 1200x630 covers all of them: LinkedIn asks 1200x627
and X 1200x628, and Discord scales what it is given.

The absolute URL is the load-bearing part and the one that fails silently. A
crawler fetches the image outside the page's context, so a root-relative path
resolves against nothing and the preview arrives with no image at all. `site` in
the Astro config is what makes `Astro.site` resolve them. `twitter:card` is
`summary_large_image` for a similar reason: X shows a thumbnail beside the text
without it, so the tag rather than the image decides the size.

The mark leads at 210px, the claim sits beside it, and an attribution line
carrying the name and the domain runs at 23px underneath. The name is
deliberately not at display weight: every host prints the page title beside the
image, so a name twice in one unfurl is the redundancy to avoid, and small under
the claim is not that. It is the same redundancy the description carried against
the title until this batch, where a card opening on "Applied AI engineer in
Gothenburg" sat under a title ending "Applied AI engineer".

The description repeated the image the same way and it took a second instrument
to see. Every host except LinkedIn prints the description beside the card, and
the card draws the claim, so an apex description opening on that same sentence
printed it twice in one unfurl. The guard in place compared the description
against the title and could not reach it. `bun run unfurl` renders all six pages
as five hosts compose them and showed it on its first run, which is what the
harness is for. `scripts/card-copy.ts` now holds the claim as one declaration so
the spec can assert against it without running the script that draws it.

That left the three parts saying three things rather than one. The split is
that **the image carries the claim and the description says what the claim
covers**, since the image is the boldest element in an unfurl and should hold
the strongest sentence, and a description elaborating rather than repeating
makes the pair read as one statement. The apex therefore runs
`Eric Le · AI Engineer` over a description naming agents, the tooling around
them, and the full-stack work of making either usable by someone else.

Naming an employer in that description is the version to avoid, and it shipped
until 2026-08-23. `Agents at Volvo` made a role that ended in June 2025 the
identity, where metadata says who someone is and the timeline on the page says
where they have been. The credential is one click away and a share card is the
most compressed surface the site owns, so an employer costs more room than it
buys. `Applied AI engineer` was retired separately, settled upstream as
`AI Engineer` on every surface at 4517ee6, and the page carried both the retired
form and a lowercase `engineer` against it.

Read the whole change on `bun run unfurl` rather than on the tags. Its default
base is port 4400, so pass `UNFURL_BASE_URL` when reading against a dev server
on another port. X truncates the description around 70 characters, which the
106 here survives with the load-bearing half intact.

It is composed inside the served site rather than in a bare page, which is what
gives it the real Fraunces and the shipped tokens. A card drawn in a fallback
face is a card judged on the wrong letterforms. The field behind it is a margin
crop of the hero's own live canvas rather than a whole-page capture of the
still `page-ground` copy, which is what lets a pointer-proximity gradient into
the frame at all: `page-ground` mounts with `animate: false` and never redraws
after its first paint, so no simulated pointer could ever reach it. An early
whole-page attempt shot the canvas while content sat over it and baked the
hero's own text into the image.

The mark grew from a 64px corner element to a 210px lead, which retires the
empty right half an earlier draft of this entry defended. With the composition
spanning the width, the measure was re-settled at 22 characters to the line
against a candidate at 28, judged downscaled rather than at 1200: a card is met
at 400 to 600 in a feed and smaller in a compact unfurl, and at full size the
longer line only looks fuller. At 340 it goes thin and 22 holds.

A square crop takes the mark and the last word of every line, and that is
accepted rather than designed around. Centring the group to survive it costs the
feed and the compact unfurl, which is a certain price for an uncertain benefit,
and a crop taken from the centre is close to the worst case rather than the
typical one, since the hosts that square-crop mostly anchor left or letterbox.
Most hosts take the first `og:image` and ignore the rest regardless of what
else exists. A separate 1:1 asset was the repair queued for whichever consumer
asked for one, and `public/avatar/` is that consumer now: six sized, themed
square rasters replacing the single `public/avatar.png` this paragraph once
named.

`bun run share-card` redraws it, and `e2e/share-card.spec.ts` guards it. Two of
its nine assertions are worth naming: one fails a description that opens on
words the title already used, and one fails a route title carrying `case study`,
which `.claude/REQUIREMENTS.md` retired on 2026-08-18 and which had reached the
visible labels without ever reaching the titles a shared link shows.

Measured at ab160ee on 2026-08-22, with the apex copy re-read across five hosts
at 248046b on 2026-08-23.

### Resume PDF served from `public/`

The footer résumé link points at `/resume.pdf`, which Astro serves from `public/resume.pdf`. The canonical source is `career/assets/resumes/eric-le-cv.pdf` in the parent career repo. It read `eric-le-resume.pdf` until 2026-08-23, by which point no file sat at that path, so the record named a source a session could not find. Upstream now keeps a Swedish `eric-le-cv-sv.pdf` beside it and this site serves the English one alone, since the page it sits on is written in English and the footer holds one résumé slot. Updates land here as a binary copy via the sync queue rather than a hotlink to a GitHub raw URL. On-domain serving keeps the URL clean (`erclx.dev/resume.pdf`) and removes a third-party dependency from the footer CTA.

### Cloudflare Pages over Vercel or GitHub Pages

The apex domain already lives in Cloudflare. Pages attaches the custom domain without DNS migration and serves both the apex and `www` from the same project. Vercel and Netlify would require pointing DNS away from Cloudflare or running a CNAME-flattening dance. GitHub Pages handles static fine but offers no per-PR previews and ties the project lifecycle to the repo settings rather than a host project.

### Deploy from GitHub Actions, not the Cloudflare Git integration

`cloudflare/wrangler-action` runs after `static-checks`, `unit-tests`, `build-verify`, and `e2e-tests` pass. CF's native Git integration would deploy on every push without honoring the test gate and would build in CF's environment with a separate bun version. Direct upload from Actions keeps the test gate and the build environment unified with CI.

### The vector serves the tab, and the rasters serve the surfaces that composite

The mark is a lowercase e followed by a block cursor, drawn in this repository
rather than synced from the parent checkout. `src/assets/brand/mark.svg` is the
one drawing and `scripts/brand.ts` renders it to rasters, so the tab, the home screen,
the avatar, and the bar cannot drift.

The vector leads the icon relation, which reverses a decision this file carried
until 2026-08-22. That decision was correct about the artwork it measured: the
synced mark was 268 stippled dots inside a 512 disc at a median radius near 6.7,
so at 16px each dot covered roughly 0.14 of a pixel and a cream dot over a
near-black ground averaged to mid-grey. It peaked at luminance 129 at 16px and
148 at 32px with zero pixels above 180, against a purpose-built 32-square raster
peaking at 221 and 255 with 30 and 152 such pixels.

Re-taken on the new mark with the same instrument, the vector peaks at 239 with
48 of 256 pixels above 180 at 16px. It beats the raster that replaced it. The
finding was never about the format, and reading it as a rule about SVG is the
mistake to avoid: it was a fact about a drawing whose detail could not survive
the size, and three shapes survive it. The stippled numbers stay above because
they are still true of that artwork.

Declaration order still does not decide which icon an engine draws. An engine
that reads the vector never requests the raster, which is why the 32-square PNG
is a fallback for engines that ignore an SVG icon rather than a first choice
that ordering could protect.

The vector carries its own cream ground with a dark mark, which is what every
brand raster does, so all four assets agree.

The bar is the one surface that takes no ground, because it is the one surface
this repository paints. A ground exists for a canvas nobody here controls, so
inside the site's own chrome it would be a cream plate laid on the page, and the
mark takes the theme's foreground instead. It renders at 24px, above the 20px at
which this drawing resolves as a letter.

The mark sits inside the way-home control and outside the name slot, which are
two different boxes and only one of them is measured. A logo in a bar is a thing
readers click, and a decorative mark against a live name is a dead 24px target
beside a working one. Making it its own link would instead put two adjacent
controls on one destination. The group is therefore the control, at 79x44 on
both bars, with the mark `aria-hidden` inside it so the accessible name stays
`Eric Le`. The name keeps its own marker because the flying name is measured
against that box, and moving the marker up to the group would hand the handoff
the lockup's left edge and land the name on the mark. Measured at 1280, the
flyer still lands 10px clear of the mark in both themes and the two centre to
0.0px.

The bar switches on rather than fading, and its ground is what fades. The name
and the toggle reach that row by riding the scroll, so both are placed and fully
opaque the moment they arrive, and a mark fading up beside them was a third
timing on a row that already had one: measured at 1280 it ramped 0, 0.84, 1
across the same 40px in which the name had already landed and stopped. It now
reads 0 then 1 with no step between, against a ground still passing 0.77.

Moving the opacity off the bar and onto the row is the version to avoid, and it
was built first. Reduced motion gives the name slot its color back, so a row
held visible by an always-opaque bar carries a second name through the whole
hero. Keeping the switch on the bar and the fade on the ground gets the same
arrival with nothing revealed early, since the ground is drawn at zero, the name
slot paints its text transparent, and the toggle slot is an empty box.

Transparent and theme-adaptive shipped first and is not reliable. A favicon
resolves `prefers-color-scheme` against the browser while the tab strip takes
its color from a theme set separately, and the two disagree routinely: the
operator's browser reported dark against a light strip and the mark rendered
cream on white and vanished. The same mismatch the other way puts dark ink on a
dark tab, so the failure is symmetric rather than a light-mode bug. A ground
removes the dependency instead of betting on two independent settings agreeing.

A disc was rejected and a rounded square was not, which is one distinction
rather than two. Inscribed in 16 pixels a circle leaves about 11 for the mark
and the letter reads cramped, where a square keeps the frame and costs the
drawing 16% of its scale. The earlier reading against a ground was arithmetic
about circles applied to grounds in general.

What it gives up is the swap, and the measurement that justified the vector
leading is unaffected: that reading was of whether the drawing survives 16
pixels, which is a property of the artwork rather than of what sits behind it.

The two other ground-carrying rasters take the same cream with a dark mark. A
home screen and a profile host both composite onto a canvas this repository does
not control, and
the dark surfaces are the ones where an edge disappears: Discord sits near
`#313338` and GitHub dark at `#0d1117`, both close enough to this site's own
dark theme that a dark disc dissolves into the page. Cream stays a defined shape
on both, and on GitHub light it separates on warmth against white.

Two defects shipped between authoring the mark and it reading as a letter, and
both are worth carrying because neither was caught by the checks in place.

The drawing was tuned inside one frame and authored inside another. The tail
angle that holds the counter open was measured on a box the mark nearly filled,
then the shipped file squared its frame and added margin, dropping the letter to
60% of the frame height. At 16px that takes a fifth off every stroke and the
counter closes. **Re-measure after changing a frame**, since every figure behind
a small-size decision is a ratio between the drawing and its box rather than a
property of the drawing.

Then a CSS declaration outranks a presentation attribute in SVG. One rule
carrying `fill` overrode the `fill="none"` on the stroked paths, so the bowl
filled and the mark shipped as a solid disc with a bar. The stroked paths and
the filled rect take separate classes for that reason.

**The second one is the lesson rather than the bug.** It made the mark fail
while making the guard pass, because a filled disc carries more ink than an open
letter and the check in place counted ink. A measure that rises as the thing
fails is worse than no measure. What catches it is a guard on the property the
drawing is actually built around: `e2e/favicon.spec.ts` counts enclosed holes in
the rendered pixels, so a letter with no eye fails whatever its coverage, and it
found this on its first run.

`public/avatar/` is served at the domain root and no visitor navigates to it.
It sits there because a profile host wants a file to upload rather than a URL
to embed, and `public/resume.pdf` already sets that precedent. What the folder
now holds and why is its own entry below.

The reduction path the earlier entry barred also turns out to cost almost
nothing here, measuring 57 bright pixels against 48 for a direct draw. Each size
is still drawn at its own dimensions, because that is what stays true if the
mark ever gains detail a reduction would average away.

Measured at e8d1d97 on 2026-08-22, where the arrival and lockup figures were
read and the luminance figures above were carried forward from 0b7e7bd
unchanged.

### A figure joins the page's own family, and a guard answers to what it guards

The experience section carries a cast of small figures in its margins. The
decisions worth keeping are not about the drawing, which
`.claude/context/agent-cast.md` holds, but about two things this run got wrong
first and about a class of instrument defect it hit five times.

The fill is the page's own. The dog fills at `#d4a574` and so does the
airliner, neither inverts with the theme, and the standard already says the
palette is derived from the artwork the site ships. The cast was the third
figure and the only one outside that family, and four passes were spent picking
a color for it before the answer turned out to be membership rather than a
value. What made those passes go wrong is worth more than the result. A brand
fill was rejected for matching the employer marks at 1.10:1 in dark, which was
real, and the constraint was then carried into the light theme where it does not
hold: measured in oklab the rejected fill sits 0.194 from those marks and every
later candidate between 0.12 and 0.22, so all of them separate. A contrast ratio
is a luminance comparison and cannot see hue, which makes it the wrong
instrument for whether a reader tells two drawings apart and the right one for
whether a shape separates from what it sits on.

An inverting ink then replaced the brand fill on the reading that no fixed color
clears 4.5:1 in both themes. The arithmetic was right, at a ceiling of 4.02:1,
and the floor was wrong. 4.5:1 governs text and every figure here is decoration
hidden from assistive technology, so the shipped pair at 2.03:1 was the
precedent rather than the exception.

Motion is bound to expression rather than assigned, and what runs unattended is
bounded rather than absent. One term rests, a scale rather than a travel so
there is no speed for the ambient band to apply to. Everything expressive is a
reaction, and a scheduler fires one of those every few seconds with nothing
touched.

That split decided how it is guarded. Shortening the reactions put twelve of
them inside the barred band and it looked like twelve defects. It was the guard
measuring the wrong population, and the reason is worth stating carefully
because this entry stated it wrongly first. It said a reaction is exempt because
it carries a fixed reference, namely the pointer that caused it. That was true
of every reaction at the time and it was never the ground. **What exempts a
reaction is that it is brief and ends on its own**, so it crosses the band
rather than sitting inside it, and the band bars sustained movement rather than
movement. A pointer is one thing that can start such a term and was never what
made the term acceptable.

Reading it the other way is what an unattended reaction breaks. One fired on a
schedule has no pointer behind it, so an exemption grounded in the pointer does
not reach it, and the record would say reactions are exempt because a reader
caused them while some of them have no reader. The guard was already measuring
the right thing: a behavior declares its kind, an idle term answers to the band,
and a reaction answers to being brief and visible, which is the defect its own
class actually has.

A scheduled reaction owes two things the pointer used to supply. It never runs
beside another, since two at once is a margin performing rather than a figure
acting. And it stands down while the section is off screen, under reduced
motion, and while a reader's own pointer rests on a member, so a hand present
outranks the schedule.

**Read the instrument failures as one class rather than five incidents.** Each
was a measure that passed hardest when the thing it watched had failed. A
coverage check counted file bytes and reported full coverage for an empty box. A
second counted alpha from a capture that had none. A placement check read
bounding boxes and passed on six members while five were unpainted. A rate check
found no rate for a behavior whose selector matched nothing, and reported it as
absent rather than as broken. A band check measured a grid at 132px while the
cast ships at 54, which crosses the barred band faster and reads laxer than the
page. The pattern is that an instrument reporting nothing wrong and an
instrument reporting nothing at all are indistinguishable unless something
proves it can still fail. `e2e/cast.spec.ts` therefore hides a member and
asserts the coverage check reports it, and fails when any behavior in the
vocabulary moved nothing.

Two harness rules came out of it. Speed measured off a bounding box scales with
the target, so an instrument reads at the smallest size that ships and a floor
is expressed against the target's own width rather than as a flat number of
pixels. And the harness reads the page's own stylesheet rather than restating
it, because a copy of the keyframes drifts within a pass and the drift is
invisible while both still animate.

Verified at 1280x800, 1440x900, and 390x844 across chromium, firefox, and
webkit, where the full suite passes 183 and the cast's twelve guards pass on
every engine.

### A slot is decided by what it needs a clock for, and sameness is counted rather than compared

The cast gained two slots and a face pass. What is worth keeping is why each
slot sits where it does, and one instrument that answered a different question
than the one asked.

A power is a slot rather than another mark. A mark's box is 17.6px across on the
smallest member and anchored to the head's top right corner, so nothing that
surrounds a body fits in it, and the aura meant to power the lead up drew a
small comb beside his ear. Gear is a slot rather than a hat, because a hat is
the only signal separating a lead from a worker and loading it with a sword
spends that signal on flavour.

**What decides whether a slot joins the member's drawing or gets its own is
whether it needs a clock.** A power pulses while the body does something else,
so one SVG carrying both makes the two animations fight, and it draws behind on
its own layer. Gear moves with the hand holding it and stays inside. The same
test settles a slot nobody has drawn yet.

That split then paid twice. Held inside the member's box a power cannot be
larger than the figure emitting it, and served live at that size a blaze read as
a fringe rather than as anything the lead was doing. Its own layer takes its own
padded viewBox. And a candidate can be swapped without re-rendering the member,
which is what let the whole vocabulary be driven from the running page.

How far it reaches is a placement number rather than a drawing one. A cluster
reserves the reach twice, once as clearance from the reading column and once in
its own width, so its footprint grows by twice the overhang. At three cells the
88px member's cluster ran 12.6px past the margin the rail and dock leave at
1280, which the existing cluster guard caught. Two clears the column by 12px and
the dock by 7px. A larger reach costs a placement change rather than a drawing
change, since what does not fit is the cluster.

**The instrument lesson is the one to carry.** The complaint was that the cast
read as one face repeated, and pairwise pixel difference found it: five of seven
members sat within 8.4% to 12.8% of each other. It is useless as a target.
Every pair in this cast lands between 8% and 12% whatever the faces say, because
a head is mostly body fill either way, so two rounds of work moved the mean from
21.2% to 21.6% while the faces changed completely. Counting members sharing a
feature is the measure that tracks what a reader sees, and it named the actual
defect on its first run: four of seven wore the identical flat mouth. No
pairwise figure pointed at it.

A measure can be right about a problem and wrong as a target. Read the first
number to find the defect and a different one to know whether it closed.

Two errors on this branch are worth naming because both were made after the rule
that forbids them had been written down. A candidate lead face was argued down
for sharing `happy` eyes with the member standing beside him, and the next
change gave a different member exactly that pairing, producing a 4.8% pair,
closer than anything the cast had held. And a mood added to `MOODS` without a
`TEMPERAMENTS` entry fails the build at render, which is loud, while binding
`emote` to a mood carrying no mark is silent and fires a reaction that animates
nothing.

A later pass on the same section found the reason three rounds of expression
work had moved nothing, and it was not the expression. The lead paints 3396px²
against the horned member's 4012px², so he is the second heaviest figure in a
margin he is meant to lead. A face is a few hundred pixels inside a silhouette,
and no face wins an argument the silhouette is losing. **Measure the thing that
dominates before redrawing the thing that decorates.**

Nothing available closes it on its own. His power is already the heaviest in the
vocabulary, so every alternative makes him lighter. The best of three new hats
buys 223px² against a 490px² gap. Growing him fails the margin guard, since his
cluster holds 2px of headroom at 1280 before it meets the rail. What is left is
trimming the figure that outweighs him, which is a decision about another
member rather than about him, and it stands open.

Two rules came out of the same pass and both are about transitions rather than
states. **A tap escalates a face rather than replacing it**, which is what the
sleeping member always did by waking surprised rather than waking as somebody
else. And **which way a pair runs carries the meaning**: wide eyes settling to
points reads as gathering, and points widening reads as being startled, so the
same two faces say opposite things depending on which is at rest.

The third is about the layer rather than the drawing. A power is a sibling drawn
behind the member and it does not move when the member does, so a cell stopping
at the silhouette tears open the moment a behavior displaces the body. It passes
under instead, far enough to cover the furthest any behavior travels, **and
inward only**: a bar crossing the whole body comes out of the far side and the
member reads as caged, which is worse than the gap it closed. Both halves were
needed and the first shipped alone.

Measured at 1280, 1440, and 1920 across the seven members, where no two share an
eye or a mouth, every power and gear cell fits its box and clears the 3px stroke
floor, no power layer crosses the reading column, and the cast's eighteen guards
pass.

### A landing-page figure sits inside the text column, and marks derive from type metrics

A figure hanging into the page margin reads as an off-centre section even when the text column measures perfectly centred. The origin timeline shipped a graph in the right margin, measured centred at 672px with equal gaps at four widths, and the operator still read the section as offset because the section's visual mass sat right of its text. The graph is gone and the timeline carries a rail in its own row gutter instead, which also fixed what the figure could never do: the dots sit on their rows by construction rather than at hand-placed coordinates that could not track rows running 87 to 147 pixels apart.

The same principle sends the header portrait inside the content column rather than into the margin beside it, floated within the headline so its top edge is the headline's own top at any width.

A mark that has to line up with type takes its position from type metrics rather than from a measured constant. The origin dot centres inside a box one line-height tall, each rail segment runs from that box's centre to the next row's, and the status dot centres on a box one cap-height tall resting on the label's baseline. Three literals were removed to get there, and each had encoded a relationship that a change to the type scale, the marker size, or a control's tap height would have invalidated with nothing reporting it. Both marks measure where they are meant to sit: the status dot lands 0.0px from the cap centre and the toggle 0.8px, and the rail joins its dots to the pixel down a five-row list.

What is banned is a literal standing in for a relationship two other values already fix, such as a nudge centring one element against another. Arithmetic over named values is the sanctioned form and is how the rule is kept, which is why a rail segment spans `calc(1lh / 2)` to the next row rather than a measured offset. A value that sets something rather than relating two things stays a literal, including spacing, type sizes, and the 44px tap minimum.

An earlier draft of this entry claimed a line box centres about 2.5px lower than uppercase text. That figure is not reproducible: measured against this label at 14px, the two centres disagree by 0.3px, and the visible improvement came from the restructure and the tighter leading rather than from the offset the number described. Verified at 139af4f on 2026-08-17.

The heading says landing page because the case-study routes take the opposite treatment, and the two do not conflict. What made the origin graph read as off-centre was a figure sitting beside its text rather than under it, so the section's mass fell to one side of its own column. A case-study figure stays centred on the prose it interrupts and overhangs it symmetrically, measured at 0px of centre offset across five widths. The landing page also varies its measure per section and has other ways to break a column, where a case study holds one measure for thousands of pixels and has none. Read the rule as barring a figure that pulls a section off its axis rather than as barring width.

### The timeline holds its rail at every width, in three tiers rather than two

The experience timeline switched its gutter off below 768, which took the rail
and all six dots with it. Every beat then read as four stacked lines, a span, a
head, a detail and the chips, separated by 28px of padding and nothing else,
with the span sitting at the head's own left edge and the head's own size so it
read as a paragraph rather than as a date. The entry above records the rail as
one of the two lines kept deliberately, because it is the only element saying
the beats are a sequence and the active-row highlight attaches to its dots. Both
of those were absent across the whole band.

The band was never described. The surface carried one wireframe, headed
`Desktop (≥768px)`, so nothing stated what a narrower reader was meant to see
and the collapse was invisible to every review that read the document. Two
variants now carry it.

Width was not the constraint, which is what makes this a missing tier rather
than a necessary fallback. The row measured 558px at 620 and 690px at 767,
against the 455px reading column that 768 was content with. The middle tier
therefore keeps three columns and narrows the two it can, and at 767 it hands
the reader 498px of reading column, more than the tier above it.

The span is what forced the type step. The widest of the six measures 177px at
the body size against a 184px column, so its column cannot narrow at all while
the span stays at body size. At the label step it needs 146px and the column
holds at 9.5rem. The same step is what stops the span reading as prose on a
phone, where it sits directly above the head rather than beside it.

Below 600 the rail moves to the section's left edge and spans the beat, since
there is no room for a column beside the reading one. That moves what the dot
has to meet: the span leads a beat there where the head leads it everywhere
else. The gutter takes its type from whichever line it is meeting rather than
carrying an offset, which keeps the mark derived in the terms the entry above
sets. Measured across eleven widths from 320 to 1280, the dot lands 0.0px from
its line at every one, the span holds one line throughout, and nothing scrolls
sideways.

What the middle tier costs is reading width at its own bottom end. At 600 the
head runs 348px against the 511px the flat stack gave it, so it wraps to two
lines where it had one. That is the trade the tier is, and it was taken
deliberately: a beat wrapping is legible and a list of six paragraphs claiming
to be a timeline is not.

A 43px step survives at 768, where the reading column goes 498px to 455px as the
window grows, because the span column and the gutter widen while the container
is already capped. It was a 235px step before this change. Closing it means
moving the widest tier's own columns, which nothing has asked for.

Measured at e9f68e5 on 2026-08-22.

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

A reveal reaches that wait in three states and the transform distinguishes two of them. An element parked at its pre-reveal offset and one moving through that same offset report one matrix, so reading the transform alone cannot tell a reveal about to run from a reveal that will never run. The second is reachable: a refresh restores the scroll, the hero lands above the viewport, and an `IntersectionObserver` only ever reports an element becoming intersecting, so nothing will mark it for the life of the page. Waiting there can only expire. Measured at 1440x900, that held the bar's slots empty for 3057ms against 876ms on a fresh load, and 3582ms and 3435ms in Chromium and WebKit against the built page. Firefox does not restore the scroll under automation and never reproduced it.

The state is read off the reveal marker with the row's position as the tiebreak, so an unmarked row still on screen is waited for and an unmarked row scrolled past is not. Treating every unmarked reveal as settled is the repair to avoid and it was built first: it takes the mid-page case to 210ms and places the name at its landed position while the row around it is still rising, which a reader sees as the title correcting itself after everything else has arrived. That is the defect the entry above this one records, arriving by a second route, and the guard against it asserts the hero has reached full opacity by the time placement announces itself rather than asserting any duration.

The wait is also watched on both anchors rather than one. It read the toggle's reveal alone while measuring the name's box as well, and the two settle 190ms apart at 1280x800.

The toggle's home slot holds no size of its own, so once the control is promoted away the slot collapses to a point and every re-measure after the first reads that empty box. The control is returned to its home for the reading rather than the slot being given a reserved size, so the control's own box stays the one source of the hero position.

That home is the header's own corner rather than a text row. The greeting moved under the name on 2026-08-19, and the portrait floats flush to the column's right edge for 160px from the heading's top, so no row under the name has a free right side to centre a control against.

Neither condition placement waits on is guaranteed to arrive. A stalled subresource holds readiness open, and the reveal is driven by an observer in `projects.astro` that does nothing without `IntersectionObserver`. The wait therefore gives up after three seconds and places the control anyway, rather than spinning a frame callback for the life of the page and leaving the bar's slot empty.

Measurement needs no scrolling. An element in flow states its position at rest as its own offset plus the current scroll, and the bar is fixed and already reports what the paint clamps against. An earlier draft scrolled the page to 0 and back on a resize listener, which fires per pixel of a window drag and once on a phone when the address bar collapses mid-scroll, so it yanked the page under the reader and cancelled the bar's own smooth scroll home.

The bar's reveal keys to half the hero rather than half the viewport. A hero shorter than half the viewport clears a viewport-keyed margin without being scrolled at all, which at 390x844 put the bar on screen carrying the name while the reader was still looking at the hero carrying it. Reading the intersection ratio keys the same moment to the hero's own height and needs nothing measured. The rail keyed to half the viewport too, and it no longer does: see `.claude/context/section-nav.md` § Reveal gate for why that coincidence broke and what it derives from now.

Both controls run on the name's travel, and the bar's arrival gate reads that one distance. A control carries its own travel only where that travel describes the move a reader sees. The toggle's corner sits 28px above the bar's slot and 216px to the right of it, because the corner aligns to the viewport where the bar aligns to the content column, so its own vertical distance is the wrong clock twice over: driving the crossing off 28px sent the control across the page inside a thumb's worth of scroll, and gating the bar on the same 28px opened it after 28 pixels while the name was still 300 down the hero. Taking whichever control landed first was the earlier form and it fails the same way, since the nearer distance is the one that describes nothing. At 390 the column is wider than the viewport, the two anchors coincide, and nothing crosses at all.

The toggle interpolates its position rather than riding the scroll. Riding it, as the name does, lands the control after those same 28px whatever the progress clock says, which is the same defect reached by another route.

`measure` reads the name's geometry whether or not the name flies, and the visual takeover of the real name is a separate call. The two were one function, skipped together under reduced motion, which left the distance at its default of 1 once the toggle and the gate began reading it and snapped everything on the first pixel scrolled.

Verified at 1280x800 and 390x844 across chromium, firefox, and webkit at f10cfb7 on 2026-08-19, and the placement-wait figures re-read at 1440x900 on all three engines on 2026-08-22.

### The merge gate runs every engine the suite defines, as a matrix rather than one job

The e2e job fans out over chromium, firefox, and webkit, one job per engine, so a failure names the engine it came from without anyone parsing a combined report. A matrix rather than one job running three engines, because `playwright.config.ts` pins `workers` to 1 under CI: a combined job would run all of it serially and multiply the two retries on top, where three jobs each hold one runner at one worker. It costs three runner slots per pull request against a defect class this project shipped three times behind a green single-engine job, twice more caught only by hand.

Widening the engines closes half the class. A rule silently taking its touch branch breaks no assertion, so a hover path is asserted reachable beside each rule that writes one, and the `pull_request` branch filter came off in the same change because a gate that never fires on a stacked pull request runs no engines at all. `.claude/context/ci.md` carries the cache trap, the local worker-count hazard, and the pointer-query form the fix settled. Measured at d91ba03 on 2026-08-21 with this branch applied, where all three engines pass the full suite at one worker: 455 passed, 1 skipped, 0 failed in 4.0m.

### The header signature is an authored shader, and the same drawing runs under the whole page

The header drew a particle flow field on a 2D canvas. It is now a fragment shader rendering contours of a 3D noise stream function, lit by the gradient of its own line width. `.claude/context/shader-field.md` carries the mount lifecycle and the uniform contract.

Two things drove the replacement and neither is that the old one was broken. The particle field cost a per-frame simulation to draw a texture with no relief, and the page needed a visual language it could carry past the hero, which a field of moving points cannot be quieted into. A shader gives both: the relief comes free from a value the contour pass already computes, and the whole surface can be held to one frame at a fraction of its weight.

The medium was not the problem the first attempt solved. `.claude/DESIGN.md` rejected shader work outright until this branch, on the reading that a shader is a preset. What is actually rejected is the shortcut, and an authored field with its own stream function and its own lighting is not one. The standard now says so.

The still copy mounts from the layout, so it reaches the project routes as well as the landing page. It damps inside the reading measure, tracking `--prose-column` rather than a fixed strip, because a route scales its column and a landing section does not. How hard it damps walks down with viewport width, since the field's scale divides by that width and one fraction therefore covers more contours the smaller the screen gets. See `.claude/context/page-ground.md` for the measured cost, which is 16.16:1 to 15.74:1 on body text.

Keying that curve to the column's share of the viewport instead is the mistake to avoid, and it shipped once. The column caps at the viewport, so its share pins at 1.0 from 768 down and the curve freezes exactly where the complaint came from: measured in dark, mean weight fell to 0.12 at 768 and rose back to 0.20 at 390, leaving a phone the least damped narrow screen while the code read as though it damped hardest. Read it as the general case rather than as one bad variable. A quantity that saturates before the range ends looks correct wherever it was measured, and share was measured at three wide widths where it still moves. Measured at 12eb2d0 on 2026-08-21, where mean weight falls 0.39, 0.33, 0.24, 0.04, 0.03, 0.03 across 1920, 1366, 1024, 768, 560, and 390.

A click disturbs it, and the disturbance is added to the stream function rather than to the drawn output. That one placement is what makes the field keep evolving underneath the wave, bend where it crosses, and recover with nothing restoring it, so the behavior falls out of where the term sits rather than being written. Painting a ring over the surface would have needed all three coded and none of them would have interacted with the field at all.

Its depth was settled by serving four tunings live and letting the operator drive them, rather than by comparing recordings. A recording answers what a gesture looks like, and the open question was what it feels like to cause. The parameter and the switcher that served them were removed with the pick.

Depth is not a free parameter. It sets how far the stream function is pushed and therefore how many contour levels one lobe crosses, so the rings a reader counts are about depth times `lineCount`. The first build at 0.5 drew thirteen and read as the surface breaking up rather than reacting.

Three tuning defects are recorded in that entry rather than here, because each is a fact about the field rather than a decision. The one worth carrying up is that two separate motion instruments read the field as still while it moved, and the operator's eye was right against both. A metric that reports no difference across presets that visibly differ is measuring the wrong quantity, and the fix came from finding a sheen drifting at 58px/s over a field at 15px/s rather than from raising any rate.

Measured at 502da58 on 2026-08-20, at 1280x800 and 390x844 across chromium, firefox, and webkit.

### The portrait sits in the field rather than under a drawing of it

The rings around the header portrait were a `repeating-radial-gradient` in one
flat ink at one thickness, tuned to match the field's peak contour weight and
swelling once every 13 seconds. They are contours of a mound the shader adds to
its own stream function now, so the field's lines close around the photo and
open back into the terrain where the mound runs out.

The placement is the decision and it is the one the click ripple already made.
Contours are extracted after the term is added, so the relief lighting, the
height tint, the sheen, and the pointer's reveal all reach the rings for free.
Nothing was written to make them bend where the terrain bends, or to make them
crowd where the mound falls fastest and part as it levels. A ring drawn over the
field gets none of that and needs each of them coded, and then needs to be kept
in step with a field it cannot read.

**Two CSS arms were built to the opposite thesis and both were driven and
rejected.** Each shaded a conic gradient masked by the ring lines, which is the
exact translation rather than an approximation: the mound is radially symmetric,
so its normal runs straight out from the centre and Lambert shading reduces to
the cosine of the angle from the light, which is purely angular. They imitate
relief convincingly. What they cannot do is read the field, so a later retune
leaves them behind with nothing reporting it.

Capping their lit arc at the flat ink's own value is the mistake that nearly
settled this, and the reasoning that produced it is in this file. The flat ink
was tuned against the field's peak, which is the right comparison for an ink
that never varies and the wrong one the moment it does. Peak against peak cost
28% of the mean and handed the operator two arms that were dimmer than the
baseline before they were anything else. Held to the mean instead they measure
0.97 and 1.05 in light, 0.93 and 1.06 in dark.

Weight is a separate question from the drawing and one arm confounded them. The
column damp exists so the field never competes with the name and the photo sits
inside the box it covers, so some lift is what makes the rings visible at all.
At full lift the annulus carries 2.10 times the retired ink in light and 2.13 in
dark, which is louder beside the name than this surface has ever been, and an
arm rejected there says nothing about whether the drawing is right. A second arm
at 0.30 holds 1.65 and 1.39, and the pick came from driving the two rather than
comparing stills, since weight is what a still is worst at separating.

The 13s swell is gone rather than moved. It was a second clock over a surface
that already has one, and the field now evolves under the rings so they breathe
with it. Reduced motion needs no special case for the same reason.

What it costs is warmth. The rings take the field's tone where the retired ink
took `--accent`, measuring 12.6 of red over blue against 17.7, so about 71%
survives rather than all or none. Tinting the ring contours back toward the
accent is queued rather than built.

**Three guards were written for this and two of them passed against a page with
the rings switched off.** That is the class this file already collects, reached
twice in one sitting. The first compared ink in the annulus against a patch of
plain field and was reading the reading column's damp: the annulus sits inside
the column at 0.4 and the only nearby patch wide enough to sample sits outside
it at 1.0, and no control patch escapes that because the photo sits against the
column's right edge by construction. The second counted turns in the radial
profile, where averaging around a circle leaves fluctuations that are each a
local extremum, so the count cleared any floor worth setting either way.

What works is amplitude at the ring scale. Averaging luminance around a circle
keeps a line that follows it and washes out one that crosses it, and detrending
against a window wider than the ring spacing leaves the ripple alone. It reads
0.6336 against 0.0355 in light and 0.8007 against 0.0301 in dark with the mound
zeroed, an eighteen to twenty-seven fold separation where the two failed guards
had none. **Zero the thing and watch the guard fail before trusting it**, which
is what caught both.

That guard skips WebKit and says why. Headless WebKit composites this page
without the canvas: a patch of pure field returns a luminance spread of 0 there
against 57.1 and 56.1 in the other two, so every pixel a WebKit capture carries
is the CSS layer alone. It looked like a page defect first, two arms coming back
byte identical and below baseline, until a probe found WebGL available, the
canvas visible, and the fallback not shown.

One cost this entry asserted and then measured away: the rings drawing under the
content column rather than over it. Across six widths from 390 to 1920 they
never reach the name at all, closest at 181px against a 94px reach.

Measured at 1280x900 on 2026-08-24, with the full landing suite passing 188 and
skipping 1 across chromium, firefox, and webkit.

### Contact travels with the reader, in the margin opposite the rail

The hero opens with three destinations and nothing else on the page carried them. A dock in the right margin carries them plus the resume, arriving on the same half-hero gate the sticky bar uses and holding to the bottom of the page.

An earlier draft of this entry said the footer closed with those three, and the dock stood down over the footer on that basis. The footer carries the resume alone, measured on 2026-08-20, so the gate removed three destinations and replaced one at the end of a page whose job is hiring. Both halves are corrected: the claim above, and the gate that rested on it.

It sits opposite the section rail so the two margins read as a pair. The rail states position and the dock offers reach, which is the split `.claude/REQUIREMENTS.md` § Navigation already draws. Both hold to the bottom of the page rather than the pair breaking there: the rail's own footer gate never earned its complexity and came out rather than getting retuned a third time.

The dock mounts from the layout, so all six surfaces carry it. A route is the longest read on the site and the one a shared link lands on, which is the arrival that skips the landing page and every contact link on it. A route also reveals it at once rather than gating: the gate watches the header for a hero to scroll past, and a route's header is its sticky bar, whose intersection ratio reads 1 for the whole page. A layout mount alone would therefore have shipped a control that never arrived on five surfaces of six.

The resume is in the dock and stays in the footer, which is the one duplicated destination and is deliberate. It is the highest-intent link on a page whose job is hiring, and it previously existed once, as the last thing on the page.

`.claude/context/contact-dock.md` carries the tap-target and pointer-events gotchas. Copying the rail also copied a footer gate that had never fired, since it watched a root capped to the top half of the viewport for an element that sits at the bottom of the last screen. Both controls were fixed on the one reading, which is the argument for building the second control from the first rather than beside it.

### A line is drawn where it divides, and a bound is revealed rather than drawn

The page carried an outline on every project card, a rounded plate under the hero band, a rule under the sticky bar, one over the footer, and one per row in the closing ask. All but the last came out, because none of them divided anything a reader compares. They stated where surfaces ended, which whitespace and a fading ground already state.

Removing an outline removes the only thing saying where a card ends, so a pointer lands on nothing. What replaces it is a shape lit under the pointer alone, inset outward from the content and drawn behind it, so the grid stays borderless at rest. That shape has to fit the gutter: at a 24px gutter its own box met the neighboring card exactly and its shadow crossed 36px into it, so pointing at one card lit the one beside it. The gutter is 48px and the shape reaches 44px.

It leaves slower than it arrives, 520ms out against 130ms in. A reader moving between two cards sees the one behind them still lit, which reads as a trail rather than as a lag.

Two lines stay and neither is an exception left behind. The closing ask keeps the rule above its criteria because a character is occluded by it, which makes it a ledge a drawing rests on. The timeline keeps its rail because it is the one element stating the beats are a sequence, and the active-row highlight attaches to its dots.

`.claude/DESIGN.md` § Borders carries the three tests a line has to pass to stay. Measured at 502da58 on 2026-08-20, at 1280, 1024, and 390.

### The focus ring is the site's own, and its shape comes from the control

The sweep above measured what a pointer does to 87 controls and never asked what a keyboard does to any of them. Measured the same way on 2026-08-22, across six pages and both themes, 222 focus probes returned exactly one ring and it was the component library's default blue. `--ring` and `--primary` hold one value, and `--primary` is painted only by the unreferenced React component two entries up, so **the only blue a visitor could ever see was the one a keyboard reached.**

That is the general case rather than a fact about this token. A pointer response is met on every pass over the page and a focus ring takes a Tab, so a library default in that slot survives every visual review by construction. `e2e/focus-inventory.ts` exists so the question gets asked without anyone remembering to.

The ring takes the accent, which measures 5.48:1 in light and 5.42:1 in dark against a 3:1 floor for a non-text indicator. Contrast was never the defect: the blue read 8.42:1 and 6.53:1 and cleared the floor comfortably. A ring can answer to the rule and still belong to another site.

Shape was the other half and the larger one. An outline follows its element's own radius, and 40 of the controls declare none, so the ring drew a rectangle around the rounded chip sitting inside it. A radius floor in `@layer base` fixes that without a list of components: an unlayered component rule and a Tailwind utility both beat a layered declaration, so a control carrying a shape keeps it and only the shapeless ones take the floor. Measured, the rail row holds 999px and the dock and toggle hold their full round, while the chip hit, the hero links and the card links move from 0 to 8px. Raising that rule out of the layer squares off every round control on the site, and no assertion about the ring's color would report it, which is what `a control with a shape of its own keeps it when focused` guards.

The glow lands by the same rule and that is the reason for choosing it. A control already answering with a shadow of its own keeps that answer and one that had none gains this, so focus and hover speak one language without either overwriting the other. Two candidates were served live from `src/components/dev/scenarios.astro` rather than composed into a sheet, because the still could not separate them: the question was what the glow does across a run of controls a reader tabs through, which only a reader tabbing can answer.

The glow reaches an inline link, where the hover response deliberately does not, and the two-tier split above governs hover alone. That split exists because a ground behind a word reads as a highlighter and fights the sentence around it, which is an argument about a fill rather than about a shadow, and it can afford to be selective because a pointer is already over the thing it marks. A focus indicator cannot: it is the only thing telling a keyboard reader where they are, so it reaches every control or it fails the one it skipped. Read the tiers as answering different questions rather than as one rule two surfaces state differently.

`--light-ring` now resolves to the light accent rather than holding a value of its own, so a control focused inside a chart plate carries the site's ring at 6.4:1 on the white that plate holds.

The ring's floor is read against every ground it can sit on rather than against the page alone. It sits on the two bars, the rail's active row and the dock as well, and the branch below this one moves exactly those surfaces, so a reading taken against `body` would have gone on passing while the thing under the ring changed.

Two instrument defects came out of writing the guard, and both are the same shape as the ones this file already collects. `outline: none` resets the width to `medium`, which engines report as 3px while drawing nothing, so a check reading `outlineWidth` sees a ring on a control that has none: read the style. And a rule added to strip a ring has to win a cascade against a layered declaration and a user-agent default, so the strip is written inline, where nothing outranks it.

After the sweep, the same instrument reports 0 controls with a square ring against 40 before, 0 with no ring in either state, and one ring color across all 222 probes.

Measured at 63bfea1 on 2026-08-22, at 1440x900 across chromium, firefox, and webkit.

### One ground for two bars, and the shape moves while the row does not

The landing bar and a route's bar diverged the moment the first was rebuilt, so a reader crossing between them met a thinned ground with no rule on one side and a near-opaque ground under a hard line on the other. Both now render one shared ground rule rather than a copy per component.

The ground has to separate from the page, which a ground taken from the page cannot do. Drawn from the background token it measured 1.002:1 against what sat behind it in light and 1.003:1 in dark, which is to say the page laid on the page, and only the text inside it said a bar was there. Blur cannot rescue that, since blurring a flat field returns the same flat field. It takes the elevated surface token, and the detached shape carries an edge and a shadow.

Two values pull against each other and were settled together. Prose passing under a lightly tinted bar reads through it as letterforms, which is what a near-opaque ground used to answer, and a wider blur answers it instead by destroying the letterforms while the backdrop still reads as a wash. Widening it further is not free: at 40px the radius averages in the dark gaps between project cards, which darkens the ground under near-black text and drops the light theme to 4.35:1. The pair sits at 0.88 over 24px, holding 5.02:1 in light and 8.16:1 in dark on the landing page and 4.83:1 and 8.30:1 on the densest route. This entry read 0.85 until 2026-08-22 against a stylesheet that has held 0.88 throughout.

The shape contracts and the row inside it does not. The hero flies its name and its theme toggle into that row's slots at measured positions, and the three defects the decision above records all came from measuring against a bar that had not settled. Measured at 1280, the name slot holds left 256 and top 12 in both states while the ground goes from 1280 wide with square corners to 832 with a full radius. What moves is the one thing nothing is measured against.

The contrast figure that nearly settled this measured the wrong thing. Sampling a fixed strip of the bar read 3.66:1 and moved to 3.70:1 under a near-opaque scrim, because the bar's contents sit in a centred column and the glyph a reader sees is painted by a separate element, so the reading was the ground against itself. A contrast number that barely moves when the ground is replaced is measuring something other than text.

One ground did not mean one behavior, and the gap ran for five days. The shape's own transition, `inset 320ms ease, border-radius 320ms ease`, has sat on `[data-bar-ground]` since 2026-08-20, and the landing bar never received it. Its component asked for the ground's reveal fade with `transition: opacity 200ms ease-out`, and `transition` is a shorthand, so that declaration reset `transition-property` to `opacity` alone rather than adding to the list. Astro scopes a component rule to a `data-astro-cid-*` attribute, which put three attribute selectors against the one in the stylesheet, so the component won on specificity and the shape lost its clock. Measured at 1280 across 31 frames, the landing ground held 2 distinct radius values against a route's 21, on the surface a reader meets first.

**A shared declaration is not shared until nothing can replace it**, which is the general form and the reason the repair is not a second copy. Composing the fade into the component would have worked and would have put the shape's durations in a file with no reason to know them, leaving the next component free to take the list again. All three terms sit in the one declaration instead, and the component declares nothing. The fade is inert on a route, where the ground never fades, and the two states cannot collide on the landing page either: the reveal keys to half the hero and the shape to 320px past its full height, which measures 770px of scroll apart at 1280 and 1440 and 635px at 390.

The record said the opposite and was wrong when it was written. A finding dated 2026-08-22 on this task cut a reduced-motion outcome on the reading that the bar transitions for nobody, since the only timed property was the ground's 200ms opacity and the width and radius switched instantly at every motion preference. That was a reading of the landing bar generalized to both, taken two days after the route bar began easing through the same 320ms. **A claim about one surface is not a claim about the pair**, and the one instrument that separates them is the computed `transition-property` rather than any capture.

The edge and the shadow stay out of the list deliberately and were not added with the rest. They arrive at once on both bars, which is what marks the instant the bar detaches from the viewport, where an edge fading up reads as the bar being unsure whether it has.

Two instruments failed before one held, and both failed by reporting nothing rather than something wrong. A sampled `border-radius` read at a fixed elapsed time returned 0 on WebKit for both surfaces and 705 on Chromium for one, because the landing page runs the hero shader and ticks at 22fps against a route's 60 under a headless composite, so the sample lands wherever that frame budget puts it. A `getAnimations` snapshot then passed against the dev server and missed the landing bar against the built preview, since it asks what is running at one instant rather than what ran. What holds on all three engines is the `transitionrun` event registered before the trigger. It also has to be armed against a settled shape: clearing `data-condensed` is instant while the leg back to full width is itself a 320ms transition, so a trigger sent underneath it is a reversal, which WebKit performs in place and announces to nothing. The guard collected an empty set on a bar that was easing correctly until it polled the rendered radius back to `0px` first.

Measured at 10c511a on 2026-08-25 with this branch applied, at 1280 across chromium, firefox, and webkit, where the shape figures above were re-read and the ground and contrast figures were carried forward from 502da58 unchanged.

### Two token sets carry elevation and response, and every control reads them

The decision above put one ground under two bars. The dock was built after that repair and never received it, so it drew its ground from the background token and measured 1.02:1 against the page behind it, which is the page laid on the page a second time. Both sets of values now sit in `:root` and every floating control and every interactive one resolves them from there.

The elevation set has a ceiling and it is worth knowing before reaching for it. In light the page sits at `oklch(0.968)` and white is 0.032 away, so a fill can barely separate at all: read off painted pixels rather than off composited tokens, a white ground measures 1.038:1 against what sits behind it, where the dark theme's reaches 1.105:1. Anything further has to come from the edge or the shadow. The two themes want different levers for that: in light the shadow does the work and the edge barely registers at 1.06:1, and in dark the shadow is invisible against a dark page while the edge reads at 1.19:1. A treatment answering only one theme was rejected for that reason.

The figures in that paragraph read 1.10:1 and 1.09:1 until 2026-08-22, and both were composites of declared tokens rather than readings of the page. A `backdrop-filter` samples what sits behind the element, so no arithmetic over token values reproduces what a reader sees, and the arithmetic ran about 6% high. Read this ceiling off pixels.

The set carries `--surface-elevated` rather than `--card`, and light no longer puts white in it. `--card` also grounds the chart plates on a project route, which stay white under charts drawn on white, so the two roles needed separating before either could move. What light put in the elevated slot was pure white at chroma 0 on a page at chroma 0.01, which made the bar, the rail's active row and the dock the only colorless surfaces on the site: dark lifts its page and keeps its warmth, and light dropped the warmth entirely. It now holds `oklch(0.988 0.012 82)`, the page lifted with its hue kept, which is the same move dark already made.

The warmth is affordable precisely because the fill was never carrying that reading. It costs 1.038:1 down to 1.023:1, against a shadow and an edge that are doing the actual work, and four candidates were served for the operator to pick from. The one rejected on measurement pushed the alpha to 0.72 for a more ghosted read: the fill fell to 1.004:1, which is the page laid on the page, and the hero's own words became legible through the bar. Ghosting belongs in the blur rather than in the alpha, which is what the pair at 0.88 over 24px already settled.

Two prototype defects on that batch are worth carrying, because both showed the operator a change nobody proposed. An arm written at `:root` reaches both themes, since `.dark` overrides only `--card` and never `--floating-fill`, so the first sheet put a cream ground under the dark theme's near-white text. And an arm scoped by element rather than by the cap under decision rewrapped every project card description alongside the lede it was meant to move. **Scope an arm to exactly the declaration being decided, and check the theme it is not about.**

The response set answers a question the site had never asked in one place. Measured across all six pages, 87 interactive elements answered a pointer three ways, 39 with an underline, 30 with a border and a color, and 18 with nothing, and not one of them glowed. The only glow that existed sat on the project card, which is neither a link nor a button, so no inventory of controls would ever have found it.

Two tiers now, and the test is whether the thing has its own box. A control with bounds takes the card's glow, and a link sitting inline in a paragraph keeps its underline, because a ground behind a word reads as a highlighter and fights the sentence around it. That test is what keeps the hero's three contact links unchanged, and it is what excludes the footer signature: the signature is `aria-hidden` decoration, and a hover response on it would promise a click that does nothing.

**The sweep left one control behind and the tier test did not catch it, because the test decides membership rather than completeness.** The rail row is a control with bounds, took the glow, and moved fill and shadow without ever touching its border, where a timeline chip and a dock control both move theirs to `--accent`. Measured on 2026-08-25 it held 1.08:1 against the ground in light and 1.03:1 in dark, which is no edge at all. It takes the accent now, at 2.58:1 and 2.79:1, matching the active row it sits beside.

The reason it survived is worth more than the repair. `e2e/inventory.ts` groups controls by which properties move, and a rule written on a pseudo-element inherits `border-top-color` from `currentColor`, so a control whose text color changes reports a border change it does not have. The rail rows therefore sat inside the 33-element majority group looking settled. **An instrument grouping by what moved cannot separate a property that moved from one that followed something else**, so a claim about one specific property is read off that property on the element rather than off the grouping.

The set has a ceiling on how much it can ever separate two states, and it is lower than the token values suggest. Held at one edge color, a pointer moves a chip's fill by 5 and its halo by 12 in light against a ground drifting 11 on its own, and by 5 and 15 in dark against a drift of 15. Both are inside the noise, because `--surface-elevated` sits 0.032 from white in light and one step above the background in dark. The border color is carrying essentially all of the response set's visible weight, and a proposal separating two states by fill or shadow alone will not read. The entry below this one records the same ceiling from the elevation side.

The card is the source rather than one more surface to match, so its four values moved out of it unchanged and it now reads them back. Where a control already carries a ground at rest, the dock and the active rail row, the glow stacks on top rather than replacing it. Swapping one shadow for the other makes a lit control appear to drop as it lights.

The palette has no headroom below its muted token, and that is a constraint on every future treatment rather than a fact about one section. Muted measures 4.82:1 in light, so a third step lightened beneath it fails the 4.5:1 floor for text at any value visible enough to do a job. The closing ask shipped exactly that on this branch, at a 65% mix measuring 2.53:1, and it was found by measuring for an unrelated question days later. Separate two text layers by weight, size, or the space between them, and read lightness as already spent.

Two measurement errors produced confident wrong answers on this branch and both are cheap to repeat. A patch sampled at the corner of a bounding box misses a round control and reads the page behind it, which reported the dock's ground repair as no change at all. A color carrying alpha read as opaque reports a color nobody sees, which is what hid the 2.53:1 until the composite was done properly.

Adding the glow to a surface that already answers a pointer is where the sweep costs something. The experience timeline had a highlight that walks back to its resting beat when a reader leaves, and a plate keyed to `:hover` stayed on the row they left and faded there while the highlight walked away, lighting two rows by two different means at once. A treatment joining a component with existing behavior keys to whatever that behavior already marks, rather than to the pointer.

That coupling then decides an easing. The plate leaves more slowly than the walk steps, so several rows carry one at once on the way back, and the trail is thickest at the start. The walk therefore lingers on the row a reader chose and gathers pace as it returns, which both gives each plate more of its fade to clear in and puts the held moment on the leaving. The reverse shipped first and rushed exactly the moment worth holding.

Read the sweep as one decision rather than as eight component edits. The operator's own framing is the reason it is recorded this way: a treatment settled on one component and not the others is how the site arrived at three answers, and the inventory at `e2e/inventory.ts` exists so the next such question is measured across the site before anything is changed. It reads pseudo elements and descendants as well as the element itself, because a first pass that read only the element reported the timeline chips and the card halo as controls that do nothing.

Verified at c5f17e4 on 2026-08-20, at 1280x800, 1440x900, and 390x844, with the elevation ceiling re-read off painted pixels at 1440x900 on 2026-08-22, and the rail's missing edge and the response set's own ceiling read at 1440x900 in both themes on 2026-08-25.

### The rail states position by moving, and a control that scrolls owns the URL it leaves

The section rail carried four labels and lit one. It now gives the active row the dock's ground, so the two margins read as one system, and steps that row out of the column so reading down the page hands the ground from label to label.

Giving all four the ground was built and rejected. Four grounded labels stop reading as a position indicator and start reading as a navigation menu, and they make the rail heavier than the control it sits opposite. On one row the ground carries information instead.

The step is a transform rather than the margin it visually undoes, because the margin is layout and would shove every label below it on each handover. Every row holds the pill's box whether or not it is painted, so the rail never reflows: measured across all four states, one left edge and one height throughout. Sampled through a handover, the outgoing and incoming rows cross at +90ms and the easing overshoots before settling, which is what makes it a lean rather than a slide. The step is the whole gesture, so a reduced-motion reader loses it entirely and the ground alone carries the row.

Peripheral vision is what decided it. The rail sits in the margin beside the column a reader is reading, and movement is what peripheral vision detects where color is not. The lean against ambient motion over long-form prose does not reach this: it was about continuous effects layered over content, and this fires four times across a 7274px page, at boundaries where a reader's attention is already moving.

The bar's home control is a button that scrolls rather than a link that navigates, so nothing cleared the fragment a timeline chip had left behind. A reader who clicked a project chip and then the bar name arrived at the top with the URL still naming the card they came from, which a copied link, a reload, or a bookmark then acted on. It replaces the entry rather than pushing one, so a reader does not press back twice to leave a control that only ever scrolled them.

The same pass made a card's name its route link. The label saying `Project` repeated what the whole card already does, and deleting it was not enough on its own: the full-card link is `aria-hidden` at `tabindex="-1"`, so that label was the only route in without a pointer and three of five cards carried no other internal link. The route also moved to a field of its own, since it had been found by picking the one internal href out of the links list, which stops working the moment the route stops being a link in it.

Verified at c5f17e4 on 2026-08-20, at 1280x800 and 1440x900.

### A figure is sized against its own shape, and a defect can be held up by another

A plate sized by the column step is a plate a portrait figure cannot fill. At a 0.70 aspect against a width chosen for charts running 2.4 and wider, the image used 40% of its plate at 1280 and 29% at 1920, because the plate scaled with the viewport while the image was pinned to a flat length that read neither it nor the screen. A portrait plate now follows its content and the image takes a ceiling that scales, which holds 86% fill at both widths.

That is the general shape rather than a fact about one route. Two literals sized against different things drift apart as soon as anything around them moves, and neither one is wrong on its own.

Fixing it exposed the next defect, which is the part worth carrying. A bigger inline figure meant opening one showed it smaller, at 0.88x, so the click a reader makes to see more showed them less. That is now a sequence with a magnifier: fitted on arrival, and a second click to the figure's own pixels, which is the first size at which a portrait chart's axis labels can be read.

Three of the defects that came out with it were older than the work, and one of those was held up by another. The panel had been positioned relatively, which overrides the fixed position a user agent gives a modal dialog, so it rendered at minus the scroll position and a reader deep in a route opened onto nothing. It stayed invisible because the page lock also reset the scroll to zero, which put an in-flow panel at the top of the viewport by accident. Repairing the scroll reset is what revealed it.

**Read that as the general case rather than as bad luck.** A defect can be masked by a second one, so repairing either exposes the other, and a session that fixes one and ships without re-looking ships the pair. What made it survive was a verification reading sizes and positions and never asking whether the thing was on screen: the panel measured a healthy 1517x639 for as long as it sat 1868px above the viewport. Assert that a surface is where a reader would see it, not only that it has the right shape.

Verified at 1024x700, 1280x800, 1440x900, and 1600x1200.

### A dev-only component serves candidate treatments the operator drives

Some decisions cannot be settled from a capture or a recording, because both are passive and the question is how a thing feels to cause: a pace read while scrolling, a gesture, whether a control is where a hand expects it. Those are served live from the running page, behind one query parameter, with a switcher for moving between arms.

`src/components/dev/scenarios.astro` owns the shape. Five decisions on one branch were served that way with a hand-written parameter, switcher, and removal each, none resembling the last, which is what earned a component rather than a habit.

It renders nothing in a production build, because the whole component is behind `import.meta.env.DEV` rather than gating itself at runtime, and nothing in development either until the page is asked for an arm by name. Verified: a built `dist/` carries no trace of the switcher, and a dev page loaded without the parameter renders none of it.

An arm carries CSS where the decision is a treatment. Where it is a value the page reads at runtime, a pace or a shader uniform, the arm carries none and the module holding that value reads the active id off `documentElement.dataset`. That split is what lets one component serve a stylesheet decision and a shader decision without knowing about either.

Two things about it are not obvious and both cost a debugging pass. Inside an Astro expression a script's children are parsed the way JSX children are, so every brace in the source reads as an interpolation and the body ships as an unevaluated literal with nothing reporting it. The source is held as a string and written with `set:html` for that reason. The switcher also sits bottom left rather than bottom centre, which is where Astro's dev toolbar sits and where it swallows every click aimed at whatever is underneath it.

**It is unreferenced today, and that is the expected state.** It is scaffolding a visual decision reaches for and removes again, so a branch with no open visual decision holds no call site. Read it the way the React entry above should be read: a session auditing the tree for unused files finds it and should leave it alone.

It has since served its sixth decision, and that run is the one that shows what it is for. The focus ring's last two candidates were composed into a sheet and the sheet could not separate them, because the glow reads almost identically on one still control and the question was what it does across a run of controls a reader tabs through. Mounted from the layout rather than from a section, since a ring reaches every control on every page, it was driven and removed inside one batch and the tree carries no trace of it.

What makes it reachable rather than merely present is the `visual-batch` skill naming it, which is the half that shipped late. The skill described the workflow as steps to build by hand and named no component, so a session following it rebuilt the switcher and met the problem the component closes. An unreferenced component is only safe while something tells a session it exists, and for one commit nothing did.

Its teardown is the arms and the call site rather than the seam. Deleting the parameter and the switcher with the pick is what a hand-rolled seam needs, and applying that to the harness deletes the harness.

Verified at 1280x900.

### The rail carries looking-for through the footer rather than hiding near it

The rail's footer gate, an `IntersectionObserver` with no root margin watching `[data-section="footer"]`, fired the instant the footer's own border box touched the bottom of the viewport. That box carries close to 100px of empty top padding before any visible content, so the rail could hide while looking-for was still the section on screen. That was itself a regression from an earlier commit that had removed the observer's `rootMargin` to fix the opposite defect, where a footer short enough to never reach the shrunk root left the rail at full opacity for the whole footer beat.

Two repairs are recorded here as the shape to avoid rather than as what shipped. Keying the hide to looking-for's own bottom crossing the same 30% anchor the active-row tracking already reads fixed the early-fire case and reopened the one the `rootMargin` removal had chased: measured at 1440x900 and 1920x1080, looking-for and the footer together barely clear one viewport, so the anchor crossing and the document's true end land on the same scroll step and the rail never got room to hide gracefully. A minimum-dwell hold, mirroring the click-intent lock already in this file, closed that too, at the cost of a fade timed to a fixed clock rather than to the reader's own scrolling, which read as the rail lingering on its own after the reader had already stopped moving.

A capture of the rail forced visible over a fully-shown footer at 1280x800 and 1920x1080 settled it: the rail sits in the empty left margin at both widths, clear of the signature, the résumé link, and the colophon, so hiding it near the footer was never buying anything a reader would notice losing. The gate comes out rather than getting retuned a third time. The rail now behaves exactly as it always did on a project route, which never gated on the footer at all: revealed once the hero is scrolled past, visible through the rest of the page, and hidden again only on scrolling back into the hero. The operator confirmed against the running page rather than a capture, since the question was how the removal reads while scrolling through it rather than how it looks at rest.

Measured at f2da68b on 2026-08-22.

### The avatar answers to a host, and the OG card answers to the same field it always should have

`public/avatar.png`, a single flat 512px raster, is now six files under
`public/avatar/`: a naked light and dark pair and a streamline dark pair, each
at 1024 and 2048px. Discord's own cropper renders a 512px source visibly soft
at the sizes it displays an avatar, and 512 was also the whole vocabulary: no
dark counterpart existed for a host whose own chrome the light-only cream
ground was never designed to sit near.

The dark ground is the site's own `--card` in dark, `oklch(0.248 0.009 74)`,
lifted one step from `--background` rather than the mark's near-black ink
inverted. The reasoning above about dark hosts swallowing a dark ground
(Discord ~`#313338`, GitHub dark ~`#0d1117`) applies exactly here: a literal
invert would read as flat black on flat black on both.

The streamline variant is drawn from the hero's own live `[data-shader-field]`
rather than from `page-ground`, which `og.png` had always used. `page-ground`
mounts with `animate: false` and draws exactly once at mount, so a pointer
simulated against it cannot produce the accent-gradient reveal a real hover
shows, whatever the wait: only the hero's canvas ticks a render loop and
tracks the cursor. `og.png` carried the identical defect and is regenerated
from the hero field too, which is what exposed the whole thing. Neither card
had ever shown the warm mix toward `--accent` a reader sees live, because
nothing before this had asked `page-ground` to.

Placing the pointer took two findings rather than one guess. The header's
`pointermove` listener attaches from an `IntersectionObserver` callback rather
than synchronously on load, so a single synthetic move fired right after
navigation can land before that listener exists and be lost outright. A
settle, a nudge, then the real move is what reaches a listener that is
actually attached. And the site's own reveal radius, 230px, is smaller than
the avatar mark's half-width at any scale worth shipping (281px at 0.55), so a
cursor centred under the mark sits entirely behind it and the glow it would
cast is invisible by construction. Both the avatar's candidates and the card's
were served live and judged rather than guessed: the avatar's placement leans
toward a corner, clear of the mark's silhouette, and the card's, small enough
that the reveal mostly clears it, still moved off the mark into the frame's
open corner over three other placements read live.

Two sizes come from one CSS-pixel geometry captured at `deviceScaleFactor` 1
and 2 rather than from two different capture widths. The field's own spatial
scale, `uFieldScale = fieldCyclesAcross / canvas width`, is driven by the
canvas's CSS width alone and not by device pixels, so widening the capture
viewport for a "2x" pass would have changed the field's density along with
the physical resolution. Holding the CSS geometry fixed and only raising the
device pixel ratio renders the identical composition twice, once supersampled.

A page that never navigates crashes the screenshot protocol once it holds a
large embedded image, in this environment, whatever the markup. The working
shape navigates to a real page first and injects the composed markup with
`page.evaluate`, which `scripts/lib/capture-field.ts` now does for both
scripts rather than each holding its own copy.

The favicon and the home-screen icon are untouched: no streamline, no new
ground, the same three files `scripts/brand.ts` has always drawn.

Measured at 86be4f3 on 2026-08-24.

### A route's rail leads with the route, and a runtime row takes no styles

The rail is shown from first paint on a project route, and the first prose
section starts 938 to 1135px down, so it named no row for the first 700 to 900px
of every route. A position indicator stating no position was the whole opening
screen, on the surface a shared link lands on.

Hiding it there is the repair that looks obvious and it was measured and
rejected. Copying the landing page's reveal gate does not reproduce the landing
page's behavior, because a route's opening section is proportionally far larger
than the landing hero: the rail would be absent for 9.3% of diction, 15.5% of
jobtriage, and 34.6% and 37.1% of stackr and caret, against roughly 6% on the
landing page. The two shortest routes lose it for over a third of the read.

**Read the divergence as deliberate rather than as an oversight**, which is the
part a consistency argument gets wrong. The landing rail tracks position through
sections a reader meets by scrolling anyway. A route's is a contents list for a
long-form read, and showing it on arrival says how long the read is and what is
in it. Those are different jobs, so matching the two surfaces costs something on
the one that needs the rail more.

What ships is a first row pointing at the section carrying the `h1`, labelled
with the project name. It is data rather than component behavior: each route
gives its opening an `id` and adds one entry to its own `navItems`, and the
component is unchanged because the opening section's top already sits above the
30% anchor at first paint. `overview` was rejected as a label against the rail's
own rule that a label reads as the heading it points at, being the one label on
the site with no heading behind it. Lighting the first prose row instead was
rejected twice over: it claims a section the reader has not reached, and the row
is then already lit when they arrive, so the rail's first handover never
happens and the step from row to row is the whole gesture.

The cost is the project name beside the `h1` on the opening screen, which is the
pairing `[data-route-here]` hides itself to avoid. Accepted, because a rail row
is a position mark in the margin at label size rather than a title in the same
band, and because past the `h1` the bar's name fades in as the rail hands off,
so the name is stated exactly once at every other scroll position.

**The instrument failure is the half worth carrying.** The row was prototyped
with `document.createElement`, and Astro scopes a component's rules to a
`data-astro-cid-*` attribute only server-rendered elements carry. The row
therefore reported `data-active` while painting no ground, no border and no
step, and the check written to verify it read `data-active` and passed. It was
active and invisible at once, and the operator found it by looking. A check
reading `backgroundColor`, `borderTopWidth` and `transform` fails it. This is
the class this file already collects, reached through a styling mechanism rather
than through a measurement: **a state a component sets and a treatment the
stylesheet paints are two claims, and reading the first says nothing about the
second.**

Three guards moved with it, and one was worth reading rather than updating.
`every section opens on a real heading` counted `main section[id] h2`, and the
opening section opens on the `h1`, so the invariant held while its selector did
not. It reads `:is(h1, h2)` now, against a measurement that every id'd section
on all five routes carries exactly one heading. The heading-size guard also had
to be scoped to one section, since across the document its heading and its prose
now land in different ones.

Read at 1440x900 across all five routes, where each rail names one painted row
at first paint and hands off between 720 and 940px.

Measured at 0159e9e on 2026-08-23 with this branch applied.

### One declaration decides how the page travels, and every caller resolves it

The site answered one question three ways. The rail eased to a section, the
bar's home control eased to the top and branched on the motion preference by
hand, and a timeline chip teleported to the card it names. The chip is a plain
anchor and nothing had ever set `scroll-behavior`, so the default stood: read on
the first frame after a click, it arrived at 2833 of 2833.

The root carries `scroll-behavior: smooth` under
`prefers-reduced-motion: no-preference`, and the two script callers pass no
behavior at all. What that buys beyond agreement is that the preference is read
in one place. The rail had named `smooth` outright and carried no reduced-motion
branch of any kind, so a reader who asked for no motion got a glide from the one
control that most looks like navigation.

Native rather than a click handler per surface. An anchor keeps the fragment a
reader can copy, keeps focus landing on the card rather than on the body, and
covers an anchor nobody has written yet. Scripting the same scroll would also
have retired the bar's fragment-clearing, which exists precisely because a chip
leaves one behind.

**The cost is that the declaration reaches every unqualified scroll in the
repository, and three of them meant "be there" rather than "travel there".**
The lazy-image walk in `e2e/lazy-images.ts` is the one that matters, since the
screenshot capture depends on it: each step settles where it stands, and a
gliding walk settles against a viewport still in transit, so the images it waits
for are never asked for. `e2e/variants.ts` shot its frame mid-scroll. Both say
`instant` now, as `figure-zoom.ts` already did.

The driver's own scroll is the case with no `behavior` to pass. Playwright
scrolls an off-screen target into view before it can tap it, and a minimal
scroll lands that target at the top of the viewport, under the sticky bar. The
cast's tap test had been relying on exactly that, with the first member sitting
61px above the viewport after the section was brought in, so the hit test was
taken against a page still moving and the bar took the tap. It centres the
member itself now, which is what the tap always needed and what removes the
driver scroll from the path.

**Two assertions about the glide were written before it was measured, and each
encoded one engine.** A threshold at half the distance failed webkit, whose
automation build collapses the whole glide into two frames and opens at 1895 of
2833 where chromium holds 23 distinct positions and firefox 29. A frame-exact
arrival then failed firefox, which does not commit a fragment scroll
synchronously: it reports the starting position on the first frame after the
click and the landing on the second, which is a jump arriving late rather than a
glide. What holds on all three is whether the page ever occupies a position
strictly between where it started and where it landed, which is true of a glide
and false of a jump by construction rather than by threshold.

The curve is the engine's and not the site's, because CSSOM-View requires the
smooth scroll and defines no timing function for it. Measured on the same chip,
chromium runs an ease-in-out with a long decay, reaching 82% of the distance by
half time and taking 949ms over 3013px and 1134ms over 4202px, so its duration
grows with distance sub-linearly. Firefox runs a spring decay instead, 64% of
the distance inside the first quarter and flat at about 745ms whatever the
distance. A reader on firefox therefore meets a noticeably more front-loaded
version of the same gesture, and closing that gap means scripting the scroll and
paying the fragment and the focus landing for it.

Measured at 573bf45 on 2026-08-24 with this branch applied, at 1280x900 across
chromium, firefox, and webkit.

### A control gets an arrival where decoration gets a schedule

The timeline's project chips sat inert, and the ask was to give them a life:
a cascade, an occasional chip lighting, something looping. What ships is one
wave across the row as it comes into view, re-armed whenever the row is scrolled
back, and nothing at all while a reader sits in front of it.

**The rule that decided it is what a thing is, not how much it moves.** The
agent cast acts every few seconds a few pixels away, and that is correct there
for reasons that do not reach these chips. A cast member is `aria-hidden`, leads
nowhere, and lives in the margin, so a reader classifies it as scenery and stops
tracking it. A chip is a link. A control that lights itself on a schedule claims
something happened at its destination, and the reader has to check it before
deciding it meant nothing. The row also sits inside the reading column rather
than beside it, so a repeat competes with the sentence around it in a way a
margin figure never does.

Apply that split to a surface nobody has built yet. Decoration may be given a
schedule, and a control is given an arrival.

The gesture is spent where it costs nothing and says something true. The row
entering view is the moment attention is already moving, and a wave stepping
five chips 90ms apart states that they are one set, in order, and reachable,
which a static row of pills does not state. Past that the section is quiet.

Re-arming is hysteresis rather than a repeat. The wave runs when the row is 60%
visible and cannot run again until the row has left entirely, so the dead band
between those two covers a reader parked with the row at the edge of the
viewport, where a single threshold would re-fire on scroll jitter alone.

The light is the hover, declared once for both states, and it was deliberately
weaker until 2026-08-25. The weaker form carried the accent at 55% mixed toward
`--border` with a fainter shadow and no fill, on the reading that a row lighting
itself as hard as a pointer does takes the pointer's answer away and the control
then reads as dead to anyone who points at it.

**That reading was true of the state and wrong about the window.** A chip is lit
for 1.48s, once, when the row first enters view. For the rest of the read it is
at rest, and a pointer landing on a resting chip moves its edge from `--border`
to `--accent`, which measures a channel distance of 189 in light and 111 in
dark. What the weaker light bought was a difference in edge color, and it was
paid for across every other bounded control on the site: the rail's active pill,
the rail's hovered row, the dock, and this chip's own hover all carry `--accent`,
and the arrival was the one state wearing a mix of it. The operator read that
difference as a defect and asked whether it was intentional, which is what got
it measured.

The fill and the shadow could not carry the difference instead, and that is the
finding worth keeping rather than the pick. Held at one edge color, a pointer
moves the chip's fill by 5 and its halo by 12 in light, against a ground that
drifts 11 on its own between two captures, and by 5 and 15 in dark against a
drift of 15. Both sit inside the noise. `--glow-fill` resolves to
`--surface-elevated`, which is 0.032 from white on a light page already at
`oklch(0.968)` and one step above the background in dark, so **the border color
is the whole visible weight of this site's glow** and two states sharing an edge
are near-indistinguishable whatever else they declare. Read that as a constraint
on any future treatment rather than as a fact about this chip.

What still separates the two states is timing. The arrival swells over 260ms and
400ms where the pointer's answer arrives in 130ms, so an unattended light reads
as the row breathing rather than as a blink, and both leave on the shared 520ms.
The transition list for the lit state has to name the fill as well: a transition
shorthand replaces the base list outright, so a property the state does not name
snaps while everything beside it swells.

The cost is accepted rather than argued away. A pointer resting on a chip during
those 1.48s changes nothing, and a reader who lands there gets no answer. The
operator was given that cost in the label of the arm they picked.

**A pointer resting on the row deliberately does not suppress the wave, and the
first build had it doing so.** Standing down under a hand is the cast's rule and
it exists to stop a schedule interrupting a reader repeatedly. A wave that runs
once has nothing to repeat, so the same rule here only costs that reader the
gesture outright with nothing to say it was spent. Read the cast's rule as
answering repetition rather than answering presence.

Four candidates were served live through `src/components/dev/scenarios.astro`
and driven by the operator, because the question was how a repeat feels while
reading, which no capture answers. One chip at intervals and a wave on a loop
both read as a notification on a control. A light traveling continuously through
the row lit the row's ground rather than the controls on it and sat closest to
the band `.claude/DESIGN.md` bars. The arms and the call site came out with the
pick, and the harness stays.

Every guard was run against the defect it exists to catch before it was trusted.
Disabling the wave fails the two positive guards and leaves the two negative
ones passing. Removing the re-arm fails the return guard alone. Adding a three
second loop fails the quiet guard and the reduced-motion guard together. That
sequence is the point rather than the count, since this file already collects
five instruments that reported nothing wrong while reporting nothing at all.

A guard was added with the reversal and run against its own defect first. It
compares the painted edge a chip wears arriving against the one it wears under a
pointer, and it fails when the arrival's declaration is taken out. It reads the
element the locator resolved rather than one found by a `:hover` selector, since
Firefox and WebKit apply the treatment while `querySelector(':hover')` finds
nothing there. `.claude/context/ci.md` carries that.

Measured at 8004095 on 2026-08-24 with this branch applied, where the full suite
passes 705 across chromium, firefox, and webkit. The reversal and its
measurements were read at 1440x900 in both themes on 2026-08-25, where the
landing surfaces pass 251 and skip 1 across the three engines.

### Visitor analytics runs at the edge, with no code in this repository

Cloudflare Web Analytics already tracked erclx.dev before this branch existed.
The zone was added to Cloudflare on 2026-04-11, and Web Analytics ran on
automatic setup the whole time, with EU visitors excluded under the dashboard's
own toggle: the edge injects the tracking beacon into every HTML response
outside that exclusion, and no script tag lives anywhere in this repository. A
fetch from a Swedish vantage point therefore carries no beacon by design rather
than by defect, which `erclx.dev/cdn-cgi/trace` confirms by reporting `loc=SE`
for that same request. The task that reached this branch assumed the opposite,
that no analytics existed and a manual `<script>` beacon needed adding to the
layout, and it was filed without anyone checking the dashboard first.

Automatic setup already delivers what the task asked for, a visit recorded with
a timestamp and a rough country, with no cookies and no backend of this
project's own. Switching to a manual snippet would add a script this repository
has to maintain for no capability automatic setup lacks, so the code change
dropped out of scope on 2026-08-24 rather than shipping as unnecessary rework.
`.claude/REQUIREMENTS.md` records why analytics left the non-goals list on the
same date.

### The closing rule is a contour, and what clips the dog is the line itself

The looking-for section's hairline was the landing page's only standalone rule,
and it drew at 1.115:1 in light and 1.188:1 in dark against the page. The page
ground behind it, inside the reading column where `contentDamp` has taken it,
measures 1.036:1 and 1.010:1 at 1.3% and 0.0% coverage. **The line was louder
than the ground it sat on and thinner than every contour drifting past it**, so
it read as table chrome on a page that had stopped drawing lines.

Read "match the field" carefully, because it points two ways and one of them
erases the line. Matching the ground actually behind it means going quieter
than 1.036:1, which is invisible. What ships instead borrows the hero field's
own contour peak, read off painted pixels at rgb(198,193,186) and rgb(88,84,79),
which measure 1.632:1 and 2.359:1 at a median 2px. That makes the rule louder
rather than subtler, and it is the direction the section wanted.

The curve is the decision the section could not have taken on its own, because
the dog perched on that rule is clipped by a window whose bottom edge sits at
0.00px from it at every width from 390 to 1920, and his paws overlap it by
3.36px. A flat clip under a curved line drops that grip everywhere the curve
leaves its midline. The window is therefore clipped by a polygon generated from
the same geometry as the drawn path, so the line he grips and the edge he is cut
against cannot disagree.

**The window's own `overflow: hidden` had to go with it, and that is the half
that shipped broken first.** Both mechanisms clip, and the tighter wins at every
point, so `clip-path` could only ever remove more of him and never reveal him:
every crest detached the paws. Deleting the clip entirely moved 0.06% of the
rendered bytes with the overflow left on, against 2.93% with it off. A check
reading the computed `clipPath` saw a healthy polygon in both states.

Amplitude is read off the stage's own width rather than fixed, and 390 is what
decides it rather than desktop. The dog spans 72 to 100% of a shorter rule there
against 78 to 93% from 1024 up, so the curve compresses under him exactly where
there is least room: his local tilt runs about 1.06 times the amplitude, against
paws about 10.4px tall. A fixed 16px reads as terrain at 1280 and tips him
visibly at 390, and a fixed 11px keeps him level everywhere while drawing a
curve barely worth having at 1920. The shipped ramp runs 5px to 16px across a
342px to 768px stage, measuring 9.5px of peak-to-peak travel at 390 and 30.4px
from 1024 up, with his tilt at 5.3px at both ends.

The curve is a sum of three incommensurate sines rather than one. The field's
own adjacent-contour gaps measure p25 3px against p90 120px, so its spacing
varies continuously and a regular period is the one thing that would not read as
belonging to it. A denser arm at 1.9x the frequency was built and rejected on
that reading: it reads as a wobble where the field's lines are long and lazy.
Clearance was never the constraint, since even a 22px amplitude leaves 15.8px to
the first row's text.

The rows keep their straight border until the script has drawn, so the line
degrades to what it always was rather than to nothing.

An earlier arm carrying the gradient on a straight 2px rule is retired with the
curve, and the fade band it left behind reaches the shipped path unevenly. The
character's own span is not the figure that matters, since the two paws that
grip the line sit narrower than the body above them: read off the paw
ellipses rather than the outer silhouette, the trailing paw clears the 90%
mark at 1280 (87.2% to 89.4%, inside the solid band) and crosses it at 390
(89.5% to 93.7%, fading to about 63% opacity at its own tip). The taper does
not shrink steadily across that range. The window's own size steps at 768,
from `w-24` at `sm:right-8` to `w-28` at `md:right-14`, so the trailing paw
sits worse a pixel below that step than at 390: at 767 it spans 90.1% to 92.2%,
fully inside the fade at roughly 78% opacity at its own tip, and at 768 the
wider window clears the band entirely at 85.8% to 88.3%. The taper is real
below 768 and absent at 768 and above, rather than fading out gradually
between 390 and 1024.

Measured at 10c511a on 2026-08-25 with this branch applied, at 390, 768, 1024,
1280, 1440, and 1920, where the full suite passes 719 and skips 7 across
chromium, firefox, and webkit.

### A case-study prose link takes the site's accent, and the tap-target guard learns what an inline link is

No route on the site carried a link inside flowing body prose until the
Jobtriage, Caret, and diction case studies each needed one, so the treatment
had no precedent to inherit. Four candidates were served live from
`/diction` through `src/components/dev/scenarios.astro`, then a composed
sheet of seven read the two front-runners against three heavier variants.
Shipped: accent-colored text with an always-on underline, applied as
Tailwind utilities per link (`text-accent underline underline-offset-[3px]
decoration-[1px]`) rather than a named CSS class, matching how the header
and footer links are styled directly rather than through a shared component
class.

Bold variants lost on the sheet for introducing a weight this site's body
prose carries nowhere else, headings excepted. A pointer-hover-only
underline lost for failing the same bar an accessible link within a
paragraph has to clear at rest: WCAG's caution against color as the only
visual means of conveying information points at a link a reader can
identify without relying on color perception alone, and a link that only
declares itself under a cursor fails a keyboard or touch reader outright.

The four new links then failed `e2e/links.spec.ts`'s phone tap-target guard,
which asserted every `a`/`button` clears 44px on both axes. A word sized to
its own text inside a sentence cannot clear that without inflating the line
it sits in, which is exactly the case WCAG's own criterion exempts. The
guard now skips an element whose computed `display` resolves to `inline`,
checked against every other link on the site before trusting it: each one
built to hit the minimum already declares `flex` or `inline-flex`, which is
what makes the exemption a test for "does this control have its own box"
rather than a blanket carve-out that could swallow a real regression.

That skip reads computed display, which drops every inline element from the
survey rather than recording which ones it dropped, so a control regressing
from `inline-flex` to plain `inline` would go uncounted rather than fail.
Whether computed display can still catch that regression turns on what sits
between the control and its flex parent, checked control by control rather
than assumed from one. `footer.astro:48`, `site-bar.astro:92`'s button, and
`route-bar.astro:46` are direct children of their own flex row, so a flex
parent blockifies their display and they read as a box whatever class they
carry, the same as the résumé link this was first verified against. Every
other control, `header.astro:154`, `project-card.astro:143`, `route-foot.astro:34`,
and the five route-page links including `jobtriage.astro:107`, sits inside an
`<li>` or a plain block container instead, so the anchor itself is never a
flex item and nothing blockifies it: a class regression there computes
exactly as declared, and the prior computed-display check would have caught
it. The class-list assertion is load-bearing on most of these controls
rather than on a few, which is the reverse of what an earlier version of
this entry claimed. The guard now asserts the exempt set directly, reading
the class list of every element carrying `min-h-11`, `min-w-11`, or
`size-11` and failing if none of `flex`, `inline-flex`, `block`,
`inline-block`, `grid`, or `inline-grid` is present, which does not depend
on what a parent's layout mode does to the computed value. Verified against
the same regression before trusting it: reverting the class list check
reintroduces the failure.

**`size-11` was outside that selector until 2026-08-26, and it is the way
ten of these controls declare the minimum.** Both contact dock rows, the
theme toggle, all three figure dialog controls, the bar's toggle slot, and
the three the screenshot gallery added set both axes with it, against eleven
controls using the pair, which carry eighteen tokens between them because
seven set both axes and four set height alone. So the guard read about half
the controls it appeared to cover, and the two written here as one gap were
different sizes: this one was ten live controls rather than a shape nothing
had reached yet. Widening it passed unchanged, because all ten already
carry a box class, which is what made the hole invisible. The guard also
counts what its filter matched now, since a filter selecting nothing
satisfies an emptiness assertion without reading a control.

One narrower gap survives that widening. A control dropping its sizing
class and `inline-flex` in the same edit matches neither the class-list
assertion nor the computed-display one, and falls back to the size check
alone, where an `<li>`-nested control now computing `inline` is exempted
again. Left open rather than closed with more code, since every call site
keeps the two together and nothing has needed them to move independently.

Measured at a7b1c04 on 2026-08-25 with this branch applied, where
`e2e/links.spec.ts` passes 60 and `e2e/case-studies.spec.ts` passes 141
across chromium, firefox, and webkit. Re-verified against `3120b0a` on
2026-08-26, where the corrected finding above and the class-list guard both
held. The `size-11` count was read across the tree at cd0f04b on 2026-08-26,
and the widened selector was proved both ways: dropping `inline-flex` from a
`size-11` control fails it and passes the version that read the pair alone.

### The gallery is one carousel rendered twice, and every end of it is a scroll the box has to reserve

The diction route opened on a single still, which showed one of eleven drills
and stood in for the whole app. It opens on five screenshots in a peek
carousel now, and clicking the centred one opens the same carousel larger in a
dialog.

**One track component serves both mounts.** The alternative was extending the
chart dialog an entry above already describes, and it is the wrong parent: it
forces a light plate because those charts are drawn on white paper, and it
pages through every figure on the route as one sequence. A screenshot of this
app wants the page's own dark card and a sequence of its own. Two components
would have been the other option and the two would drift, so the scroller, the
track, and the slides are one file that both mounts render, scoped by whichever
ancestor holds it.

**Three attempts at reserving the end scroll failed, and each failure is a
different lesson about what contributes scrollable overflow.** Padding on the
track came first and shrank every slide, because a child's percentage
`flex-basis` resolves against the track's content box: measured 333px against
the 538px `60%` was meant to produce. Pseudo-element spacers replaced it and
worked at the near end only. `align-items: center`, added to stop unequal
captures stretching, collapsed them to `height: 0`, and **a zero-height box
contributes no scrollable overflow**, so the trailing spacer reserved nothing
and the last slide sat 195px right of centre with `scrollLeft` already at
`maxScrollLeft`. Padding returned and still failed, because the track was a
block-level box the width of the scroller while its slides overflowed to about
3000px, putting its trailing padding nowhere near the end of the content.

What holds is `width: max-content` on the track, with the slides sized in `cqw`
against the scroller so padding and slide width cannot fight. The first and
last then land at exactly `scrollLeft: 0` and `maxScrollLeft` by construction
rather than by tuning.

**Read the diagnosis rather than the fix.** Two of those attempts were this
branch's own earlier repairs cancelling each other, and what identified it was
`maxScrollLeft` moving between readings, 2051 to 2067, which a fixed border box
cannot do and a set of scaled children can. A wobbling bound is the tell that
overflow is coming from transformed content rather than from the box.

The centred slide is read back from an `IntersectionObserver` as the largest
share of any slide showing, never as the first intersecting entry in the batch.
A step crosses two slides at once and the batch is not ordered by how centred
each is, so taking the first put the active row on index 3 after a click on
index 4 and left the dots a slide behind for the rest of the track.

**A control's destination outranks that reading until the scroll reaches it.**
Geometry is the right authority for a swipe, where nothing declared an intent,
and the wrong one for a click, where waiting to infer the answer makes it
depend on the scroll finishing and on a threshold being crossed on the way.
Under a loaded three-engine run that race lost, and a dot click left the row on
the previous slide with the attribute never arriving. Setting it from the
control alone is not enough either: every slide the scroll passes over is
briefly the one showing most of itself, so the row walked through the
intermediate slides and settled correctly only at the end. The pending
destination is what holds the two together, and a reader touching the track
clears it, so a scroll interrupted by a swipe cannot leave the observer
deferring to a destination nothing is traveling to.

**Focus and centring are one state.** Slides take a roving tabindex, focus
follows the carousel whenever a slide already holds it, and the arrow keys move
focus onto the track. Each of those closed a defect a reader saw: the ring
marking the slide they had stepped off, Tab reaching four slides they could
not see, and the ring pinned to an arrow while the screenshots moved under it. The
sharpest was at the ends, where an arrow disables and **a browser blurs an
element as it becomes disabled**, dropping focus to `body` so the keydown bound
to the mount never fired again and the carousel was stuck. The keys themselves
were never dead: the browser already scrolls the nearest scrollable ancestor
and snap lands it on a neighbor, on all three engines, so the handler buys one
slide per press rather than a pixel distance.

The scroller carries `padding-block` because `overflow-x: auto` forces the
block axis to clip, so the focus ring drawn outside a slide's border box is cut
off. The centred slide is the only one that suffers, sitting at `scale(1)`
where the peeking slides are held clear by their own `scale(0.94)`.

The preview panel takes a fixed width rather than fitting its content. Fitted,
it read its width off whichever slide was centred and resized under the reader
as they stepped, measured 958px on the first against 720px on the last.

**Two instruments lied on this branch and both are the class this file already
collects.** A clipped-ring guard compared the ring's reach against the room
around it and passed on a slide carrying no ring, because `outline-width`
computes to `0px` while `outline-style` is `none`, so it read 0 against 0. And
the falsification run meant to prove that guard sound was served a `dist` built
before the revert, so it reported green having never exercised the reverted
code. **Confirm the build under test carries the revert before believing a
falsification that passes.**

The five screenshots are captured at one viewport rather than full page, which
is a constraint the source imposes rather than a layout choice. The app's
sidebar is `fixed inset-y-0 h-svh`, so a full-page capture of a longer screen
renders it stopping partway down with a gap beneath, which reads as a defect in
the app and was one of two complaints a single re-capture closed.

Measured at c58ae55 on 2026-08-26 with this branch applied, at 390, 1280, and
1440 across chromium, firefox, and webkit, where the case-study suite passes
180 and the full suite passes 770 and skips 7 with nothing failing.

### Equal gaps are not a centre, and the name nobody could press was the only way back

A route's bar named the route between the identity lockup and the theme
toggle. The name sat 17.5px right of the bar's centre at every width from 390
to 1920 and on all five routes, and pressing it did nothing.

**The offset was arithmetic rather than drift.** Three items under
`justify-between` split the free space into two equal gaps, which centres the
middle item only when the two flanking it weigh the same. The lockup measures
79px against the toggle's 44px, and `(79 - 44) / 2` is 17.5 exactly. The gaps
either side of the name were equal at every width, so the name was centred
between the two controls and not in the bar. **Those are different boxes, and
only one of them is the box an eye reads a bar's centre from.**

That distinction decides the guard as well as the fix. A check reading the two
gaps passes against the defect, because equal gaps are precisely what the
retired layout produced. It reads the row's own box instead.

The repair is three columns with equal outer ones rather than a nudge. A 17.5px
offset encodes today's two control widths and goes wrong the moment either
moves, which is the literal-standing-in-for-a-relationship this file already
bars. Matching the two flanking slots by width was the other candidate and
fails the same way, since it fixes the toggle's slot to the lockup's current
size.

**The dead label turned out to name a gap rather than a spare control.** Every
other way back on a route leaves it: the lockup here and the closing foot both
target the landing page, and the rail's first row is the only control that
returns to the top of the route. The rail is hidden below 1280, so **the one
band with no back-to-top at all was the band the name is the sole answer in**,
which is where both screenshots that prompted this were taken. It is a button
now, and the two existing exits are unchanged.

Opacity was the only thing withholding it, and opacity hides a control from the
eye and from nothing else. That cost a `span` nothing. It costs a button a tab
stop and a 44px target across the whole opening screen while painting nothing.
It takes `inert` on the same clock as the shown marker, which closes
the pointer and the tab sequence together rather than needing an answer each.
The 44px costs the row nothing, since the lockup beside it already holds that
height.

**Three instruments failed on this branch and all are the class this file
collects.** A before-and-after sheet reported no difference while the
manipulation producing it was a silent no-op: the two grid classes are not
adjacent in the class attribute, so a string replace of them matched nothing
and returned the attribute untouched, and the pair of crops was two pictures of
one layout. It asserts the offset moves before it trusts a crop. Then eighteen
unrelated tests failed on the first three-engine run and none reproduced on a
clean one, because the run overlapped a capture driving its own browser. The
tap-target guard's own failure was a count of zero controls on the page rather
than an undersized one, which is a starved page and not a regression. **Read a
guard's failure mode before reading its verdict**, since zero controls and no
undersized controls are the same green on a different question.

The third was the search itself, and it is the one that reached furthest. A raw
NUL byte sat inside a string literal in `e2e/case-studies.spec.ts`, which makes
every text tool classify the file as binary, so `grep` and `rg` answer that a
binary file matches and print no lines. Two searches during this branch's review
came back empty against a file that held what they asked for, and the way-home
count guard was nearly reported missing while it sat at line 600. It blinded a
reading on this side as well: a `sed -n` line count taken while the byte was
still there reported the wrong line, and the correct one only appeared once the
file was text again.

That is exactly what the entries above describe, arriving through the tooling
rather than through a test. **A tool reporting nothing and a tool reporting
nothing wrong are the same output**, and a search is the instrument least likely
to be suspected of either, because an empty result is what an honest search
returns most of the time. The escape `\0` compiles to the same value and keeps
the file searchable. It predated this branch and is repaired here, since this is
the branch that was reading the file.

The wireframe had drawn the name centred since the surface was written, so the
document stated the intent and the row diverged from it with nothing comparing
the two.

Measured at 4577565 on 2026-08-26 with this branch applied, at 320, 390, 640,
768, 1024, 1280, 1440, and 1920 across all five routes, where the name centres
to 0.00px at every one. The full suite passed 812 across chromium, firefox, and
webkit at 2c17144, and the two commits since changed no assertion and no
rendered surface.

### The standards corpus is resolved rather than installed, and the readers were the load-bearing half

`.claude/standards/` held 28 files and `.claude/snippets/` held 3. Both are
gone. No standard installs into a project any more, so the corpus inside the
`aitk` package is what answers here and `aitk standards <name>` is the route to
it. Across the rules, the skills and the root file, 24 places cited the deleted
path and none named the verb. Every rule names it now.

Nothing in the tree was project-authored, and that was checked rather than
assumed. Three of the 28 named standards the toolkit has since retired,
`prose`, `changelog` and `roadmap`, which reads like local authoring and is not:
this repository's own history shows two commits touching `prose.md` and both are
toolkit syncs, and the file differs from the toolkit's last copy by two edits
made upstream after this one was taken. A retired standard and an authored one
look identical in a listing, so the question is answered from history rather
than from the file set.

**The citations were the easy half. Two hooks read the tree at run time, and
both fail silently rather than loudly.** `standards-audit.sh` parsed the word
bans out of `prose.md`, which the toolkit retired into `markdown.md` and the
`write-human` skill, so deleting the tree left it checking em dashes and
semicolons while reporting nothing wrong. `standards-reminder.sh` gated on
`[ -f "$root/$path" ] || exit 0`, so the same deletion switched it off
completely with no error anywhere. The audit hook now calls
`aitk markdown audit --json` and the reminder names `aitk standards <name>`,
and both were run against a probe carrying three banned words before either was
trusted. A machine with no `aitk` on PATH draws the same missing-binary line
`standards-audit.sh` and `tasks-index.sh` draw rather than exiting clean, which
`575-hooks` bars for a hook that is the only enforcer of its rule. This is the
class this file already collects, arriving through a path test rather than
through a measurement: **a guard keyed to a file's existence reports success the
moment that file stops existing.**

The tooling sync was read and declined. It reported 15 changes across 9 configs,
5 scripts and a gitignore line, and every drifted file is a customization this
document already defends. `playwright.config.ts` carries its own port band,
`fullyParallel` off with the measurement behind it, and the prebuilt-dist path.
`.github/workflows/verify.yml` carries the three-engine matrix, the xvfb wrapper
firefox needs for a GL context, and an engine-keyed cache. `e2e/screenshot.ts`
carries per-section capture. Those three are the clearest cases and not the
whole list: the decline covers the tooling domain entire, with `astro.config.mjs`
holding the `site` value the share cards resolve absolute image URLs through and
`scripts/worktree-port.sh` holding the per-worktree port derivation among the
rest. A sync would take all of it. The one additive item is a `screenshots/`
ignore line, and captures land under `.canon/review/`, which is ignored already. **Read a tooling report as a list of decisions to re-take
rather than as drift to clear**, since the sync has no way to tell a
customization from a lag.

Three declines now cost something on every install rather than one.
`450-link-behavior` joins `440-surface-capture` because `455-links` states the
same same-tab default plus the `rel="noopener"` requirement on a narrower glob,
and two rules on one concern is the exact objection `440` was declined under.
`505-at-references` governs the retired snippets folder and nothing else.

The archives moved from flat siblings onto the nested layout, `.canon/tasks/archive/`
and `.canon/plans/archive/`, which is what the toolkit's own `tasks-index.sh`
was updated to expect: its guard skips the live index alone, and a shell
wildcard crosses a separator, so the copy here would have rebuilt the board
index from an archived file. 28 pointers were retargeted, 20 for the rename and
8 more for the folder depth the move added, and that second set is the one worth
naming. `../groundwork/` and `../intake/` resolved correctly before the move and
broke because the files sat one level deeper, which no search for the old
spelling would ever have found. **A move retargets what names the moved folder
and what the moved files name from where they now sit, and only the first can be
found by searching for the old name.** All 78 links across the board and both
archives resolve.

`CLAUDE.md` kept four sections, `005-behavior`, `015-output`, `045-memory`, and
`025-indexes`, that overlap the rules of the same name rather than only the
three cut outright. The kept four are not a wording fork of the rule: measured
at `e904c1e`, the overlapping bullets are byte-identical, and each section
carries bullets the rule does not, 13 against 10, 11 against 9, 4 against 4, and
4 against 1. Cutting a kept section wholesale would drop that project-specific
content, and nothing compares the shared bullets between the two copies, so a
wording edit to one needs the same edit made to the other by hand.

The four kept sections did not stay duplicated. `005-behavior` and
`015-output` came down to the bullets their rule counterpart does not carry, 4
of 13 and 2 of 11, and `045-memory` and `025-indexes` carried no such
remainder: both came out of `CLAUDE.md` entirely rather than staying byte-
identical with the rule. One `025-indexes` bullet, drafting a new domain's
context entry at ship time, moved into `.claude/context/development.md`
instead of dropping, since it reads as this project's own practice rather than
an always-loaded rule. `CLAUDE.md` runs 58 lines against the 98 the entry
above measured. Measured at 7783070 on 2026-09-05.

Measured at 3.38.0 on 2026-08-28, where 59 rules carry zero citations of the
retired path and 16 name the verb, both hooks fire against a probe and the
reminder draws its missing-binary line on a stripped PATH, and the
install stamp reads from `.claude/aitk/config.json` with `stampAtLegacyPath`
reported false.

## Risks / open questions

- The first build seeds copy directly from career sources. The cutover to the queue-only model after v1 needs a clear marker so future sessions do not fall back to reading career files.
- Closed on 2026-08-28. The stamp recorded a governance commit living only on an unmerged toolkit branch, because the Astro glob fix had been synced from a local checkout rather than a release. It is stamped from released 3.38.0 now, which carries both that fix and the mirror retirement, so no domain here is anchored to an unreleased tree. A released package ships no git history, so the governance domain records no commit at all rather than a stale one, and `aitk sync --check` reports the drift it can still see as unattributed.
- The governance install carried two stack members short until 2026-08-15: `556-groundwork` and `557-intake`, both shipped by the base stack and both named in the install record, now `.claude/aitk/config.json`, while absent from disk. `aitk gov sync` refreshes rules already present and adds none, so the gap survived every sync and closed only under `aitk gov install`. A sync alone does not prove the install is complete, and the signal to read is a recorded path with no file behind it rather than the rule count on its own. A recorded path whose file exists with a different hash is a separate state and not that signal. The three standards files that illustrated it here are gone with the rest of the tree, so the example no longer resolves and the reading it supports still holds.
- `canon gov install` re-adds every stack member this project declines, and there are three: `440-surface-capture`, which the decision below covers, `450-link-behavior`, which `455-links` supersedes on an overlapping glob, and `505-at-references`, which governs the retired snippets folder alone. No mechanism exists to opt a project out of one rule its stack ships, so each decline holds only while an install is followed by removing that file and its record entry. Check for all three after any install. A sync reports them as listed but not installed rather than re-adding them, so only `install` carries this cost. Confirmed again during the aitk-to-canon rename on 2026-09-03: `canon gov install base --add 502-mermaid,576-settings .` re-added `505-at-references` while `440-surface-capture` and `450-link-behavior` stayed out, since the latter two belong to a stack this project never installs.
- `canon gov sync` reverts `306-test-scope.md` to citing `440-surface-capture.md` on every run, because the one line naming `445-screenshot.md` is a customization of a toolkit-owned file rather than a project-authored rule. Re-apply it after any sync. Moving the rule into `.claude/rules/project/` is not available, since the rest of the file is toolkit content this project wants updated.
- `caret.astro` and `stackr.astro` sync against `career/assets/portfolio/caret.md` and `stackr.md`, which do not exist on the career repository's `main` today. Both files, along with the two opening sentences and the `Fix Session Timeout` example they carry, are added by `erclx/career#210`, still open. Until that pull request merges, the sync target for those two routes can still move, and a reword to either file on its branch arrives as fresh drift here with nothing reporting it. Re-check both files against `main` once `erclx/career#210` lands, and until then read the branch it ships from rather than assuming it is `main`.
