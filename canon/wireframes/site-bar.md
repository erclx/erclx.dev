---
title: Site bar
description: Sticky top bar that the hero's name and theme toggle travel into as the reader scrolls, carrying the way back to the top at every viewport
---

# Site bar

Sits fixed at the top of the viewport on the landing page, hidden while the reader is still in the hero and revealed once they have passed half of it. Carries the name as a control returning to the top, and the theme toggle the hero hands over. A project route renders its own bar instead, which is the same column and the same two controls plus the route's name.

This is the surface that closes the navigation hole the rail could not. The rail is hidden below 1280px and states position rather than offering reach, so before this bar a reader below that width had no navigation at all.

## Regions

- Ground: the shape the bar draws, detached from the viewport edge, holding the same column as the hero. Both bars draw one shared ground rather than a copy per surface, so a reader crossing between the landing page and a route meets the same shape at the same height
- Home lockup: the mark and the name at the left of the row, one control rather than a mark beside one
- Route name: centred in the row, on a project route only
- Theme toggle: at the right of the row, the hero's own control once it has arrived
- On the landing page, revealed, at 768 and wider: the layout drawn below

```plaintext
┌─[viewport]──────────────────────────────────────────────────┐
│      ╭─[ground: elevated surface, blurred, detached]──╮     │
│      │  e▮ Eric Le                              [☾]   │     │  ← mark, name returns to top,
│      ╰──────────────────────────────────────────────╯       │    toggle arrived from hero
└─────────────────────────────────────────────────────────────┘
```

- On a project route: the same ground and column, with the route's name centred between the lockup and the toggle, drawn below

```plaintext
┌─[viewport]──────────────────────────────────────────────────┐
│      ╭─[same ground, same column]───────────────────╮       │
│      │  e▮ Eric Le       diction              [☾]   │       │  ← mark, way home, name returns to route top, toggle
│      ╰──────────────────────────────────────────────╯       │
└─────────────────────────────────────────────────────────────┘
```

## States

| State                 | Reached when                                                       | Shows                                                                                                 | Evidence       |
| --------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | -------------- |
| `over-hero`           | The reader is on the landing page and has not passed half the hero | No bar, and the toggle painted onto the hero's own row                                                | `not captured` |
| `revealed`            | The reader passes half the hero                                    | The bar with its ground at the full width with square corners, the name and the toggle arriving in it | `not captured` |
| `contracted`          | The reader scrolls on past the reveal                              | The ground contracted to a rounded shape, the row inside it unmoved                                   | `not captured` |
| `name-hovered`        | A pointer rests on the name, or the name takes keyboard focus      | The name underlined                                                                                   | `not captured` |
| `route-title-visible` | A reader is on a project route with its own title still on screen  | The route bar with no route name                                                                      | `not captured` |
| `route-title-passed`  | The route's title passes behind the bar                            | The route name faded in at the centre of the bar                                                      | `not captured` |
| `reduced-motion`      | The reader asks for reduced motion                                 | The name kept in the hero and the bar showing its own, with the toggle still moving                   | `not captured` |

### Over the hero

```plaintext
┌─[viewport]──────────────────────────────────────────────────┐
│                                                       [☾]   │  ← bar absent, toggle painted
│   I build AI agents and developer tools.                    │    onto the hero's own row
│                                                             │
│   Eric Le                                     (photo)       │
└─────────────────────────────────────────────────────────────┘
```

## Copy

- Home lockup name: `Eric Le`
- Route name: the route's own name, templated per route, so `diction` in the sketch is a placeholder
- Route name's accessible name: `Back to top of <route>`, templated

## Behavior

