---
title: Origin
description: Career git-log timeline that bridges the hero narrative into the projects section.
---

# Origin

Appears between the header band and the projects section. Renders the career story as a stylized git log with bullet states, a year column, and project names. Replaces a prose paragraph in the same slot. Mono font ties the surface to the looking-for card at the bottom of the page. The format reads as a personal commit history of how the page's author got here.

## Desktop (≥768px)

```plaintext
●  2026 ──  ready for the next role
○  2026 ──  jobtriage published
○  2026 ──  stackr published, 1,300 on open vsx
○  2026 ──  caret published
○  2025 ──  volvo contract iii wrapped
○  2024 ──  chalmers engineering physics graduate

    Each entry made the next one possible.
              — Fraunces italic, body size
```

## Behavior

- Section sits on the page canvas at `px-6 py-16 md:py-20`.
- Timeline renders as an ordered list in `font-mono` at `text-body` size.
- The first row marks the current state with a filled `●` in `text-primary` and full-foreground text. The remaining five rows render with open `○` markers in `text-muted-foreground`.
- Year column uses `tabular-nums` so digit widths align across rows.
- A short box-drawing separator carries the eye from the year column to the event text.
- The closing kicker line sits below the timeline in Fraunces italic body size, muted, capped at `max-w-xl`. Bridges the timeline into a single narrative thought.

## Cascade reveal

On scroll-in, each timeline row reveals via the page's 700ms fade-and-rise pattern with `--fade-delay` cascading top to bottom. Current state lands first at 0ms, oldest entry lands last at 500ms. The kicker line follows at 750ms. Reuses the `data-fade` + `--fade-delay` vocabulary already on the page. No new motion primitives.
