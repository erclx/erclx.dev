---
title: Motion
description: The scroll reveal and its groups, smooth travel to a target, the pointer gate, what loops, and the traps that delete a reveal
---

# Motion

## Overview

Owns how the page reveals on scroll, travels to a target, and gates a pointer response. An element marked `data-fade` fades and rises over 700ms as it enters, and under reduced motion every one renders in place. The root declares smooth scrolling for the no-preference case, so a scrolling control resolves it rather than naming a behavior.

Only the availability halo in the closing ask and the hero's shader field loop. Everything else arrives once and stays, including the about aircraft, the closing-ask figure, the footer signature wipe, and the timeline's chip wave.

## Layout

### `src/lib/`

Holds the shared motion modules. `reveal.ts` runs the observer behind `data-fade`, and `pointer.ts` holds the one query every hover response reads.

- The observer sorts each callback's batch by document position inside a 400ms window, so a fast scroll never reveals the page backwards
- A container marked `data-fade-group` is watched instead of its rows, which step 220ms apart on timers, since a slow scroll delivers rows one per callback
- `revealAtDocumentEnd` reveals everything once the document end is reached, since content anchored there never crosses the inset root on a tall screen
- A response to a pointer being over something is gated on `pointer.ts`, and a click, a focus, or a tap never is, since touch performs those as a mouse does
- `e2e/lazy-images.ts` imports `REVEAL_THRESHOLD` and `REVEAL_ROOT_BOTTOM_INSET_PERCENT`, so the capture walk waits on the elements the observer marks

## Gotchas

- `transition` is a shorthand, so a component declaring one on a `data-fade` element deletes the reveal. Open its list with `var(--reveal-transition)`.
- `--reveal-transition` carries no delay, since a nested `var()` in an inherited property resolves where it is declared, at `:root`
- The bar's shape transition sits on `[data-bar-ground]` in `global.css`, since a component redeclaring `transition` drops the shape change to one frame
- Group a list only when it fits about one screen, since watching a taller grid lights its last card while that card is still off screen
- Check a reveal by its paint rather than its marker, and read a first-paint arrival by its first and last value, since a loaded engine skips a short fade
