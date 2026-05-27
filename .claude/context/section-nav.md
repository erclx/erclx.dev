---
title: Section nav
description: Scroll-position tracking, reveal gates, and click-lock behind the section-nav rail
---

# Section nav

`src/components/site/section-nav/section-nav.astro` renders the fixed left-margin rail used on the landing page and the Jobtriage case study. It is a plain Astro file with an inline `<script>`. Layout and intent live in `.claude/wireframes/section-nav.md`. This entry covers how the tracking works.

## Active tracking

- A scroll handler recomputes the active section on every `scroll` and `resize`, throttled with `requestAnimationFrame`.
- The active section is the last one in document order whose top edge has crossed an anchor line at 30% of viewport height from the top (`ANCHOR_RATIO = 0.3`).
- The handler reads `getBoundingClientRect` on the section elements, never on the project cards inside them, so the active state does not flicker across card boundaries.

## Near-bottom override

When `scrollY + innerHeight` reaches `document.documentElement.scrollHeight`, the handler forces the active label to the last section. Without it, a page that bottoms out before the final section crosses the 30% anchor would never mark that section active.

## Click-intent lock

Clicking a rail link sets the clicked section active immediately and suppresses scroll-based recomputation for 700ms (`CLICK_LOCK_MS`), matching the smooth-scroll duration. Without the lock, clicking a section whose smooth scroll cannot fully reach the top resolves the active label to a different section via the near-bottom override.

## Reveal and footer gates

- The rail starts hidden and fades in once the hero is roughly half-scrolled past. An `IntersectionObserver` on the hero element with `rootMargin: '-50% 0px 0px 0px'` toggles `data-revealed`. Bidirectional: scrolling back into the hero hides the rail again.
- A second `IntersectionObserver` on `<footer data-section="footer">` with `rootMargin: '0px 0px -50% 0px'` toggles `data-near-footer` so the rail fades out only once the footer crosses into the upper half of the viewport. A more eager margin hid the rail while looking-for was still the dominant reading surface, since looking-for sits flush with the footer.

## instant prop

When the `instant` prop is set, the rail renders with `data-revealed` already true at server render, a `data-instant` marker disables the opacity-transition CSS, and the hero and footer observers do not attach. Used on the Jobtriage case study, which is otherwise static, so the rail does not fade in alone.

## Gotchas

- An earlier max-intersection-ratio `IntersectionObserver` drove active tracking. It flipped the active label to a taller preceding section when the visitor clicked the last, shorter rail item. The scroll-position handler replaced it.
- No-JS path: the rail stays hidden and non-interactive because the reveal gate only flips under JS. The page reads correctly without it.
- Click handling calls `e.preventDefault()` then `scrollIntoView({ behavior: 'smooth', block: 'start' })` with no URL hash side effect. Reduced-motion users get the native instant scroll.
