---
title: Typography
description: Variable font loading, the preload split, and the type scale tokens
---

# Typography

## Overview

Owns how the three families reach the browser and how their sizes are named. Spans `src/layouts/base.astro` for loading and `src/styles/global.css` for the scale. Intended values live in `.claude/DESIGN.md` § Typography, which this entry does not restate.

## Layout

- `src/layouts/base.astro` owns the `?url` imports and the preload links in `<head>`
- `src/styles/global.css` owns the `@fontsource-variable` imports and the `@theme inline` scale

## Decisions

- All three families ship as variable fonts on a weight axis. One file per family covers every weight the page uses, so no separate 400 and 600 downloads exist to go out of sync.
- Fraunces and Inter are imported as `?url` in `base.astro` and referenced from `<link rel="preload">`. Vite resolves the specifier through `node_modules` and emits a hashed asset, so no manual copy into `public/` is needed and the hash changes when the package updates.
- Only Fraunces and Inter preload. Both render above the fold in the hero, where Fontsource's default `font-display: swap` would otherwise flash fallback text. JetBrains Mono is imported in `global.css` without a preload because code type appears below the fold, where the swap costs nothing visible.
- The scale is named by role rather than by size. `--text-display`, `--text-heading`, `--text-body`, `--text-label`, and `--text-code` each carry their own line height, and weight where it differs from the family default.
- `--font-heading` aliases `--font-display` rather than repeating the stack. A heading that should stop tracking the display family needs its own stack rather than an edit to the alias.
- `--text-display` is the only fluid step, set with `clamp()` against viewport width. Every other step is fixed, so the hero scales across breakpoints without a media query and the reading sizes stay stable.

## Adding a family

1. `bun add @fontsource-variable/<family>`
2. Add an `@import` beside the other three at the top of `global.css`
3. Add a `--font-<role>` entry inside `@theme inline` with the CSS family name and its fallback chain
4. Preload it in `base.astro` only when it renders above the fold, importing the axis file with `?url`

## Gotchas

- The CSS family name carries a `Variable` suffix (`'Fraunces Variable'`, not `'Fraunces'`). Dropping it silently falls through to the next stack entry rather than erroring.
- The preload `href` must come from the `?url` import rather than a hand-written path. A literal path into `node_modules` breaks once the package version changes its hash.
- A preload without `crossorigin` re-fetches the file instead of reusing the preloaded copy. Fonts fetch in CORS mode whatever the origin.
- Preloading a family that renders below the fold makes first paint slower rather than faster, since it competes with the two that do
