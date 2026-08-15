---
title: Case study figures
description: Native dialog that opens a raster case-study figure at source resolution, and why only one route carries it
---

# Case study figures

## Overview

The opening treatment behind a raster figure on a case-study route. One dialog per page serves every figure on it, filled on click from whichever figure the reader picked. The treatment covers the pronunciation route alone, since the other two case studies build every figure from layout and type.

## Layout

- `src/components/site/figures/` owns the dialog markup and the module that drives it

## Decisions

- A native `<dialog>` driven by `showModal()` over a hand-rolled overlay. The element brings focus trapping, the backdrop, Escape-to-close, and focus return to the trigger without a dependency, and a hand-rolled overlay reimplements four things to get three of them wrong.
- One dialog per page rather than one per figure. The module reads the source image out of the trigger the reader clicked and writes it into the shared dialog, so a route with six figures ships one dialog element.
- The trigger is a `<button>` wrapping the existing `<Image>`, so the accessible name is the figure's own alt text and the reader hears what the chart shows along with the fact that it opens.
- The opened image is bounded on both axes: the width by the dialog, the height at `150dvh`. Fitting to height alone caps a portrait chart at roughly a third of the width the screen offers, which returns a reader to the problem the treatment exists to solve. Removing the height bound instead opens a portrait chart two to three screens tall, which reads as oversized and buries the shape of the chart under a scroll. Measured 2026-08-15 on the baseline chart at a 1280 by 800 viewport, against a 1526 by 2195 source: 356px wide in the column, 488px fitted to height, 1168 by 1680 unbounded, and 834 by 1200 as it ships.
- A wide chart never reaches the height bound, so the two axes divide the work cleanly. The bound is what a portrait chart hits and the dialog width is what a landscape one hits, and neither treatment needs to know which kind it has.
- The caption is read out of the figure's own `<figcaption>` rather than passed as a second attribute, so the opened view cannot drift from the page.
- Raster figures reach one route. Applying the treatment to all twelve figures across the three case studies ships a control that does nothing on half of them, since a figure built from layout and type gains a reader nothing at a larger size.

## Gotchas

- The dialog carries an `<img>` with an empty `src` until a reader opens something. The capture harness waits for every image on the page to report pixels, so that placeholder stalled it until `e2e/lazy-images.ts` learned to skip an image carrying no source at all. A second placeholder image anywhere on the site needs the same treatment.
- The close control sits on the dialog rather than inside the scrolling container. Placing it in the container scrolls it off the top on a tall chart, leaving Escape and the backdrop as the only ways out with nothing on screen saying so.
- Astro emits the figure at the source's own intrinsic width, since no `width` prop constrains it. The dialog therefore reads full resolution straight off the rendered `<img>` and needs no second `getImage()` call.

## Hidden contracts

- `[data-figure-zoom]` on the trigger, `[data-figure-dialog]` on the dialog, and `[data-figure-dialog-image]` on its image are what the module binds. Renaming one silently disables the opening.
- The trigger has to sit inside the `<figure>` whose `<figcaption>` it borrows. Moving it out drops the caption from the opened view without failing anything.
