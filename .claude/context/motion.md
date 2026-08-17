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
- `data-visible="true"` set at server render makes the fade a no-op. The Jobtriage case study sets it on every faded element so the long-form page renders static.
- Under `prefers-reduced-motion: reduce` elements render at final position immediately.
- The cascade defeats a geometry assertion that reads too early. Two cards in one grid row report positions several pixels apart while the later one is still rising, which reads as a layout defect and is not one. A test comparing positions scrolls the surface into view and waits out the longest delay first. Heights are unaffected, since the reveal translates rather than scales, so a height comparison needs no wait.

## Availability pulse

- The status dot in the header holds full opacity while a pseudo-element halo scales from its own size to 2.6 and fades, on a 2400ms loop with no end. It is the only always-on animation on the page, and it exists because a pulse states that availability is live now rather than printed.
- The halo is a pseudo-element rather than the dot itself, so the pulse never changes the dot’s box and nothing in the status row reflows against it.
- Under a reduced-motion preference the pseudo-element is not generated at all, so the halo has no presence in the layout and the dot keeps its static ring.
- Only this dot pulses. The origin section's active marker states a position rather than a state, it already animates on hover and on the walk back, and a second heartbeat would compete with the first for the same attention.

## Origin timeline

- One timeline row is highlighted at a time. JS owns the active row via `[data-active]`. The first row carries `[data-default-active]` so the no-JS path renders with row one highlighted. The script removes that attribute at init.
- Hovering a row transfers the highlight. On `pointerleave` of the stage wrapper the highlight walks back row by row to the first row. Step delays follow a quadratic ease-out from 40ms to 160ms so the highlight reads as a ball settling, not a constant march.
- The active row's dot fills with the accent and takes a soft ring, transitioning at 150ms ease-out alongside the row's color shift.
- The SVG career graph beside the list is gone, and with it the node-to-row hover pairing and the edge-draw stagger it carried. The dots now sit in the row gutter on a single rail, so a row and its dot are one element to hover and there are two fewer moving parts. A session reading this entry for the fan animation is reading a removed feature.

## Footer signature wipe

- The footer signature is an inlined SVG of filled paths rendered in `--foreground`, fully visible by default so a JS or observer failure cannot hide it.
- On viewport entry an `IntersectionObserver` at threshold 0.1 with a -10% bottom `rootMargin` toggles `data-revealed="true"` once, activating a CSS keyframe that wipes `clip-path` from `inset(0 100% 0 0)` to `inset(0)` over 1200ms ease-out.
- The animation is gated on `[data-js="true"]` and `prefers-reduced-motion: no-preference` so no-JS and reduced-motion paths render statically.
- Filled paths from auto-vectorization preclude `stroke-dashoffset`, so the wipe substitutes for a stroke-draw effect at footer scale.

## Header H1 annotation

- One phrase in the hero H1 carries a `rough-notation` underline drawn ~950ms after the H1 enters the viewport, roughly 100ms after the fade settles. Runs once per page load and never replays.
- The library imports dynamically from a client `<script>` so it executes browser-only. The stroke uses `currentColor`, which inherits the H1's foreground text color.
- Skipped entirely under `prefers-reduced-motion: reduce`. Only one phrase per page may carry an annotation, by editorial rule.
