---
title: Contact dock
description: The right-margin control carrying GitHub, LinkedIn, the address, and the résumé, its gates, its ground, and its touch and keyboard paths
---

# Contact dock

## Overview

Owns the control in the page's right margin carrying GitHub, LinkedIn, the address, and the résumé. It mounts from the layout, so the landing page and every project route carry it, and it sits opposite the section rail so the two margins read as a pair.

On the landing page it arrives on the same half-hero gate the sticky bar uses and holds to the end of the page. A route attaches no gate and renders it reachable at once, since a route has no hero to watch.

## Layout

### `src/components/site/contact-dock/`

Holds the dock markup and the gates at both ends of its travel. Reach and inertness are one state written through one function, so the two halves cannot drift.

- The ground is the elevated-surface token, read from the shared values in `global.css`, since the page's own background measured 1.02:1 against itself
- The stack reverses, so the resting at-sign sits nearest the corner and the résumé, the destination most readers came for, renders next to it
- A hover adds the glow's shadow on top of the elevation rather than replacing it, since a swap makes a lit control appear to drop
- Each name sits left of its icon, since the dock is pinned right, and is hidden from assistive technology, since the link already carries it

## Gotchas

- The dock is `inert` until it arrives, since opacity and `pointer-events: none` leave all four links tabbable while off screen
- The collapsed stack fades and translates and never scales, since scaling put its targets at 43px against the 44px tap minimum
- A tap closes the set only because `pointerleave` acts on a mouse alone, a pointer activation releases focus, and the hover rule skips a coarse pointer
- A keyboard activation keeps focus where a pointer one releases it, since a blur drops the reader on `body` and restarts their tab order
- The hover rule reads `not all and (pointer: coarse)` rather than requiring hover, since one engine reports no pointer capability at all
