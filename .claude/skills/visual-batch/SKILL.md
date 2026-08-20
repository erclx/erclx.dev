---
name: visual-batch
description: Plans a run of visual work into batches with declared pull request boundaries, then runs each batch as an eyeball loop where the operator judges prototypes and rendered output rather than reading code. Use when asked to work on the landing page or a project route, to change how a surface looks, to rework a section, or when a request arrives as a dump of visual observations. Do NOT use for a copy correction with no visual change, which is the copy cycle alone, and do NOT use to plan a non-visual feature, which is `claude-feature`.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, Skill
---

# Visual batch

Visual work cannot be judged from a diff. The operator decides by looking, so every step here exists to put something in front of them and to keep the tree uncommitted until they have.

## Guards

- If the request names no surface and no visual outcome, stop: `❌ Nothing to look at. This is not a visual run.`
- If a batch is not in the agreed table, stop: `❌ Batch not in the agreed plan. Put the table up before implementing.`

## Phase 1: plan the batches

1. Read the dump and group it into batches. One batch is one surface or one coherent change across surfaces. Group by the decision rather than by the component when several items turn out to be one question asked about different surfaces, per `## Sweeping` below.
2. Name the files each batch touches, before sequencing, because the file sets decide the next step.
3. Mark each batch dependent or independent by comparing those file sets. A batch sharing no file and no token with another is independent and ships on its own branch.
4. File one task per batch through `claude-tasks`, carrying the outcomes the operator will judge rather than the implementation.
5. Put the batch table in chat: batch, surface, depends on, pull request it lands in.
6. Escalate what the operator's preference decides through `AskUserQuestion`, recommendation first, `(Recommended)` in its label.

### Rules

- Declare the pull request boundary here, never at ship time. A dependency chain cannot be split once built, so the choice exists only while the batches are still a plan.
- Independent batches earn separate branches even when they arrive in one dump. A run measured at 68 files and 2951 insertions carried three batches touching disjoint files that all landed in one review surface, because nothing drew the boundary.

## Phase 2: the loop, once per batch

1. Implement the batch.
2. Classify the decision before capturing, per `## Choosing a capture` below. Reaching for the default capture is what produces evidence about the wrong thing.
3. Capture, then look at what came back.
4. Hand off per that same rule, then stop. The operator judges before anything else happens.
5. Take the correction, change the code, capture again. Repeat until they say it is right.
6. Commit the batch once they have judged it, then move to the next. Never commit between iterations of one batch.

### Rules

- Never report a visual result you have not looked at. A claim about appearance with no capture behind it is a guess.
- A capture proves appearance. A measurement proves a relationship. Reach for the second whenever the claim is about a number, such as a contrast ratio, a column width, a tap target, or a document that scrolls sideways.
- Capture the state the change is about. A treatment that only exists under a pointer is not shown by a capture taken at rest, and a batch verified against numbers alone has proved its treatments uniform without showing anyone what any of them looks like. Uniform and right are different claims.
- Read the harness options before capturing rather than accepting its defaults. Its default suppresses motion, which is correct for layout and wrong for anything that moves.
- Measure a color change against the contrast floor before committing it, not after someone asks. A palette has less headroom than it looks: a muted token sitting at 4.82:1 has nowhere below it, so a step down fails at any value visible enough to do the job, and a treatment that reads fine in a capture can be a text failure.
- Composite alpha before reading a color. A `color-mix` toward transparent resolves to channels plus an alpha, and reading those channels as opaque reports a color nobody sees.
- Sample inside the shape. A patch taken at the corner of a bounding box misses a round control entirely and reads the page behind it, which is how a ground repair measured as no change at all.
- Ask whether a reader would see the thing, not only whether it has the right shape. A relationship that holds off screen is not evidence: a panel reported a healthy 1517 by 639 for as long as it sat 1868px above the viewport, and every check that read its size passed.
- Take a baseline the same way before calling a failure a regression. A suite run narrow against a branch run whole compares two different loads, and a load-dependent failure then reads as new work breaking something.
- Re-verify the whole path when a fix uncovers a second defect, rather than the fix alone. One defect masks another whenever the first suppresses the conditions the second needs, so repairing either exposes its pair, and a run that ships after the first ships both.

## Choosing a capture

`.claude/rules/ui/445-screenshot.md` owns the capture mechanics and fires on a path match whether or not this skill ran. Follow it. This section only classifies the decision so the right option in that rule gets used.

- A decision about size, weight, color, spacing, or arrangement is static. Compose the candidates into one sheet.
- A decision about how something moves is motion. Record it, per that rule's `video: true`, rather than shooting stills of a moving surface.
- A decision needing the operator to drive it, such as a hover response, a scroll-linked position, or anything where timing is theirs to control, is interactive. Serve the candidates as live query-parameter variants, since a recording is passive and answers a question they did not ask.
- Prototype rather than deciding when two treatments are both defensible and the difference is taste. A call taken silently there is the operator's to make.
- Remove the arms that lose in the same batch that picks the winner. A variant left behind a flag is a second design nobody maintains.

