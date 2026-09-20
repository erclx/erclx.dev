---
title: Layout measure
description: How the timeline rail and a case-study route's prose and figures hold their geometry as the viewport changes
---

# Layout measure

## Overview

Two surfaces hold their geometry as the viewport moves, and each was chosen against an arrangement that failed. The landing timeline holds its rail in three tiers, and a case-study route scales its measure with the viewport while its figures overhang it. They share a subject and nothing else, so read the one you came for. Per-surface layout lives in `canon/wireframes/experience.md` and the route wireframes.

## Layout

- `src/components/site/experience/` owns the timeline rail and its tiers
- `src/styles/` owns the route type tokens and the clamps
- `src/layouts/` owns the `surface` prop that scopes the route tokens to the five project routes

## Decisions

### The timeline holds its rail at every width, in three tiers rather than two

Width is not what forces the middle tier. The row measures 558px at 620 and 690px at 767, against the 455px reading column 768 is content with. The span column forces the type step instead: the widest of the six beats needs 177px at body size against a 184px column, so its column cannot narrow at all while the span stays at body size.

- Below 600 the rail moves to the section's left edge and spans the beat, since there is no room for a column beside the reading one. The span leads a beat there where the head leads it everywhere else.
- The gutter takes its type from whichever line it is meeting rather than carrying an offset.
- The middle tier costs reading width at its own bottom end: at 600 the head wraps to two lines rather than one. That trade is deliberate. A wrapping beat is legible, and a list of six paragraphs claiming to be a timeline is not.

Measured at e9f68e5 on 2026-08-22.

### A case-study route scales its measure with the viewport, and its figures overhang it

Prose runs 672px at 1280 and 832px at 1920, and the body scales with it from 17px to 22px. Both are clamps that hold today's values at 1280 and below and stop growing past 1920. Figures overhang the prose symmetrically, reaching 896px and 1216px at those widths, which takes the widest viewport from 35% content to 63%.

- A route carries two prose steps. The lede scales alongside the body and runs 21px to 26px across the same range, so a route's largest prose sits 53% above the landing page's flat 17px at 1920 where the body sits 29% above it. Both surfaces match exactly at 1280 and diverge only above it.
- The pair moves together because the column cannot widen alone. Widening a column while the body stays put lengthens the line, the failure that reached production once. The route holds 61.1ch at 768 and 1280 and 59.4ch at 1920.
- Both surfaces run about 90 characters to the line. Counted on the breaks the browser made, the route body averages 89 and the landing page 92, past the comfortable ceiling near 75 on both. The pair keeps that count flat across the range rather than bringing it down, which is not the same as settling the measure.
- Count characters on real line breaks when the question is whether a surface sits inside the band, since that is the band's own unit. Read `ch` when the question is whether two columns are the same width, since it is text-independent.
- The prose and figure clamps carry different slopes, so their ratio drifts from 1.333 at 1280 to 1.462 at 1920. That is deliberate. A constant 1.4 ratio would make the figure 941px at 1024, leaving 17px of gutter each side. Do not replace the two clamps with one ratio without re-checking 1024.
- A `surface` prop on the layout stamps a class on `body`, so the tokens reach the five project routes and nothing else.

Measured at 502da58 on 2026-08-20.

## Gotchas

- `@theme inline` bakes a literal into the generated utility. A token declared as `--text-body: 1.0625rem` inside that block cannot be overridden by any downstream scope, because the utility carries the value rather than a reference. The color tokens escape this only because each resolves to a `var()`. The two type steps take the same form, resolving through `--body-size` and `--lede-size` declared in `:root`, which is why the scoping indirection exists.
