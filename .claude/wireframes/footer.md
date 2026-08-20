---
title: Footer
description: Bottom of the page. Carries a downloadable résumé link plus a colophon and the last deploy date
---

# Footer

Appears at the bottom of the page. Carries a downloadable résumé link plus a colophon and the date of the last deploy. Contact links live in the header and in the dock, so the footer does not duplicate them.

Nothing rules across the top. Space before it and the signature opening it are what mark the footer, which is what a reader was using anyway.

## Desktop (≥768px)

```plaintext
┌──────────────────────────────────────────────────────────┐
│                                                          │  ← space alone, no rule
│              (handwritten signature)                     │
│                                                          │
│   📎 Résumé      Built with coding agents, which is      │
│                  also the work.                          │
│                  Updated August 2026                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Narrow (≤320px)

```plaintext
┌──────────────────────────────────┐
│                                  │
│      (handwritten signature)     │
│                                  │
│   📎 Résumé                      │
│   Built with coding agents,      │
│   which is also the work.        │
│   Updated August 2026            │
│                                  │
└──────────────────────────────────┘
```

## Behavior

- The signature anchors the top of the footer content. Below it, the Résumé link and the colophon block render in a row: Résumé on the left, colophon right-aligned. Stacks to a column under `md` with the link above the colophon.
- The Résumé link opens in a new tab so the landing page stays in the originating tab while the PDF reads in another. A small paperclip icon precedes the word `Résumé`, slightly rotated and muted, signalling "attached document" rather than a generic link.
- The colophon states how the page was made. The page claims its author builds the layer between a language model and the job it has to do, and stating that the page itself was built that way demonstrates the claim on the one artifact the reader is already inside rather than asserting it a second time.
- It runs nine words. `Designed and` opened it until 2026-08-20 and came out for reading prose-like on a line read in passing, and because the pair invites a reader to weigh two acts that are one act here. The closing turn is the half that cannot go: without it the line thanks a tool, which is the register the point above rules out.
- The date is taken at build time and names a month rather than a year alone, so it states the last deploy. Within the current year a bare year carries almost no information, which is the ambiguity it replaced.
- The city left this line rather than moving. The closing ask above already states it as a filter, so the footer was repeating it beside a year that read as a copyright with its symbol missing.

## Why no rule

A rule here sat under five row separators in the closing ask and read as a stack rather than as a division. It also ran wider than the rows above it, 1152px against 1024, because the footer breaks out to a wider measure than that section holds.

`.claude/DESIGN.md` § Borders carries the tests deciding whether a line stays anywhere on the page.

## Masthead

The footer's closing mark is the handwritten signature itself. The set-type `Eric Le` is retired. The handwritten signature carries the name on its own, scaled large enough to read as the page's signoff and clamped so it scales smoothly from narrow phone widths to desktop without overflowing. Below it, the Résumé link and right-anchored colophon balance the visual mass without an empty quarter.

## Signature wipe

The signature is fully visible by default and wipes in left-to-right on viewport entry. It substitutes for a stroke-draw effect, which the filled signature paths cannot carry. Mechanism: `.claude/context/motion.md`.
