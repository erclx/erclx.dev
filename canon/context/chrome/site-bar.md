---
title: Site bar
description: The landing bar the hero's name and toggle fly into, the route bar and its back-to-top name, the shared ground, and the way home from a route
---

# Site bar

## Overview

Owns the bars that frame a page and the way back from a project route. The landing bar takes the hero's own name and theme toggle rather than rendering its own, so one toggle stays wired and the page's only `h1` keeps its name. A project route renders its own bar, whose name is a button that scrolls to the route's top.

A route carries two way-home links to `/`, one in the bar and one in the foot. For a reader who arrived from the landing page, a module turns them into a history unwind, so the browser restores the landing page's scroll position.

## Layout

### `src/components/site/nav/`

Holds both bars, the brand mark, and the handoff that flies the hero's name and toggle into the landing bar's row.

- Placement waits on `document.readyState`, the hero's reveal at rest, and the marker on both anchors, with a three-second timeout
- The toggle returns to its home for each reading, since its home slot collapses to a point once the control leaves
- The bar reveals at half the hero rather than half the viewport, since a short hero would clear a viewport-keyed margin unscrolled
- The ground takes the elevated-surface token at 0.88 alpha over a 24px blur, since the page's own background measured 1.002:1 against itself
- A route's bar centers its name in three columns of equal width, since equal gaps center the middle item only when its neighbors match

### `src/components/site/case-study/`

Holds the way-home module every project route loads, and `route-foot.astro`, which carries the closing control and the footer landmark.

- The module binds `[data-way-home]`, so a new way home carries the attribute and an anchor without it stays a plain link
- The unwind applies when the referrer is this origin at `/` and `history.length` is at least two, and a modifier click passes through
- A route carries exactly two way-home anchors, one in the header and one in the footer, since a third would repeat an exit
- The route name stays `inert` until the `h1` passes behind the bar, since opacity alone leaves a tab stop over the opening screen

## Gotchas

- A bar measurement taken before the page settles is held for good, so read a position only after the reveal marker and the hero rest
- A component-level `transition` shorthand replaces the bar ground's shared list, and Astro's scoped selectors let it win
- The landing position restores near the departure rather than on it, since lazy images settle at other heights, so compare against a threshold
- The landing page does not replay its reveal on the way back, since the browser restores it rather than running it again
