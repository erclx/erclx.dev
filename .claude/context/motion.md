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
- The cascade defeats a geometry assertion that reads too early. Two cards in one grid row report positions several pixels apart while the later one is still rising, which reads as a layout defect and is not one. A test comparing positions scrolls the surface into view and waits out the longest delay first. Heights are unaffected, since the reveal translates rather than scales, so a height comparison needs no wait.

## Availability pulse

- The status dot in the closing ask holds full opacity while a pseudo-element halo scales from its own size to 2.6 and fades, on a 2400ms loop with no end. It is the only always-on animation on the page, and it exists because a pulse states that availability is live now rather than printed.
- The halo is a pseudo-element rather than the dot itself, so the pulse never changes the dot’s box and nothing in the status row reflows against it.
- Under a reduced-motion preference the pseudo-element is not generated at all, so the halo has no presence in the layout and the dot keeps its static ring.
- Only this dot pulses. The experience section's active marker states a position rather than a state, it already animates on hover and on the walk back, and a second heartbeat would compete with the first for the same attention.

## Experience timeline

- One timeline row is highlighted at a time. JS owns the active row via `[data-active]`. The first row carries `[data-default-active]` so the no-JS path renders with row one highlighted. The script removes that attribute at init.
- Hovering a row transfers the highlight. On `pointerleave` of the stage wrapper the highlight walks back row by row to the first row. Step delays follow a quadratic ease-out from 40ms to 160ms so the highlight reads as a ball settling, not a constant march.
- The active row's dot fills with the accent and takes a soft ring, transitioning at 150ms ease-out alongside the row's color shift.
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
- A figure arrives and stays. Both surfaces reveal on an `IntersectionObserver` at a threshold rather than at any intersection, run once, and never replay, so nothing on the page loops except the availability pulse.
- Take the fill from the upstream artwork the accent derives from rather than sampling a rendered figure, so a second mark reads as the same language rather than as a near miss of the first.
- Every figure carries `aria-hidden` and no accessible name, and renders nothing at all under `prefers-reduced-motion: reduce`. A figure carrying information would fail that test, which is another way of stating the first rule.
- A figure near a section's top edge collides with the sticky bar when a reader arrives from the rail, since the section pins under it. Gate the reveal on the section's own top edge against the bar's measured height.

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