## Sweeping

A dump names the components an operator happened to be looking at. Read past them to the question underneath, because several items are routinely one question asked about different surfaces, and answering them one component at a time is what produced the divergence being reported.

- Inventory the whole site before changing one instance of anything. `e2e/inventory.ts` walks every page and groups every control by what its treatment actually does, which is the reading a per-component look cannot give.
- Judge the answer against every surface it reaches, then change them together. A treatment settled on one component and not its siblings is a new divergence, filed under a fix.
- Declare the rule that decides membership rather than the treatment alone. `does it have its own box` is a test the next session can apply to a component nobody has built yet, where a list of eight components answers only for those eight.
- Put the shared values in one declaration and have every component resolve them. Two components holding equal copies are already drifting, and nothing reports it.
- Measure the sweep afterwards with the same instrument that found the problem. The count of distinct treatments is the outcome, and it either fell or it did not.

An instrument reading only the element itself will report a treatment written on a child or a pseudo-element as no treatment at all, which reads as a dead control and is a fabricated defect. Read the subtree and both pseudo-elements.

## Serving a live variant

An interactive decision is one the operator has to drive: how a gesture feels to cause, how a pace reads while scrolling, whether a control is where a hand expects it. A recording answers how a thing looks and cannot answer any of those, so the candidates are served live and the operator drives them.

The shape is the same every time and is worth building the same way.

1. Read one query parameter and resolve it to an arm, defaulting to what ships when the parameter is absent or unknown.
2. Apply that arm at the one place the decision lives: a stylesheet for a treatment, a constant for a pace, a uniform for a field.
3. Render a switcher listing every arm, marking the current one, and carrying the parameter through so the operator moves between arms without editing a URL.
4. Hand over the links and stop.
5. Delete the parameter, the arms, and the switcher in the same change that applies the pick.

### Rules

- Gate every part of it on the parameter, so a page asked for nothing renders exactly what ships. Prove that with a check counting the switcher's own elements on the bare page.
- Put the switcher where the decision is visible. A control inside a modal belongs in the modal, since a fixed element outside it sits under the backdrop.
- Send the composed sheet as well as the links. The sheet is what the operator scans to pick two arms worth driving, and driving is what settles between them.
- Keep the arms in the source rather than in a scratch script when the decision is a constant the page reads at runtime. A scratch script that rewrites a file between captures cannot be driven by a person.
- Say what each arm costs in the handoff, not only what it is. An arm with no stated cost is not an option.
- Never leave the seam behind a flag. A variant nobody removed is a second design nobody maintains, and the parameter is a surface a reader can reach.

## The copy cycle

Page copy is canonical upstream at `career/assets/portfolio/` and is read across the filesystem. Never edit rendered text without running all four steps.

1. Name the intention. What is this text for, and what is wrong with what it says now?
2. Draft alternatives, labelled, in chat. Three is usually right.
3. The operator picks.
4. Apply the pick to the component and to the upstream source in the same pass.

### Rules

- Show drafts in chat rather than in a file. The operator is choosing, not reviewing a document.
- Report the upstream edit explicitly in the same message as the component edit. It lands in a different repository, so this branch cannot carry it, no check compares the two, and a page-side edit alone reintroduces the drift the split exists to close. See `.claude/ARCHITECTURE.md` § Content read from the parent checkout.

## Holding the diff

- Hold the tree uncommitted across every iteration within a batch. The operator is judging rendered output, and a commit between iterations is noise in a history they read later.
- Commit at a batch boundary once the operator has judged it, rather than holding the whole run. A run spanning many batches otherwise carries hours of unsaved work, and the boundary is where the batch's own outcomes settle anyway.
- Run `claude-docs` at that same boundary. Per commit is too often, since outcomes close per batch and not per commit, and at the end of the run is too late: the architecture entries then get written from a summary rather than from the measurements that produced them, which is how a record loses the failed attempts and the numbers that decided it.
- Fold batches into one record entry where they are one story. Three batches that together gave the page one elevation language read as three unrelated styling changes when written up separately.
- Root `CLAUDE.md` § Shipping owns when a commit and a push are allowed. Follow it rather than a copy, and do not infer a shipping rule from this file.
- On the ship signal, split with `git-stage`, refresh the record with `claude-docs`, and open the pull request with `git-pr`.

## Voice

The page is personal and reads as one document. Copy is written for a person, in connected prose rather than fragments, and every surface follows the same design language so nothing reads as imported from another site. Load `write-human` before drafting anything a visitor reads.

## What this delegates

Cite these rather than restating them. A step reimplemented here rots against the skill that owns it.

- `claude-worktree` enters the worktree this runs in
- `claude-tasks` writes and archives the task files phase 1 produces
- `e2e/inventory.ts` reads every control on every page and groups them by treatment, which is what `## Sweeping` is measured with
- `claude-docs` refreshes the record at ship
- `git-stage`, `git-pr`, and `git-followup` carry the commits and the pull request
- `claude-review` and `claude-address-review` run the review pass
