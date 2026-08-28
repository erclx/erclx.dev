---
title: Theming
description: Dark mode wiring across the first-paint script, theme toggle, and CSS class variant
---

# Theming

## Overview

How the page picks and switches between light and dark. Spans `src/layouts/base.astro`, `src/components/site/theme-toggle/theme-toggle.astro`, and `src/styles/global.css`.

## Layout

- `src/components/site/theme-toggle/` owns the control that writes the theme choice
- `src/styles/` owns the token layers both themes resolve through

## Layer responsibilities

- `src/layouts/base.astro` owns the first-paint inline script. Reads `localStorage.theme` and `prefers-color-scheme`, resolves the active mode, applies `.dark` to `documentElement`, and writes `documentElement.dataset.themeMode` before the body renders.
- `src/components/site/theme-toggle/theme-toggle.astro` owns the in-page swap as a plain Astro `<button>` with an inline `<script>`. All three Lucide icons (Sun, Moon, Monitor) render in the markup. CSS shows only the one matching `html[data-theme-mode='<mode>']`. Click cycles `light → dark → system → light` and reapplies the resolved theme synchronously.
- `src/styles/global.css` owns the token sets behind `@custom-variant dark (&:is(.dark *))`.

## Token layers

Color travels through three layers in `global.css`, and an edit at the wrong one either misses a theme or breaks the utility name.

- `:root` declares the light palette as bare custom properties in oklch, such as `--background` and `--primary-foreground`
- `.dark` redeclares the same property names with the dark values. A property declared in `:root` and missing here keeps its light value in dark mode rather than failing
- `@theme inline` maps each bare property to its Tailwind color name, such as `--color-background: var(--background)`. This is what makes `bg-background` resolve, and a new token needs an entry here or the utility does not exist

Values are authored in oklch rather than hex. The lightness channel is perceptually uniform, so a light and dark pair can hold the same chroma and hue while differing only in lightness. `.claude/DESIGN.md` § Color states these as intent and is the source for what a role means.

A fourth group sits above the light palette. `--light-card`, `--light-muted-foreground`, and `--light-ring` are declared in `:root` and deliberately never in `.dark`, so they hold one value under either theme. The light declarations point at them and so does `.dark .figure-plate`, which is what lets a surface pinned to the light palette follow an edit rather than hold a copy of it. Add one only for a token a pinned surface consumes, since a light alias no plate reads is a second name for a value that already has one.

## What the palette cannot do

Two ceilings bound every treatment built on these tokens, and neither is visible from a token name.

- Nothing separates below `--muted-foreground`. It measures 4.82:1 against the light page and 7.80:1 against the dark one, so a value stepped beneath it fails the 4.5:1 floor for text at any lightness visible enough to read as a second layer. A 65% mix of it measures 2.53:1 and shipped once before anyone read it. Separate two text layers by weight, size, or the space between them, and treat lightness as already spent.
- A fill drawn from `--card` tops out at 1.10:1. The token is pure white against a light page at `oklch(0.968)`, and a floating control reaches 1.09:1 in practice. Further separation comes from the edge or the shadow, and the themes disagree about which carries it: light gets its separation from the shadow while the edge barely registers at 1.06:1, and dark gets it from the edge at 1.19:1 while the shadow is invisible. A treatment answering one theme answers neither.

## Decisions

