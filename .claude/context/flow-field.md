---
title: Flow field
description: Hand-rolled particle canvas behind the header with cursor force and reduced-motion fallback
---

# Flow field

The animated signature behind the header. Lives at `src/components/site/header/flow-field/` and renders into a `<canvas data-flow-field>` placed by `header.astro`.

## Layer responsibilities

- `index.ts` owns mount and lifecycle: canvas sizing, DPR clamp, low-end detection, rAF loop, theme observation, visibility handling, cleanup
- `config.ts` owns tuning constants. Every magic number lives here, not in the loop
- `noise.ts` owns the simplex 2D noise generator
- `particle.ts` owns the struct-of-arrays Float32 pool and the per-frame step
- `render.ts` owns the canvas draw
- `header.astro` owns the DOM: a `<canvas data-flow-field>` plus a sibling fallback `<div data-flow-field-fallback>` with inline SVG

## Decisions

- Hand-built canvas over a shader library. Animated mesh gradients have become a templated AI-era look by 2026. The hand-built field is the page's craft signal.
- Net new dependency budget is `rough-notation` only at ~9kb gz, used elsewhere for the H1 underline. The flow field itself ships zero third-party physics deps.
- Particles store as parallel Float32 arrays, not an array of objects. The pool sizes once on mount and never reallocates.
- Cursor force applies within `config.cursorRadius`. Strength caps at `config.cursorStrength`.
- Low-end devices, defined as `navigator.hardwareConcurrency` at or below `config.lowEndConcurrency`, halve the particle count and cap to `config.lowEndFps`.
- Mount waits for the canvas to enter the viewport via `IntersectionObserver`. The rAF loop never starts on a page where the header is scrolled out of view.
- Tab visibility pauses the loop. The `visibilitychange` listener stops on hidden and resumes on visible.

## Visual budget

- ~200 active particles at baseline. Half that on low-end devices.
- Stroke color tracks `--foreground` at `config.baseAlpha` of 0.2 so the field reads quietly on either theme.
- Reduced-motion fallback is a hand-authored SVG snapshot at 0.08 alpha. The active canvas hides via `motion-reduce:hidden` and the fallback shows via `motion-reduce:block`.

## Hidden contracts

- The canvas reads `--foreground` from `documentElement` on mount. A `MutationObserver` watching the `class` attribute re-reads it when `.dark` flips, so the palette swaps without a remount.
- DPR clamps to a maximum of 2. Retina screens render at 2x to keep the fill rate bounded.
- The fallback SVG renders when `prefers-reduced-motion: reduce` matches. Tailwind switches via `motion-reduce:hidden` on the canvas and `motion-reduce:block` on the fallback.
- `data-flow-field` and `data-flow-field-fallback` are the public contract. Mount queries by these attributes, not by class or id.
- The fallback SVG imports via `?raw` and renders with `set:html`. Build emits it inline, so reduced-motion users see the field on first paint with no network round trip.

## Gotchas

- Per-frame perf samples over `config.perfWindowMs`. If observed fps drops below `config.perfFloorFps`, the pool sheds particles via `degrade()` and stops sampling.
- `targetFrameMs` only throttles subsequent frames. The first frame after mount always renders at whatever the browser schedules.
