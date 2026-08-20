---
title: Header
description: Full-height top-of-page band on every viewport. Carries a greeting, the name, the portrait, and primary contact links
---

# Header

Appears at the top of the page on every viewport. Carries the name, a greeting, the portrait, and primary contact links. Sits inside a tinted band that runs edge-to-edge, holding the full viewport height from md up and 70svh below it.

The name opens the surface and the greeting sits under it, so one line both opens the page and frames the links that stood bare beneath it. The greeting takes the display face at the lede step, which reads as one masthead rather than as a heading with a caption. `svh` rather than `vh` below md, since a collapsing address bar grows `vh` mid-scroll and would overflow the band the value bounds.

The theme toggle sits in the header's own corner rather than on a text row. The portrait floats flush to the column's right edge for 160px from the heading's top, so no row under the name has a free right side.

Three things left this surface on 2026-08-17. The claim and its elaboration moved to experience, because the elaboration opens on a pronoun standing for the claim and splitting the two left that pronoun with no antecedent on either surface. The location moved nowhere: the closing-ask rows already state it as a filter. The availability status moved to the closing ask, where the ask lives.

The emptiness is deliberate. The band is a stage held open for an authored real-time surface, and a claim competing with it would make that surface decoration. Until that surface ships the header reads sparse, which is a known cost rather than an oversight.

## Desktop (≥768px)

```plaintext
┌─[tinted band, full viewport height]─────────────────────────┐
│                                                     [☾]     │  ← toggle in the header's
│                                                             │    own corner
│   Eric Le                                     (photo)       │  ← display heading,
│                                               portrait      │    portrait floats in it
│   Welcome to my corner of the internet.                     │  ← greeting, display face
│   GitHub    LinkedIn    me@erclx.dev                        │  ← contact links row
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Narrow (≤320px)

```plaintext
┌─[tinted band]────────────────────┐
│                                  │
│   Welcome to my           [☾]    │
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

- The greeting and the theme toggle share one row, with the toggle out of that row's flow so its tap height cannot displace the line it centres on. The toggle renders here and is the page's only one, but it does not stay here: the handoff moves it into a host fixed to the viewport and paints it onto this row, so the same control answers in the hero and in the bar. What sits in this column is the empty slot it was measured from.
- The name and the toggle both leave this surface as the reader scrolls, carried into the sticky bar. See `.claude/wireframes/site-bar.md` for what they land in and `.claude/context/theming.md` for why exactly one toggle exists.
- The portrait floats to the top right inside the headline itself, so its top edge is the headline's own top at every width rather than a sum of the elements above it. It stays inside the content column rather than sitting in the margin beside it, so the band reads as centred, and it floats rather than taking a column of its own, so only the headline's first lines run short instead of every line losing the same width.
- The toggle aligns to the greeting's cap height rather than to its line box, because the empty descender space still counts toward a line box's middle.
- Contact links wrap to a new row when the viewport cannot hold all three on one line. Links are same-tab.

## Shader field signature

An authored WebGL surface renders behind the header band as the page's visual signature, and the same drawing continues under the whole page at a fraction of its weight. It replaced a particle canvas on 2026-08-20. See `.claude/context/shader-field.md` for the mount lifecycle, the uniform contract, and the reduced-motion still, and `.claude/context/page-ground.md` for the layer under the page.

The surface answers a pointer two ways. Resting on it raises a hill the contours bend around, and clicking drops a disturbance that travels outward from where the click landed, bends the field it crosses, and fades to nothing. Both are read as displacement rather than as color, so the band never lights up under a reader.

A reader who asks for reduced motion gets neither, since that path draws one frame and listens for nothing. Links and buttons are excluded from the click, so reaching for a destination in the header never disturbs the band behind it.
