---
title: Section nav
description: The left-margin rail's scroll tracking, near-bottom override, click lock, reveal gate, active-row step, and the route's opening row
---

# Section nav

## Overview

Owns the fixed left-margin rail on the landing page and every project route. It names the section a reader is in, which is the last one in document order whose top has crossed an anchor 30% down the viewport. The rail is hidden below 1280 and states position rather than reach.

On the landing page the rail fades in as the first section crosses that anchor and hides again back in the hero. A route passes `instant`, so its rail shows from the first frame with a row for the section carrying the `h1`.

## Layout

### `src/components/site/section-nav/`

Holds the rail markup and the inline script that tracks position, throttled to one `requestAnimationFrame` per scroll or resize.

- The handler reads each section's box rather than the cards inside it, so the active row never flickers across a card boundary
- Within 4px of the document's end the last section is forced active, since a short final section never reaches the anchor otherwise
- A click sets its row active and locks recomputation for 700ms, though chromium's glide can run 1134ms, so the lock ends on a clock rather than a settle
- The hero observer's `rootMargin` derives from `ANCHOR_RATIO`, so the rail appears exactly as the first section crosses the anchor
- The active row takes the contact dock's ground and steps right with a `transform`, so the rail never reflows on a handover

## Gotchas

- A row built with `document.createElement` takes none of the component's scoped styles, so it reports `data-active` while painting nothing
- A click calls `scrollIntoView` naming no behavior, so the root's motion preference decides, and naming `smooth` overrides reduced motion
- The hide-until-revealed rule is scoped to `[data-js='true']`, so a reader with no script keeps a visible rail of working fragment anchors
- The 1px accent edge splits across two device rows at 1x and paints near 2.6:1, where it paints exactly at device scale 2
