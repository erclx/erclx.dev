---
title: Project cards
description: Static Astro card rendering with hover-play video and parallax tilt as vanilla TS modules
---

# Project cards

## Overview

The projects section. Cards render statically from a config array in `projects.astro`. Interactivity ships as two vanilla TypeScript modules loaded via `<script>` tags, not as React islands.

## Layer responsibilities

- `src/components/site/projects/projects.astro` owns the section: the data array of cards and the `<script>` imports that mount interactivity
- `src/components/site/projects/project-card.astro` owns one card's DOM: poster image, hover video, headline, description, link row, and the overlay anchor that opens the route the card owns
- `src/lib/hover-video.ts` owns hover-play, and is shared rather than local because a case-study route needs the same behavior. It finds each `[data-media-video]`, resolves its host through `closest('[data-media-host]')`, plays on pointer enter, and pauses and rewinds on leave. A host declaring `data-media-host="view"` also plays on intersection where the pointer cannot hover, which a card deliberately leaves out: its clip is revealed by a hover-driven opacity, so playing it on a touch device would run frames nobody can see.
- `src/components/site/projects/tilt.ts` owns parallax. Tracks pointer per card with `MAX_TILT_DEG` and `MAX_PARALLAX_PX`, lerps toward the target with `LERP`, runs one rAF loop across all cards.

## Decisions

- Vanilla TypeScript modules over React islands. Skipping the framework tax is worth the discipline of keeping interactive logic small enough that vanilla TS reads cleaner than a hydrated component.
- Both interactivity modules query by `[data-tilt]`, the same attribute the card sets on its root `<article>`. One attribute, two consumers.
- Both modules bail early on `prefers-reduced-motion: reduce`. The card stays static.
- Each card carries an id derived from its name in lowercase, and a scroll margin so an in-page jump does not land it against the viewport edge. The experience section's chips target those ids, and an e2e test compares the chip labels against the card headings, so a card added there without a chip fails loudly rather than leaving a dead link. A name carrying a space or punctuation would produce an invalid fragment, which that test is also what catches.
- A whole-card click reaches the card's route through an absolutely positioned anchor covering the card, with the link row raised above it. Nested anchors are invalid markup, so wrapping the card in one is not available, and the overlay is the shape that leaves the inner links reachable.
- The overlay carries `aria-hidden` and sits outside the tab order. The `Project` link in the row already reaches the same destination with a real label, so exposing the overlay too would announce and tab through one destination twice.
- The overlay is passed as a `caseStudyHref` prop, derived in `projects.astro` from the one link on a card that stays inside the site. Every card carries exactly one, since every shipped project owns a route, and an e2e test counts the overlays against the cards so a card added without a route fails loudly.
- Tilt batches state in a single rAF loop rather than one loop per card.
- A card description is the canonical portfolio prose with two edits: drop the leading article, and drop the trailing sentence naming the links, which the card renders as its own row. Everything the source says about what the artifact does and where it is reached stays. The convention is readable off any card that already conforms rather than written down anywhere else, and `.claude/context/index.md` routes to `.claude/ARCHITECTURE.md` § Content read from the parent checkout for why the source is upstream.
- An odd number of cards makes the last one span both columns from `lg`, laying its still beside its text so the closing card keeps a height near the paired ones. The four above it are untouched and the grid stays at two columns. Every card also fills its grid row, so two cards sharing a row share a lower edge rather than leaving a ragged one.
- Tilt rotates up to `MAX_TILT_DEG` (6°) toward the cursor. The inner media slot translates up to `MAX_PARALLAX_PX` (8px) against the rotation for parallax depth. Per-card values lerp toward the target with factor `LERP` of 0.18.

## Gotchas

