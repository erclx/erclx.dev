---
title: Motion
description: Scroll-reveal cascade primitive and the per-surface animations on the landing page
---

# Motion

## Overview

How the landing page's scroll-triggered animation works. Layout and interaction intent for each surface live in its `.claude/wireframes/<surface>.md` file. This entry covers the shared mechanism.

## Layout

- `src/lib/` owns the reveal observer and the threshold constants its harnesses import
- `src/styles/` owns the fade-and-rise and the bar shape-transition declarations every surface here resolves
- `e2e/` owns the reveal-selector inventory and the lazy-image walk that waits on what the observer marks

## Traveling to a target

- The root declares `scroll-behavior: smooth` under `prefers-reduced-motion: no-preference`, and every control that scrolls resolves it rather than naming a behavior. That covers the rail, the bar's home control, and the timeline chips, which had answered the same question three different ways. `.claude/ARCHITECTURE.md` § One declaration decides how the page travels, and every caller resolves it carries the reasoning and what it cost.
- The curve is the engine's. CSSOM-View requires the smooth scroll and defines no timing function, so there is nothing here to tune and no duration to match. Measured over a 3013px trip on 2026-08-24, chromium runs an ease-in-out with a long decay taking 949ms, reaching 82% of the distance by half time, and grows to 1134ms over 4202px. Firefox runs a spring decay at 64% inside the first quarter and holds near 745ms whatever the distance.
- A caller that means to arrive rather than to travel says `behavior: 'instant'`. Every test harness that walks the page is in that group, and so is the figure dialog. The failure is silent, which is why it is stated here as a rule rather than left to each caller.
- Read a claim about the glide off the positions the page occupies rather than off a fraction of the distance or a frame count. Both were tried and each described one engine: webkit's automation build collapses the glide into two frames, and firefox does not commit a fragment scroll until the frame after the click.

## The chip row's arrival

- The timeline's project chips light in one wave as the row reaches 60% visible, stepped 90ms apart, and the section is then still for the rest of the read. It re-arms only once the row has left the viewport entirely, so the dead band between those two thresholds absorbs a reader parked at the edge of the screen.
- It is an arrival rather than a schedule because a chip is a control. `.claude/ARCHITECTURE.md` § A control gets an arrival where decoration gets a schedule carries the split and the four candidates that were driven before it was settled, and it is the rule to apply to any surface asking for a life of its own.
- This is why the agent cast may act every few seconds in the same section without the two competing. The cast is scenery in the margin and the chips are links in the reading column, so only one of them is ever performing.
- The light is the chip's own hover, declared once for both states, which reverses the weaker arrival this carried until 2026-08-25. The weaker form existed so a pointer still had an answer, and that reason held for a window of 1.48s once per visit while the edge color it cost was paid across every bounded control on the site. `.claude/ARCHITECTURE.md` § A control gets an arrival where decoration gets a schedule carries what was measured.
- Timing is what still separates the two. The arrival swells over 260ms and 400ms where a pointer's answer arrives in 130ms, so an unattended light reads as the row breathing rather than as a blink. Both leave on the shared 520ms.
- A pointer resting on the row does not suppress the wave, which is the one place this diverges from the cast. Standing down under a hand answers a schedule interrupting a reader repeatedly, and a wave that runs once has nothing to repeat.

## The bar's shape change

- Both bars contract from full width into a floating pill on scroll, and the shape transition is declared once as `inset 320ms ease, border-radius 320ms ease` on `[data-bar-ground]` in `src/styles/global.css`. The landing bar's ground also fades in on reveal, and that `opacity 200ms ease-out` sits in the same declaration rather than in the component.
- It has to sit there. `transition` is a shorthand, so a component redeclaring it replaces the list rather than adding to it. `site-bar.astro` asked for the fade on its own ground until 2026-08-25, which reset `transition-property` to `opacity` alone and left the landing bar changing shape in a single frame while a route eased through the same 320ms. Astro scopes a component rule to a `data-astro-cid-*` attribute, so the component selector carried three attribute selectors against the one in the stylesheet and won on specificity.
- Measured at 1280 across 31 frames, the landing ground held 2 distinct radius values against a route's 21. Read a claim about this off the computed `transition-property` rather than off a capture, since the two surfaces render identically at rest and differ only in how they get there.
- The border and the shadow are deliberately not in the list. They arrive at once on both bars, which marks the instant the bar detaches from the viewport, where an edge fading up reads as the bar being unsure whether it has.
- The landing bar's reveal fade and its shape change never overlap. The reveal keys to half the hero and the shape to 320px past its full height, which measures 770px of scroll apart at 1280 and 1440 and 635px at 390.
- The two bars condense on different gates by design. A route condenses at 240px of raw scroll, and the landing bar at 320px past the hero's own height, so a tall viewport and a short one condense at the same point in the reading rather than at the same pixel.
- Under `prefers-reduced-motion: reduce` neither bar transitions and both still change shape, so that reader meets two shapes arriving instantly. See `.claude/ARCHITECTURE.md` § One ground for two bars, and the shape moves while the row does not.

