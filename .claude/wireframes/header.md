---
title: Header
description: Top-of-page band on every viewport. Carries identity, status, headline, narrative, and primary contact links
---

# Header

Appears at the top of the page on every viewport. Carries identity, status, headline, narrative, and primary contact links. Sits inside a tinted band that visually separates it from the rest of the page.

## Desktop (≥768px)

```plaintext
┌─[tinted band]───────────────────────────────────────────────┐
│                                                             │
│   ● OPEN TO WORK                                    [☾]     │  ← row 1: status pill ↔ theme toggle
│   ERIC LE · GOTHENBURG, SWEDEN                              │  ← row 2: identity meta
│                                                             │
│   I build the layer between a language        (photo)       │  ← display heading,
│   model and the job it has to do.                           │    portrait floats in it
│                                                             │
│   In practice that means agents, and the developer tools    │
│   around them. Some of that was paid work, eighteen months   │  ← body paragraph, capped measure
│   of it at Volvo Technology, and the rest is tools I ...     │
│                                                             │
│   GitHub    LinkedIn    me@erclx.dev                        │  ← contact links row
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Narrow (≤320px)

```plaintext
┌─[tinted band]────────────────────┐
│                                  │
│   ● OPEN TO WORK          [☾]    │
│   ERIC LE · GOTHENBURG,          │  ← identity wraps to two lines
│   SWEDEN                         │
│                                  │
│   I build the layer      (photo) │
│   between a language             │
│   model and the job              │
│   it has to do.                  │
│                                  │
│   [body paragraph wraps]         │
│                                  │
│   GitHub    LinkedIn             │
│   me@erclx.dev                   │
│                                  │
└──────────────────────────────────┘
```

## Behavior

- Status pill and theme toggle anchor opposite ends of the same row. The toggle stays inside the header column rather than fixed to the viewport.
- The identity meta line sits directly under the status pill, tightly spaced, so the two read as one block of meta information. Nothing may open a gap between the two: a portrait sharing that row on a centre alignment pushed the identity line off the pill, which broke the pairing.
- The portrait floats to the top right inside the headline itself, so its top edge is the headline's own top at every width rather than a sum of the elements above it. It stays inside the content column rather than sitting in the margin beside it, so the band reads as centred, and it floats rather than taking a column of its own, so only the headline's first lines run short instead of every line losing the same width.
- The status dot carries the size and the ring that the origin section's active marker carries, so the two read as one shape language. Its color stays its own: green states availability where the warm accent states position.
- The dot and the toggle both align to the label's cap height rather than to its line box. A line box centres lower than uppercase text looks, because the empty descender space still counts toward the middle, and the drop is visible at this size.
- The body paragraph caps its measure so line length stays readable on wide viewports while the band itself runs full width.
- Contact links wrap to a new row when the viewport cannot hold all three on one line. Links are same-tab.

## Status pulse

The availability dot holds steady and a halo pings outward from it on a slow loop, so the status reads as live rather than as a printed label. It is the only always-on motion on the page. Under reduced motion the halo does not exist and the static ring remains. Mechanism: `.claude/context/motion.md`.

## H1 annotation

A single phrase in the hero H1 carries a hand-drawn underline that draws on shortly after the H1 fade settles, once per page load. Only one phrase per page may carry an annotation, by editorial rule. Skipped under reduced motion. Mechanism: `.claude/context/motion.md`.

## Flow field signature

A particle canvas renders behind the header band as the page's visual signature. See `.claude/context/flow-field.md` for the mount lifecycle, perf budget, and reduced-motion fallback contract.
