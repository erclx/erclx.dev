---
title: Footer
description: Bottom of the page. Carries a downloadable résumé link and the last deploy date
---

# Footer

Appears at the bottom of the page. Carries a downloadable résumé link and the date of the last deploy. Contact links live in the header and in the dock, so the footer does not duplicate them.

Space before it and the signature opening it are what mark the footer, which is what a reader was using anyway.

## Regions

- Signature: the handwritten signature at the top of the footer content, the page's closing mark
- Résumé link: below the signature, on the left
- Deploy date: beside the Résumé link, right-aligned
- At 768 and wider: the Résumé link and the date render in a row, Résumé on the left and the date right-aligned

```plaintext
┌──────────────────────────────────────────────────────────┐
│                                                          │  ← space alone, no rule
│              (handwritten signature)                     │
│                                                          │
│   📎 Résumé                      Updated August 2026     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Below 768: the row stacks to a column with the link above the date, drawn at 320 below

```plaintext
┌──────────────────────────────────┐
│                                  │
│      (handwritten signature)     │
│                                  │
│   📎 Résumé                      │
│   Updated August 2026            │
│                                  │
└──────────────────────────────────┘
```

The footer's closing mark is the handwritten signature itself. The set-type `Eric Le` is retired. The handwritten signature carries the name on its own, scaled large enough to read as the page's signoff and clamped so it scales smoothly from narrow phone widths to desktop without overflowing. Below it, the Résumé link and the right-anchored date balance the visual mass without an empty quarter.

## States

| State     | Reached when                             | Shows                                                                             | Evidence       |
| --------- | ---------------------------------------- | --------------------------------------------------------------------------------- | -------------- |
| `resting` | The page loads with the footer offscreen | The signature fully visible, the Résumé link and the date waiting to arrive       | `not captured` |
| `arrived` | The footer scrolls into view             | The signature wiping in left to right, then the Résumé link and the date arriving | `not captured` |

## Copy

- Résumé link: `Résumé`, preceded by a paperclip icon
- Deploy date: `Updated <Month YYYY>`, templated from the build date, so `August 2026` in the sketches is a placeholder

## Behavior

- The Résumé link opens in a new tab so the landing page stays in the originating tab while the PDF reads in another. A small paperclip icon precedes the word `Résumé`, slightly rotated and muted, signalling "attached document" rather than a generic link.
- The date is taken at build time and names a month rather than a year alone, so it states the last deploy. Within the current year a bare year carries almost no information, which is the ambiguity it replaced.
- The signature is fully visible by default and wipes in left-to-right on viewport entry. It substitutes for a stroke-draw effect, which the filled signature paths cannot carry. Mechanism: `canon/context/motion.md`.
- The Résumé link and the date arrive on scroll rather than being in place before a reader reaches them. They carried no reveal marker at all until 2026-08-22, which made the last surface on the page the one that never animated. The signature keeps its own wipe and takes no marker. Mechanism: `canon/context/motion.md`.

## Not on this surface

- No rule across the top. A rule here sat under five row separators in the closing ask and read as a stack rather than as a division. It also ran wider than the rows above it, 1152px against 1024, because the footer breaks out to a wider measure than that section holds. `canon/DESIGN.md` § Borders carries the tests deciding whether a line stays anywhere on the page.
- No contact links. The header and the dock carry them.
- No colophon. A line stating the page was built with coding agents sat above the date until 2026-09-27, when the operator dropped it alongside the career source's rewrite, whose footer carries the date alone.
- No city. It left this line rather than moving. The closing ask above already states it as a filter, so the footer was repeating it beside a year that read as a copyright with its symbol missing.
- No set-type name. The handwritten signature carries it.