- The media slot needs `poster` and `mediaAlt`. A card missing either skips the slot entirely, and tilt still applies while hover-play has nothing to bind.
- `videoSrc` is optional. A card carrying a still and no clip renders the still, and `hover-video.ts` skips it because its `[data-media-video]` query returns nothing. Two cards ship this way while their screencasts are owed.
- Card stills run `1280x720` or `1280x800` against an `aspect-[11/7]` slot, so `object-cover` crops horizontally under the default top position, roughly 6.5% off each edge at the wider ratio and under 2% at the taller one. A still whose content sits flush left, such as a terminal transcript or an app shell with a sidebar, needs `mediaPosition: 'left top'` or that content is cropped away.
- A card still shows the artifact running rather than a result it produced. The card names the tool and its route carries the depth, which is the split every card on the page follows. A route reports a measured result only where the project has one.
- `fadeDelay` on the card uses the array index. Reordering the data array reorders the staggered fade-in.
- A `view` host plays on intersection, so a test asserting its clip is paused before a hover is racing the behavior the mode exists for. The jobtriage route declares `view`, and Firefox's observer fires early enough to lose that race on every run while chromium and webkit win it, which reads as a Firefox playback defect and is a test that contradicts the component. It reproduces with the pre-branch media file swapped in, and the codec, profile, pixel format, and level are identical across that change.
- The overlay covers the description, so that text is not selectable on a card. Dragging across it starts a link drag rather than a navigation, which was the risk worth checking, and the lost selection is the accepted cost of the whole-card target. Measured 2026-08-15 against the built page.
- Hover-play and tilt both survive the overlay because `pointermove` bubbles to the card and `pointerenter` fires on the card when the pointer crosses any descendant. An overlay that stopped propagation would break both while every automated check still passed.
- The link row is raised by `z-10` on each `<a>` rather than on the `<ul>`. Raising the list would put its full-width box above the overlay and leave the gaps between links inert.

## Visual budget

- At most one muted MP4 per project, dark theme only, ≤500kb, 720p, h.264 baseline. Where a clip exists the poster is a single dark PNG extracted from it, and where none does the still is the card's own `1280x720` or `1280x800` image.
- Poster sits underneath the video. The video transitions from opacity 0 to opacity 100 over 200ms on card hover via CSS. `hover-video.ts` calls `play()` in parallel on `pointerenter`, so the fade runs even if `play()` is rejected.
- A card renders its poster at 498px and that width does not grow with the viewport, because the projects grid caps at `lg:max-w-5xl`. The clips are recorded at 1280 wide, so a card shows one at 39% of native. A case-study route shows the same clip at 896px or 1216px, which is the measurement behind giving every project a route.
- Media slot frames the dark clip as embedded media so it sits cleanly on either page theme: rounded inner corners, hairline ring, soft shadow, light surface inset. That frame is the one that stays. The card around it draws no plate, no outline, and no rule under the media, so what is framed is the content and the prose sits on the page ground.
- The prose block carries top padding and no horizontal inset. Prose sitting on the page ground indents from nothing, so the inset the plate justified would have started it right of every other reading edge in the section.

## Card bounds

- A pseudo-element on `[data-media-host]` reveals the card's extent under the pointer, and nothing is drawn at rest. It is inset outward from the content rather than added as padding, so the shape is larger than the card and costs no layout. The card isolates, which keeps the shape behind its own content rather than behind the section.
- The shape reaches 24px for its own box and 20px more for the shadow, against a 48px gutter. A shape wider than the gutter meets its neighbor, so pointing at one card lights the one beside it. The shadow carries no spread for the same reason.
- The transition is asymmetric: 520ms out and 130ms in, written as a rule on the base state and a second on the hovered one. Arriving late reads as broken, and leaving slowly trails a glow behind a pointer crossing the grid rather than snapping off at every gutter.
- Tilt moved from the card root onto the media slot when the outline came off. Rotating a card with no visible bounds tilts nothing a reader can see. The pointer target is still the whole card, so the region that answers is unchanged and only the element with visible mass moves.

## Hidden contracts

- `[data-tilt]` on the card root is the public contract for interactivity. Removing it disables both hover-play and parallax.
- `[data-media-video]` and `[data-media-poster]` are the inner contracts for the media slot.
- The video element preloads `none` and starts muted. Autoplay-with-sound would trigger a browser block.
- Tilt writes `--tilt-x`, `--tilt-y`, `--parallax-x`, and `--parallax-y` CSS variables on the card and inner slot. The media slot consumes the tilt pair and the image wrapper the parallax pair, both via `[transform:...]` attribute selectors. Renaming any one breaks the visual transform.
