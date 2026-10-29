---
title: Contact dock
description: The route's bottom-right control carrying GitHub, LinkedIn, the address, and the résumé, its ground, its phone clearance, its stand-down under the sections menu, and its touch and keyboard paths
---

# Contact dock

## Overview

Owns the control in a route's bottom-right corner carrying GitHub, LinkedIn, the address, and the résumé. The layout mounts it on routes alone. A route's foot carries the way home and nothing else, so the dock is a route's only contact, where the landing page holds every destination in the hero, the closing ask, and the footer.

It renders reachable from the first frame and attaches no arrival gate, since a route has no hero to watch.

## Layout

### `src/components/site/contact-dock/`

Holds the dock markup and its open state. The page keeps its own bottom space below `md`, so at the end of a route the dock sits clear of the closing foot.

- The ground is the elevated-surface token, read from the shared values in `global.css`, since the page's own background measured 1.02:1 against itself
- The stack reverses, so the resting at-sign sits nearest the corner and the résumé, the destination most readers came for, renders next to it
- A hover adds the glow's shadow on top of the elevation rather than replacing it, since a swap makes a lit control appear to drop
- Each name sits left of its icon, since the dock is pinned right, and is hidden from assistive technology, since the link already carries it
- The dock turns `inert` while the sections sheet is open, and the scrim over it in the top layer is what dims it

## Gotchas

- The collapsed stack fades and translates and never scales, since scaling put its targets at 43px against the 44px tap minimum
- A tap closes the set only because `pointerleave` acts on a mouse alone, a pointer activation releases focus, and the hover rule skips a coarse pointer
- A keyboard activation keeps focus where a pointer one releases it, since a blur drops the reader on `body` and restarts their tab order
- The hover rule reads `not all and (pointer: coarse)` rather than requiring hover, since one engine reports no pointer capability at all
- The dock's box holds the collapsed stack above the resting control, so a measurement of where it sits reads `[data-dock-toggle]`
