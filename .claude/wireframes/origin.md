---
title: Origin
description: Career git-log timeline that bridges the hero narrative into the projects section.
---

# Origin

Appears between the header band and the projects section. Renders the career story as a stylized git log with bullet states, a year column, and project names. Replaces a prose paragraph in the same slot. Mono font ties the surface to the looking-for card at the bottom of the page. The format reads as a personal commit history of how the page's author got here.

## Desktop (≥768px)

```plaintext
origin

●  2026   ready for the next role
○  2026   jobtriage published
○  2026   stackr published, 1,300 on open vsx
○  2026   caret published
○  2025   volvo contract iii wrapped
○  2024   chalmers engineering physics graduate

    Each entry made the next one possible.
              — Fraunces italic, label size
```

## Behavior

- Section sits on the page canvas at `px-6 py-16 md:py-20`.
- A mono kicker label `origin` (`font-mono text-label text-muted-foreground`) heads the section, mirroring the `looking-for` label and pairing the two as the page's mono system-surfaces.
- Timeline renders as an ordered list in `font-mono` at `text-body` size, sitting below the kicker at `mt-6`. Each row is a three-column grid: marker, fixed-width year column (3rem), event text. No glyph separator between year and event. Column structure carries the alignment.
- Each row carries a CSS-drawn marker dot (border circle, fillable via background-color). The active row gets a filled primary dot, full-foreground text, and a primary left bar. Inactive rows show an outline marker and muted text.
- Year column uses `tabular-nums` so digit widths align across rows.
- The closing kicker line sits below the timeline in Fraunces italic label size, muted, capped at `max-w-xl`. Bridges the timeline into a single narrative thought without competing with the timeline rows.
- One row is highlighted at a time. The first row is highlighted by default as the "current state" anchor. Hovering any other row transfers the highlight to it and deactivates the first row. On `pointerleave` of the whole list the highlight walks back row by row, landing on the first row. Step delays follow a quadratic ease-out curve from 40ms to 160ms (fast at the start, slow as it settles), so the highlight reads as a ball settling into the anchor rather than a constant-speed march. JS owns the active-row state via `[data-active]`. The first row's `[data-default-active]` keeps the no-JS path rendering with row one highlighted. At JS init the script removes that attribute and from then on `[data-active]` drives everything. Under `prefers-reduced-motion: reduce` the walk-back snaps instantly to the first row. The 2px left border, marker fill, and color shift all transition at 150ms ease-out per the design motion rule. Negative left margin compensates for the border-side padding so content does not shift.

## Cascade reveal

On scroll-in, each timeline row reveals via the page's 700ms fade-and-rise pattern with `--fade-delay` cascading top to bottom. The `origin` kicker lands first at 0ms, then the timeline rows cascade from 150ms to 650ms, and the closing italic line follows at 900ms. Reuses the `data-fade` + `--fade-delay` vocabulary already on the page. No new motion primitives.
