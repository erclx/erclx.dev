---
title: Typography
description: The three variable font families, the above-the-fold preload, and the role-named type scale
---

# Typography

## Overview

Owns how the three type families reach the browser and how their sizes are named. Fraunces sets display and headings, Inter sets body and labels, and JetBrains Mono sets code, each a variable font on one weight axis. `canon/DESIGN.md` § Typography holds the intended values.

The scale lives in `@theme inline` in `src/styles/global.css` and is named by role, from `--text-display` through `--text-code`. `--text-display` is the only fluid step, a `clamp()` on viewport width, and `--text-lede` sets the opening paragraph of each section and each route's deck.

## Layout

### `src/layouts/`

Holds the HTML shell, which preloads the two families that render above the fold. The first-paint theme script lives here too, and `canon/context/foundations/theming.md` covers it.

- Fraunces and Inter import with `?url` and feed `<link rel="preload">`, so Vite emits a hashed asset that tracks the package version
- JetBrains Mono imports in `global.css` with no preload, since code type renders below the fold
- A new family takes `bun add @fontsource-variable/<family>`, an `@import` in `global.css`, a `--font-<role>` in `@theme inline`, and a preload only above the fold
- `--font-heading` aliases `--font-display`, so a heading leaving the display family needs its own stack rather than an edit to the alias

## Gotchas

- The CSS family name carries a `Variable` suffix, as in `'Fraunces Variable'`, and dropping it falls through to the next stack entry silently
- A preload `href` must come from the `?url` import, since a literal path into `node_modules` breaks when the package changes its hash
- A font preload needs `crossorigin`, since fonts fetch in CORS mode and a preload without it fetches the file twice
- Preloading a family that renders below the fold slows first paint, since it competes with the two that render above it
