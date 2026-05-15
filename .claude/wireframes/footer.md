---
title: Footer
description: Bottom of the page. Carries a downloadable résumé link plus a copyright line.
---

# Footer

Appears at the bottom of the page. Carries a downloadable résumé link plus a copyright line. Contact links live in the header so the footer does not duplicate them. Separated from the projects section by a hairline `border-t`.

## Desktop (≥768px)

```plaintext
┌──────────────────────────────────────────────────────────┐
│   ─────────────────────────────────────────────────────  │  ← border-t
│                                                          │
│   Résumé              Set in Fraunces and Inter · 2026   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Narrow (≤320px)

```plaintext
┌──────────────────────────────────┐
│   ──────────────────────────     │
│                                  │
│   Résumé                         │
│   Set in Fraunces and Inter ·    │
│   Gothenburg, 2026               │
│                                  │
└──────────────────────────────────┘
```

## Behavior

- Layout switches from row to column under `md`. On narrow viewports the link sits above the colophon with comfortable spacing between.
- Résumé link opens in a new tab so the landing page stays in the originating tab while the PDF reads in another.
- Year derives from the current build time. The colophon credits the type families plus the city, in place of a copyright line.

## Masthead

The footer opens with a Fraunces 600 `Eric Le` mark sized via `clamp(2rem, 4vw + 1rem, 3rem)` so it scales smoothly down to 320px without overflowing. The Résumé link and copyright drop below the mark as small meta in the existing `text-label` rendering. Sized one step under the hero H1 so the footer reads as a closing statement, not a second title.

## Signature wipe

The footer signature is an inlined SVG of filled paths sized to ~6rem wide via an explicit aspect-ratio wrapper, rendered in `--foreground`. The signature is fully visible by default so a JS or observer failure does not hide it. On viewport entry an `IntersectionObserver` at threshold 0.1 with a -10% bottom rootMargin toggles `data-revealed='true'` once, which activates a CSS keyframe animation wiping `clip-path: inset(0 100% 0 0)` to `inset(0)` over 1200ms ease-out. The animation rule is gated on `[data-js='true']` and `prefers-reduced-motion: no-preference` so the no-JS and reduced-motion paths render statically. Filled paths from auto-vectorization preclude `stroke-dashoffset`, so the wipe substitutes for the stroke-draw effect at footer scale.
