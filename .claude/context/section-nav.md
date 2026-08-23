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

The rail starts hidden and fades in once the first section reaches the anchor. An `IntersectionObserver` on the hero element toggles `data-revealed`, with its `rootMargin` derived from `ANCHOR_RATIO` rather than written beside it. Bidirectional: scrolling back into the hero hides the rail again.

One number places both lines, and the arithmetic is why. The hero holds the viewport height wherever this rail is visible, so a hero whose bottom edge sits at the anchor is the same moment the section under it crosses that anchor. A margin of half the viewport revealed the rail 0.2 viewport heights early, so it painted at full opacity naming no row for 150px at 1280, 170px at 1440, and 210px at 1920, a window that grew with the screen because both ends were fractions of it. `e2e/home.spec.ts` guards it by sampling either side of the crossing and counting positions where the rail is visible and no row is named.

The bar arrives before the rail and always did, at 280px against 570px measured at 1280x800. It reveals on `byArrival || byHero`, and the arrival gate fires first, so a reading of the hero-ratio gate alone does not describe when the bar appears.

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

## The route's opening leads its rail

A route's first row points at the section carrying the `h1`, labelled with the project name. Without it the rail named no row for the first 700 to 900px of every route, measured at 1440x900 across all five, because `instant` shows the rail from first paint while the first prose section starts 938 to 1135px down. A position indicator stating no position was the whole opening screen.

Hiding the rail there instead was built and rejected. Copying the landing page's reveal gate does not reproduce the landing page's behavior, because a route's opening section is proportionally far larger than the landing hero: the rail would be absent for 9.3% of diction, 15.5% of jobtriage, and 34.6% and 37.1% of stackr and caret, against roughly 6% on the landing page. The two shortest routes would lose it for over a third of the read. The two rails also do different jobs, which is what makes the divergence deliberate rather than an oversight: the landing rail tracks position through sections a reader meets by scrolling, where a route's is a contents list for a long-form read usually arrived at from a shared link.

Filling the empty state by lighting the first prose row was rejected for a second reason beyond claiming a section the reader has not reached. The row is then already lit when they arrive at it, so the rail's first handover never happens, and the step from row to row is the whole gesture.

It is data rather than component behavior. Each route gives its opening section an `id` matching its label and adds one entry at the top of its own `navItems`, so the rail component is unchanged and carries no fallback: the opening section's top already sits above the 30% anchor at first paint, so the existing walk names it. The label is the heading it points at, which is the rule every other row follows, and `overview` was rejected against it as the one label on the site with no heading behind it.

What it costs is the project name beside the `h1` on the opening screen, which is the pairing `[data-route-here]` hides itself to avoid. It is accepted because a rail row is a position mark in the margin at label size rather than a title in the same band, and because past the `h1` the bar's name fades in as the rail hands off, so the name is stated exactly once at every other scroll position.

## Gotchas

- A rail row built with `document.createElement` takes none of this component's styles. Astro scopes them to a `data-astro-cid-*` attribute only server-rendered elements carry, so a row added at runtime paints no ground, no border, and no step while still reporting `data-active`. The lead row above was prototyped that way and shipped a row that was active and invisible at once. Read the paint, not the state: a check reading `data-active` reported that arm working, where one reading `backgroundColor`, `borderTopWidth`, and `transform` fails it. This is the same class as the instrument failures `.claude/ARCHITECTURE.md` collects, reached through a styling mechanism rather than through a measurement.
- An earlier max-intersection-ratio `IntersectionObserver` drove active tracking. It flipped the active label to a taller preceding section when the visitor clicked the last, shorter rail item. The scroll-position handler replaced it.
- No-JS path: the rail stays hidden and non-interactive because the reveal gate only flips under JS. The page reads correctly without it.
- Click handling calls `e.preventDefault()` then `scrollIntoView({ behavior: 'smooth', block: 'start' })` with no URL hash side effect. Reduced-motion users get the native instant scroll.
- A footer `IntersectionObserver` with no root margin fired the instant the footer's own border box, carrying roughly 100px of empty top padding before any visible content, touched the bottom of the viewport. That hid the rail while looking-for was still the section on screen. Keying the hide to looking-for's own bottom crossing the 30% anchor closed that case and reopened the one the missing root margin was meant to fix: a viewport tall enough to run out of scroll room before the crossing never hid the rail at all. A minimum-dwell hold fixed that too, at the cost of a fade timed to a clock rather than to the reader's own scrolling. See `.claude/ARCHITECTURE.md` § The rail carries looking-for through the footer rather than hiding near it for why the gate was removed instead of retuned again.
