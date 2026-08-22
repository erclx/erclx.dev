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

Each step of that walk settles where it stands rather than pausing a fixed span and leaving the waiting until the end. A fixed pause is a guess at how much lead an engine needs to issue a lazy fetch, and the engines disagree on it by an order of magnitude, so a walk tuned against one strands images on another with nothing recovering them once the viewport has moved on. The step waits on the reveal markers as well, since those are driven off the viewport and stranded the same way. `.claude/context/ci.md` carries the per-engine figures and the three gating cases one change repaired. Measured at 07e7c9b on 2026-08-21 with this branch applied.

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

It is composed inside the served site rather than in a bare page, which is what
gives it the real Fraunces and the shipped tokens. A card drawn in a fallback
face is a card judged on the wrong letterforms. The field behind it is captured
from the page with every other element hidden, after a first attempt shot the
canvas while content sat over it and baked the hero's own text into the image.

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
typical one, since the hosts that square-crop mostly anchor left or letterbox. A
separate 1:1 asset is the repair when one is wanted, and it waits on a consumer
that asks for it: most hosts take the first `og:image` and ignore the rest, and
`public/avatar.png` already ships as this project's square mark.

`bun run share-card` redraws it, and `e2e/share-card.spec.ts` guards it. Two of
its nine assertions are worth naming: one fails a description that opens on
words the title already used, and one fails a route title carrying `case study`,
which `.claude/REQUIREMENTS.md` retired on 2026-08-18 and which had reached the
visible labels without ever reaching the titles a shared link shows.

Measured at ab160ee on 2026-08-22.

### Resume PDF served from `public/`

The footer résumé link points at `/resume.pdf`, which Astro serves from `public/resume.pdf`. The canonical source remains `assets/resumes/eric-le-resume.pdf` in the parent career repo. Updates land here as a binary copy via the sync queue rather than a hotlink to a GitHub raw URL. On-domain serving keeps the URL clean (`erclx.dev/resume.pdf`) and removes a third-party dependency from the footer CTA.

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

`public/avatar.png` is served at the domain root and no visitor navigates to it.
It sits there because a profile host wants a file to upload rather than a URL to
embed, and `public/resume.pdf` already sets that precedent.

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

The bar's reveal keys to half the hero rather than half the viewport. A hero shorter than half the viewport clears a viewport-keyed margin without being scrolled at all, which at 390x844 put the bar on screen carrying the name while the reader was still looking at the hero carrying it. Reading the intersection ratio keys the same moment to the hero's own height and needs nothing measured. The rail still uses the viewport-keyed form and agrees with this wherever it is visible, since the hero holds the full viewport height from md up.

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

Measured at 502da58 on 2026-08-20, at 320, 375, 425, 768, 1280, 1600, 1920, and 2560.

### Two token sets carry elevation and response, and every control reads them

The decision above put one ground under two bars. The dock was built after that repair and never received it, so it drew its ground from the background token and measured 1.02:1 against the page behind it, which is the page laid on the page a second time. Both sets of values now sit in `:root` and every floating control and every interactive one resolves them from there.

The elevation set has a ceiling and it is worth knowing before reaching for it. In light the page sits at `oklch(0.968)` and white is 0.032 away, so a fill can barely separate at all: read off painted pixels rather than off composited tokens, a white ground measures 1.038:1 against what sits behind it, where the dark theme's reaches 1.105:1. Anything further has to come from the edge or the shadow. The two themes want different levers for that: in light the shadow does the work and the edge barely registers at 1.06:1, and in dark the shadow is invisible against a dark page while the edge reads at 1.19:1. A treatment answering only one theme was rejected for that reason.

The figures in that paragraph read 1.10:1 and 1.09:1 until 2026-08-22, and both were composites of declared tokens rather than readings of the page. A `backdrop-filter` samples what sits behind the element, so no arithmetic over token values reproduces what a reader sees, and the arithmetic ran about 6% high. Read this ceiling off pixels.

The set carries `--surface-elevated` rather than `--card`, and light no longer puts white in it. `--card` also grounds the chart plates on a project route, which stay white under charts drawn on white, so the two roles needed separating before either could move. What light put in the elevated slot was pure white at chroma 0 on a page at chroma 0.01, which made the bar, the rail's active row and the dock the only colorless surfaces on the site: dark lifts its page and keeps its warmth, and light dropped the warmth entirely. It now holds `oklch(0.988 0.012 82)`, the page lifted with its hue kept, which is the same move dark already made.

The warmth is affordable precisely because the fill was never carrying that reading. It costs 1.038:1 down to 1.023:1, against a shadow and an edge that are doing the actual work, and four candidates were served for the operator to pick from. The one rejected on measurement pushed the alpha to 0.72 for a more ghosted read: the fill fell to 1.004:1, which is the page laid on the page, and the hero's own words became legible through the bar. Ghosting belongs in the blur rather than in the alpha, which is what the pair at 0.88 over 24px already settled.

