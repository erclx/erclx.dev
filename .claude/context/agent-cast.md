---
title: Agent cast
description: The blocky figures in the experience margins, their expression and motion vocabularies, and the instruments that guard them
---

# Agent cast

## Overview

A set of small figures scattered down both margins of the experience section, drawn from a cell grid rather than authored as files. The domain owns the drawing, the expression vocabulary, the motion vocabulary, and the placement. It owns nothing about the section it sits in beyond one mount and one `relative`.

It is decoration. Every figure is `aria-hidden`, carries no accessible name, and leads nowhere.

## Layout

- `src/components/site/experience/cast/` owns the whole domain: the generator, the two vocabularies, the shared stylesheet, and the placement component.
- `e2e/` owns the two instruments, `cast-motion.ts` and `cast-inventory.ts`, and the guards in `cast.spec.ts`.
- `.claude/review/cast/` holds the generated inventory and is gitignored.

## Decisions

- A member is a rounded body on two feet with a face, arms below the mouth line, and a hat. Members differ by a feature or by whether they stand, never by width: a narrowed body reads as the same member squeezed rather than as a second one.
- Two eyes on a block reads as a saucer. Either limbs or a mouth fixes it, and this family carries no limbs above the mouth line, so the mouth is what carries it. Apply that test to a figure nobody has drawn yet.
- Three roles carry meaning and the hat carries flavour. A lead takes the antenna, a worker takes any hat from the pool, and an idle is seated. That split is what lets the pool hold six hats without the cast reading as six species.
- The fill is `#d4a574` in both themes, which is the dog's tan and the airliner's, with the dog's own `#2a1d14` for the eye. All three figures on the site share one palette and none of them inverts. It measures 2.03:1 against the light page, under the 3:1 a graphic answers to, and that floor governs a meaningful graphic where these are decoration.
- Placement is by cluster rather than by member. A cluster anchors to the reading column's own edge and members sit at offsets from it, so a pair keeps its relationship to itself as the page resizes. Six members holding six page positions cannot express a pair at all.
- Motion is bound to expression through `TEMPERAMENTS`, so a placement cannot recombine them. Up and down belongs to pleasure, a tilt to disappointment, a jitter to frustration.
- Only one term runs unattended, and it is a scale rather than a travel, so there is no speed for the ambient band to apply to. Everything expressive fires under a pointer or a tap.
- A tap changes the member's mood as well as moving it. Both faces are rendered and one is hidden, rather than shipping the generator to the browser for a state a few members reach.
- Mirroring happens inside the drawing rather than as a CSS transform. The wrapper already carries arrival and the body carries a behavior, and a third transform silently overwrites one of them.
- The cast lives in the experience section rather than the projects section because that is the only one with margins to hold it. Measured at 1280, experience runs a 768px column leaving 141px clear on the left and 188px on the right, where projects runs 1024px and leaves 13px and 60px. A member at the smallest size the cast ships does not fit beside the projects grid on either side until 1920.
- The cast is desktop only, above 1280. Below it the clear margin measures 0px on both sides, and the alternative was placing figures inside a reading column that already runs 2067px at 390.

## Gotchas

- A behavior demonstrated on the wrong member animates nothing, and no rate check can see it because there is no rate to read. Each one declares the hat and the mood it needs. This shipped twice before the declaration existed.
- Speed measured off a bounding box scales with the target. Read the instrument at the smallest size the cast ships, since a comfortable size crosses the barred band faster for the same keyframes and reads laxer than the page it guards.
- A rotation moves a small part's bounding box far more slowly than its angle suggests. An antenna turning 11 degrees measures 6px per second.
- Keyframes written for ambient looping put their movement at the end of a long cycle. Reused as a reaction that pays out seconds after the click and reads as a dead control.
- A capture of an element taller than the viewport is stitched, and absolutely positioned children outside the first frame are dropped. That reads as the cast not rendering. Capture viewport frames instead.
- `omitBackground` clears the page canvas and not the background the page paints, so an element capture comes back fully opaque and any coverage check reports success for an empty box.

## Adding a behavior

1. Declare it in `behaviors.ts` with its kind, whether it travels, and the hat and mood it needs to demonstrate itself.
2. Write its keyframes in `motion.css`. A reaction puts its movement at the start of its own cycle and rests afterwards.
3. Run `bun e2e/cast-motion.ts` and copy the measured peak into the declaration. The figure is measured rather than intended.
4. Bind it to a mood in `TEMPERAMENTS`. A member never names a behavior directly.

Nothing is removed from either vocabulary. Both are inventories a placement draws from, and an unused entry costs a few bytes of a static build.
