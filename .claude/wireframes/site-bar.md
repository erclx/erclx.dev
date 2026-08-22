---
title: Site bar
description: Sticky top bar that the hero's name and theme toggle travel into as the reader scrolls, carrying the way back to the top at every viewport
---

# Site bar

Sits fixed at the top of the viewport on the landing page, hidden while the reader is still in the hero and revealed once they have passed half of it. Carries the name as a control returning to the top, and the theme toggle the hero hands over. A project route renders its own bar instead, which is the same column and the same two controls plus the route's name.

This is the surface that closes the navigation hole the rail could not. The rail is hidden below 1280px and states position rather than offering reach, so before this bar a reader below that width had no navigation at all.

## Landing page, revealed (≥768px)

```plaintext
┌─[viewport]──────────────────────────────────────────────────┐
│      ╭─[ground: elevated surface, blurred, detached]──╮     │
│      │  e▮ Eric Le                              [☾]   │     │  ← mark, name returns to top,
│      ╰──────────────────────────────────────────────╯       │    toggle arrived from hero
└─────────────────────────────────────────────────────────────┘
```

The ground starts at the full width with square corners and contracts to a rounded shape as the reader scrolls. The row inside it does not move.

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
┌─[viewport]──────────────────────────────────────────────────┐
│      ╭─[same ground, same column]───────────────────╮       │
│      │  e▮ Eric Le       diction              [☾]   │       │  ← mark, way home, route name, toggle
│      ╰──────────────────────────────────────────────╯       │
└─────────────────────────────────────────────────────────────┘
```

The route name is absent while the route's own title is still on screen and fades in once that title passes behind the bar, so the two never state the same thing at once. A route carries no arrow beside the name. The foot carries one on its own control, and the two are separated by a page height rather than by an ornament, so an arrow here would state a second time what the name already does.

## Behavior

- The bar holds the same column as the hero on every surface, so the chrome never resizes as a reader moves between the landing page and a route. That also lands the name where it started horizontally, so the travel reads as vertical.
- The name is a control rather than a label. It returns the reader to the top, smoothly unless reduced motion is set. Hovering or focusing it underlines the name.
- The mark and the name are one control, not a mark beside one. Clicking either goes home, the control measures 79x44 on both bars, and the mark is hidden from assistive technology so the accessible name stays the name alone. A separate link on the mark was rejected as two adjacent controls on one destination.
- The mark sits inside that control and outside the name slot, which are different boxes. The slot is the target the flying name is measured against, so the marker stays on the name rather than moving up to the group.
- The bar switches on and its ground fades in under it. The name and the toggle arrive by riding the scroll and are fully opaque when they land, so a mark fading up beside them was a third timing on the row. The opacity stays on the bar rather than the row, because reduced motion gives the name slot its color back and an always-opaque bar would then show a second name through the whole hero.
- The bar is `inert` until it is revealed, so nothing inside it takes focus while it is off screen.
- A route's own bar is the sticky one rather than a second bar above it, so a reader deep in a long route always has a way home without stacking two bars.

## The ground

Both bars draw one shared ground rather than a copy per surface. A reader crossing between the landing page and a route meets the same shape at the same height.

- The ground is the elevated surface token rather than the page background. Drawn from the background it measured 1.002:1 against what sat behind it, so only the text inside said a bar was there. Blurring a flat field returns the same flat field.
- The shape is detached from the viewport edge, carries an edge and a shadow, and holds no rule under it.
- It is lightly translucent over a wide blur. Prose passing under a lighter bar reads through it as letterforms, which a wider blur destroys while the backdrop still reads as a wash. Widening it further averages the dark gaps between project cards into the ground and darkens it under near-black text.
- It contracts on scroll and the row inside holds its position. Everything the hero flies into that row is placed at a measured position, so the shape is the one thing free to move.

See `.claude/ARCHITECTURE.md` § One ground for two bars, and the shape moves while the row does not for the measured values behind each of these.

## The handoff

The name and the toggle are not duplicated between the hero and the bar. Both travel, and each is one element throughout.

- The name a reader sees while it travels is a third element, fixed and scaling from the hero's display size down to the bar's. The hero's own heading keeps its text for assistive technology and is painted transparent rather than hidden, so the page's only `h1` keeps its accessible name.
- The toggle is the hero's own control, re-parented into a fixed host. Exactly one exists per page. See `.claude/context/theming.md`.
- Both ride the scroll rather than playing an animation over it, and each travels on its own measurements, so the toggle lands before the name. Syncing them would mean one moving at a rate the scroll does not.
- Reduced motion keeps the name in the hero and shows the bar's own, which is the same information with none of the travel. The toggle still moves, since its position has to stay continuous for the control to be reachable at every scroll.

Placement waits for the stylesheet and for the hero's reveal to come to rest before it measures, and gives up waiting after three seconds. Measuring before either put the toggle 868px off its row in WebKit against the built page. See `.claude/ARCHITECTURE.md` § A promoted control is measured against the settled page.
