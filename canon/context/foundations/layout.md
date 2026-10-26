---
title: Layout
description: The project route's scaling prose measure and overhanging figures, and the landing timeline's three-tier rail
---

# Layout

## Overview

Owns how the landing timeline and a project route hold their geometry as the viewport changes. A route's prose runs 672px at 1280 and 832px at 1920, with the body growing from 17px to 22px and the lede from 21px to 26px. Each is a clamp that holds at 1280 and below and stops growing past 1920.

Figures overhang the prose symmetrically, reaching 896px and 1216px at those widths. A `surface` prop on the layout stamps a class on `body`, so the route tokens reach the project routes and nothing else.

## Layout

### `src/components/site/experience/`

Holds the timeline, whose rail holds at every width in three tiers.

- Below 600 the rail moves to the section's left edge and the span leads each beat, since no room is left for a column beside the reading one
- The middle tier steps the span column's type down, since the widest beat needs 177px at body size against a 184px column
- The gutter takes its type from the line it meets rather than carrying an offset
- At 600 a beat's head wraps to two lines, which keeps the six beats reading as a timeline rather than six paragraphs

## Gotchas

- A type step varying by scope resolves through `--body-size` and `--lede-size` in `:root`, since `@theme inline` bakes a literal no scope can override
- The prose and figure clamps carry different slopes, and one shared ratio would leave a 17px gutter at 1024, so re-check 1024 before merging them
- Count characters on real line breaks to judge a measure, and read `ch` to judge whether two columns match
- Both surfaces run about 90 characters to the line, past the comfortable 75, so a wider column needs a larger body with it
