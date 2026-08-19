---
title: Site bar
description: Sticky top bar that the hero's name and theme toggle travel into as the reader scrolls, carrying the way back to the top at every viewport
---

# Site bar

Sits fixed at the top of the viewport on the landing page, hidden while the reader is still in the hero and revealed once they have passed half of it. Carries the name as a control returning to the top, and the theme toggle the hero hands over. A project route renders its own bar instead, which is the same column and the same two controls plus the route's name.

This is the surface that closes the navigation hole the rail could not. The rail is hidden below 1280px and states position rather than offering reach, so before this bar a reader below that width had no navigation at all.

## Landing page, revealed (≥768px)

```plaintext
┌─[fixed, full width, near-opaque over blurred content]───────┐
│   Eric Le                                           [☾]     │  ← name returns to top,
└─────────────────────────────────────────────────────────────┘    toggle arrived from hero
```

## Landing page, over the hero

```plaintext
┌─[viewport]──────────────────────────────────────────────────┐
│                                                       [☾]   │  ← bar absent, toggle painted
│   Welcome, this is my corner of the internet.               │    onto the hero's own row
│                                                             │
│   Eric Le                                     (photo)       │
└─────────────────────────────────────────────────────────────┘
```

## Project route

```plaintext
┌─[sticky, scrolls with the page then holds]──────────────────┐
│   Eric Le              diction                      [☾]     │  ← way home, route name, toggle
└─────────────────────────────────────────────────────────────┘
```

The route name is absent while the route's own title is still on screen and fades in once that title passes behind the bar, so the two never state the same thing at once. A route carries no arrow beside the name. One arrow plus the trailing way home at the foot of the page read as three exits from a page that needs one.

## Behavior

- The bar holds the same column as the hero on every surface, so the chrome never resizes as a reader moves between the landing page and a route. That also lands the name where it started horizontally, so the travel reads as vertical.
- The name is a control rather than a label. It returns the reader to the top, smoothly unless reduced motion is set. Hovering or focusing it underlines the name.
- The bar is `inert` until it is revealed, so nothing inside it takes focus while it is off screen.
- The bar sits near-opaque over a blur. Prose passing under a lighter bar reads through it as ghost text, which looks like a rendering fault rather than a translucent surface.
- A route's own bar is the sticky one rather than a second bar above it, so a reader deep in a long route always has a way home without stacking two bars.

## The handoff

The name and the toggle are not duplicated between the hero and the bar. Both travel, and each is one element throughout.

- The name a reader sees while it travels is a third element, fixed and scaling from the hero's display size down to the bar's. The hero's own heading keeps its text for assistive technology and is painted transparent rather than hidden, so the page's only `h1` keeps its accessible name.
- The toggle is the hero's own control, re-parented into a fixed host. Exactly one exists per page. See `.claude/context/theming.md`.
- Both ride the scroll rather than playing an animation over it, and each travels on its own measurements, so the toggle lands before the name. Syncing them would mean one moving at a rate the scroll does not.
- Reduced motion keeps the name in the hero and shows the bar's own, which is the same information with none of the travel. The toggle still moves, since its position has to stay continuous for the control to be reachable at every scroll.

Placement waits for the stylesheet and for the hero's reveal to come to rest before it measures, and gives up waiting after three seconds. Measuring before either put the toggle 868px off its row in WebKit against the built page. See `.claude/ARCHITECTURE.md` § A promoted control is measured against the settled page.
