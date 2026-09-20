---
title: Site bar
description: The sticky bar the hero's name and toggle travel into, its shared ground, its measurement timing, and the route bar's centering and back-to-top name
---

# Site bar

## Overview

The sticky bar on the landing page and the route bar on a project route are one mechanism read at three moments: when the hero's controls are promoted into it, when its ground is drawn, and when a route bar centers its name. Layout and intent live in `canon/wireframes/site-bar.md`. This entry covers the decisions behind them.

## Layout

- `src/components/site/nav/` owns both bars, the brand mark the landing bar carries, and the handoff that flies the hero's name and toggle into the row
- `src/styles/` owns the shared bar ground and its shape transition

## Decisions

### A promoted control is measured against the settled page

The bar takes the hero's name and theme toggle rather than rendering its own. One element travels in each case, which keeps a single toggle wired and keeps the page's only `h1` carrying its accessible name. The cost is that both end up in fixed hosts holding a measured position, so a measurement taken against a page that has not settled is held for good.

- Placement waits on `document.readyState`, the hero's own reveal transform at rest, and the reveal marker on both anchors rather than one, with a three-second timeout in case neither condition arrives.
- The wait reads the reveal marker with the row's position as the tiebreak, so an unmarked row still on screen is waited for and an unmarked row scrolled past is not.
- The toggle's home slot holds no size of its own, so once the control is promoted away the slot collapses to a point and every re-measure after the first reads that empty box. The control is returned to its home for the reading rather than the slot being given a reserved size, so the control's own box stays the one source of the hero position.
- That home is the header's own corner rather than a text row. The greeting sits under the name and the portrait floats flush to the column's right edge, so no row under the name has a free right side to center a control against.
- The bar's reveal keys to half the hero rather than half the viewport, since a hero shorter than half the viewport clears a viewport-keyed margin without being scrolled at all. `canon/context/section-nav.md` § Reveal gate carries the rail's own reveal derivation.
- The toggle's corner sits off both the bar's slot and the name's own travel, so its own vertical distance is the wrong clock for either the toggle's crossing or the bar's arrival gate. Both read the name's travel, the one distance that describes the move a reader sees.

### One ground for two bars, and the shape moves while the row does not

The landing bar and a route's bar share one ground rule rather than each declaring its own. It draws from the elevated-surface token at 0.88 alpha over a 24px blur, holding 5.02:1 and 8.16:1 contrast in light and dark on the landing page and 4.83:1 and 8.30:1 on the densest route.

- A ground taken from the page's own background token cannot separate from it. It measured 1.002:1 and 1.003:1, the page laid on the page, and blur alone cannot rescue that, since blurring a flat field returns the same flat field.
- The shape contracts on scroll and the row inside it does not. The hero flies its name and toggle into the row's slots at measured positions, so a measurement of either has to be taken against a settled shape.
- A shared declaration is not shared until nothing can replace it. The shape's transition, `inset 320ms ease, border-radius 320ms ease`, sits on `[data-bar-ground]` rather than inside either bar's component, since `transition` is a shorthand and a component rule setting only `transition: opacity` resets `transition-property` to that one property rather than adding to the list.
- The edge and the shadow stay out of that list deliberately. They arrive at once on both bars, marking the instant the bar detaches from the viewport, where an edge fading up would read as the bar being unsure whether it has. `canon/context/motion.md` § The bar's shape change carries the measured frames.

Measured at 10c511a on 2026-08-25 at 1280 across chromium, firefox, and webkit.

### Equal gaps are not a center, and the name nobody could press was the only way back

A route's bar centers its name with three columns of equal outer width rather than `justify-between` across three items of unequal width, since equal free-space gaps only center the middle item when its two neighbors weigh the same.

- A 17.5px offset nudge would have encoded the lockup and toggle's current widths and gone wrong the moment either moved, which is a literal standing in for a relationship two other values already fix.
- The name is a button that scrolls to the route's top. It is the only back-to-top control in the band below 1280, where the section rail is hidden.
- Opacity was the only thing withholding it. A control hidden by opacity alone still costs a tab stop and a 44px target while painting nothing, so it takes `inert` on the same clock as its visible marker.

Measured at 4577565 on 2026-08-26 at 320, 390, 640, 768, 1024, 1280, 1440, and 1920 across all five routes.

## Gotchas

- A bar measurement taken before the page settles is held for good. Read a position only after the reveal marker and the hero's transform have both come to rest.
- Two bars sharing a rule is not a guarantee. A component-level `transition` shorthand silently replaces the shared list, and Astro's scoped attribute selectors let it win on specificity.
- A ground read from composited token values does not match what a reader sees when `backdrop-filter` samples the page behind it, so measure contrast off painted pixels.
