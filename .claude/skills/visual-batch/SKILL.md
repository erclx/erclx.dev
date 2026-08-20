---
name: visual-batch
description: Plans a run of visual work into batches with declared pull request boundaries, then runs each batch as an eyeball loop where the operator judges prototypes and rendered output rather than reading code. Use when asked to work on the landing page or a project route, to change how a surface looks, to rework a section, or when a request arrives as a dump of visual observations. Do NOT use for a copy correction with no visual change, which is the copy cycle alone, and do NOT use to plan a non-visual feature, which is `claude-feature`.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, Skill
---

# Visual batch

Visual work cannot be judged from a diff. The operator decides by looking, so every step here exists to put something in front of them and to keep the tree uncommitted until they have.

## Guards

- Stop when the request names no surface and no visual outcome. A change with nothing to look at needs no batch and no loop.
- Stop before implementing anything the operator has not agreed to in the batch table. The dump is the request and the table is the plan.
- Stop and ask rather than choosing when two treatments are both defensible and the difference is a matter of taste. Prototyping is the answer, not a judgment call taken silently.

## Phase 1: plan the batches

1. Read the dump and group it into batches. One batch is one surface or one coherent change across surfaces.
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
4. Hand back the localhost URL and one or two lines naming what is worth the operator's eye. Name what you are unsure about rather than summarizing what you built.
5. Take the correction, change the code, capture again. Repeat until they say it is right.
6. Move to the next batch. Do not commit between iterations or between batches.

### Rules

- Never report a visual result you have not looked at. A claim about appearance with no capture behind it is a guess.
- A capture proves appearance. A measurement proves a relationship. Reach for the second whenever the claim is about a number, such as a contrast ratio, a column width, a tap target, or a document that scrolls sideways.
- Read the harness options before capturing rather than accepting its defaults. Its default suppresses motion, which is correct for layout and wrong for anything that moves.

## Choosing a capture

`.claude/rules/ui/445-screenshot.md` owns the capture mechanics and fires on a path match whether or not this skill ran. Follow it. This section only classifies the decision so the right option in that rule gets used.

- A decision about size, weight, color, spacing, or arrangement is static. Compose the candidates into one sheet.
- A decision about how something moves is motion. Record it, per that rule's `video: true`, rather than shooting stills of a moving surface.
- A decision needing the operator to drive it, such as a hover response, a scroll-linked position, or anything where timing is theirs to control, is interactive. Serve the candidates as live query-parameter variants and hand back the URLs, since a recording is passive and answers a question they did not ask.
- Remove the arms that lose in the same batch that picks the winner. A variant left behind a flag is a second design nobody maintains.

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

- Hold the tree uncommitted across every iteration and across every batch in the run. The operator is judging rendered output, and a commit between iterations is noise in a history they read later.
- Root `CLAUDE.md` § Shipping owns when a commit and a push are allowed. Follow it rather than a copy, and do not infer a shipping rule from this file.
- On the ship signal, split with `git-stage`, refresh the record with `claude-docs`, and open the pull request with `git-pr`.

## Voice

The page is personal and reads as one document. Copy is written for a person, in connected prose rather than fragments, and every surface follows the same design language so nothing reads as imported from another site. Load `write-human` before drafting anything a visitor reads.

## What this delegates

Cite these rather than restating them. A step reimplemented here rots against the skill that owns it.

- `claude-worktree` enters the worktree this runs in
- `claude-tasks` writes and archives the task files phase 1 produces
- `claude-docs` refreshes the record at ship
- `git-stage`, `git-pr`, and `git-followup` carry the commits and the pull request
- `claude-review` and `claude-address-review` run the review pass
