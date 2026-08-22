---
title: Motion
description: Scroll-reveal cascade primitive and the per-surface animations on the landing page
---

# Motion

## Overview

How the landing page's scroll-triggered animation works. Layout and interaction intent for each surface live in its `.claude/wireframes/<surface>.md` file. This entry covers the shared mechanism.

## Cascade reveal primitive

- Elements that animate in on scroll carry a `data-fade` attribute and an optional `--fade-delay` CSS custom property.
- On viewport entry the element reveals via a 700ms fade-and-rise. The observer writes the effective delay: everything arriving in one callback sorts by document position, and the whole batch fits inside a 400ms window, so the authored `--fade-delay` states the intended order rather than the timing.
- An authored delay assumes its surface arrives alone, and a fast scroll breaks that assumption. Several surfaces land in one callback, a card at 800ms finishes after a row below it at 150ms, and the page reveals backwards. Sorting the batch puts that inversion out of reach at any scroll speed, and the window caps the longest wait rather than letting it grow with the batch.
- `data-visible="true"` set at server render makes the fade a no-op. Every project route sets it on every faded element so those long-form pages render static.
- Under `prefers-reduced-motion: reduce` elements render at final position immediately.
- `REVEAL_THRESHOLD` and `REVEAL_ROOT_BOTTOM_INSET_PERCENT` are exported and the observer builds its `threshold` and `rootMargin` from them. `e2e/lazy-images.ts` imports the pair, because the walk a test runs has to wait on the elements this module is due to mark, and a walk holding its own copies drifts from these the moment either moves.
- The cascade defeats a geometry assertion that reads too early. Two cards in one grid row report positions several pixels apart while the later one is still rising, which reads as a layout defect and is not one. A test comparing positions scrolls the surface into view and waits out the longest delay first. Heights are unaffected, since the reveal translates rather than scales, so a height comparison needs no wait.

## A list reveals as a group

- A container marked `data-fade-group` is watched instead of its rows, and its rows are stepped by their position in it at 220ms. Its rows are excluded from the batch path entirely, so the two never both write to one element.
- The batch stagger above cannot produce a cascade, which is worth stating because it looks like it should. It orders whatever arrives in one observer callback, and a reader scrolling at reading pace delivers a six-row list as six callbacks of one element each: measured on the timeline, batch sizes ran 1,1,1,1,1,1,1,1,1,2 under a slow scroll against 3,6 under a fast one. A batch of one is stepped by zero, so the constant is inert in exactly the case a reader is in and raising it changes nothing anyone sees.
- The group's step is scheduled with a timer per row rather than written as a `transition-delay`, because that longhand is reset by any `transition` shorthand a component declares on the same element.
- The step is read against the 700ms fade rather than chosen freely. Rows closer than about a fifth of it overlap almost entirely and the list reads as one block. At 220ms the last of six starts at 1.1s and the list settles inside 1.8s, judged live against 90 and 140.
- The threshold is 0 rather than a ratio, since a list taller than the viewport never reaches a share of itself.

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

- The portrait carries concentric contour rings on a frame element, since an image is replaced content and generates no pseudo-element of its own. The frame draws nothing at rest and holds the float and the size, so it is markup a treatment can use rather than a treatment.
- One swell every 13s, then a rest for the back half of the cycle. A pulse restarting the moment it ends reads as presence rather than as a signal, and this surface already carries the field's own motion under it.
- Reduced motion keeps the rings and drops the swell, which is the same drawing without the movement.
- The ink is one hue at two weights rather than two colors. `--accent` is already theme-aware, so what needs splitting is how much of it to use: the same ink over cream carries far more than over near-black.
- Both weights are set against the field's own contour lines in the annulus the rings occupy, where the field peaks at 10.73 in light and 12.65 in dark. Light saturates at 12% and lands on 10.87, dark takes 22% and lands on 12.79, so the rings join the field rather than sitting on top of it. Measured as added ink the two match within 4%, at 0.126 and 0.131 of mean deviation.
- The 30% that looked right in dark measured 20.32 in light, nearly twice the weight of the lines it was meant to join. A single alpha across both themes is the mistake to avoid.
- Rings are drawn with a repeating radial gradient rather than stacked box shadows. A box shadow is a filled disc, so the visible ring is the gap between two of them and the weight lands in the band, which read as a grey donut in light at every alpha tried.

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
- The contrail's tail pins at the start of the flight and never moves. A fade window travels with the aircraft and everything older has gone to nothing, which is what gives the trail a length without anything being shortened. A tail sliding forward reads as the trail being deleted.
- The trail's head holds 6% of the flight behind the aircraft. The curve runs 760.8 units and the aircraft renders 48.6 wide, so half of it is 3.2%, and a head closer than that draws inside the tail rather than behind it.
- Both trail animations are sampled from the aircraft's easing and run `linear`. A timing function applies per keyframe interval rather than across an animation, so a multi-step trail and a two-step aircraft compute their positions on different curves and drift apart the moment the trail gains a middle step.
- Read a position along the curve off its arc length rather than its parameter. A cubic's parameter and the distance it covers are not the same walk.
- The flight runs 2000ms on a curve covering 17% of the journey in its first quarter. The site's other one-shot animations run 500ms, 700ms, and 1200ms, so this is the longest and stays in the family. An earlier 3600ms spent half its duration on the last 12% of the distance.
- The clip belongs to the element carrying the page measure rather than to the band, which grows with the viewport while the curve's start does not, leaving the aircraft parked in the margin in full view.

Verified at 2ae6e7f on 2026-08-19.
