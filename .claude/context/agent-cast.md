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
- `pets.ts` is a second family rather than a fourth slot. A pet belongs to a cluster, not to a member.
- `e2e/` owns the two instruments, `cast-motion.ts` and `cast-inventory.ts`, and the guards, split across `cast.spec.ts` and `cast-scheduler.spec.ts` with shared helpers in `cast-helpers.ts`. The split is a CI-timing concern, covered in `.claude/context/ci.md`, and carries no meaning about the drawing.
- `placement.ts` holds where every figure stands, separately from the component, so a guard can read it without rendering the page. The defects this domain has shipped live inside a cluster's own box, which the margin check cannot see.
- `cast.test.ts` holds every guard that is a fact about the drawing or the placement rather than about the rendered page. Cell bounds, stroke floors, overlapping eyes, stepped figures breaking apart, repeated face features, and figures overlapping inside a cluster all run without a browser.
- `.canon/review/cast/` holds the generated inventory and is gitignored.

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
- A member answers a hover and a tap with different terms, and the tap carries the larger one. Sharing the dominant term makes the second read as the first repeating rather than as an answer to being pressed, since the reaction restarts on click: measured at 1767ms into a hover, a click put it back to 50ms. Four members carried the same set on both, two of them identically, and none does now.
- A mark is given to a member rather than carried by every mood. Every mood declares one, so binding a mood used to hand its mark to whatever figure took it: seven of seven emitted on a tap and five of seven standing still, which reads as one gesture repeated rather than as seven characters. Three are drawn now, on three members, in one state each.
- A mark earns its place when it says what the face cannot. Closed eyes alone could be a member that is content, so `zzz` is what makes one asleep, and the tap takes it away rather than replacing it, which is what waking up looks like. Wide eyes over a bared mouth already say startled, so a mark beside them states the same thing twice.
- `emote` is derived from whether the mark is drawn rather than kept in step by hand. Binding it to a member drawing none fires a reaction that animates nothing, and that failure is silent where a mood with no temperament stops the build.
- The aura travels with the figure on the terms that take the figure somewhere, and ignores the terms that move a part inside it. A member reaching 11.9px on a jump against the 9px the aura extends leaves its own light entirely, and an aura dragged around for an ear flick makes the margin restless. `power` is the one whole-body term excluded, since a scale keeps the figure centred and a second thing swelling beside it reads as the margin pumping.
- One member acts on its own every few seconds and never two at once. The band bars sustained motion with no fixed reference, and every term here is a reaction crossing it in a fraction of its cycle, so what the scheduler changes is who pulls a trigger rather than what a trigger runs. It writes the same `data-reacting` a tap writes and the same `animationend` clears it, which is why no keyframe and no selector moved for it.
- The scheduler stands down while the section is off screen, under reduced motion, and while a pointer sits on a member. All three are read off the page rather than tracked, so nothing can disagree with them. Measured over 45 seconds on screen: 7 acts, never more than one at once, the busiest member moving 6.8% of the window and the cast moving at all 18.1%.
- A power is what a member is rather than an event it emits, and one drawing serves both states. Swapping flames for bolts on a tap read as the figure becoming somebody else for a second, so the slot holding a second drawing is gone along with its markup and its three rules.
- A pet is its own drawing rather than a small member, because members differ by a feature and never by width: shrinking one reads as the same member squeezed. Four feet under a low body, ears and a tail, and no arms is what makes it a different creature.
- A pet answers no pointer, carries no mood, no power and no reaction. One that answers is a member with fewer legs.
- A pet is placed below its member rather than beside it, so a cluster's width and its headroom against the rail or the dock do not move.
- A pair is offset down as well as across, and the vertical figure carries it. Separating across is not available: measured at 1280 the left cluster holds 2px of headroom before it meets the rail, so any `dx` clearing the bodies puts the cluster into it.
- A tap escalates a face rather than replacing it. The lead swapped a level gaze for an angled brow and a broad smile for a plain open box, which reads as dismay; the worker widened his eyes and his mouth at once, which reads as startled; and the crowned member's tap moved him back into the register he had just been moved out of. What carries a tap is one feature changing while the rest holds, which is why the crowned member's mouth stays open through both of his faces.
- Which way a pair runs carries the meaning. Wide eyes settling to points reads as a figure gathering itself and points widening reads as one being startled, so the crowned member rests wide and narrows under a tap rather than the reverse.
- The lead is the second heaviest figure in the section rather than the first, at 3396px² of paint against the horned member's 4012px². A face is a few hundred pixels inside a silhouette, so no expression makes a figure read as the lead while another outweighs it. Three passes on his face moved nothing until that was measured.
- A power travels with the member on every term the body takes. Its own drawing carries the `bn` class, which is what every whole-body rule already selects, so the two share one transform without anything wiring them together. Measured through a jump, a sway and a slump, the body and the power report the same offset at every frame.
- Read that before proposing to sync them. This entry claimed the opposite until 2026-08-24, and a session took the claim at face value, diagnosed a disconnect that did not exist, and served four candidate treatments for it. What made the wrong reading survive its own check is that a query for `.bn` finds the power's drawing first in document order, so one element gets measured under two names and reports perfect agreement with itself.
- A cell meeting the silhouette still runs 3 cells under the body. The overlap costs nothing and covers a term that displaces the body without the power, which nothing does today and which a future one could.
- That overlap runs inward only. A bar long enough to cross the whole body emerges from the far side, and a member with lines out of both sides reads as caged rather than as moving, which is worse than the gap it closed.
- A tap changes the member's mood as well as moving it. Both faces are rendered and one is hidden, rather than shipping the generator to the browser for a state a few members reach.
- Mirroring happens inside the drawing rather than as a CSS transform. The wrapper already carries arrival and the body carries a behavior, and a third transform silently overwrites one of them.
- The cast lives in the experience section rather than the projects section because that is the only one with margins to hold it. Measured at 1280, experience runs a 768px column leaving 141px clear on the left and 188px on the right, where projects runs 1024px and leaves 13px and 60px. A member at the smallest size the cast ships does not fit beside the projects grid on either side until 1920.
- The cast is desktop only, above 1280. Below it the clear margin measures 0px on both sides, and the alternative was placing figures inside a reading column that already runs 2067px at 390.

