---
title: Experience
description: The claim, the paragraphs elaborating it, and the career timeline that carries them into the projects section
---

# Experience

Appears between the about surface and the projects section. Opens on the claim and the two paragraphs that elaborate it, then renders the career story as a single commit rail rather than as a list beside a diagram.

Renamed from `Origin` on 2026-08-17, because the section holds two degrees and a job rather than where the person is from. Origin in the ordinary sense is what the about surface now carries.

A display heading opens it, matching the about, projects, and looking-for headings so a reader scanning for a section finds all four at the same weight. The claim sits under the heading at display size, the elaboration follows in body prose, then a row of employer marks, and below them a vertical rail runs down the gutter with one dot per beat sitting on it. The newest beat carries a row of chips naming the artifacts it produced.

## Desktop (≥768px)

```plaintext
Experience
  ← display heading, same weight as Projects

I build the layer between a language model and the job it has to do.
  ← the claim, display face, one phrase carrying an annotation underline

In practice that means agents, the developer tooling around them,
  and the full-stack work of making either usable by someone else...
  I came to it from engineering physics and complex adaptive
  systems at Chalmers.
I spend most of my working day with coding agents...
  ← two body paragraphs, muted, the first closing on the degrees

Where that happened
  ← label-size eyebrow, muted

( ⬤ VOLVO )    ( BAC HA )    ( CHALMERS )
  ← employer marks, one tone, sized so each reads rather than matching heights

 jan 2026 to        ●  shipping independently, open to the next thing
 present            │     ( canon ) ( Jobtriage ) ( Stackr ) ( Caret ) ( diction )
                    │
 jun to dec 2025    ○  working out what to build
                    │     Took the time to learn TypeScript and web application
                    │     development, and to work out where to point AI next.
                    │
 jan 2024 to        ○  volvo technology, gothenburg
 jun 2025           │     The job was an agent that let engineering teams plot
                    │     and query truck data by asking in plain language.
                    │     It started as my master's thesis and became a
                    │     multi-step SQL pipeline with session memory.
                    │
 jun to aug 2023    ○  internship at bac ha software, hanoi
                    │     ...
                    │
 sep 2022 to        ○  msc in complex adaptive systems, chalmers
 jun 2024           │     How simple agents and their environment produce
                    │     behavior nobody designed.
                    │
 sep 2019 to        ○  bsc in engineering physics, chalmers
 jun 2022           ┊     Where the modelling habits came from, before any of
                    ┊     this was software.
                          ← rail fades out below the oldest dot

 ↑ spans in their own column, tabular numerals
```

The list opened on `Newest first.` in Fraunces italic at label size until 2026-08-20. It was there because the spans sat inside the head sentences, separated by a middle dot, so the ordering was not visible without reading each row. The spans now hold a column of their own and a reader meets jan 2026 against jun to dec 2025 against jan 2024 down one edge, so the list states its own order and the line restated what was already on screen.

## Tablet (600 to 767px)

The same three parts, with the span column narrowed and the span itself set at label size. This width was the flat stack below until 2026-08-22, and it carried no wireframe at all, which is what let the rail disappear across the whole band with nothing describing what a reader was meant to see.

```plaintext
 jan 2026        ●  shipping independently, open to the
 to present      │  next thing
                 │    ( canon ) ( Jobtriage ) ( Stackr ) ( Caret )
                 │
 jun to dec 2025 ○  working out what to build
                 │    Took the time to learn TypeScript and web
                 │    application development, and to work out where
                 │    to point AI next.
```

## Phone (below 600px)

The span column folds into the reading column and leads its own beat, still at label size. The rail moves to the section's left edge and runs the full height of each beat rather than sitting between two columns, so the beats still read as a sequence at a width that has no room for a column beside them.

```plaintext
 ● jan 2026 to present
 │ shipping independently, open to
 │ the next thing
 │   ( canon ) ( Jobtriage )
 │   ( Stackr ) ( Caret ) ( diction )
 │
 ○ jun to dec 2025
 │ working out what to build
 │   Took the time to learn
 │   TypeScript and web application
 │   development, and to work out
 │   where to point AI next.
```

## Behavior

