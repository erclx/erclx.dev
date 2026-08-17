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
│   ERIC LE · GOTHENBURG, SWEDEN                    (photo)   │  ← row 2: identity meta ↔ portrait
│                                                             │
│   I build the layer that makes language models              │  ← display heading
│   useful, from the agents to the tooling around them        │
│                                                             │
│   Eighteen months at Volvo Technology building natural      │
│   language data agents for engineering teams. Since then    │  ← body paragraph, capped measure
│   I've been building tools that ...                         │
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
│   ERIC LE ·             (photo)  │  ← identity wraps beside the portrait
│   GOTHENBURG, SWEDEN             │
│                                  │
│   I build the layer that         │
│   makes language models          │
│   useful, from the agents        │
│   to the tooling around them     │
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
- The portrait floats to the top right inside the header column, under the theme toggle. It stays inside the column rather than sitting in the margin beside it, so the band reads as centred, and it floats rather than taking a column of its own so only the headline's first lines run short instead of every line losing the same width.
- The body paragraph caps its measure so line length stays readable on wide viewports while the band itself runs full width.
- Contact links wrap to a new row when the viewport cannot hold all three on one line. Links are same-tab.

## H1 annotation

A single phrase in the hero H1 carries a hand-drawn underline that draws on shortly after the H1 fade settles, once per page load. Only one phrase per page may carry an annotation, by editorial rule. Skipped under reduced motion. Mechanism: `.claude/context/motion.md`.

## Flow field signature

A particle canvas renders behind the header band as the page's visual signature. See `.claude/context/flow-field.md` for the mount lifecycle, perf budget, and reduced-motion fallback contract.