## Cascade reveal primitive

- Elements that animate in on scroll carry a `data-fade` attribute and an optional `--fade-delay` CSS custom property.
- On viewport entry the element reveals via a 700ms fade-and-rise. The observer writes the effective delay: everything arriving in one callback sorts by document position, and the whole batch fits inside a 400ms window, so the authored `--fade-delay` states the intended order rather than the timing.
- An authored delay assumes its surface arrives alone, and a fast scroll breaks that assumption. Several surfaces land in one callback, a card at 800ms finishes after a row below it at 150ms, and the page reveals backwards. Sorting the batch puts that inversion out of reach at any scroll speed, and the window caps the longest wait rather than letting it grow with the batch.
- `data-visible="true"` set at server render makes the fade a no-op. A project route used to set it on every faded element so those long-form pages rendered static, and that stopped being true at 858fcaf, which gave a route's prose the same reveal the landing page runs. Measured on `/canon`, prose arrives between 778ms and 1111ms.
- Under `prefers-reduced-motion: reduce` elements render at final position immediately.
- `REVEAL_THRESHOLD` and `REVEAL_ROOT_BOTTOM_INSET_PERCENT` are exported and the observer builds its `threshold` and `rootMargin` from them. `e2e/lazy-images.ts` imports the pair, because the walk a test runs has to wait on the elements this module is due to mark, and a walk holding its own copies drifts from these the moment either moves.
- The cascade defeats a geometry assertion that reads too early. Two cards in one grid row report positions several pixels apart while the later one is still rising, which reads as a layout defect and is not one. A test comparing positions scrolls the surface into view and waits out the longest delay first. Heights are unaffected, since the reveal translates rather than scales, so a height comparison needs no wait.

## A list reveals as a group

- A container marked `data-fade-group` is watched instead of its rows, and its rows are stepped by their position in it at 220ms. Its rows are excluded from the batch path entirely, so the two never both write to one element.
- The batch stagger above cannot produce a cascade, which is worth stating because it looks like it should. It orders whatever arrives in one observer callback, and a reader scrolling at reading pace delivers a six-row list as six callbacks of one element each: measured on the timeline, batch sizes ran 1,1,1,1,1,1,1,1,1,2 under a slow scroll against 3,6 under a fast one. A batch of one is stepped by zero, so the constant is inert in exactly the case a reader is in and raising it changes nothing anyone sees.
- The group's step is scheduled with a timer per row rather than written as a `transition-delay`, because that longhand is reset by any `transition` shorthand a component declares on the same element.
- The step is read against the 700ms fade rather than chosen freely. Rows closer than about a fifth of it overlap almost entirely and the list reads as one block. At 220ms the last of six starts at 1.1s and the list settles inside 1.8s, judged live against 90 and 140.
- The threshold is 0 rather than a ratio, since a list taller than the viewport never reaches a share of itself.
- A group clears the authored `--fade-delay` on every row it marks. The batch path overwrites that value on everything it touches, so a delay written in markup has set nothing for a long time and several surfaces still carry one. Left alone under a group it adds to the timer rather than replacing it, and the pair pushes the last row past the delay ceiling the suite holds. The existing assertion caught this rather than any new one.
- Grouping suits a container that fits roughly within a screen, and only that. Measured at a 900px viewport: the timeline runs 674px and the closing ask 252px, so both group. The projects grid runs 1477px, which is 1.6 times the viewport, and does not: watching it lit the last card while that card was still off screen, measured under a scroll, and its ten faded elements put the last one 1980ms out.
- A project card is a group of its own, which is the same rule applied one level down. The numeral leads and the card follows, and the lead already existed by accident, since the numeral sits above and outside the card and crosses the viewport edge first. It ran 199, 198, 226, and 197ms on the four two-column cards and collapsed to 56ms on the wide one that closes the section, whose geometry differs. Grouping evens it to 222 through 247ms on all five, and it matters most on a phone, where one column makes every card the wide case.
- Read that pair as the rule rather than as two calls. What can be grouped is whatever a reader meets as one thing on one screen, so a card qualifies where the grid holding it does not.

