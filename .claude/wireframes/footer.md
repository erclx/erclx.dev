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
│   Résumé              Gothenburg, Sweden · 2026          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Narrow (≤320px)

```plaintext
┌──────────────────────────────────┐
│   ──────────────────────────     │
│                                  │
│   Résumé                         │
│   Gothenburg, Sweden · 2026      │
│                                  │
└──────────────────────────────────┘
```

## Behavior

- Signature anchors the top of the footer content. Below it, the Résumé link and colophon line render in a flex-between row: Résumé on the left, `Gothenburg, Sweden · 2026` on the right. Stacks to a column under `md` with the link above the colophon.
- Résumé link opens in a new tab so the landing page stays in the originating tab while the PDF reads in another. A small Lucide paperclip icon precedes the word `Résumé` with `inline-flex items-center gap-2`, slightly rotated and rendered in `text-muted-foreground`, signalling "attached document" rather than a generic link.
- Year derives from the current build time. The colophon carries the city plus the year in place of a copyright line. Font families are not named. The page itself shows them.

## Masthead

The footer's closing mark is the handwritten signature itself. The set-type `Eric Le` is retired. The handwritten signature carries the name on its own at a scale large enough to read as the page's signoff. Width clamps via `clamp(7rem, 14vw + 3rem, 16rem)` so it scales smoothly from narrow phone widths up to desktop without overflowing. Below the signature, the Résumé link and right-anchored colophon balance the visual mass without an empty quarter.

## Signature wipe

The footer signature is an inlined SVG of filled paths sized via `clamp(7rem, 14vw + 3rem, 16rem)` width and an explicit aspect-ratio wrapper, rendered in `--foreground`. The signature is fully visible by default so a JS or observer failure does not hide it. On viewport entry an `IntersectionObserver` at threshold 0.1 with a -10% bottom rootMargin toggles `data-revealed='true'` once, which activates a CSS keyframe animation wiping `clip-path: inset(0 100% 0 0)` to `inset(0)` over 1200ms ease-out. The animation rule is gated on `[data-js='true']` and `prefers-reduced-motion: no-preference` so the no-JS and reduced-motion paths render statically. Filled paths from auto-vectorization preclude `stroke-dashoffset`, so the wipe substitutes for the stroke-draw effect at footer scale.
