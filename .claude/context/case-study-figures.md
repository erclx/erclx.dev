---
title: Case study figures
description: Native dialog that opens a route raster figures as a sequence, fitted then magnified, and why only one route carries it
---

# Case study figures

## Overview

The opening treatment behind a raster figure on a case-study route. One dialog per page serves every figure on it as a sequence: a reader opens one, steps between them without closing, and magnifies any of them to its own pixels. The treatment covers the pronunciation route alone, since the other two case studies build every figure from layout and type.

## Layout

- `src/components/site/figures/` owns the dialog markup and the module that drives it

## Decisions

- A native `<dialog>` driven by `showModal()` over a hand-rolled overlay. The element brings focus trapping, the backdrop, Escape-to-close, and focus return to the trigger without a dependency, and a hand-rolled overlay reimplements four things to get three of them wrong.
- One dialog per page rather than one per figure. The module reads the source image out of the trigger the reader clicked and writes it into the shared dialog, so a route with six figures ships one dialog element.
- The trigger is a `<button>` wrapping the existing `<Image>`, so the accessible name is the figure's own alt text and the reader hears what the chart shows along with the fact that it opens.
- The opened figure has two states. It arrives fitted, whole and never scrolling, and a click magnifies it to its own pixels with the panel becoming a pan. Fitted is the default because a portrait chart opened at full size runs two to three screens tall and hands the reader a scroll to see one figure. That argument is old and survives every shape that followed it.
- The panel takes 96vw and 94dvh. It was capped at 1000px, which is narrower than the plate the page itself gives a figure above roughly 1488px of viewport, so a reader who clicked to see more saw less.
- The fitted picture takes whatever height the panel has left after its padding and its caption, asked of the box rather than written as a length. A written ceiling was 4px short on every portrait at every viewport, because the chrome under the picture costs 84px against the 80 it allowed, and the panel scrolled in the one state whose whole purpose is that it does not. Any figure taken from that arithmetic breaks again the moment a caption wraps to a second line.
- The magnifier is what a portrait figure gains, rather than the fit. Fitting a portrait is height-bound and buys 1.02x its inline size, where magnifying reaches 100% of source, about three times the inline width and the first size at which its axis labels can be read. A landscape figure gains at both steps, 1.49x fitted and 100% magnified.
- The magnified width is read off the opened picture on its load, never off the inline one. Figures further down a route load lazily, so a reader stepping to one they have not scrolled past reads a natural width of zero and the picture collapses to nothing.
- The ends of the sequence stop rather than wrap, so a reader can feel that they have seen everything rather than reading a counter to find out. Arrow keys step while fitted and are left to the browser while magnified, where the same keys pan.
- A route carrying one figure hides the steps and the counter rather than showing two dead controls and .
- Scrolling the page under an open dialog is not something `showModal()` prevents. It makes the page inert to clicks and leaves the wheel alone, so the module locks `body` overflow on open, padding for the removed scrollbar so the page does not jump sideways.
- The scroll position is recorded before that lock and restored after it. Hiding the body overflow takes the document scroll to zero, because that overflow propagates to the viewport when the scrolling element is the root, so releasing it alone drops the reader at the top of the page: measured at 6177px lost on the pronunciation route. A reader who stepped through the sequence lands beside the figure they ended on instead, since that is the one they were last reading.
- Every control is pinned to the viewport rather than to the panel. The panel is sized to its picture, so stepping between orientations resizes it and moves chrome out from under a pointer that has not moved, and a reader stepping quickly hits close where next had been. Measured across four panel sizes: one position each. A fixed child of a dialog resolves against the viewport, since the top layer is the containing block.
- Each step sits on the side it moves toward, so the control position is its meaning and neither glyph has to be read. It also puts 1364px between next and close where grouping the two in one corner left 118.
- The panel is positioned explicitly rather than relatively. A modal dialog is fixed by the user agent, and `relative` overrides that and drops the panel into normal flow near the top of the document, where it renders at minus the scroll position and a reader deep in a route opens onto nothing. It stayed invisible only while the lock above also reset the scroll to zero, which put an in-flow panel at the top of the viewport by accident.
- The caption is read out of the figure's own `<figcaption>` rather than passed as a second attribute, so the opened view cannot drift from the page.
- Raster figures reach one route. Applying the treatment to all twelve figures across the three case studies ships a control that does nothing on half of them, since a figure built from layout and type gains a reader nothing at a larger size.
- The figure plate holds its light ground in both themes. All six charts are drawn on pure white, which is the single most common value in each of them at 45% to 84% of their pixels, so a dark plate under one leaves a bright rectangle punched through a near-black page and a reader whose system asks for dark gets that six times over. A light plate frames the chart instead, which is the honest reading of a picture drawn on paper. `.dark .figure-plate` in `src/styles/global.css` rebinds `--card`, `--muted-foreground`, and `--ring` to their light-theme values, so `bg-card` on the plate, the caption, and the focus ring all follow one declaration rather than three pinned colors. The class is what carries it, so a figure added without `figure-plate` regresses silently. Measured 2026-08-16 against the six sources in `src/assets/`.
- The plate resolves to `oklch(1 0 0)`, the same white the charts carry, so the chart has no visible edge against it and the padding is what reads as the frame. Picking a tinted plate to give the chart a border would draw a seam around every figure and is the thing to avoid rather than an improvement withheld.
- Rebinding the ring is not cosmetic and is the part worth keeping. The dark ring at `oklch(0.7 0.15 264)` reads near 2.3:1 on white and fails the 3:1 the accessibility rule sets, so a plate turned light without it breaks keyboard focus visibility on every zoom trigger.
- The three values in that block resolve through `--light-card`, `--light-muted-foreground`, and `--light-ring`, which `:root` declares and `.dark` leaves alone. The light declarations read the same aliases, so a light-palette edit reaches the plate on its own and the copies a rewrite could miss no longer exist. The block still sits directly under the dark declarations to keep both in one view. `.claude/context/theming.md` § Token layers owns the alias group.
- The plate's ground stays pure white while the rest of the light palette warms. The charts are drawn on pure white, so a warmed `--card` would draw a seam around every figure in the light theme, where the plate takes the unscoped value. Warming that token is the change to refuse rather than an inconsistency to tidy.
- The theme control is class-based, set on the root element by the first-paint script. A `prefers-color-scheme` query inside a `<picture>` would ignore a manual toggle, so a second chart file per theme is not available as the mechanism even where an upstream regeneration could produce one.
- The plate treats a symptom the asset pipeline owns. The parent checkout produces these charts and overwrites them on sync, so a chart later regenerated on a dark ground makes this frame wrong and nothing here reports it. Regenerating them per theme upstream is the durable repair and reaches every surface rendering the files. Chosen against for this pass because it holds the work open on a pipeline run in another repository, and the plate is reversible.
- The opened view keeps the dark panel. A dialog dims the whole page behind it and reads as a deliberate frame already, so the leak the plate answers does not arise there. Leaving it also keeps one panel treatment for the close control and the caption the dialog draws itself.