## What arrives, and what was always there

- Reveal is opt-in and nothing reported what opted out until `e2e/reveal-inventory.ts` was written. Measured on the landing page before this work: 79 blocks revealed and 8 did not.
- The footer carried no marker at all across the résumé link, the colophon, and the deploy date, so the last surface on the page was in place before a reader reached it. Its signature keeps its own wipe and takes none. The two blocks are grouped rather than left to the batch path, because they stack at narrow widths and would then cross the edge separately, which is a batch of one and a step of zero.
- The hero's theme toggle is marked on the control rather than on its home in the hero. The handoff re-parents it into a fixed host on load and the home collapses to a point, so a marker there would fade an empty box. The handoff is unaffected: it reads the home's box rather than the control's, discounts a `[data-fade]` ancestor's transform when it finds one, and a transform on the control changes no parent's layout box. Verified at 1280x800, where the control fades 0 to 1 while rising 56 to 40 and still lands on the bar slot at 0px in both axes.
- The `.theme-toggle` rule was the second instance of a component deleting the reveal, found by the guard rather than by eye, and it is why that check is worth more than the one defect it was written for.
- A route's way home is marked in the foot and deliberately not in the bar. The foot sits among prose that now reveals, and the bar is chrome a reader reaches for at any scroll position, where a delay takes navigation away to gain nothing.
- Three kinds of block stay static on purpose: the contact dock runs its own scroll gate, the shader canvas is a ground rather than an element, and the hero's fade band and the about surface's flight are decoration with animations of their own.
- A route's chrome arrives with its prose. The rail and the bar row both start at opacity 0 and reach 1, measured from first paint, where the rail alone read 1 against the prose's 0 until 2026-08-24. The landing bar is the deliberate exception: its name and toggle fly in from the hero on measured positions, and an opacity transition there reopens the three placement defects `.claude/ARCHITECTURE.md` records. Same arrival, different mechanism.
- The instrument watching this failed the way the surfaces it watches fail. `e2e/reveal-inventory.ts` read the rail as `[data-section-nav] li` and the rail renders `a`, so that clause matched nothing on every run and reported nothing wrong, which is the same output as a rail arriving correctly. A guard asserts every clause still finds something, and the list moved to `e2e/reveal-selectors.ts` because the inventory executes at import and a spec reading the list from it started an inventory run inside the suite.
- An instrument is not a guard. That inventory reports when somebody runs it, and nothing failed while a route's chrome sat placed for weeks. A surface whose arrival matters earns an assertion rather than a line in a report.
- Sample a first-paint arrival by its first and last value rather than by catching a frame mid-transition. The rail fades over 300ms against the prose's 700, so a loaded engine steps over the rail's whole transition and reports a surface that faded as one that was placed.
- Giving the footer a reveal stranded it on a tall screen, and the mechanism reaches further than the footer. The reveal root is inset from the bottom by a share of the viewport, while content at the end of the document sits a fixed distance from the page's bottom, so past some height the inset is deeper than that distance and the element lands in the excluded band with no scroll left to carry it out. Measured on the footer: revealed at 1000 and 1080, never revealed at 1200 and 1400, where its top sat at 1108 against an edge at 1080.
- Reaching the end of the document is therefore the moment nothing may still be hidden, whatever an observer decided, and `revealAtDocumentEnd` in `src/lib/reveal.ts` enforces it. A group runs its own staggered reveal from there rather than being marked flat, so the fallback costs the cascade nothing.
- This is the same class the contact dock hit, where a gate watched a root capped to the top half of the viewport for an element sitting at the bottom of the last screen. Any gate keyed to a share of the viewport is wrong for content anchored to the end of the page. A check at one viewport height proves nothing about it, which is why the guard runs at 800, 1200, and 1600.

## A component can delete the reveal, and nothing reports it