Two prototype defects on that batch are worth carrying, because both showed the operator a change nobody proposed. An arm written at `:root` reaches both themes, since `.dark` overrides only `--card` and never `--floating-fill`, so the first sheet put a cream ground under the dark theme's near-white text. And an arm scoped by element rather than by the cap under decision rewrapped every project card description alongside the lede it was meant to move. **Scope an arm to exactly the declaration being decided, and check the theme it is not about.**

The response set answers a question the site had never asked in one place. Measured across all six pages, 87 interactive elements answered a pointer three ways, 39 with an underline, 30 with a border and a color, and 18 with nothing, and not one of them glowed. The only glow that existed sat on the project card, which is neither a link nor a button, so no inventory of controls would ever have found it.

Two tiers now, and the test is whether the thing has its own box. A control with bounds takes the card's glow, and a link sitting inline in a paragraph keeps its underline, because a ground behind a word reads as a highlighter and fights the sentence around it. That test is what keeps the hero's three contact links unchanged, and it is what excludes the footer signature: the signature is `aria-hidden` decoration, and a hover response on it would promise a click that does nothing.

The card is the source rather than one more surface to match, so its four values moved out of it unchanged and it now reads them back. Where a control already carries a ground at rest, the dock and the active rail row, the glow stacks on top rather than replacing it. Swapping one shadow for the other makes a lit control appear to drop as it lights.

The palette has no headroom below its muted token, and that is a constraint on every future treatment rather than a fact about one section. Muted measures 4.82:1 in light, so a third step lightened beneath it fails the 4.5:1 floor for text at any value visible enough to do a job. The closing ask shipped exactly that on this branch, at a 65% mix measuring 2.53:1, and it was found by measuring for an unrelated question days later. Separate two text layers by weight, size, or the space between them, and read lightness as already spent.

Two measurement errors produced confident wrong answers on this branch and both are cheap to repeat. A patch sampled at the corner of a bounding box misses a round control and reads the page behind it, which reported the dock's ground repair as no change at all. A color carrying alpha read as opaque reports a color nobody sees, which is what hid the 2.53:1 until the composite was done properly.

Adding the glow to a surface that already answers a pointer is where the sweep costs something. The experience timeline had a highlight that walks back to its resting beat when a reader leaves, and a plate keyed to `:hover` stayed on the row they left and faded there while the highlight walked away, lighting two rows by two different means at once. A treatment joining a component with existing behavior keys to whatever that behavior already marks, rather than to the pointer.

That coupling then decides an easing. The plate leaves more slowly than the walk steps, so several rows carry one at once on the way back, and the trail is thickest at the start. The walk therefore lingers on the row a reader chose and gathers pace as it returns, which both gives each plate more of its fade to clear in and puts the held moment on the leaving. The reverse shipped first and rushed exactly the moment worth holding.

Read the sweep as one decision rather than as eight component edits. The operator's own framing is the reason it is recorded this way: a treatment settled on one component and not the others is how the site arrived at three answers, and the inventory at `e2e/inventory.ts` exists so the next such question is measured across the site before anything is changed. It reads pseudo elements and descendants as well as the element itself, because a first pass that read only the element reported the timeline chips and the card halo as controls that do nothing.

Verified at c5f17e4 on 2026-08-20, at 1280x800, 1440x900, and 390x844, with the elevation ceiling re-read off painted pixels at 1440x900 on 2026-08-22.

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

## Risks / open questions

- The first build seeds copy directly from career sources. The cutover to the queue-only model after v1 needs a clear marker so future sessions do not fall back to reading career files.
- `.claude/aitk.json` records a governance commit that lives only on an unmerged toolkit branch, because the Astro glob fix was synced from a local checkout rather than a release. Running `aitk gov sync` against released 0.98.0 before erclx/aitk#1006 merges reverts all four `ui/` globs and rewrites the four hashes to match, so the record stays internally consistent while the fix disappears with nothing reporting it. Re-sync from a released build once that pull request ships, and check the four `paths:` blocks carry `'**/*.astro'` before trusting a sync run in the meantime.
- The governance install carried two stack members short until 2026-08-15: `556-groundwork` and `557-intake`, both shipped by the base stack and both named in `.claude/aitk.json` while absent from disk. `aitk gov sync` refreshes rules already present and adds none, so the gap survived every sync and closed only under `aitk gov install`. A sync alone does not prove the install is complete, and the signal to read is a recorded path with no file behind it rather than the rule count on its own. A recorded path whose file exists with a different hash is a separate state and not that signal: `.claude/standards/context.md`, `prose.md`, and `wireframes.md` all mismatch today, which is the project customization § Agent context split by load cost describes rather than a defect.
- `aitk gov install` re-adds `440-surface-capture` every time it runs, and the decision below declines it. No mechanism exists to opt a project out of one rule its stack ships, so the decline holds only while each install is followed by removing that file and its record entry. Check for it after any install.
