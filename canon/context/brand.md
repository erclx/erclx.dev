---
title: Brand
description: The mark's single vector source, the rasters rendered from it, and the avatar set a profile host consumes
---

# Brand

## Overview

The mark is a lowercase e followed by a block cursor, drawn in this repository. `src/assets/brand/mark.svg` is the one drawing and everything else derives from it, so the tab, the home screen, the avatar, and the bar cannot drift.

## Layout

- `src/assets/brand/` owns the vector source of the mark
- `public/avatar/` owns the profile-host images, served at the domain root
- `scripts/` owns the renderers that turn the drawing into rasters and the avatar captures
- `scripts/lib/` owns the field capture shared by the avatar renderer

## Decisions

### The vector serves the tab, and the rasters serve the surfaces that composite

`scripts/brand.ts` renders the drawing to rasters. An engine that reads the vector never requests the raster, which is why the 32-square PNG is a fallback for engines that ignore an SVG icon rather than a first choice that declaration order could protect.

- Every brand raster carries a cream ground with a dark mark, so all four assets agree.
- The bar is the one surface that takes no ground, because it is the one surface this repository paints. A ground there would be a cream plate laid on the page, so the mark takes the theme's foreground instead.
- A disc was rejected in favor of a rounded square. A circle inscribed in 16 pixels leaves about 11 for the mark and the letter reads cramped, where a square costs 16% of the drawing's scale and keeps the frame.
- The two other ground-carrying rasters, the home screen and the avatar, keep the same cream-on-dark pairing. A dark disc dissolves into a dark host chrome such as Discord or GitHub dark, where cream stays a defined shape on both themes.
- The bar's own fade stays on its ground rather than moving to the row that carries the name and the toggle. Under reduced motion the row keeps its color, so a fade on the row would show a second name through the whole hero, where a fade on the ground alone reveals nothing early.

The stroked paths and the filled rect take separate CSS classes. A shared class rule carrying `fill` outranks a `fill="none"` presentation attribute and silently turns an open letter into a solid disc. `e2e/favicon.spec.ts` counts enclosed holes in the rendered pixels rather than ink coverage, since a filled disc carries more ink than an open letter and a coverage-based guard would pass the broken mark.

`public/avatar/` is served at the domain root and no visitor navigates to it. It sits there because a profile host wants a file to upload rather than a URL to embed, and `public/resume.pdf` already sets that precedent.

Measured at e8d1d97 on 2026-08-22.

### The avatar answers to a host

`public/avatar/` carries six files: a naked light and dark pair and a streamline dark pair, each at 1024 and 2048px. Discord's own cropper renders a smaller source visibly soft at the sizes it displays an avatar.

- The dark ground is the site's own `--card` in dark, lifted one step from `--background`. The mark's near-black ink inverted was rejected, since a literal invert reads as flat black on a dark host's own chrome.
- The streamline variant is drawn from the hero's live `[data-shader-field]` canvas rather than the static `page-ground` copy. `page-ground` mounts with `animate: false` and draws exactly once, so a simulated pointer against it can never produce the accent-gradient reveal a real hover shows.
- Two sizes come from one CSS-pixel geometry captured at `deviceScaleFactor` 1 and 2 rather than from two capture widths. The field's spatial scale is driven by the canvas's CSS width alone, so widening the capture viewport would change the field's density along with the resolution.
- `scripts/lib/capture-field.ts` navigates to a real page first and injects the composed markup with `page.evaluate`. A page holding a large embedded image and never navigating crashes the screenshot protocol in this environment.
- The favicon and the home-screen icon are untouched by the avatar set.

## Gotchas

- A file guard keyed on ink coverage passes a broken mark. Count enclosed holes instead.
- A shared class carrying `fill` beats a `fill="none"` attribute, so never share one class across the stroked and filled parts of the drawing.
