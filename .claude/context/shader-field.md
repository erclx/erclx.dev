---
title: Shader field
description: The authored WebGL surface behind the hero and under the page, its mount lifecycle, and the reduced-motion still
---

# Shader field

## Overview

The page's visual signature. One fragment shader, authored here, drawn twice: strongly behind the hero band, and faintly under every page as a still ground. Lives at `src/components/site/header/shader-field/`.

It replaced a hand-built particle canvas on 2026-08-20. That canvas and its six files are gone rather than kept behind a flag, along with a dot-lattice arm built and judged beside this one.

## Layer responsibilities

- `mount.ts` owns everything a surface needs regardless of what it draws: canvas sizing, the pixel-ratio clamp, low-end detection, the render loop, theme re-reads, viewport and tab-visibility gating, the degrade path, pointer and click state, and cleanup
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

A click adds a wave packet at the same place: an oscillation held inside an envelope whose centre travels outward from where the click landed. At the moment of the click the envelope sits on the click and reads as the drop.

Adding it to the stream function rather than to the drawn output is the whole design. Contours are extracted after the term is added, so the field keeps evolving underneath the disturbance, the disturbance bends what it crosses rather than being painted over it, and it returns to nothing on its own. Three factors take it there and none of them restores anything: the envelope confines it to a band, so the field ahead of and behind the front is untouched, age fades the packet, and distance spreads its energy the way a widening ring loses height.

Four can be in flight. The count is fixed in the source because WebGL1 needs a constant loop bound, and the mount displaces the oldest, so a reader clicking repeatedly always gets an answer. An unused slot carries a negative age, which the shader reads through a masked term rather than a branch, since an empty slot has to cost what a full one costs for every fragment on the surface.

## Decisions

- Authored rather than installed. `.claude/DESIGN.md` § Personality rejects the shortcut rather than the medium, and states what separates the two.
- Reduced motion draws one frame and runs no loop, rather than hiding for an authored stand-in. One surface answers both preferences and neither can drift from the other. Measured at zero scheduled animation frames over 1500ms against 120 with motion allowed. The click disturbance inherits that for free: the still path attaches no pointer listener at all, so a click there is not suppressed so much as never heard. Verified byte identical after a click and 1.9s later.
- The inlined SVG fallback is reached where WebGL is missing, where the program fails to build, and where the context is lost. A band with nothing behind it reads as a broken page rather than a quiet one. A restore that rebuilds the renderer hides it again, so a context the browser drops and returns leaves no trace.
- The page ground runs the same field with `animate: false` and a lower alpha, rather than a second drawing. Nothing can drift because there is only one.
- The page ground is fixed rather than scrolling, so it costs one viewport of fill however long the page runs.

## Gotchas

- The field's alpha is a ceiling that coverage, relief, and height all multiply down, so a fraction of it is not a fraction of what a reader sees. At 0.4 the page ground peaked at 38 against the hero's 239 and read as nothing. It runs 0.85.
- The reading column the ground damps inside is a different width per surface. It reads `--prose-column` on a route and a fixed column on the landing page, so the strip and the prose are one width by construction rather than by a copied number.
- Astro scopes both halves of a descendant selector. A rule keyed on the surface class, which sits on `body`, matches nothing unless that half is `:global()`. The tell was a ground column holding 768 while the prose ran 672 to 832 beneath it.
- Fill rate governs the cost rather than processor speed. The degrade path drops resolution where a particle field would shed particles.
- The frame guard's floor is a fraction of the rate the throttle targets rather than a fixed count. A device reporting four cores or fewer is throttled to 30fps, so its frames measure 30fps by construction, and a constant floor of 45 marked every one of them a failure. That degraded the surface inside the first two-second window whatever the device could draw, and set the flag that stops all further sampling for the life of the page. The effect was invisible, because the low-end ceiling and the degraded ceiling are both a pixel ratio of 1, so nothing about the picture changed and only the guard was lost.
- Two instruments for judging the motion returned figures that moved with nothing. A mean absolute difference over a sparse field is dominated by its empty pixels, and a correlation over thin lines collapses as soon as they sit one pixel off each other. Neither settled anything the eye did not settle faster. A third joined them: counting contour lines along a strip to size the ripple came back at five and could not tell a depth of 0.5 from one of 0.36, because the strip averages across curved lines and smears them.
- A position written for this surface is flipped into the fragment's own space, whose origin is the bottom left where the document's is the top left. The cursor already carried that correction and the ripple shipped without it, which puts a wave at the click's mirror image about the horizontal midline. It reads as vertical inversion alone, because the other axis needs no correction, so a report of one axis being wrong is the signature of a missing flip rather than of a broken coordinate.
- The ripple's depth is not a taste value on its own. It decides how far the stream function is pushed and therefore how many contour levels one lobe crosses, so the ring count a reader sees is roughly that depth times `lineCount`. Read the two together before changing either.
- A disturbance retires where the field's own decay has taken it under a thousandth of its starting amplitude, and `mount.ts` computes that from `rippleDecay` rather than holding a duration of its own. The two live in different config objects, so a literal here goes wrong the moment the rate is tuned and nothing reports it. At the shipped rate the retirement lands at 8.13 seconds.
- A click anywhere in the document drops one, since the listener sits on the window. Off the hero it costs a term nobody sees, and the hero band is the whole first viewport, so a click on the portrait ripples as readily as one beside it. Only links and buttons are excluded.
- The page ground's `animate: false` means it draws exactly once at mount and never again, so a pointer simulated against it for a capture script cannot ever produce the accent-gradient reveal, however long the simulation waits. Only the hero's own canvas ticks a render loop and tracks the cursor live.
- The hero's `pointermove` listener attaches from an `IntersectionObserver` callback rather than synchronously on load, so a single synthetic move fired right after navigation can land before that listener exists and be lost outright. A capture script settles first, moves once off-target, then moves onto it, so at least one event reaches a listener that is actually attached.
- `uFieldScale = fieldCyclesAcross / canvas width` is driven by the canvas's CSS width alone, not by device pixels. Capturing the same CSS-pixel geometry at `deviceScaleFactor` 1 and 2 renders one composition at two physical resolutions. Widening the CSS capture viewport for a "2x" pass instead would change the field's density along with the resolution.

## Hidden contracts

- `data-shader-field` and `data-shader-field-fallback` are the hero's public contract, and `data-shader-content` is the box the field damps inside. The mount queries by these attributes.
- A `MutationObserver` on `documentElement`'s class re-reads the palette when the theme flips, so the surface swaps without a remount. Under the still path that observer also redraws, since nothing else would.
- The accent is the reserved rust token. A rust and amber switch shipped with the ported prototype and was never judged, and it was removed on 2026-08-20 with the arm that lost.
