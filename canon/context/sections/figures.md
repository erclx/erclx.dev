---
title: Figures
description: The figure dialog that opens a route's raster charts as a fitted then magnified sequence, the light figure plate, and the diction screenshot gallery
---

# Figures

## Overview

Owns how a raster figure on a project route opens, and the diction route's screenshot gallery. One native `<dialog>` per page serves every figure as a sequence. A figure opens fitted, whole and never scrolling, and a click magnifies it to its own pixels.

Only the pronunciation route carries raster figures, since the other routes build every figure from layout and type. The figure plate keeps a light ground in both themes, because every chart is drawn on white.

## Layout

### `src/components/site/figures/`

Holds the dialog markup and the module that drives it. `showModal()` brings focus trapping, the backdrop, Escape, and focus return without a dependency.

- The trigger is a `<button>` wrapping the `<Image>` inside its `<figure>`, so it is named by the alt text and the dialog borrows the `<figcaption>`
- The panel takes 96vw by 94dvh, and the fitted picture takes the height left after padding and caption, asked of the box rather than written
- Every control is pinned to the viewport, since the panel resizes with each picture and would move a step out from under a resting pointer
- The module locks page scroll through `src/lib/page-scroll-lock.ts` and restores the position after, since hidden overflow resets the scroll to zero
- `.figure-plate` keeps a light ground in the dark theme, so a figure added without the class regresses silently

### `src/components/site/gallery/`

Holds the diction route's peek carousel, one track component mounted inline and again larger in a dialog.

- The track takes `width: max-content` with slides sized in `cqw`, so the end slides land exactly at both scroll limits
- The centred slide is the largest share an `IntersectionObserver` reports, and a control's destination outranks it until the scroll arrives
- Focus and centring are one state on a roving tabindex, since a disabled end arrow would otherwise drop focus to `body`

## Gotchas

- The panel is positioned explicitly, since `relative` drops a modal dialog into flow at the document top and a deep reader opens onto nothing
- Read the magnified width off the opened picture on its load, since a lazy inline figure reports a natural width of zero
- The dialog's empty `<img>` never reports complete, so `e2e/capture/cases.ts` drops its empty `src` before a capture waits on every image
- A `maxScrollLeft` that wobbles between readings means transformed content is overflowing rather than the box
- The arrow keys step while fitted and pan while magnified, so a test pressing them reads the dialog's state first
