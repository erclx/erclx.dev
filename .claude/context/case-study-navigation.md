---
title: Case study navigation
description: How the way-home controls return a reader to the position on the landing page they left from
---

# Case study navigation

## Overview

The behavior behind the two way-home controls a case-study route carries. Both are ordinary links to `/`, one in the route bar and one in the foot. The module upgrades them to a history unwind for the reader who arrived from the landing page, so the browser restores the scroll position rather than dropping them at the hero.

The two are not one control repeated. The bar answers at any scroll position and the foot answers when the read is over, which is the split `.claude/REQUIREMENTS.md` § Navigation states.

The foot came out on 2026-08-21 and went back the same day. Removing it rested on a measurement, that both controls sit on screen together at the foot of every route, and the measurement was right while the conclusion drawn from it was not: a control being reachable is a different question from whether the end of a long read should close on something. The operator read the removed version and reported the page ending too tight, which is the evidence the measurement could not carry. It returned left-aligned rather than at its old full width, on the edge every line of prose starts from, and the tail went from 80px to 96 above the control and 112 below.

## Layout

- `src/components/site/case-study/` owns the module all five project routes load

## Decisions

- Unwinding history over restoring scroll by hand. The browser already tracks where a reader left and restores it on a back navigation, so the work is letting it, not repeating it. Writing the position to storage and reapplying it on load reimplements a browser feature and fights the reveal animations on the way in.
- The control stays an `<a href="/">` in the markup and the module intercepts the click. A reader with no script, and a crawler, get a working link to the landing page. Rendering a `<button>` instead would trade that away for nothing.
- Two guards decide whether the upgrade applies. The referrer has to be this origin at path `/`, which is the reader who came from the landing page, and `history.length` has to be at least two, which excludes the tab opened fresh onto the case study where an unwind would leave the site. Failing either leaves the plain link, so the fallback is the correct destination rather than a dead control.
- A click carrying a modifier or a non-primary button passes through untouched, since the reader is asking for a new tab and the link already does that correctly.

## Gotchas

- Measured 2026-08-15 against the built page: leaving the landing page at scroll 1899, the control returned at 0 before this and returns at 1359 after, which is what the browser's own back button gives. The restored position is near where the reader left rather than exact, because lazy images above the fold settle at slightly different heights on the way back.
- A test asserting the restored position has to compare against a threshold rather than the exact departure offset, for that same reason.
- The landing page does not replay its reveal cascade on the way back, since the page is restored rather than re-executed. That is a consequence of the history unwind rather than a second thing the module does, so it disappears if the unwind is ever replaced by a plain navigation.

## Hidden contracts

- `[data-way-home]` on an anchor is what the module binds. A case-study route that adds another way home gets the behavior by carrying the attribute, and one that drops the attribute silently falls back to a plain navigation.
- A test counts those anchors by region, one in the header and one in the footer, rather than counting two anywhere on the page. A route that grew a third in the body would satisfy a bare count of two and is the case the split assertion catches.
- `route-foot.astro` owns the closing control for all five routes. It carries the footer landmark as well, so a route that drops the component ends with no `[data-section="footer"]` at all, which is the shape the routes shipped in for part of 2026-08-21.
