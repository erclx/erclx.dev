---
title: Case study navigation
description: How the way-home controls return a reader to the position on the landing page they left from
---

# Case study navigation

## Overview

The behavior behind the two way-home controls a case-study route carries. Both are ordinary links to `/`. The module upgrades them to a history unwind for the reader who arrived from the landing page, so the browser restores the scroll position rather than dropping them at the hero.

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

- `[data-way-home]` on an anchor is what the module binds. A case-study route that adds a third way home gets the behavior by carrying the attribute, and one that drops the attribute silently falls back to a plain navigation.