- The section runs at the page measure, which every section holds below the widest breakpoint. The projects grid and the footer break out past it at that breakpoint and nothing else does. Nothing sits outside this column: a figure hanging into the margin left the text centered while the section read as offset, which is why the earlier diagram beside the list is gone.
- The rail starts at the newest dot and fades to nothing under the oldest one, so the record reads as continuing behind the first entry rather than stopping at a dot.
- Each row is a span in its own column, a dot in the gutter beside it, and a head with a supporting sentence under it. The dot aligns to the head rather than to the block. The spans set in tabular numerals so the column holds one edge down the list.
- On a phone the span leads the beat instead of holding a column, and the dot aligns to the span, since that is the first line of the beat there. The dot meets whichever line leads at a given width rather than one fixed part of the row.
- Nothing on this surface takes the monospace face. The heads carried it until 2026-08-17, which made them the largest text in the section and the reason it read louder than its neighbors. Mono now marks literal machine values alone, and no value on this surface is one.
- Every dot sits exactly on its own row, which a fixed figure could never do once rows started running to different heights.
- A span carries months rather than a year alone, because a year read as twelve months of work where the record held six. The newest beat holds `jan 2026 to present` for the same reason: a bare `2026` said less than every row under it on a list whose spans carry months.
- A head names the employer and its city, and states no duration. The span column beside it already carries the length, so a head restating it puts the same fact on one row twice. Both job beats led on a duration until 2026-08-20 and both gave it up together, which is what keeps them reading as a pair.
- The two job beats name a city and the two degree beats name the university. What a beat leads on is what a reader scanning the column compares, so a beat that drops the pattern reads as a different kind of row rather than as a shorter one.
- The prose above carries the schooling, and the timeline carries the dates for it. The paragraph closes on the two degrees rather than opening on them, because the section leads on what gets built.
- One row is highlighted at a time as the "current state" anchor. The first row is highlighted by default. Hovering another row transfers the highlight to it. On leaving the list the highlight walks back row by row to the first row.
- The walk lingers on the row the reader chose and gathers pace as it returns, because what it shows is a row being let go of rather than another being traveled to.
- The highlighted dot fills with the warm accent and carries a soft ring, so one warm point marks where the reader is on a timeline that is otherwise muted. The rail marker in `section-nav.md` states position the same way and takes the same color.
- The highlighted row also lifts onto a plate, which the closing ask and the project cards already carry, so the record answers a pointer the way the rest of the page does. The plate covers the span, the gutter and the beat together, since the three are one row. The rail runs behind it rather than across it.
- The plate travels with the highlight through the walk, and several rows carry one at once on the way back because a plate leaves more slowly than the walk steps. Nothing is plated once the walk settles, including the row highlighted by default.
- The framing line sits above the timeline rather than below it, and states the reading order rather than a thought about the path. `each entry made the next one possible` closed the list until 2026-08-19 and came out on the operator's call: an aphorism about a career makes a claim no record can check, which is the register that reads as machine-written. A line describing the list is the page's to write and a line speaking for the person is not.

## Margin cast

Above 1280 the section carries small figures in both margins, in the tan the dog and the airliner already fill at. They sit in clusters anchored to the reading column's own edge rather than to the viewport, two of them as pairs and three alone, and the pairs face each other. A pair is offset down as well as across, since the margin has no room to separate one sideways.

Every member emits something, drawn on its own layer behind it: the lead stands in flames, and the others carry lightning, trailing bars, a ring, a wind, water and loose points. Four of the five clusters also carry a companion, a smaller creature that is its own drawing rather than a member at half scale.

```plaintext
   [rail]        [ figures ]   |  reading column  |   [ figures ]   [dock]
                  lead         |                  |   worker
                    playful    |                  |     spark
                    ember      |                  |   horned + flustered
                  crowned      |                  |
                               |                  |   sleeping
                               |                  |     dog
```

One member acts on its own every few seconds and never two at once, drawing from the same gestures a pointer runs. It stands down while the section is off screen, under reduced motion, and while a pointer sits on a member, so a reader's own hand outranks the schedule.

Pointing at one runs the gesture its mood carries. Tapping one changes its face, and the change escalates rather than replaces: the sleeping figure wakes surprised, the crowned one narrows his eyes rather than widening them, and the lead swaps his flames for a discharge while a companion only perks up. A lit shape appears behind whichever is pointed at, so a reader can tell they answer.

Below 1280 the section carries none. Both margins measure zero there, which is the same reason the rail stands down.

## Employer marks

