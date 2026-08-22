---
title: Section nav
description: Scroll-position tracking, reveal gates, and click-lock behind the section-nav rail
---

# Section nav

## Overview

`src/components/site/section-nav/section-nav.astro` renders the fixed left-margin rail used on the landing page and every project route. It is a plain Astro file with an inline `<script>`. Layout and intent live in `.claude/wireframes/section-nav.md`. This entry covers how the tracking works.

## Active tracking

- A scroll handler recomputes the active section on every `scroll` and `resize`, throttled with `requestAnimationFrame`.
- The active section is the last one in document order whose top edge has crossed an anchor line at 30% of viewport height from the top (`ANCHOR_RATIO = 0.3`).
- The handler reads `getBoundingClientRect` on the section elements, never on the project cards inside them, so the active state does not flicker across card boundaries.

## Near-bottom override

When `scrollY + innerHeight` reaches `document.documentElement.scrollHeight - 4`, the handler forces the active label to the last section. The 4px slack absorbs sub-pixel scroll positions. Without it, a page that bottoms out before the final section crosses the 30% anchor would never mark that section active.

## Click-intent lock

Clicking a rail link sets the clicked section active immediately and suppresses scroll-based recomputation for 700ms (`CLICK_LOCK_MS`), matching the smooth-scroll duration. Without the lock, clicking a section whose smooth scroll cannot fully reach the top resolves the active label to a different section via the near-bottom override.

## Reveal gate

The rail starts hidden and fades in once the hero is roughly half-scrolled past. An `IntersectionObserver` on the hero element with `rootMargin: '-50% 0px 0px 0px'` toggles `data-revealed`. Bidirectional: scrolling back into the hero hides the rail again.

Nothing hides the rail near the footer. Looking-for and the footer together barely clear one viewport, so any scroll-position trigger for a footer fade has little to no runway to fire on before the document runs out of scroll room, and forcing one in with a minimum-dwell hold read as a timer disconnected from the reader's own scrolling rather than a response to it. A capture of the rail held visible over a fully-shown footer at 1280x800 and 1920x1080 found no clutter or overlap, so the rail carries looking-for through the rest of the page instead: revealed once and visible until the reader scrolls back into the hero, the same as a project route always behaved. See `.claude/ARCHITECTURE.md` § The rail carries looking-for through the footer rather than hiding near it.

## The active row

The active row carries the contact dock's ground, resolved from the shared values in `src/styles/global.css`, so the two margin controls read as one system. It replaces a 2px accent edge, which stated the same thing in the same color with less of it. See `.claude/context/contact-dock.md` for where those values come from and what their fill can and cannot buy.

Grounding all four rows was built and rejected. Four grounded labels read as a navigation menu rather than as a position indicator, and they make the rail heavier than the control it sits opposite. On one row the ground carries information instead.

The row also steps out of the column, so reading down the page hands the ground from label to label and each one leans right and settles back. Two things keep that from costing anything:

- Every row holds the pill's box whether or not it is painted, so the rail never reflows. Measured across all four states, one left edge and one height throughout.
- The step is a `transform` rather than the negative margin it visually undoes. The margin is layout and would shove every row below it on each handover, where a transform moves paint alone.

Sampled through one handover at 1440x900, the outgoing and incoming rows cross at +90ms and the easing overshoots past the resting position before settling, which is what makes it a lean rather than a slide.

Under a reduced-motion preference the step is dropped rather than shortened, and the ground alone carries the row. Half a gesture whose whole point is the movement is worse than none.

Pointing at a row is a separate claim from being inside one, so a hover adds the site's glow. On the active row it stacks on top of the ground rather than replacing it, for the reason the dock records.

## instant prop

When the `instant` prop is set, the rail renders with `data-revealed` already true at server render, a `data-instant` marker disables the opacity-transition CSS, and the hero observer does not attach. Used on every project route, which are otherwise static, so the rail does not fade in alone.

## Gotchas

- An earlier max-intersection-ratio `IntersectionObserver` drove active tracking. It flipped the active label to a taller preceding section when the visitor clicked the last, shorter rail item. The scroll-position handler replaced it.
- No-JS path: the rail stays hidden and non-interactive because the reveal gate only flips under JS. The page reads correctly without it.
- Click handling calls `e.preventDefault()` then `scrollIntoView({ behavior: 'smooth', block: 'start' })` with no URL hash side effect. Reduced-motion users get the native instant scroll.
- A footer `IntersectionObserver` with no root margin fired the instant the footer's own border box, carrying roughly 100px of empty top padding before any visible content, touched the bottom of the viewport. That hid the rail while looking-for was still the section on screen. Keying the hide to looking-for's own bottom crossing the 30% anchor closed that case and reopened the one the missing root margin was meant to fix: a viewport tall enough to run out of scroll room before the crossing never hid the rail at all. A minimum-dwell hold fixed that too, at the cost of a fade timed to a clock rather than to the reader's own scrolling. See `.claude/ARCHITECTURE.md` § The rail carries looking-for through the footer rather than hiding near it for why the gate was removed instead of retuned again.