- shadcn keys dark off `@custom-variant dark (&:is(.dark *))`. `prefers-color-scheme` alone never switches the theme. The first-paint script bridges the system preference into the class.
- The toggle is a plain Astro component, not a React island. All three icons render in HTML and CSS swaps which is visible based on `data-theme-mode`. No hydration, no React runtime shipped for this page.
- The toggle uses a cycle pattern. Clicks rotate `light → dark → system → light`. The `system` state clears the `localStorage.theme` key so the first-paint script falls back to `prefers-color-scheme` on the next load. The other two states write the literal `light` or `dark` value.
- In `system` mode, a `matchMedia('(prefers-color-scheme: dark)')` listener re-applies the resolved theme whenever the OS preference flips while the page is open.
- The button uses the native browser `title="Cycle theme"` attribute as its hover tooltip. The matching `aria-label` carries the same string for screen readers. The shadcn `Tooltip` primitive was dropped along with the React island.
- The first-paint script also writes `documentElement.dataset.js = 'true'`. Styles can key off `[data-js]` for progressive enhancement without flashing the no-JS state.
- The `localStorage` key is `theme`. Valid stored values are `light`, `dark`, or `system`. The toggle removes the key when transitioning into `system` mode, so the literal `system` value normally never gets written. The first-paint script falls back to `system` for any missing or invalid value.
- A surface that has to stay light in the dark theme rebinds the tokens it consumes on a scoped class rather than pinning a color per element. `.dark .figure-plate` points `--card`, `--muted-foreground`, and `--ring` at the light aliases, so `bg-card`, `text-muted-foreground`, and the focus ring all follow one declaration and every utility in the markup stays as written. Custom properties inherit, so descendants take the light values with no rule of their own. `.claude/context/case-study-figures.md` covers the one surface using it.
- Rebinding `--ring` is the half a session skips. The dark ring at `oklch(0.7 0.15 264)` measures near 2.3:1 against white and fails the 3:1 that `410-a11y` sets, so any surface flipped light in the dark theme loses keyboard focus visibility until the ring moves with it. Read that as the cost of the technique rather than as a detail of the figure treatment, since it applies to the next such surface too.
- `--card` resolves to pure white in the light theme and is not warmed with the rest of the neutrals. The plate under a chart reads `bg-card` in both themes and the six charts are drawn on pure white, so a warmed card would draw a seam around every figure in the light theme. Warmth reaches that surface through the page canvas around it rather than through the plate itself.
- `--accent` carries the warm rust and no longer carries the subtle hover surface shadcn ships it as. The preset's value was referenced by no file, so repurposing the name beat declaring a second accent-shaped token beside a dead one. `--secondary` and `--muted` cover the subtle-surface role that vacated.
- `--primary` keeps the operable role and gives up the state role. The rail's active marker and the timeline's current node moved to `--accent`, since each offers position rather than an action. The rail label is a clickable anchor and still takes `--primary` for its focus ring, so one element carries a token from each role and what the mark offers decides which, not the element and not what raised it. The closing block's rows raise their accent border on hover and stay accent on the same reading, since the rows are read rather than operated.
- Two files read `--primary` after that move, `src/components/ui/button.tsx` and this stylesheet, and the component is the unreferenced one `.claude/ARCHITECTURE.md` records. No rendered surface reads it today. It stays because `--ring` carries the same value into every focus ring, and because the light value is pinned by an end-to-end test asserting the figure plate's ring clears 3:1 on white. Read a proposal to delete it against that test first.
- The eight `--sidebar-*` tokens are gone. No file read them, shadcn's sidebar component is not installed, and `--sidebar-accent` meaning a hover surface beside an `--accent` meaning brand rust would have documented the opposite of what the palette does.

## Hidden contracts

- `.dark` is the only theme class. Any future variant such as sepia or high-contrast needs both a new class and a new `@custom-variant` in `global.css`.
- A shadcn component added later reaches for `bg-accent` and `hover:bg-accent` expecting a near-neutral hover surface, and gets warm rust. Point those utilities at `bg-secondary` when installing one, since the token's meaning here is deliberate rather than a value nobody got around to moving.
- A token declared in `:root` that `.dark` also declares is theme-varying. One `.dark` leaves alone is theme-fixed, which the `--light-*` group relies on. Adding a `.dark` declaration for one of those silently unpins every surface reading it.
- Modules that react to theme changes observe the `class` attribute on `documentElement` via `MutationObserver`. The shader field uses this pattern in `shader-field/mount.ts`, where the observer also redraws under the still path, since nothing else would. See `.claude/context/shader-field.md`.
- CSS reads tokens like `--foreground` and `--background` from the active variant. Inline scripts that need the resolved value must use `getComputedStyle(documentElement).getPropertyValue(...)`.

## Exactly one toggle exists per page

The toggle script binds with a singular `querySelector`, which is correct because the page renders one toggle and only one. The landing page renders it in the hero, and the hero handoff re-parents that same element into a fixed host so one control answers in the hero and in the sticky bar. A project route renders its own inside the route bar, and no site bar mounts there.

Adding a second toggle to the markup does not produce two working controls. The script binds whichever comes first in the document and the other is inert, which is what happened when the bar first rendered one of its own: the hero's toggle went dead and reported the same mode on every click. The bar reserves an empty slot for the promoted control instead.

## Gotchas

- `prefers-color-scheme` alone never switches the theme. shadcn keys dark off a class, not a media query.
- The first-paint script in `base.astro` is `is:inline`, so it ships in the rendered HTML and has no module boundary. That keeps the dark class applied before any framework code runs.
