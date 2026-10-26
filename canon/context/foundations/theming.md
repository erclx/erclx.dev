---
title: Theming
description: Light and dark through the class variant, the first-paint script, the theme toggle, the token layers, and the contrast ceilings
---

# Theming

## Overview

Owns how the page picks, switches, and paints light and dark. The `.dark` class on `documentElement` is the only switch, since shadcn keys dark off `@custom-variant dark` rather than a media query. An `is:inline` script in `src/layouts/base.astro` resolves `localStorage.theme` and `prefers-color-scheme` into that class before the body renders.

A module reacting to a theme change observes `class` on `documentElement` with a `MutationObserver`, and an inline script reads a resolved token with `getComputedStyle`. `canon/DESIGN.md` § Color states what each color role means.

## Layout

### `src/components/site/theme-toggle/`

Holds the one theme control, a plain Astro button whose inline script cycles light, dark, and system and reapplies the theme synchronously.

- All three icons render in the markup, and CSS shows the one matching `html[data-theme-mode]`
- `system` removes `localStorage.theme`, so the first-paint script falls back to the OS, and a `matchMedia` listener follows an OS flip
- The script binds with one `querySelector`, so the landing page moves the hero's toggle into the sticky bar rather than rendering a second
- A project route renders its own toggle inside the route bar, since no site bar mounts there

### `src/styles/`

Holds the token layers in `global.css`. `:root` declares the light palette in oklch, `.dark` redeclares the same names, and `@theme inline` maps each to the Tailwind color name a utility reads.

- A token absent from `.dark` keeps its light value, which keeps the `--light-*` group fixed under both themes
- `@theme inline` bakes a literal into the utility, so a step that varies by scope resolves through a `:root` property such as `--body-size`
- `.dark .figure-plate` points `--card`, `--muted-foreground`, and `--ring` at the light aliases, so a light-pinned surface follows one declaration
- `--accent` is warm rust and `--primary` is the operable role, so a mark offering position, such as the rail's active row, takes `--accent`
- `--card` stays pure white in the light theme, since the charts are drawn on white and a warmed plate would draw a seam around each

## Gotchas

- A shadcn component installed later reaches for `bg-accent` as a neutral hover and gets rust, so point it at `bg-secondary`
- A surface pinned light in the dark theme must rebind `--ring` too, since the dark ring measures about 2.3:1 on white against the 3:1 floor
- Nothing separates below `--muted-foreground`, at 4.82:1 light and 7.80:1 dark, so separate text layers by weight, size, or space
- A `--card` fill tops out near 1.10:1 on the page, and light separates by shadow while dark separates by edge, so a floating control needs both
- Read contrast off painted pixels, since `backdrop-filter` samples what sits behind a control and arithmetic over the tokens misses it
