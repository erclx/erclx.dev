---
title: Footer
description: Bottom of the page. Carries a downloadable résumé link plus a copyright line
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

- The signature anchors the top of the footer content. Below it, the Résumé link and colophon line render in a row: Résumé on the left, `Gothenburg, Sweden · 2026` on the right. Stacks to a column under `md` with the link above the colophon.
- The Résumé link opens in a new tab so the landing page stays in the originating tab while the PDF reads in another. A small paperclip icon precedes the word `Résumé`, slightly rotated and muted, signalling "attached document" rather than a generic link.
- The year derives from the current build time. The colophon carries the city plus the year in place of a copyright line.

## Masthead

The footer's closing mark is the handwritten signature itself. The set-type `Eric Le` is retired. The handwritten signature carries the name on its own, scaled large enough to read as the page's signoff and clamped so it scales smoothly from narrow phone widths to desktop without overflowing. Below it, the Résumé link and right-anchored colophon balance the visual mass without an empty quarter.

## Signature wipe

The signature is fully visible by default and wipes in left-to-right on viewport entry. It substitutes for a stroke-draw effect, which the filled signature paths cannot carry. Mechanism: `.claude/context/motion.md`.
