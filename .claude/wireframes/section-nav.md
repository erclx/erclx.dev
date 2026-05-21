---
title: Section nav
description: Fixed left-margin rail that tracks the active section as the visitor scrolls. Hidden below xl and during the hero and footer beats.
---

# Section nav

Appears as a fixed rail in the left margin once the visitor scrolls past the hero. Tracks which of the three story sections (origin, projects, looking-for) currently sits in the middle of the viewport, and lets the visitor jump between them. Extends the existing mono-kicker vocabulary already established by the `origin` and `looking-for` section labels rather than introducing a new control type.

## Wide (≥1280px)

```plaintext
┌─[viewport]─────────────────────────────────────────────────┐
│                                                            │
│  origin         [section content fills the column]         │
│ │projects │                                                │
│  looking-for                                               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

The active label sits inside a 2px primary left border. Inactive labels render in `text-muted-foreground` with a transparent border, matching the active-row treatment in `origin.md` and `looking-for.md`.

## Below xl (≤1280px)

Hidden. From md (768px) through lg (1024px) there is never a clear gutter wide enough for both the rail and content. At lg the projects section switches to `max-w-5xl` and fills the viewport edge-to-edge, putting the rail directly on top of card content. Below xl the page is short enough that scroll-tracking adds marginal value, so the rail hides entirely.

## Behavior

- Position: `fixed left-6 top-1/2 -translate-y-1/2`, vertical flex with `gap-3`. `hidden xl:flex`.
- Labels: `font-mono text-label`, lowercase, mirroring the existing `origin` and `looking-for` kickers. Inactive at `text-muted-foreground`. Active at `text-foreground` with `border-primary` on the 2px left border. Hover lifts inactive labels to `text-foreground` over 150ms.
- Active tracking: a scroll handler computes the active section on every `scroll` and `resize` event, throttled with `requestAnimationFrame`. The active section is the last one whose top edge has crossed an anchor line at 30% of viewport from the top. Iterates sections in document order, returns the last one above the anchor. This handles short sections at the end of the page correctly (an earlier max-intersection-ratio approach would flip the active label to a taller preceding section when clicking the last rail item). Observes the sections themselves via `getBoundingClientRect`, not the cards inside projects, so the active state never flickers across project card boundaries.
- Near-bottom override: when `scrollY + innerHeight` reaches the document's `scrollHeight`, force the active label to the last section. Handles the case where the page bottoms out before the last section can scroll high enough to cross the 30% anchor.
- Click-intent lock: clicking a rail link sets the clicked section active immediately and suppresses the scroll-based recomputation for 700ms (matching the smooth scroll duration). Click intent always wins on click. Scroll-based detection resumes after the lock expires. Without this lock, clicking a section whose smooth scroll cannot fully position it at the top would resolve the active label to a different section (typically the trailing one via the near-bottom override).
- Click handling: `e.preventDefault()` then `target.scrollIntoView({ behavior: 'smooth', block: 'start' })`. No URL hash side effects. Reduced-motion users get the native instant scroll fallback.
- Reveal gate: rail starts at `opacity-0` and fades to `opacity-1` once the hero band is roughly half-scrolled past. The reveal observer targets the hero element with `rootMargin: '-50% 0px 0px 0px'` (root shrunk to the bottom half of the viewport), toggling `data-revealed` based on whether the hero is intersecting that band. The earlier trigger lets the rail meet the visitor on the way down rather than catching up after origin has already taken the top of the screen. Tying the gate to the hero rather than to origin keeps the rail visible all the way through projects and looking-for, since origin scrolls out of the reading area long before the visitor reaches the footer. Bidirectional: scrolling back up into the hero hides the rail again on return visits within the same scroll session.
- `instant` prop: when set, the rail renders with `data-revealed` already true at server time, the `data-instant` marker disables the opacity transition CSS, and the hero and footer observers do not attach. The rail is just there, no fade. Used on the case study sub-page where the page-level "no animation" baseline argues against a single micro-fade on chrome that would stand out more for being the only animation.
- Footer fade-out: a second `IntersectionObserver` on `<footer data-section="footer">` toggles `data-near-footer` on the rail. Uses `rootMargin: '0px 0px -50% 0px'` so the rail only fades when the footer's top crosses into the upper half of the viewport. Because looking-for sits flush with the footer via its `pb-32` padding, a more eager rootMargin would hide the rail while looking-for was still the dominant reading surface. Fades back in when the visitor scrolls up so that looking-for re-enters the reading area.
- No-JS path: rail stays at `opacity-0` and `pointer-events-none` because the reveal gate only flips under JS. The page reads correctly without the rail.
