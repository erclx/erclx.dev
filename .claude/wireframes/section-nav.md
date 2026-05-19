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
- Active tracking: one `IntersectionObserver` on the three `<section>` elements with `rootMargin: '0px 0px -50% 0px'` so a section becomes active as soon as it enters the top half of the viewport, with max-ratio logic flipping the active label when a newer section occupies more of that half than the previous one. A narrower middle-band rootMargin felt laggy because sections could be visibly on screen with no active label. Observes the sections themselves, not the cards inside projects, to avoid flicker across the three project cards.
- Click handling: `e.preventDefault()` then `target.scrollIntoView({ behavior: 'smooth', block: 'start' })`. No URL hash side effects. Reduced-motion users get the native instant scroll fallback.
- Reveal gate: rail starts at `opacity-0` and fades to `opacity-1` once the hero band is roughly half-scrolled past. The reveal observer targets the hero element with `rootMargin: '-50% 0px 0px 0px'` (root shrunk to the bottom half of the viewport), toggling `data-revealed` based on whether the hero is intersecting that band. The earlier trigger lets the rail meet the visitor on the way down rather than catching up after origin has already taken the top of the screen. Tying the gate to the hero rather than to origin keeps the rail visible all the way through projects and looking-for, since origin scrolls out of the reading area long before the visitor reaches the footer. Bidirectional: scrolling back up into the hero hides the rail again on return visits within the same scroll session.
- Footer fade-out: a second `IntersectionObserver` on `<footer data-section="footer">` toggles `data-near-footer` on the rail. Uses `rootMargin: '0px 0px -50% 0px'` so the rail only fades when the footer's top crosses into the upper half of the viewport. Because looking-for sits flush with the footer via its `pb-32` padding, a more eager rootMargin would hide the rail while looking-for was still the dominant reading surface. Fades back in when the visitor scrolls up so that looking-for re-enters the reading area.
- No-JS path: rail stays at `opacity-0` and `pointer-events-none` because the reveal gate only flips under JS. The page reads correctly without the rail.
