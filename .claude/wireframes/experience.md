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

In practice that means agents, and the developer tools around them...
I spend most of my working day with coding agents...
  ← two body paragraphs, muted

Where that happened
  ← label-size eyebrow, muted

( ⬤ VOLVO )    ( BAC HA )    ( CHALMERS )
  ← employer marks, one tone, sized so each reads rather than matching heights

 2026               ●  shipping independently, open to the next thing
                    │     Each project below answers a problem I ran into.
                    │     ( aitk ) ( Jobtriage ) ( Stackr ) ( Caret ) ( diction )
                    │
 jun to dec 2025    ○  working out what to build
                    │     Took the time to learn TypeScript and web application
                    │     development, and to work out where to point AI next.
                    │
 jan 2024 to        ○  eighteen months at volvo technology
 jun 2025           │     The job was an agent that let engineering teams plot
                    │     and query truck data by asking in plain language.
                    │     It started as my master's thesis and became a
                    │     multi-step SQL pipeline with session memory.
                    │
 jun to aug 2023    ○  ten weeks at bac ha software, hanoi
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

The list opened on `Newest first.` in Fraunces italic at label size until 2026-08-20. It was there because the spans sat inside the head sentences, separated by a middle dot, so the ordering was not visible without reading each row. The spans now hold a column of their own and a reader meets 2026 against jun to dec 2025 against jan 2024 down one edge, so the list states its own order and the line restated what was already on screen.

## Behavior

- The section runs at the page measure, which every section holds below the widest breakpoint. The projects grid and the footer break out past it at that breakpoint and nothing else does. Nothing sits outside this column: a figure hanging into the margin left the text centered while the section read as offset, which is why the earlier diagram beside the list is gone.
- The rail starts at the newest dot and fades to nothing under the oldest one, so the record reads as continuing behind the first entry rather than stopping at a dot.
- Each row is a span in its own column, a dot in the gutter beside it, and a head with a supporting sentence under it. The dot aligns to the head rather than to the block. The spans set in tabular numerals so the column holds one edge down the list.
- Nothing on this surface takes the monospace face. The heads carried it until 2026-08-17, which made them the largest text in the section and the reason it read louder than its neighbors. Mono now marks literal machine values alone, and no value on this surface is one.
- Every dot sits exactly on its own row, which a fixed figure could never do once rows started running to different heights.
- A span carries months rather than a year alone, because a year read as twelve months of work where the record held six.
- One row is highlighted at a time as the "current state" anchor. The first row is highlighted by default. Hovering another row transfers the highlight to it. On leaving the list the highlight walks back row by row to the first row.
- The walk lingers on the row the reader chose and gathers pace as it returns, because what it shows is a row being let go of rather than another being traveled to.
- The highlighted dot fills with the warm accent and carries a soft ring, so one warm point marks where the reader is on a timeline that is otherwise muted. The rail marker in `section-nav.md` states position the same way and takes the same color.
- The highlighted row also lifts onto a plate, which the closing ask and the project cards already carry, so the record answers a pointer the way the rest of the page does. The plate covers the span, the gutter and the beat together, since the three are one row. The rail runs behind it rather than across it.
- The plate travels with the highlight through the walk, and several rows carry one at once on the way back because a plate leaves more slowly than the walk steps. Nothing is plated once the walk settles, including the row highlighted by default.
- The framing line sits above the timeline rather than below it, and states the reading order rather than a thought about the path. `each entry made the next one possible` closed the list until 2026-08-19 and came out on the operator's call: an aphorism about a career makes a claim no record can check, which is the register that reads as machine-written. A line describing the list is the page's to write and a line speaking for the person is not.

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

## Cascade reveal

On scroll-in the heading, then the rows, reveal in a top-to-bottom cascade. Mechanism: `.claude/context/motion.md`.

## Claim annotation

A single phrase in the claim carries a hand-drawn underline that draws on shortly after the claim's fade settles, once per page load. Only one phrase per page may carry an annotation, by editorial rule. Skipped under reduced motion. The claim opened the header until 2026-08-17 and the annotation traveled with the sentence rather than staying on that surface. Mechanism: `.claude/context/motion.md`.
