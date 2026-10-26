---
title: Cast
description: The cell-grid figures in the experience margins and the dog on the looking-for rule, their vocabularies, placement, scheduler, and drawing traps
---

# Cast

## Overview

Owns the small figures in the experience section's margins and the dog on the looking-for rule. Every figure is drawn from a cell grid rather than authored as a file, and every one is decoration, so it carries `aria-hidden` and no accessible name. The cast shows above 1280 alone, since the margins measure 0px below it.

Seven members differ by a feature, never by width, and no two share an eye or a mouth. A lead takes the antenna, a worker any hat, and an idle sits. One member acts on its own every few seconds, never two at once, and a tap escalates its face rather than replacing it.

## Layout

### `src/components/site/experience/cast/`

Holds the generator, its vocabularies, the placement, and the scheduler. `faces.ts`, `powers.ts`, `gear.ts`, and `pets.ts` hold what a figure looks like, and `placement.ts` holds where each cluster stands, so a unit test reads it without rendering.

- `TEMPERAMENTS` binds motion to mood, so a placement cannot recombine them, and a mood missing from it fails the build
- `scheduler.ts` takes an injected clock and reads the pointer, the section, and reduced motion off the page, so its policies run as unit tests
- A power draws behind its member in `--cast-aura` and shares the body's `bn` class, so the two move as one transform
- Both cluster reservations derive from `POWER_OVERHANG`, so a longer reach cannot paint a power over prose with the guard still passing
- The fill is `#d4a574` in both themes with `#2a1d14` for the eye, the palette the dog and the about aircraft share

### `src/components/site/looking-for/`

Holds the closing ask and the dog on its rule. The rule is a curved contour at the hero field's peak weight, summing three sines so it reads as part of the surface behind it.

- The dog is clipped by a polygon built from the curve's own path, since a rectangular clip drops its grip where the curve leaves the midline
- The amplitude ramps from 5px to 16px across a 342px to 768px stage, since a fixed one tips the dog at 390

## Gotchas

- A query for `.bn` finds the power's drawing before the body's, and a tap hides the resting face, so both reads report a moving figure as still
- Keep every stroke 0.7 cells or wider, since a cell is 4.5px on the 54px member, and judge a figure at the size it ships
- A scheduled act that starts no animation never ends, so it holds the scheduler's one slot and the cast goes quiet for the life of the page
- WebKit holds `:hover` on a tapped element, so the scheduler's tap gate is the one policy that needs a browser to test
- A guard filtering a list to its offenders passes hardest on an empty list, so `cast.test.ts` first asserts every vocabulary has a population
