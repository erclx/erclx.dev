---
title: Project cards
description: Static Astro card rendering with hover-play video and parallax tilt as vanilla TS modules
---

# Project cards

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

## Visual budget

- One muted MP4 per project, dark theme only, ≤500kb, 720p, h.264 baseline. Poster is a single dark PNG extracted from the same clip.
- Poster sits underneath the video. Video fades in over 200ms once playback starts.
- Media slot frames the dark clip as embedded media so it sits cleanly on either page theme: rounded inner corners, hairline ring, soft shadow, light surface inset.

## Hidden contracts

- `[data-tilt]` on the card root is the public contract for interactivity. Removing it disables both hover-play and parallax.
- `[data-media-video]` and `[data-media-poster]` are the inner contracts for the media slot.
- The video element preloads `none` and starts muted. Autoplay-with-sound would trigger a browser block.
- Tilt writes `--tilt-x`, `--tilt-y`, `--parallax-x`, and `--parallax-y` CSS variables on the card and inner slot. The card's class consumes them via `[transform:...]` attribute selectors. Renaming any one breaks the visual transform.

## Gotchas

- A card without `poster`, `videoSrc`, and `mediaAlt` skips the media slot entirely. Tilt still applies, but hover-play has nothing to bind.
- `fadeDelay` on the card uses the array index. Reordering the data array reorders the staggered fade-in.
