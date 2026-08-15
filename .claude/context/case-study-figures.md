---
title: Case study figures
description: Native dialog that opens a raster case-study figure to fit the screen, and why only one route carries it
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
- The opened image fits the screen on both axes and never scrolls. The panel caps at `min(92vw,1000px)` and `85dvh`, and the image caps at the panel height less its chrome. A landscape chart hits the width bound and a portrait one hits the height bound, so the two axes divide the work and neither treatment needs to know which kind it has.
- Bounding the height by a viewport multiple rather than by the panel was the wrong shape and is worth recording, because the reasoning behind it is seductive. A multiple scales with the screen, so a taller display produced a taller image and a taller panel. Read the complaint "the image covers the whole page" as a panel that sizes to its content when the content is unbounded.
- Fitting to width alone was abandoned before that, and the reason survives the shapes that followed it. A portrait chart at source aspect runs taller than the screen at any width worth reading, so a width-only bound opens it two to three screens tall and hands the reader a scroll to see one figure. That is the argument to re-read before widening the bound again.
- The no-scroll bound costs a portrait chart most of its gain on a short screen, and the operator settled on paying it, 2026-08-15. The geometry is fixed rather than a shortcoming of the bound: the in-page render is already height-capped at `32rem`, so beating it needs more image height than an 800px-tall viewport can show inside a panel. A portrait figure cannot be both fully visible and meaningfully larger on a laptop. Measured against a 1526 by 2195 source: 356px in the column, 384px opened at 1280 by 800, and 596px opened at 1440 by 1160. A landscape figure is unaffected and opens near 968px at either size.
- Do not reopen that bound to recover the portrait gain without raising the in-page cap first. The `32rem` cap is what sets the bar the opened view has to clear, so widening only the dialog trades a whole visible chart for a scroll and moves the number by little.
- Measured 2026-08-15 on the baseline chart against a 1526 by 2195 source. At a 1280 by 800 viewport: 356px wide in the column, 1168 by 1680 with no height bound, and 384 by 552 as it ships. At 1440 by 1160: 596 by 858 as it ships. The gain is smaller on a short screen and larger on a tall one, which is the honest trade for never scrolling.
- Scrolling the page under an open dialog is not something `showModal()` prevents. It makes the page inert to clicks and leaves the wheel alone, so the module locks `body` overflow on open and restores it on close, padding for the removed scrollbar so the page does not jump sideways.
- The caption is read out of the figure's own `<figcaption>` rather than passed as a second attribute, so the opened view cannot drift from the page.
- Raster figures reach one route. Applying the treatment to all twelve figures across the three case studies ships a control that does nothing on half of them, since a figure built from layout and type gains a reader nothing at a larger size.

## Gotchas

- The dialog carries an `<img>` with an empty `src` until a reader opens something. The capture harness waits for every image on the page to report pixels, so that placeholder stalled it until `e2e/lazy-images.ts` learned to skip an image carrying no source at all. A second placeholder image anywhere on the site needs the same treatment.
- The close control floats in the panel's top-right and the image container is padded to clear it, so the control never covers the chart and the chart never pushes the control off screen. A full-width row holding it instead reads as dead space, and a rule under that row makes it worse by naming the emptiness as a region.
- Astro emits the figure at the source's own intrinsic width, since no `width` prop constrains it. The dialog therefore reads full resolution straight off the rendered `<img>` and needs no second `getImage()` call.

## Hidden contracts

- `[data-figure-zoom]` on the trigger, `[data-figure-dialog]` on the dialog, and `[data-figure-dialog-image]` on its image are what the module binds. Renaming one silently disables the opening.
- `[data-figure-scroll]` marks the container the fit test reads. It exists so a test asserting the image needs no scroll keeps pointing at the right element when the panel's structure changes, which it has once.
- The trigger has to sit inside the `<figure>` whose `<figcaption>` it borrows. Moving it out drops the caption from the opened view without failing anything.
