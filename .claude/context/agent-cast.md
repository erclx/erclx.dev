---
title: Agent cast
description: The blocky figures in the experience margins, their expression and motion vocabularies, and the instruments that guard them
---

# Agent cast

## Overview

A set of small figures scattered down both margins of the experience section, drawn from a cell grid rather than authored as files. The domain owns the drawing, the expression vocabulary, the motion vocabulary, and the placement. It owns nothing about the section it sits in beyond one mount and one `relative`.

It is decoration. Every figure is `aria-hidden`, carries no accessible name, and leads nowhere.

## Layout

- `src/components/site/experience/cast/` owns the whole domain: the generator, the four vocabularies, the shared stylesheet, and the placement component.
- `faces.ts` holds what a face does, `powers.ts` what a member emits, and `gear.ts` what it holds. A face is three slots inside the head, and the other two are slots around the body.
- `e2e/` owns the two instruments, `cast-motion.ts` and `cast-inventory.ts`, and the guards in `cast.spec.ts`.
- `.claude/review/cast/` holds the generated inventory and is gitignored.

## Decisions

- A power is a slot rather than another mark, and the reason is measured. A mark's box is 17.6px across on the smallest member and anchored to the head's top right corner, so nothing surrounding a body fits in it. An aura built there reads as a small comb beside the ear, which is what the lead shipped with.
- Gear is a slot rather than a hat. A hat is the only signal separating a lead from a worker, so loading it with a sword spends that signal on flavour. Gear says what a member is doing, which the section could not say before.
- The power is its own drawing stacked behind the member, not part of it. It needs its own clock, since an aura pulses while the body does something else and one SVG carrying both makes the two animations fight. Gear stays inside the member on the same test read the other way: it moves with the hand holding it, so it has no clock of its own to want.
- A power draws in `--cast-aura`, the body fill at 52%. In the body's own fill it merges with the silhouette and reads as anatomy: the flanking tongues became a second pair of ears and the standing shadow became a lump on the back. `shadow` alone takes `--cast-shade`, the eye's ink at 34%, because a silhouette lighter than the figure casting it is not a shadow.
- Gear held clear of the silhouette keeps the body fill. Gear crossing it takes a contrasting ink, since the keyboard sat across the chest in body ink and rendered as nothing at all.
- The power layer reaches 2 cells past the member on every side, and that figure belongs to the placement rather than to the drawing. A cluster reserves it twice, once as clearance from the reading column and once in its own width, so the footprint grows by twice the overhang. At 3 cells the 88px member's cluster ran 12.6px past the margin the rail and dock leave at 1280. Both reservations derive from `POWER_OVERHANG` rather than sitting as literals, so a reach that changes cannot leave a power painting over prose with the guard still passing.
- No two members share an eye or a mouth. That is the invariant behind the cast reading as seven characters, and it is what pairwise pixel difference could not see: four of the seven wore the same flat mouth while every pair still measured 8% to 12% apart.
- A member is a rounded body on two feet with a face, arms below the mouth line, and a hat. Members differ by a feature or by whether they stand, never by width: a narrowed body reads as the same member squeezed rather than as a second one.
- Two eyes on a block reads as a saucer. Either limbs or a mouth fixes it, and this family carries no limbs above the mouth line, so the mouth is what carries it. Apply that test to a figure nobody has drawn yet.
- Three roles carry meaning and the hat carries flavour. A lead takes the antenna, a worker takes any hat from the pool, and an idle is seated. That split is what lets the pool hold six hats without the cast reading as six species.
- The fill is `#d4a574` in both themes, which is the dog's tan and the airliner's, with the dog's own `#2a1d14` for the eye. All three figures on the site share one palette and none of them inverts. It measures 2.03:1 against the light page, under the 3:1 a graphic answers to, and that floor governs a meaningful graphic where these are decoration.
- Size is shared the same way the fill is. The seven members run 54 to 88px, and the airliner a section above draws inside that band at 78. `e2e/cast.spec.ts` holds it there, since the aircraft shares no code with a member and drifted to 50px, under every figure on the page, with nothing relating the two numbers. The 88 is the one member carrying horns, which lose their step below 96px, so it reads as the band's ceiling rather than as its centre.
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
- A mood added to `MOODS` without an entry in `TEMPERAMENTS` fails the build at render, since the placement reads `TEMPERAMENTS[mood].idle`. That is the loud failure. The quiet one is binding `emote` to a mood carrying no mark, which fires a reaction that animates nothing.
- Pairwise pixel difference between two faces saturates between 8% and 12% whatever the faces say, because a head is mostly body fill either way. It measures presence and not expression, so it reads the original problem and cannot be optimized against. Count members sharing a feature instead.
- An SVG the generator emits is inline, so it carries no namespace and resolves its inks from the page. Loaded as a standalone image in a harness it has neither and decodes to nothing, which a comparison then reads as two identical empty grids.
- A clearance measured by branching on which side of the column an element sits reports nonsense once the element overlaps. Take the signed larger of the two edge distances instead, which needs no branch. The branching form reported a 10px overlap as 890px.

## Adding a power or a piece of gear

1. Draw it in `powers.ts` or `gear.ts` on the 12 by 12 grid, stepped rather than tapered. A power may run from minus the reach to the grid plus it; gear is clipped to the member's own box.
2. Keep every stroke 0.7 cells or wider. One cell is 4.5px on a 54px member, so a thinner stroke lands under 3px and stops holding its shape.
3. Give a cell a contrasting ink where it crosses the body, and leave it in the default where it does not.
4. Judge it at the size it ships rather than at inventory scale. That is the mistake the whole power slot exists to correct.

## Adding a behavior

1. Declare it in `behaviors.ts` with its kind, whether it travels, and the hat and mood it needs to demonstrate itself.
2. Write its keyframes in `motion.css`. A reaction puts its movement at the start of its own cycle and rests afterwards.
3. Run `bun e2e/cast-motion.ts` and copy the measured peak into the declaration. The figure is measured rather than intended.
4. Bind it to a mood in `TEMPERAMENTS`. A member never names a behavior directly.

Nothing is removed from either vocabulary. Both are inventories a placement draws from, and an unused entry costs a few bytes of a static build.
