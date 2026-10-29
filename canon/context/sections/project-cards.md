---
title: Project cards
description: The projects section's static cards, the whole-card route link, hover-play and tilt as vanilla modules, and the pointer queries they read
---

# Project cards

## Overview

Owns the projects section, whose cards render statically from a config array in `projects.astro` with hover-play and tilt as vanilla TypeScript modules. The set runs canon, Frameboard, Stackr, Caret, Jobtriage, and annex, and every card owns a route.

A card's heading links its route, and every other link in its row leaves the site. Hover-play comes from `src/lib/hover-video.ts`, shared because a project route plays its clips the same way. It plays only a clip the stylesheet displays, so a card's `posterDark` and `videoSrcDark` pair one clip per theme and the hidden one is never fetched.

## Layout

### `src/components/site/projects/`

Holds the section, one card's markup, and `tilt.ts`. A card draws no plate or outline, and a glow under the pointer reveals its bounds.

- An `aria-hidden` overlay anchor covers the card, since nested anchors are invalid and the row links must stay reachable above it
- Each row link carries `z-10` itself, since raising the `<ul>` puts its full-width box over the overlay and kills the gaps between links
- `tilt.ts` runs one rAF loop for every card, rotating the media slot up to 6° and shifting it 8px, and stops under reduced motion
- An odd card count makes the last card span both columns from `lg`, with its still beside its text, which six cards never trigger
- A description is the project's portfolio prose minus its leading article and its trailing sentence naming the links

## Gotchas

- A card needs `poster` and `mediaAlt` or it skips the media slot while tilt still applies, and `videoSrc` is optional
- A still whose content sits flush left needs `mediaPosition: 'left top'`, since `object-cover` crops the edges of a 1280-wide still
- Write a hover-only rule as `not all and (pointer: coarse)`, since Firefox reports no pointer capability and a hover rule sends it down the touch path
- A card's id is its lowercased name, which the experience chips target, so a name holding a space or punctuation breaks the fragment
- An overlay that stopped propagation would break hover-play and tilt with every check passing, since both rely on events reaching the card