## Gotchas

- A guard that filters a list to its offenders and asserts the result is empty passes hardest when the list itself is empty. `cast.test.ts` opens by asserting every vocabulary it reads carries a population.
- A rate is a distance over a target's own box, and a pseudo-element has none. The aura is painted by one, so the moment it took the traveling terms both motion readers found five behaviors moving 0.0px/s and reported them as sluggish. Each skips a pseudo-element now, since the drawing carries the movement and is measured already.
- A settle that waits a fixed span is a guess at how much lead an engine needs. The arrival scales every member from 0.7, and on webkit under the full suite the largest read 61.6px against the 72 it settles at while passing alone. `settleCast` polls until no `cast-spawn` runs.
- A query for `.bn` inside a member finds the power's drawing before the body's, and a tap hides the resting face, so a read of `.cast-face:not(.is-tapped)` returns an element that never animates. Both mistakes report the figure as still while it moves, and both were made in one session.
- A behavior demonstrated on the wrong member animates nothing, and no rate check can see it because there is no rate to read. Each one declares the hat and the mood it needs. This shipped twice before the declaration existed.
- Speed measured off a bounding box scales with the target. Read the instrument at the smallest size the cast ships, since a comfortable size crosses the barred band faster for the same keyframes and reads laxer than the page it guards.
- A rotation moves a small part's bounding box far more slowly than its angle suggests. An antenna turning 11 degrees measures 6px per second.
- Every `dx` and `dy` in the placement was chosen when a member was its own box. A power layer reaches a sixth of the member past that box, so adding one moved both pairs into each other and nothing reported it: their bodies overlapped 16px and 12px and each pair read as one shape. A cluster guard reading the cluster's own box cannot see this, since the overlap is inside it.
- A pet answers a pointer with one gesture and the swap between its two faces. It stood still beside six members that move and read as scenery, which is worse than the risk of it reading as a member. What keeps it a pet is the size of what it does rather than whether it does anything: no mood system, no power, a single term.
- One bold feature each, and that is the whole rule for a pet. A bird needs a beak, a wing and a tail to read as one, and three features inside twelve cells at 3.7px each come out as one shape with a slot in it. It was drawn twice and cut. Its first draft also wore a crest, which read as the antenna marking the lead.
- Two creatures may not carry the same kind of feature. A bulb on the back and a shell on the back both read as a mass behind the head, so they were one silhouette drawn twice however different the masses were. The three that ship differ by where the weight sits: a quadruped with none, an up-swept tail, and a pair of tall ears.
- A creature defined by more than one appendage does not fit this grid. A winged dragon was drawn six times and cut, each draft failing differently: a one-sided fan read as the tail above, flat wings and a short snout read as a bird, a square head on a square body read as a totem pole, fourteen shapes answering that came out as a tangle, stripping back left the body a plain rectangle, and a taper with a rising tail merged into a slab.
- Detail is not the cure for a shape that does not read, and two shapes at the same height on the same side become one shape. Twelve cells hold a body, a head and one feature, which is why every creature that ships is compact and its silhouette is a single idea.
- A feature butting against the body in the same ink merges with it. The bushy tail drawn level with the body read as one rectangle with ears, and it sweeps up above the body's top edge instead. A gap small enough to fit the grid is 2px at ship size and reads as nothing, which is the same merge the power layer hit for the same reason.
- A scheduled act that starts no animation is never ended by one, and it costs more than the same trap on the tap path: a member left marked holds the scheduler's one slot for the life of the page and the cast goes quiet with nothing saying why.
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
