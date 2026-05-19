---
title: Theming
description: Dark mode wiring across the first-paint script, theme toggle, and CSS class variant
---

# Theming

How the page picks and switches between light and dark. Spans `src/layouts/base.astro`, `src/components/site/theme-toggle.tsx`, `src/components/ui/tooltip.tsx`, and `src/styles/global.css`.

## Layer responsibilities

- `src/layouts/base.astro` owns the first-paint inline script. Reads `localStorage.theme` and `prefers-color-scheme`, applies `.dark` to `documentElement` before the body renders.
- `src/components/site/theme-toggle.tsx` owns the in-page swap as a React island mounted via `client:only="react"`. Three states cycle on click: `light`, `dark`, `system`. The component renders a single Lucide icon (Sun, Moon, or Monitor) per mode and wraps the button in shadcn `Tooltip` so the next-state hint appears on hover instead of the native browser tooltip.
- `src/components/ui/tooltip.tsx` is the shadcn primitive built on Radix UI. The toggle is currently the only consumer.
- `src/styles/global.css` owns the token sets behind `@custom-variant dark (&:is(.dark *))`.

## Decisions

- shadcn keys dark off `@custom-variant dark (&:is(.dark *))`. `prefers-color-scheme` alone never switches the theme. The first-paint script bridges the system preference into the class.
- The toggle moved from static Astro to a React island so it can host shadcn `Tooltip` for the next-state hint. The `client:only="react"` directive skips SSR so the initial state reads `localStorage` and `documentElement.classList` directly, with no hydration mismatch.
- The toggle uses a cycle pattern. Clicks rotate `light → dark → system → light`. The `system` state clears the `localStorage.theme` key so the first-paint script falls back to `prefers-color-scheme` on the next load. The other two states write the literal `light` or `dark` value.
- In `system` mode, a `matchMedia('(prefers-color-scheme: dark)')` listener re-applies the resolved theme whenever the OS preference flips while the page is open.
- The tooltip label is the next-click target, e.g. `Theme: system. Click for light.` Replaces the prior native `title` attribute. No more browser-default tooltip.
- The first-paint script also writes `documentElement.dataset.js = 'true'`. Styles can key off `[data-js]` for progressive enhancement without flashing the no-JS state.
- The `localStorage` key is `theme`. Stored values are `light` or `dark`. The first-paint script treats anything else as "no preference, fall back to system".

## Hidden contracts

- `.dark` is the only theme class. Any future variant such as sepia or high-contrast needs both a new class and a new `@custom-variant` in `global.css`.
- Modules that react to theme changes observe the `class` attribute on `documentElement` via `MutationObserver`. The flow field uses this pattern in `flow-field/index.ts`.
- CSS reads tokens like `--foreground` and `--background` from the active variant. Inline scripts that need the resolved value must use `getComputedStyle(documentElement).getPropertyValue(...)`.

## Gotchas

- `prefers-color-scheme` alone never switches the theme. shadcn keys dark off a class, not a media query.
- The first-paint script in `base.astro` is `is:inline`, so it ships in the rendered HTML and has no module boundary. That keeps the dark class applied before any framework code runs.
