---
title: Motion
description: Scroll-reveal cascade primitive and the per-surface animations on the landing page
---

# Motion

How the landing page's scroll-triggered animation works. Layout and interaction intent for each surface live in its `.claude/wireframes/<surface>.md` file. This entry covers the shared mechanism.

## Cascade reveal primitive

- Elements that animate in on scroll carry a `data-fade` attribute and an optional `--fade-delay` CSS custom property.
- On viewport entry the element reveals via a 700ms fade-and-rise. `--fade-delay` staggers siblings so a section's children cascade top to bottom.
- `data-visible="true"` set at server render makes the fade a no-op. The Jobtriage case study sets it on every faded element so the long-form page renders static.
- Under `prefers-reduced-motion: reduce` elements render at final position immediately.

## Origin timeline

- One timeline row is highlighted at a time. JS owns the active row via `[data-active]`. The first row carries `[data-default-active]` so the no-JS path renders with row one highlighted. The script removes that attribute at init.
- Hovering a row transfers the highlight. On `pointerleave` of the stage wrapper the highlight walks back row by row to the first row. Step delays follow a quadratic ease-out from 40ms to 160ms so the highlight reads as a ball settling, not a constant march.
- The SVG career graph extends the same script: `setActive(idx)` toggles `[data-active]` on the row and `[data-node-active]` on the matching graph node. Hover works from either side. The `pointerleave` listener sits on the wrapper containing both list and graph so crossing between them does not trigger the walk-back.
- The 2px left border, marker fill, and color shift transition at 150ms ease-out. A negative left margin compensates for the border-side padding so content does not shift.
- Graph edges animate `stroke-dashoffset` from 1 to 0 in three batches (trunk 150ms, branches 300ms, converges 500ms) so the DAG reads as building from the foundation up. Reduced motion renders edges at full length.

## Footer signature wipe

- The footer signature is an inlined SVG of filled paths rendered in `--foreground`, fully visible by default so a JS or observer failure cannot hide it.
- On viewport entry an `IntersectionObserver` at threshold 0.1 with a -10% bottom `rootMargin` toggles `data-revealed="true"` once, activating a CSS keyframe that wipes `clip-path` from `inset(0 100% 0 0)` to `inset(0)` over 1200ms ease-out.
- The animation is gated on `[data-js="true"]` and `prefers-reduced-motion: no-preference` so no-JS and reduced-motion paths render statically.
- Filled paths from auto-vectorization preclude `stroke-dashoffset`, so the wipe substitutes for a stroke-draw effect at footer scale.

## Header H1 annotation

- One phrase in the hero H1 carries a `rough-notation` underline drawn ~950ms after the H1 fade settles, once per page load, never replayed.
- The library imports dynamically from a client `<script>` so it executes browser-only. The stroke uses `--foreground`.
- Skipped entirely under `prefers-reduced-motion: reduce`. Only one phrase per page may carry an annotation, by editorial rule.
