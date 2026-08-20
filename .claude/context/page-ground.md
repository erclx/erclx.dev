---
title: Page ground
description: The still contour layer under every page, why it damps inside the reading column, and how it tracks two different measures
---

# Page ground

## Overview

A fixed layer behind every page, drawing the hero's own field at a fraction of its weight. Lives at `src/components/site/page-ground/page-ground.astro` and mounts from `src/layouts/base.astro`, so every surface carries it rather than the landing page alone.

It exists because the hero's surface stopped at the hero. Dissolving the seam between them removed the boundary and left the two halves still speaking different languages, which is what a reader was reading as two documents joined.

## Decisions

- It runs the hero's shader held to a single frame rather than an authored copy. There is one drawing, so the two cannot drift and there is no second rendering path to keep matched. See `.claude/context/shader-field.md`.
- Still rather than moving, and that is the point rather than a saving. Ambient motion behind a name is a different proposition to ambient motion under prose a reader is reading, and the hero's own pace was already taken down an order of magnitude for being too much to sit with.
- Fixed rather than scrolling. It costs one viewport of fill however long the page runs, and the ground stays put while the content travels over it.
- It mounts in the layout rather than on a page, which is what carried it onto the project routes.

## The damping column

The field damps inside the measure a reader reads down, so contours sit in the margins and off the prose. Every landing section holds the same centred column, so that strip is one shape rather than a box per section.

The two surfaces do not share a measure. The landing page holds a fixed column at every width, and a route scales its measure with the viewport, so a fixed strip would leave the widest part of the widest column undamped, which is exactly where the most prose sits. The strip reads `--prose-column`, the same token the route's own text reads, so the two are one width by construction rather than by a copied number. Measured at 672, 752, and 832 across 1280, 1600, and 1920, matching the prose exactly at each.

## Gotchas

- Astro scopes both halves of a descendant selector, and the surface class sits on `body`. The rule keying the route measure has to mark that half `:global()` or it matches nothing. The tell is a ground column holding its landing width while the prose scales beneath it.
- The damping column is positioned rather than in flow. As a second full-height child it stacks under the canvas and is measured a full viewport off-screen, which damps nothing and reports nothing. The tell is a peak that does not move when the box is introduced.
- The weight is not a fraction of what a reader sees. See the alpha gotcha in `.claude/context/shader-field.md`.

## What it costs the reader

Nothing measurable in legibility. With the ground hidden the reading column is uniform, and with it on the background swings 2.51% in light and 0.06% in dark, taking body contrast from 16.16:1 to 15.74:1 against a 4.5:1 requirement. Light is where the ground is roughly forty times more present in the column, so a complaint about busyness will be about that theme.
