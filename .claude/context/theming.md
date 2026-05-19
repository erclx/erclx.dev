---
title: Theming
description: Dark mode wiring across the first-paint script, theme toggle, and CSS class variant
---

# Theming

How the page picks and switches between light and dark. Spans `src/layouts/base.astro`, `src/components/site/theme-toggle/theme-toggle.astro`, and `src/styles/global.css`.

## Layer responsibilities

- `src/layouts/base.astro` owns the first-paint inline script. Reads `localStorage.theme` and `prefers-color-scheme`, resolves the active mode, applies `.dark` to `documentElement`, and writes `documentElement.dataset.themeMode` before the body renders.
- `src/components/site/theme-toggle/theme-toggle.astro` owns the in-page swap as a plain Astro `<button>` with an inline `<script>`. All three Lucide icons (Sun, Moon, Monitor) render in the markup. CSS shows only the one matching `html[data-theme-mode='<mode>']`. Click cycles `light → dark → system → light` and reapplies the resolved theme synchronously.
- `src/styles/global.css` owns the token sets behind `@custom-variant dark (&:is(.dark *))`.

## Decisions

- shadcn keys dark off `@custom-variant dark (&:is(.dark *))`. `prefers-color-scheme` alone never switches the theme. The first-paint script bridges the system preference into the class.
- The toggle is a plain Astro component, not a React island. All three icons render in HTML and CSS swaps which is visible based on `data-theme-mode`. No hydration, no React runtime shipped for this page.
- The toggle uses a cycle pattern. Clicks rotate `light → dark → system → light`. The `system` state clears the `localStorage.theme` key so the first-paint script falls back to `prefers-color-scheme` on the next load. The other two states write the literal `light` or `dark` value.
- In `system` mode, a `matchMedia('(prefers-color-scheme: dark)')` listener re-applies the resolved theme whenever the OS preference flips while the page is open.
- The button uses the native browser `title="Cycle theme"` attribute as its hover tooltip. The matching `aria-label` carries the same string for screen readers. The shadcn `Tooltip` primitive was dropped along with the React island.
- The first-paint script also writes `documentElement.dataset.js = 'true'`. Styles can key off `[data-js]` for progressive enhancement without flashing the no-JS state.
- The `localStorage` key is `theme`. Stored values are `light` or `dark`. The first-paint script treats anything else (including the literal `system`) as "no explicit preference, fall back to system" and the toggle script removes the key when transitioning into `system` mode.

## Hidden contracts

- `.dark` is the only theme class. Any future variant such as sepia or high-contrast needs both a new class and a new `@custom-variant` in `global.css`.
- Modules that react to theme changes observe the `class` attribute on `documentElement` via `MutationObserver`. The flow field uses this pattern in `flow-field/index.ts`.
- CSS reads tokens like `--foreground` and `--background` from the active variant. Inline scripts that need the resolved value must use `getComputedStyle(documentElement).getPropertyValue(...)`.

## Gotchas

- `prefers-color-scheme` alone never switches the theme. shadcn keys dark off a class, not a media query.
- The first-paint script in `base.astro` is `is:inline`, so it ships in the rendered HTML and has no module boundary. That keeps the dark class applied before any framework code runs.