## Gotchas

- The dialog carries an `<img>` with an empty `src` until a reader opens something. The capture harness waits for every image on the page to report pixels, so that placeholder stalled it until `e2e/lazy-images.ts` learned to skip an image carrying no source at all. A second placeholder image anywhere on the site needs the same treatment.
- The controls take no space in the panel at all, since they are pinned to the viewport, so the picture is bounded by the panel and the caption alone. A full-width row holding them reads as dead space, and a rule under that row makes it worse by naming the emptiness as a region.
- Astro emits the figure at the source's own intrinsic width, since no `width` prop constrains it. The dialog therefore reads full resolution straight off the rendered `<img>` and needs no second `getImage()` call. Read the resolution off the opened picture rather than that one, though: the inline figures load lazily and report a natural width of zero until they have been scrolled past.

## Hidden contracts

- `[data-figure-zoom]` on the trigger, `[data-figure-dialog]` on the dialog, and `[data-figure-dialog-image]` on its image are what the module binds. Renaming one silently disables the opening.
- `[data-figure-prev]`, `[data-figure-next]`, and `[data-figure-position]` are the sequence contract, and `data-magnified` on the dialog is what the two picture states key on.
- `[data-figure-scroll]` marks the container the fit test reads. It exists so a test asserting the image needs no scroll keeps pointing at the right element when the panel's structure changes, which it has once.
- The trigger has to sit inside the `<figure>` whose `<figcaption>` it borrows. Moving it out drops the caption from the opened view without failing anything.
