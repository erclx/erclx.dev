---
title: Site bar
description: The landing bar the hero's name and toggle fly into, the route bar and its breadcrumb, the shared full-width ground, and the way home from a route
---

# Site bar

## Overview

Owns the bars that frame a page and the way back from a project route. Both run full width with their row out to `--page-inset`, on the page's own background with a hairline under it once content passes beneath. The landing bar takes the hero's own name and theme toggle rather than rendering its own, so one toggle stays wired and the page's only `h1` keeps its name.

A project route renders its own bar, with `Eric Le / <route>` as a breadcrumb on the left, the route's section links, and the toggle. `Eric Le` is a way home, and the route name is a button that scrolls to the route's top.

A route carries two way-home links to `/`, one in the bar and one in the foot. For a reader who arrived from the landing page, a module turns them into a history unwind, so the browser restores the landing page's scroll position.

## Layout

### `src/components/site/nav/`

Holds both bars, the brand mark, and the handoff that flies the hero's name and toggle into the landing bar's row.

- Placement waits on `document.readyState`, the hero's reveal at rest, and the marker on both anchors, with a three-second timeout
- The toggle returns to its home for each reading, since its home slot collapses to a point once the control leaves
- The bar reveals at half the hero rather than half the viewport, since a short hero would clear a viewport-keyed margin unscrolled
- The ground is `--background`, opaque and unblurred, with a 1px `--border` bottom edge once condensed and no radius or shadow, declared once in `global.css`
- Each bar publishes `--bar-height`, the row's padding and its tap target, which the sections sheet hangs from
- The route name truncates first when a long name meets the `Sections` button and the toggle at phone width

### `src/components/site/case-study/`

Holds the way-home module every project route loads, and `route-foot.astro`, which carries the closing control and the footer landmark.

- The module binds `[data-way-home]`, so a new way home carries the attribute and an anchor without it stays a plain link
- The unwind applies when the referrer is this origin at `/` and `history.length` is at least two, and a modifier click passes through
- A route carries exactly two way-home anchors, one in the header and one in the footer, since a third would repeat an exit

## Gotchas

- A bar measurement taken before the page settles is held for good, so read a position only after the reveal marker and the hero rest
- A component-level `transition` shorthand replaces the bar ground's shared list, and Astro's scoped selectors let it win
- The landing position restores near the departure rather than on it, since lazy images settle at other heights, so compare against a threshold
- The landing page does not replay its reveal on the way back, since the browser restores it rather than running it again
- The route name shows from the first frame, since a breadcrumb missing its last crumb reads as `Eric Le /`