- `transition` is a shorthand, so a component declaring one on a `[data-fade]` element replaces the reveal's outright rather than adding to it. Specificity does not decide it: these rules sit in `@layer utilities` and Astro emits component styles unlayered, and an unlayered declaration beats a layered one at any specificity.
- The experience rows shipped in that state. They declared a 150ms color and shadow transition for their active state and snapped from 0 to 1 with no fade at all, while carrying every marker a structural inventory reads. Six of the 35 faded elements on the page were affected and only those six.
- `--reveal-transition` in `:root` is the repair. A component setting `transition` on a faded element opens its list with `var(--reveal-transition)`.
- That token carries no delay and cannot. A nested `var()` inside an inherited custom property resolves where the property is declared rather than where it is used, so `var(--fade-delay)` written into it resolves against `:root`, falls back to its default, and every element inherits the same baked zero.
- `e2e/home.spec.ts` guards both halves. One fails when any faded element has no opacity transition, and one fails unless a row is caught part-way through its fade. The second matters on its own: a spread measurement alone passes on a list that snaps at staggered times, which is exactly what shipped.
- Read the general case rather than the CSS trivia. Three separate mechanisms each produced the same symptom, and a structural check reporting the markers present passed through all three. Watch the paint, not the attribute.

## Availability pulse

- The status dot in the closing ask holds full opacity while a pseudo-element halo scales from its own size to 2.6 and fades, on a 2400ms loop with no end. It is the only always-on animation among the page's content, and it exists because a pulse states that availability is live now rather than printed.
- The header's shader field also runs without end, and the two do not compete. The field is a ground rather than an element, it carries no edge to track, and it moves at 0.13px per second against a halo completing a cycle every 2400ms. The still copy of that field under the rest of the page does not move at all. See `.claude/context/shader-field.md` and `.claude/context/page-ground.md`.
- The halo is a pseudo-element rather than the dot itself, so the pulse never changes the dot’s box and nothing in the status row reflows against it.
- Under a reduced-motion preference the pseudo-element is not generated at all, so the halo has no presence in the layout and the dot keeps its static ring.
- Two things pulse, and they never share a screen. This dot sits in the closing ask and the portrait's rings sit at the top of the hero, so the reason a second heartbeat was barred, that it competes with the first for the same attention, does not reach a surface a reader has to scroll a page to leave. Read the rule as one pulse per screen rather than one per page.
- The experience section's active marker still takes none. It states a position rather than a state, it already animates on hover and on the walk back, and it sits between the two above.

## Portrait rings

- The rings are contours of a mound the shader adds to its own stream function, centred on the photo. Nothing draws a ring: a radially falling term makes the field's level sets circles where it dominates, so the lines a reader counts are the field's own, bending where the terrain does and dissolving back into it where the mound runs out.
- That placement is the whole decision, and it is the one the click ripple already made. Contours are extracted after the term is added, so the relief lighting, the height tint, the sheen, and the pointer's reveal all reach the rings without a second drawing existing to keep in step with the first.
- `portraitDepth` times `lineCount` is the ring count, the same arithmetic the ripple answers to. 0.62 at 13 draws eight.
- The mound falls on a smoothstep rather than a straight ramp, so its slope is steepest mid-annulus and flattens at both ends. The rings crowd where it falls fastest and part as it levels, which is spacing a stack of evenly-spaced rings has no way to state.
- `portraitReach` is 2.35 times the photo's radius, 188px against an 80px photo at `lg`. It carries over from the CSS rings this replaced, so what changed is what the rings are rather than how far they go.
- The column damp is lifted across the annulus, because the damp exists so the field never competes with the name and the photo sits inside the box it covers. Rings drawn there and then damped are rings drawn where the field is quietest.
- `portraitLift` is 0.30 rather than full. At 0.75 the annulus carries 2.10 times the retired CSS rings' ink in light and 2.13 in dark, read off painted pixels, which is louder beside the name than this surface has ever been. 0.30 holds 1.65 and 1.39. Both were served live and driven, since two arms differing only in weight are what a still is worst at separating.
- The 13s swell is gone rather than moved. It was a second clock over a surface that already has one: the field evolves under the rings now, so they breathe with it instead of pulsing against it. Reduced motion needs no special case for the same reason, since the field already holds one drawn frame under it.
- The rings take the field's own tone where the retired ink took `--accent`. Measured as red over blue across ink pixels, they run 12.6 against 17.7, so about 71% of the warmth survives rather than all or none of it. The field's light tone is already a warm cream, which is why the loss is milder than it looks in a capture.
- Two CSS arms were built and rejected, both shading a conic gradient masked by the ring lines. They imitate relief convincingly and stay imitations, and a later retune of the field leaves them behind with nothing reporting it. Held to the shipped mean they measured 0.97 and 1.05 in light, 0.93 and 1.06 in dark.
- Capping the shaded arms' lit arc at the flat ink's own value is the mistake that nearly settled this. The flat ink was tuned against the field's peak contour weight, which is the right comparison for an ink that never varies and the wrong one once it does: peak-to-peak cost 28% of the mean and made both arms dimmer than the baseline before they were anything else.
- The rings never reach the name at any width. Measured across six from 390 to 1920, the closest approach is 181px against a 94px reach at 390, so drawing them under the content column rather than over it costs nothing. That cost was asserted and then measured away.

