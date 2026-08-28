---
title: Page ground
description: The still contour layer under every page, why it damps inside the reading column, and how it tracks two different measures
---

# Page ground

## Overview

A fixed layer behind every page, drawing the hero's own field at a fraction of its weight. Lives at `src/components/site/page-ground/page-ground.astro` and mounts from `src/layouts/base.astro`, so every surface carries it rather than the landing page alone.

It exists because the hero's surface stopped at the hero. Dissolving the seam between them removed the boundary and left the two halves still speaking different languages, which is what a reader was reading as two documents joined.

## Layout

- `src/components/site/page-ground/` owns the still layer the base layout mounts under every page

## Decisions

- It runs the hero's shader held to a single frame rather than an authored copy. There is one drawing, so the two cannot drift and there is no second rendering path to keep matched. See `.claude/context/shader-field.md`.
- Still rather than moving, and that is the point rather than a saving. Ambient motion behind a name is a different proposition to ambient motion under prose a reader is reading, and the hero's own pace was already taken down an order of magnitude for being too much to sit with.
- Fixed rather than scrolling. It costs one viewport of fill however long the page runs, and the ground stays put while the content travels over it.
- It mounts in the layout rather than on a page, which is what carried it onto the project routes.

## The damping column

The field damps inside the measure a reader reads down, so contours sit in the margins and off the prose. Every landing section holds the same centred column, so that strip is one shape rather than a box per section.

The two surfaces do not share a measure. The landing page holds a fixed column at every width, and a route scales its measure with the viewport, so a fixed strip would leave the widest part of the widest column undamped, which is exactly where the most prose sits. The strip reads `--prose-column`, the same token the route's own text reads, so the two are one width by construction rather than by a copied number. Measured at 672, 752, and 832 across 1280, 1600, and 1920, matching the prose exactly at each.

The damping fraction walks down with viewport width rather than holding one value. The field's own scale divides by that width, so the whole pattern squeezes as the screen narrows while the column does not, and one fraction therefore covered steadily more contours the smaller the screen got. Measured inside the column in the dark theme, the field laid 0.08% of its pixels at 1920 against 1.29% at 390, sixteen times the ink over prose on the surface most visitors arrive on. Light climbed 1.00% to 4.06% over the same range. The curve runs from 0.40 at 1920 to a floor of 0.10 at 390.

Three treatments were built and served live before one was picked. Holding contour size constant below a reference width read flattest on the instrument and was passed over, because it changes the drawing itself and the hero renders that same drawing. Clearing the column outright below a breakpoint was passed over for pinning a literal width that the measure work queued against the landing page would move underneath it.

The pick was keyed to the column's share of the viewport first, and that variable is the one thing here worth carrying forward, because it fails silently on exactly the devices it was written for. The column caps at the viewport, so its share pins at 1.0 from 768 down and the curve freezes there while density keeps climbing. Measured in dark, mean weight fell to 0.12 at 768 and then rose back to 0.20 at 390, which left a phone the least damped of the three narrow screens while the code read as though it damped hardest. Width sees what share cannot: on the same curve driven by width, mean falls 0.39 at 1920, 0.33 at 1366, 0.24 at 1024, then 0.04, 0.03, 0.03.

A variable that saturates before the range ends is the general shape rather than a fact about this curve. Share was measured at three wide widths, where it moves, and shipped.

The hero keeps one flat fraction and does not take this. Its content box is a heading rather than prose, and at phone width that heading is most of the screen, so a curve written for a reading column would empty the band behind the name.

## Gotchas

- Astro scopes both halves of a descendant selector, and the surface class sits on `body`. The rule keying the route measure has to mark that half `:global()` or it matches nothing. The tell is a ground column holding its landing width while the prose scales beneath it.
- The damping column is positioned rather than in flow. As a second full-height child it stacks under the canvas and is measured a full viewport off-screen, which damps nothing and reports nothing. The tell is a peak that does not move when the box is introduced.
- The weight is not a fraction of what a reader sees. See the alpha gotcha in `.claude/context/shader-field.md`.
- Reading this surface needs `preserveDrawingBuffer` forced on before the mount runs. It draws one frame and runs no loop, so the buffer is cleared once composited and every later read returns an empty field. `e2e/page-ground.spec.ts` and `e2e/header-shader.spec.ts` both install it as an init script for that reason. The trap is that the failure is engine-dependent rather than uniform: Chromium happened to retain the buffer for a screenshot taken afterwards and WebKit did not, so a run without the patch reports a blank field on one engine and a healthy one on another, which reads as the engine lacking WebGL. It does not. All three engines render this surface and all three pass the guard.
- A section can hide this surface without anything reporting it. The closing ask carried an opaque fill on its rows container, at a raised index over the ground, so it was the one section on the site that painted the page background over the field. It existed to hide a character's body so he reads as peeking over the rule above the rows, and the reader who found it described that section as solid while every other one was transparent. Clip the thing that needs hiding rather than plating what sits over it.
- A cutoff chosen against the hero reports this surface as painting nothing. The hero runs undamped at full alpha, while inside the damped column here the peak sits near 7 of 255, so the hero spec's cutoff of 8 counts zero lit pixels on a field that is drawing correctly. The guard reads mean alpha instead, which needs no cutoff and moves with exactly what damping multiplies.

## What it costs the reader

Nothing measurable in legibility. With the ground hidden the reading column is uniform, and with it on the background swings 2.51% in light and 0.06% in dark, taking body contrast from 16.16:1 to 15.74:1 against a 4.5:1 requirement. Light is where the ground is roughly forty times more present in the column, so a complaint about busyness will be about that theme.