A row of three marks sits between the prose and the timeline under a muted `Where that happened` label. The section states two degrees and two jobs in text alone, so recognition arrives only after a line has been read, and the marks carry it in a glance.

They sit above the timeline rather than on the beats themselves. Only some beats would carry a mark, and a list where some rows are illustrated and others are not reads as a ranking between them rather than as a record.

- The order is by start date, newest first, matching the timeline directly below. It also puts the two employers ahead of the university and leaves the long wordmark last rather than between two compact marks.
- Every mark inherits the surrounding text color, so one file serves both themes and no brand palette lands on a page that has no room for one.
- Marks are not sized to a shared height. Each is sized to the point where the smallest thing inside it still reads, which differs per mark: a roundel carrying its own name inside the circle needs more height than a wordmark does.
- The employer mark is the roundel rather than the bare wordmark, because the roundel is what a reader recognizes.
- The university mark is a wordmark rather than a crest. The crest was replaced, and the emblem file they publish resolves into nothing under about 80px.
- One mark ships only as a raster, because that is all its owner publishes. It renders as a mask filled with the current color rather than as a picture, which is what puts it in the same tone as the other two, and it is drawn under its own pixel height to stay sharp.
- Pointing at a mark names it underneath. The name wraps inside a box narrower than the column and renders only where a pointer exists. Held on one line it reached 62px past a 375 viewport and 47px past a 390 one, since it sits at its mark's left edge and the rightmost mark carries the longest name, which scrolled the whole page sideways while the label itself was invisible.

## Artifact chips

The newest beat carries one chip per card in the projects section, in the order those cards render, because the copy under that beat says every project below came out of it and the chips are what make the claim reachable.

Each chip links to its own card rather than to the section, so a reader lands on the artifact they picked. They are ordinary links with visible labels, which keyboard users reach in sequence. The earlier version hid the same targets inside a decorative graphic where only a pointer could use them. A chip clears the phone tap minimum rather than sizing to its label, which the tap-target spec holds every link on this page to.

A card added below earns a chip here, and a test compares the two lists so the pair cannot drift.

The row lights once as it comes into view, each chip 90ms after the one before it, and then holds still for the rest of the read. The wave says the five are one set, in order, and reachable, which is the thing a static row of pills does not say. It runs again whenever the row is scrolled back into view, and never while a reader is sitting in front of it.

A lit chip wears the same treatment a pointed-at one wears, accent edge and glow, and the light was weaker than that until 2026-08-25. Timing is the whole difference now: the arrival swells and a pointer's answer snaps. A reader whose pointer rests on a chip during the wave's 1.48s therefore sees nothing change, which is the accepted cost of one accent across every bounded control on the page. `.claude/ARCHITECTURE.md` § A control gets an arrival where decoration gets a schedule carries why the fill and the shadow could not carry that difference instead.

Clicking a chip glides to its card rather than jumping there, which the whole site now does from one declaration. See `.claude/context/motion.md` § Traveling to a target.

A loop was driven and rejected, and the reason bounds anything proposed here later. A chip is a control, so a light that repeats claims something happened at a destination and makes a reader check it before deciding it meant nothing, where the agent cast in the margins can act on a schedule because it is `aria-hidden`, leads nowhere, and reads as scenery. The row also sits inside the reading column rather than beside it. Four candidates were served live: one chip at intervals, a wave on a loop, a light traveling continuously through the row, and this one.

## Cascade reveal

On scroll-in the heading, then the rows, reveal in a top-to-bottom cascade. The list is watched as one unit and steps its rows 220ms apart, so the cascade holds at any scroll speed rather than depending on which rows happened to cross the viewport edge together. The last of six starts at 1.1s and the list settles inside 1.8s. Mechanism: `.claude/context/motion.md`.

The cascade was absent until 2026-08-22 and the section still read as arriving in one block, twice over: the rows had no opacity transition at all, because the row's own `transition` for its active state replaced the reveal's, and the stagger they were given was computed per observer callback, which delivers one row per callback at reading pace.

## Claim annotation

A single phrase in the claim carries a hand-drawn underline that draws on shortly after the claim's fade settles, once per page load. Only one phrase per page may carry an annotation, by editorial rule. Skipped under reduced motion. The claim opened the header until 2026-08-17 and the annotation traveled with the sentence rather than staying on that surface. Mechanism: `.claude/context/motion.md`.
