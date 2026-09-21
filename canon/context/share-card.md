---
title: Share card
description: The Open Graph card and description a crawler reads, what each one says, and the harnesses that check them
---

# Share card

## Overview

Every host that unfurls a link reads the same Open Graph tags, so one image and one description cover all of them. This entry owns what a crawler reads and why the card says what it says.

## Layout

- `scripts/` owns the card renderer, the shared copy module, and the unfurl harness
- `e2e/` owns the guard on the drawn card
- `public/avatar/` owns the separate 1:1 asset for a host that wants one, described in `canon/context/brand.md`

## Decisions

### A shared link renders one card, and the card says what the title cannot

One 1200x630 image and one description serve every host.

- `site` in the Astro config makes `Astro.site` resolve the image to an absolute URL, which a crawler needs since it fetches the image outside the page's own context.
- The image carries the claim (`Eric Le · AI Engineer`) and the description elaborates rather than repeats it, since a host printing both beside each other would otherwise say the same sentence twice. The claim is held in `scripts/card-copy.ts`.
- The mark leads the composition at 210px. A square crop across the mark and the last word of every line is a known cost, accepted because most hosts take the first `og:image` at whatever aspect they choose.
- The description never names an employer. Metadata says who someone is and the timeline on the page says where they have been. A share card is the most compressed surface the site owns, so an employer costs more room than the one click to the credential buys.
- The card's ground is drawn from the same live field the avatar's streamline variant uses. `scripts/share-card.ts` crops a margin of the hero's own `[data-shader-field]` canvas with a pointer held up and to the left of the mark, so the card carries the accent-gradient reveal a real hover produces. It used to be a whole-page capture of the static `page-ground` copy, which mounts with `animate: false` and never redraws after its first paint, so that source could not carry a gradient at all.
- The crop starts in the left margin rather than the centered 768px column, since the field damps hardest inside the column. `scripts/avatar-field.ts` follows the same rule, and `scripts/lib/capture-field.ts` holds the capture both share.
- `bun run unfurl` renders all seven pages as five hosts compose them and is the harness to check against, not the tags themselves.
- `bun run share-card` redraws the card and `src/test/rendered-copy.test.ts` guards it, including that no route title carries `case study`.

## Gotchas

- A crawler fetches the image outside the page, so a relative image URL resolves to nothing. Keep `site` set in the Astro config.
- Do not add a second image per host. The tags are shared, and the square crop is the price.
