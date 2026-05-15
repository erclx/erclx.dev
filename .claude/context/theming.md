---
title: Theming
description: Dark mode wiring across the first-paint script, theme toggle, and CSS class variant
---

# Theming

How the page picks and switches between light and dark. Spans `src/layouts/base.astro`, `src/components/site/theme-toggle.astro`, and `src/styles/global.css`.

## Layer responsibilities

- `src/layouts/base.astro` owns the first-paint inline script. Reads `localStorage.theme` and `prefers-color-scheme`, applies `.dark` to `documentElement` before the body renders.
- `src/components/site/theme-toggle.astro` owns the in-page swap. Click toggles the class and writes the new value to `localStorage`.
- `src/styles/global.css` owns the token sets behind `@custom-variant dark (&:is(.dark *))`.

## Decisions

- shadcn keys dark off `@custom-variant dark (&:is(.dark *))`. `prefers-color-scheme` alone never switches the theme. The first-paint script bridges the system preference into the class.
- The toggle ships as static Astro with two inline SVGs that swap via `dark:hidden` and `hidden dark:block`. A React island under `client:load` or `client:only="react"` produced visible hydration flicker: the empty placeholder before JS replaced itself with the icon after JS, leaving a layout flash. For presentation-only toggles, the framework cost is not worth the layout shift.
- The first-paint script also writes `documentElement.dataset.js = 'true'`. Styles can key off `[data-js]` for progressive enhancement without flashing the no-JS state.
- The `localStorage` key is `theme`. Stored values are `light` or `dark`. The first-paint script treats anything else as "no preference, fall back to system".

## Hidden contracts

- `.dark` is the only theme class. Any future variant such as sepia or high-contrast needs both a new class and a new `@custom-variant` in `global.css`.
- Modules that react to theme changes observe the `class` attribute on `documentElement` via `MutationObserver`. The flow field uses this pattern in `flow-field/index.ts`.
- CSS reads tokens like `--foreground` and `--background` from the active variant. Inline scripts that need the resolved value must use `getComputedStyle(documentElement).getPropertyValue(...)`.

## Gotchas

- `prefers-color-scheme` alone never switches the theme. shadcn keys dark off a class, not a media query.
- The toggle script is `is:inline`, so it ships in the rendered HTML and has no module boundary. Extracting to a module would change the no-island contract.