## Experience timeline

- One timeline row is highlighted at a time. JS owns the active row via `[data-active]`. The first row carries `[data-default-active]` so the no-JS path renders with row one highlighted. The script removes that attribute at init.
- Hovering a row transfers the highlight. On `pointerleave` of the stage wrapper the highlight walks back row by row to the first row.
- The walk lingers on the row a reader chose and gathers pace as it returns, at step delays running 160ms down to 83ms across five steps. It depicts letting go of a row rather than traveling to another, so the moment worth holding is the leaving. The reverse shipped until 2026-08-20 and rushed exactly that, then eased into a row nobody had asked about. Judged live at four paces against an even cadence, the reverse, and a curve slow at both ends.
- The active row's dot fills with the accent and takes a soft ring, transitioning at 150ms ease-out alongside the row's color shift.
- The row also lifts onto the site's glow, drawn behind it and inset outward, so the list carries no plate at rest. It is keyed to the row the list marks rather than to the pointer, which is what lets the plate travel with the dot through the walk. On `:hover` alone it stayed on the row the pointer left and faded there while the dot moved on, lighting two rows by two different means: measured 160ms after leaving, the dot sat two rows from a plate still at 0.66.
- The stage carries an engagement flag so the plate leaves once the walk settles. Keying the plate to the marked row alone would put a permanent one under the first row, which is highlighted from first paint.
- The plate leaves over the site's shared 520ms while the walk steps faster than that, so several rows are lit at once on the way back and the glow cascades up the list. That is the reason the slow steps fall first: the trail is thickest at the start, and a longer first step gives each plate more of its own fade to clear in.
- The SVG career graph beside the list is gone, and with it the node-to-row hover pairing and the edge-draw stagger it carried. The dots now sit in the row gutter on a single rail, so a row and its dot are one element to hover and there are two fewer moving parts. A session reading this entry for the fan animation is reading a removed feature.

## Footer signature wipe

- The footer signature is an inlined SVG of filled paths rendered in `--foreground`, fully visible by default so a JS or observer failure cannot hide it.
- On viewport entry an `IntersectionObserver` at threshold 0.1 with a -10% bottom `rootMargin` toggles `data-revealed="true"` once, activating a CSS keyframe that wipes `clip-path` from `inset(0 100% 0 0)` to `inset(0)` over 1200ms ease-out.
- The animation is gated on `[data-js="true"]` and `prefers-reduced-motion: no-preference` so no-JS and reduced-motion paths render statically.
- Filled paths from auto-vectorization preclude `stroke-dashoffset`, so the wipe substitutes for a stroke-draw effect at footer scale.

## Claim annotation

- One phrase in the claim carries a `rough-notation` underline drawn 100ms after the claim's reveal transition ends. Runs once per page load and never replays. The annotation belongs to the sentence rather than to a surface, so it sits on experience, where the claim sits.
- The end of the transition is the signal rather than a figure describing it. The reveal observer writes the delay at intersection time and creates itself synchronously, while this module waits on a dynamic import, so a delay read inside the annotation is either stale or already spent depending on which runs first. A version reading the computed delay drew the underline at 0.01 opacity, on a headline that had barely started rising.
- A headline the page rendered visible never transitions, so a settled opacity draws immediately, and a timeout bounded by the reveal duration covers a transition interrupted before it ends.
- The library imports dynamically from a client `<script>` so it executes browser-only. The stroke uses `currentColor`, which inherits the foreground color of the claim it marks.
- Skipped entirely under `prefers-reduced-motion: reduce`. Only one phrase per page may carry an annotation, by editorial rule.

## Section motifs

Two surfaces carry a small figure: a character rising into the closing ask, and an aircraft crossing the about surface and coming to rest. Two is a pair rather than a pattern, and the rule below is what decides whether a third is a language or a habit.

