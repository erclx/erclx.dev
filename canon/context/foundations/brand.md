---
title: Brand
description: The mark's single vector source, the rasters and avatars rendered from it, and the share card and description a crawler reads
---

# Brand

## Overview

Owns the mark and every image generated from it. The mark is a lowercase e and a block cursor drawn once in `src/assets/brand/mark.svg`, so the tab, the home-screen icon, the avatar, and the bar cannot drift. `bun run brand` renders the rasters with a cream ground and a dark mark, and the bar alone takes the theme's foreground with no ground.

The share card is one 1200x630 image and one description for every host. `bun run share-card` draws it from the hero's live field, with the line held in `scripts/brand/card-copy.ts`, and `bun run unfurl` previews it as five hosts compose it.

## Layout

### `src/assets/brand/`

Holds the mark's one vector source. The stroked paths and the filled rect take separate CSS classes, since a shared class carrying `fill` outranks `fill="none"` and turns the open letter solid.

- The SVG serves the tab, and the 32-square PNG is a fallback for an engine that ignores an SVG icon
- A rounded square frames the mark rather than a disc, which leaves the letter room at 16 pixels

### `scripts/brand/`

Holds the scripts that render every brand image from the mark and the live field. `rasters.ts` draws the mark's rasters, `share-card.ts` and `avatar-field.ts` crop the hero's field, and `unfurl.ts` previews the card.

- `card-copy.ts` holds the card's line once, so the card and the header cannot drift while they match
- `capture-field.ts` holds the field capture both croppers share, so the card and the avatar take one live source
- `unfurl.ts` reads the tags off the served page rather than the source, since a crawler reads the rendered copy

### `public/avatar/`

Holds six profile-host images, a light and dark pair and a streamline dark pair, each at 1024 and 2048px, since a host wants a file to upload.

- The dark ground is the site's dark `--card`, one step above `--background`, since an inverted near-black reads as flat on a dark host
- The streamline pair crops the hero's live canvas with a pointer held, since the still page ground never draws the accent reveal
- The two sizes are one CSS geometry at device scale 1 and 2, since the field's density follows the canvas's CSS width

## Gotchas

- A guard on the mark counts enclosed holes rather than ink, since a filled disc carries more ink than an open letter
- A crawler fetches `og:image` outside the page, so it needs the absolute URL that `site` in the Astro config builds from `ASTRO_SITE`
- `bun run share-card` shoots a live page, so serve `dist/` first and pass `CARD_BASE_URL`, which defaults to `http://localhost:4400`
- `scripts/brand/capture-field.ts` navigates to a real page before injecting markup, since a page holding a large embedded image crashes the capture
- The description never names an employer or repeats the card's line, and `src/test/rendered-copy.test.ts` fails a page whose description does
