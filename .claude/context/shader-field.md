---
title: Shader field
description: The authored WebGL surface behind the hero and under the page, its mount lifecycle, and the reduced-motion still
---

# Shader field

## Overview

The page's visual signature. One fragment shader, authored here, drawn twice: strongly behind the hero band, and faintly under every page as a still ground. Lives at `src/components/site/header/shader-field/`.

It replaced a hand-built particle canvas on 2026-08-20. That canvas and its six files are gone rather than kept behind a flag, along with a dot-lattice arm built and judged beside this one.

## Layer responsibilities

- `mount.ts` owns everything a surface needs regardless of what it draws: canvas sizing, the pixel-ratio clamp, low-end detection, the render loop, theme re-reads, viewport and tab-visibility gating, the degrade path, and cleanup
- `field.ts` owns the contract between the two. A field supplies a fragment shader, its uniform names, and a function writing them from the frame the mount hands it
- `fields/prelude.ts` owns the GLSL every field shares: the precision block, 2D and 3D gradient noise, and the reading-column falloff
- `fields/streams.ts` owns the one field that ships, its shader source and its tuning constants
- `index.ts` mounts it behind the hero
- `page-ground.astro` mounts the same field again, still, under the whole page

Splitting the mount from the field is what makes a second look cost a shader rather than a second lifecycle. It was one file until a second arm needed building.

## What it draws

Contours of a stream function, which is what a streamline is. The field is 3D gradient noise where the third axis is time, so the surface changes where it stands rather than being carried past the viewport. A drift vector is what reads as a current running one way, and this surface carries none.

The gradient the shader computes to hold the lines at an even width is also the surface normal of the field read as a height map, so lighting it costs no extra sampling. Height read off the field itself tints low ground back where the lighting runs edge-on and states nothing.

The pointer raises a bump in the stream function, so contours bend around it the way a flow bends around an obstacle. A vortex arm and a lens arm were built against that and removed with their uniforms.

## Decisions

- Authored rather than installed. `.claude/DESIGN.md` § Personality rejects the shortcut rather than the medium, and states what separates the two.
- Reduced motion draws one frame and runs no loop, rather than hiding for an authored stand-in. One surface answers both preferences and neither can drift from the other. Measured at zero scheduled animation frames over 1500ms against 120 with motion allowed.
- The inlined SVG fallback is reached only where WebGL is missing or its context is lost. A band with nothing behind it reads as a broken page rather than a quiet one.
- The page ground runs the same field with `animate: false` and a lower alpha, rather than a second drawing. Nothing can drift because there is only one.
- The page ground is fixed rather than scrolling, so it costs one viewport of fill however long the page runs.

## Gotchas

- The field's alpha is a ceiling that coverage, relief, and height all multiply down, so a fraction of it is not a fraction of what a reader sees. At 0.4 the page ground peaked at 38 against the hero's 239 and read as nothing. It runs 0.85.
- The reading column the ground damps inside is a different width per surface. It reads `--prose-column` on a route and a fixed column on the landing page, so the strip and the prose are one width by construction rather than by a copied number.
- Astro scopes both halves of a descendant selector. A rule keyed on the surface class, which sits on `body`, matches nothing unless that half is `:global()`. The tell was a ground column holding 768 while the prose ran 672 to 832 beneath it.
- Fill rate governs the cost rather than processor speed. The degrade path drops resolution where a particle field would shed particles.
- Two instruments for judging the motion returned figures that moved with nothing. A mean absolute difference over a sparse field is dominated by its empty pixels, and a correlation over thin lines collapses as soon as they sit one pixel off each other. Neither settled anything the eye did not settle faster.

## Hidden contracts

- `data-shader-field` and `data-shader-field-fallback` are the hero's public contract, and `data-shader-content` is the box the field damps inside. The mount queries by these attributes.
- A `MutationObserver` on `documentElement`'s class re-reads the palette when the theme flips, so the surface swaps without a remount. Under the still path that observer also redraws, since nothing else would.
- The accent is the reserved rust token. A rust and amber switch shipped with the ported prototype and was never judged, and it was removed on 2026-08-20 with the arm that lost.