- The bar holds the same column as the hero on every surface, so the chrome never resizes as a reader moves between the landing page and a route. That also lands the name where it started horizontally, so the travel reads as vertical.
- The name is a control rather than a label. It returns the reader to the top, smoothly unless reduced motion is set. Hovering or focusing it underlines the name.
- The mark and the name are one control, not a mark beside one. Clicking either goes home, the control measures 79x44 on both bars, and the mark is hidden from assistive technology so the accessible name stays the name alone. A separate link on the mark was rejected as two adjacent controls on one destination.
- The mark sits inside that control and outside the name slot, which are different boxes. The slot is the target the flying name is measured against, so the marker stays on the name rather than moving up to the group.
- The bar switches on and its ground fades in under it. The name and the toggle arrive by riding the scroll and are fully opaque when they land, so a mark fading up beside them was a third timing on the row. The opacity stays on the bar rather than the row, because reduced motion gives the name slot its color back and an always-opaque bar would then show a second name through the whole hero.
- The bar is `inert` until it is revealed, so nothing inside it takes focus while it is off screen.
- The route name is absent while the route's own title is still on screen and fades in once that title passes behind the bar, so the two never state the same thing at once.
- A route's name is `inert` on its own clock, since it is withheld for the opening screen while the bar around it is already reachable. Opacity hides a control from the eye and from nothing else, so without this it was a tab stop and a 44px target across the whole opening screen while painting nothing.
- The route name sits at the centre of the bar's own box, which is what the diagram above has always drawn.
- The route row is three columns with equal outer ones rather than a spaced row, so the name centres whatever the two controls beside it weigh. A measured nudge was rejected: the offset is exactly half the difference between them, so it would encode today's two widths and go wrong the moment either moved.
- The route name is also the route's way back to its own top. Every other control on a route leaves it: the lockup here and the closing foot both target the landing page, and the rail's first row is the only one that returns to the top and is hidden below 1280, which is the band both of the screenshots that prompted this sit in.
- A route's own bar is the sticky one rather than a second bar above it, so a reader deep in a long route always has a way home without stacking two bars.
- The ground is the elevated surface token rather than the page background, since a ground drawn from the background left only the text inside to say a bar was there.
- The ground carries an edge and a shadow.
- The ground is lightly translucent over a wide blur. Prose passing under a lighter bar reads through it as letterforms, which a wider blur destroys while the backdrop still reads as a wash. Widening it further averages the dark gaps between project cards into the ground and darkens it under near-black text.
- The ground contracts on scroll and the row inside holds its position. Everything the hero flies into that row is placed at a measured position, so the shape is the one thing free to move.
- The ground eases between the two shapes on both surfaces, and the edge and the shadow arrive at once rather than fading with it. The landing bar switched in a single frame until 2026-08-25.
- See `canon/context/site-bar.md` § One ground for two bars, and the shape moves while the row does not for the measured values behind each of the ground's bullets.
- The name and the toggle are not duplicated between the hero and the bar. Both travel, and each is one element throughout.
- The name a reader sees while it travels is a third element, fixed and scaling from the hero's display size down to the bar's. The hero's own heading keeps its text for assistive technology and is painted transparent rather than hidden, so the page's only `h1` keeps its accessible name.
- The toggle is the hero's own control, re-parented into a fixed host. Exactly one exists per page. See `canon/context/theming.md`.
- Both ride the scroll rather than playing an animation over it, and each travels on its own measurements, so the toggle lands before the name. Syncing them would mean one moving at a rate the scroll does not.
- Reduced motion keeps the name in the hero and shows the bar's own, which is the same information with none of the travel. The toggle still moves, since its position has to stay continuous for the control to be reachable at every scroll.
- Placement waits for the stylesheet, and for the hero's arrival wherever that arrival is still coming, before it measures. It gives up waiting after three seconds. Measuring too early put the toggle 868px off its row in WebKit against the built page, and waiting on an arrival that could never come left the bar's slots empty for three seconds on any refresh landing below the hero. See `canon/context/site-bar.md` § A promoted control is measured against the settled page.

## Not on this surface

- No rule under the bar.
- No arrow beside the route name. The foot carries one on its own control, and the two are separated by a page height rather than by an ornament, so an arrow here would state a second time what the name already does.
- No second bar on a route. The route's own bar is the sticky one.
- No separate link on the mark.
- No second theme toggle. The hero's control travels into the bar.
