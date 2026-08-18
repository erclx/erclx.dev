---
title: Header
description: Full-height top-of-page band on every viewport. Carries a greeting, the name, the portrait, and primary contact links
---

# Header

Appears at the top of the page on every viewport. Carries a greeting, the name, the portrait, and primary contact links. Sits inside a tinted band that runs edge-to-edge and holds the full viewport height from md up.

Three things left this surface on 2026-08-17. The claim and its elaboration moved to experience, because the elaboration opens on a pronoun standing for the claim and splitting the two left that pronoun with no antecedent on either surface. The location moved nowhere: the closing-ask rows already state it as a filter. The availability status moved to the closing ask, where the ask lives.

The emptiness is deliberate. The band is a stage held open for an authored real-time surface, and a claim competing with it would make that surface decoration. Until that surface ships the header reads sparse, which is a known cost rather than an oversight.

## Desktop (≥768px)

```plaintext
┌─[tinted band, full viewport height]─────────────────────────┐
│                                                             │
│   Welcome, this is my corner of the internet.       [☾]     │  ← greeting ↔ theme toggle
│                                                             │
│   Eric Le                                     (photo)       │  ← display heading,
│                                                             │    portrait floats in it
│                                                             │
│   GitHub    LinkedIn    me@erclx.dev                        │  ← contact links row
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Narrow (≤320px)

```plaintext
┌─[tinted band]────────────────────┐
│                                  │
│   Welcome, this is my     [☾]    │
│   corner of the internet.        │
│                                  │
│   Eric Le                (photo) │
│                                  │
│   GitHub    LinkedIn             │
│   me@erclx.dev                   │
│                                  │
└──────────────────────────────────┘
```

## Behavior

- The greeting and the theme toggle share one row, with the toggle out of that row's flow so its tap height cannot displace the line it centres on. The toggle stays inside the header column rather than fixed to the viewport.
- The portrait floats to the top right inside the headline itself, so its top edge is the headline's own top at every width rather than a sum of the elements above it. It stays inside the content column rather than sitting in the margin beside it, so the band reads as centred, and it floats rather than taking a column of its own, so only the headline's first lines run short instead of every line losing the same width.
- The toggle aligns to the greeting's cap height rather than to its line box, because the empty descender space still counts toward a line box's middle.
- Contact links wrap to a new row when the viewport cannot hold all three on one line. Links are same-tab.

## Flow field signature

A particle canvas renders behind the header band as the page's visual signature. See `.claude/context/flow-field.md` for the mount lifecycle, perf budget, and reduced-motion fallback contract.
