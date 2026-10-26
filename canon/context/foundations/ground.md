---
title: Ground
description: The authored WebGL contour field behind the hero, its still copy under every page, the reading-column damp, and the traps in reading its pixels
---

# Ground

## Overview

Owns the authored WebGL field behind the hero and its still copy under every page. One fragment shader draws contours of a stream function built from 3D gradient noise with time as the third axis. The page ground runs that same field with `animate: false` at a lower alpha, so the two cannot drift.

The pointer raises a bump in the stream function, a click adds a decaying wave packet, and a mound centred on the header portrait closes the contours into rings. Under reduced motion the hero draws one frame with no loop and no pointer listener, and an inlined SVG stands in where WebGL is missing, fails, or is lost.

## Layout

### `src/components/site/header/shader-field/`

Holds the hero's surface, split so a new look costs a shader rather than a second lifecycle. `mount.ts` owns sizing, the render loop, gating, the degrade path, and pointer and click state, and a field under `fields/` supplies a shader and its uniforms.

- `fields/streams.ts` is the one field that ships, and `fields/prelude.ts` holds the noise and the reading-column falloff every field shares
- `data-shader-field`, `data-shader-field-fallback`, and `data-shader-content` are the hero's contract, and the mount queries by them
- A device reporting four cores or fewer runs at 30fps, so the frame guard's floor is a fraction of the target rate rather than a fixed count
- Four click packets fly at once, since WebGL1 needs a constant loop bound, and each retires once `rippleDecay` takes it under a thousandth
- `premultipliedAlpha: true` and `blendFuncSeparate(SRC_ALPHA, ONE_MINUS_SRC_ALPHA, ONE, ONE_MINUS_SRC_ALPHA)` are one pair, and neither is correct alone

### `src/components/site/page-ground/`

Holds the still layer `src/layouts/base.astro` mounts under every page, fixed to the viewport so it costs one viewport of fill however long the page runs.

- The field damps inside the reading column, which reads `--prose-column` on a route and a fixed column on the landing page
- The damping fraction runs from 0.40 at 1920 to 0.10 at 390 on viewport width, since the column's share of the viewport pins at 1.0 below 768
- The damping column is positioned rather than in flow, since a second full-height child stacks under the canvas and damps nothing

## Gotchas

- The field's alpha is a ceiling that coverage, relief, and height multiply down, so at 0.4 the ground read as nothing, and it runs 0.85
- Astro scopes both halves of a descendant selector, and the surface class sits on `body`, so a rule keyed on it needs `:global()` on that half
- A position written for the shader flips into fragment space, whose origin is bottom left, so one axis reading wrong signals a missing flip
- Headless WebKit composites the page without the canvas, so a WebKit capture measures the CSS layer alone
- A pointer or pixel reading needs motion allowed and `preserveDrawingBuffer` set before the mount, since the still path draws once with no listener
