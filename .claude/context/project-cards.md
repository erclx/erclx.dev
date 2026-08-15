---
title: Project cards
description: Static Astro card rendering with hover-play video and parallax tilt as vanilla TS modules
---

# Project cards

## Overview

The projects section. Cards render statically from a config array in `projects.astro`. Interactivity ships as two vanilla TypeScript modules loaded via `<script>` tags, not as React islands.

## Layer responsibilities

- `src/components/site/projects/projects.astro` owns the section: the data array of cards and the `<script>` imports that mount interactivity
- `src/components/site/projects/project-card.astro` owns one card's DOM: poster image, hover video, headline, description, link row
- `src/components/site/projects/project-media.ts` owns hover-play. Reads `[data-tilt]` cards, plays the inner `[data-media-video]` on pointer enter, pauses and rewinds on leave.
- `src/components/site/projects/tilt.ts` owns parallax. Tracks pointer per card with `MAX_TILT_DEG` and `MAX_PARALLAX_PX`, lerps toward the target with `LERP`, runs one rAF loop across all cards.

## Decisions

- Vanilla TypeScript modules over React islands. Skipping the framework tax is worth the discipline of keeping interactive logic small enough that vanilla TS reads cleaner than a hydrated component.
- Both interactivity modules query by `[data-tilt]`, the same attribute the card sets on its root `<article>`. One attribute, two consumers.
- Both modules bail early on `prefers-reduced-motion: reduce`. The card stays static.
- Tilt batches state in a single rAF loop rather than one loop per card.
- Tilt rotates up to `MAX_TILT_DEG` (6°) toward the cursor. The inner media slot translates up to `MAX_PARALLAX_PX` (8px) against the rotation for parallax depth. Per-card values lerp toward the target with factor `LERP` of 0.18.

## Gotchas

- The media slot needs `poster` and `mediaAlt`. A card missing either skips the slot entirely, and tilt still applies while hover-play has nothing to bind.
- `videoSrc` is optional. A card carrying a still and no clip renders the still, and `project-media.ts` skips it because its `[data-media-video]` query returns nothing. Two cards ship this way while their screencasts are owed.
- Card stills run `1280x720` or `1280x800` against an `aspect-[11/7]` slot, so `object-cover` crops horizontally under the default top position, roughly 6.5% off each edge at the wider ratio and under 2% at the taller one. A still whose content sits flush left, such as a terminal transcript or an app shell with a sidebar, needs `mediaPosition: 'left top'` or that content is cropped away.
- A card still shows the artifact running rather than a result it produced. The card names the tool and its case study carries the measurement, which is the split every card on the page follows.
- `fadeDelay` on the card uses the array index. Reordering the data array reorders the staggered fade-in.

## Visual budget

- At most one muted MP4 per project, dark theme only, ≤500kb, 720p, h.264 baseline. Where a clip exists the poster is a single dark PNG extracted from it, and where none does the still is the card's own `1280x720` image.
- Poster sits underneath the video. The video transitions from opacity 0 to opacity 100 over 200ms on card hover via CSS. `project-media.ts` calls `play()` in parallel on `pointerenter`, so the fade runs even if `play()` is rejected.
- Media slot frames the dark clip as embedded media so it sits cleanly on either page theme: rounded inner corners, hairline ring, soft shadow, light surface inset.

## Hidden contracts

- `[data-tilt]` on the card root is the public contract for interactivity. Removing it disables both hover-play and parallax.
- `[data-media-video]` and `[data-media-poster]` are the inner contracts for the media slot.
- The video element preloads `none` and starts muted. Autoplay-with-sound would trigger a browser block.
- Tilt writes `--tilt-x`, `--tilt-y`, `--parallax-x`, and `--parallax-y` CSS variables on the card and inner slot. The card's class consumes them via `[transform:...]` attribute selectors. Renaming any one breaks the visual transform.