- A section earns a figure only when its own copy names the thing the figure draws. The aircraft qualifies because the paragraph arrives from Vietnam in its first sentence and leaves most summers in its last, so flight is what both ends share. A figure chosen for a section that reads as bare is decoration, and the section reads as bare for some other reason.
- Reject the figure that answers part of the copy. A map of Sweden was measured against the same paragraph and drops Vietnam, which is the clause it opens on, so it illustrates the middle sentence and contradicts the first.
- One figure per surface, and no surface takes a second. A figure competing with the header portrait is what `.claude/wireframes/about.md` bars, and a moving figure clears that bar by arriving rather than by sitting there from the first paint.
- A figure arrives and stays. Both surfaces reveal on an `IntersectionObserver` at a threshold rather than at any intersection, run once, and never replay, so no figure loops. The availability pulse and the header's ambient field are the only two things that do.
- Take the fill from the upstream artwork the accent derives from rather than sampling a rendered figure, so a second mark reads as the same language rather than as a near miss of the first.
- Every figure carries `aria-hidden` and no accessible name, and renders nothing at all under `prefers-reduced-motion: reduce`. A figure carrying information would fail that test, which is another way of stating the first rule.
- A figure near a section's top edge collides with the sticky bar when a reader arrives from the rail, since the section pins under it. Give that reader the figure at rest rather than declining to render it, and keep the approach for an arrival with clear air under the bar.
- Read both conditions on demand rather than taking them from an observer callback. An observer reports a threshold being crossed, so a reader who arrives already past it never crosses it again: the gate declines once and no further callback arrives however far they scroll. Scrolling on from a pinned section carries the band further up and out, so the clear air it waits for cannot come.

## Flight mechanics

- The aircraft follows one cubic through `offset-path`, with `offset-rotate: auto` taking its angle off the tangent. Two transforms on separate easings compose a path only by disagreeing, and what they compose is a glide followed by a dive, since neither owns the shape.
- The curve lives in the component and reaches the CSS as a custom property, so the contrail and the aircraft read one string.
- The craft rides that curve by its own origin, so the origin is the one point the contrail leaves from and it has to be the drawing's centre at every scale. Derive it from the scale rather than writing the pair beside it. The pair that stated it by hand was exact at 0.45 and silently wrong the moment the scale moved: at 0.7 it put the origin 15 units ahead of the fuselage and 7.5 below its centreline, which reads as the trail leaving from beside the aircraft rather than behind it, and measured 7.5px perpendicular and 15px along at 1280. Derived, it measures 0.00px on both at 1280, 1024, and 390.
- Read that as the shape the surface keeps producing rather than as one slip. The scale, the trail's weight, and the origin are three values holding one ratio, and the first two were already derived for this reason. The record here carried the corrected 75.6 while the component's own comment still read 48.6, so a figure updated in prose and left in code is what the drift looks like from either side.
- The contrail's tail pins at the start of the flight and never moves. A fade window travels with the aircraft and everything older has gone to nothing, which is what gives the trail a length without anything being shortened. A tail sliding forward reads as the trail being deleted.
- The trail's head holds 6% of the flight behind the aircraft. The curve runs 760.8 units and the aircraft renders 75.6 wide, so half of it is 5.0%, and a head closer than that draws inside the tail rather than behind it.
- The aircraft's own scale therefore bounds that head. At the 48.6 it drew until 2026-08-22 the floor sat at 3.2% and the head cleared it by 21 units. At 75.6 the floor is 5.0% and the clearance is 8. A further scale past about 0.90 puts the nose inside its own trail, so the head moves with it.
- Both trail animations are sampled from the aircraft's easing and run `linear`. A timing function applies per keyframe interval rather than across an animation, so a multi-step trail and a two-step aircraft compute their positions on different curves and drift apart the moment the trail gains a middle step.
- Read a position along the curve off its arc length rather than its parameter. A cubic's parameter and the distance it covers are not the same walk.
- The flight runs 2000ms on a curve covering 17% of the journey in its first quarter. The site's other one-shot animations run 500ms, 700ms, and 1200ms, so this is the longest and stays in the family. An earlier 3600ms spent half its duration on the last 12% of the distance.
- The clip belongs to the element carrying the page measure rather than to the band, which grows with the viewport while the curve's start does not, leaving the aircraft parked in the margin in full view.

Verified at 2ae6e7f on 2026-08-19, with the origin re-read at 1280, 1024, and 390 on 2026-08-23.
