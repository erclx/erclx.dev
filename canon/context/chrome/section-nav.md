---
title: Section nav
description: The section links in both bars, their scroll tracking, near-bottom override, click lock, the `Sections` menu below `md`, and the route's links after its opening
---

# Section nav

## Overview

Owns the section links in the landing bar and in every route bar. A link is marked as the reader's position when its section is the last one in document order whose top has crossed the viewport's middle. The active link carries an accent underline, the one accent mark the bar adds.

From `md` the links sit inline in the bar's row, right, before the toggle. Below it they fold behind a borderless `Sections` button that opens a sheet as tall as its links, over a scrim. A route links its sections after the opening row, since the breadcrumb's route name already returns to the top.

## Layout

### `src/components/site/section-nav/`

Holds the links and the inline script that tracks position, throttled to one `requestAnimationFrame` per scroll or resize.

- One list serves both widths, a `popover` element shown inline from `md`, which opens, closes on Escape and a tap outside, and reaches the top layer without a script
- The sheet hangs from `--bar-height`, which each bar publishes, and the scrim starts there too, so the bar stays undimmed and live
- The handler reads each section's box rather than the cards inside it, so the mark never flickers across a card boundary
- Within 4px of the document's end the last section is forced active, which still covers a last section shorter than half the viewport
- A click marks its link, closes the sheet, and locks recomputation for 700ms, though chromium's glide can run 1134ms, so the lock ends on a clock rather than a settle

### `src/lib/section-nav.ts`

Holds `ANCHOR_RATIO`, the share of the viewport a section's top crosses before it is marked. It is 0.5, since at 0.3 a 292px closing section above a 317px footer marked Looking for only inside the end-of-page override at 1440x900.

## Gotchas

- The links carry no reveal of their own, so they arrive, hide, and turn inert with the bar they sit in
- A click calls `scrollIntoView` naming no behavior, so the root's motion preference decides, and naming `smooth` overrides reduced motion
- The browser restores focus to the button only when it sat inside the sheet, and WebKit never focuses a clicked button, so the script returns it on close
- Crossing into `md` with the sheet open would paint the inline row in the top layer, so a width change closes the sheet first
- A display rule on the popover outranks the browser's hiding of a closed one, so the sheet's own rules stay inside the narrow media query
