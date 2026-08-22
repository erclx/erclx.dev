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
- One batch is one pull request. The run accumulates on a single branch and the batches stack in commit order, and at ship time each batch becomes its own pull request targeting the one before it. A dependent batch is a reason to stack rather than a reason to merge two batches into one review.
- Say so in the table. The pull request column carries one entry per batch and names what each targets, so a run that plans to open five says five before the first line is written.
- Sequence a sweep last. A batch that deliberately rewrites files earlier batches touched is coherent as the final one and forces every batch after it into one review anywhere else. One run put its interaction sweep in the middle, where it rewrote four components three earlier batches had settled, and the branch could not be separated after that.
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
- A measurement answers its own question and not the one beside it. Whether a control is reachable is not whether a surface should close on one, and a removal resting only on reachability gets read on the page before it ships. One run measured two way-home controls on screen together at the foot of every route, cut the second on that basis, and put it back within the hour once the operator read the page and found it ended too tight. The number was right both times.
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

`src/components/dev/scenarios.astro` is the harness and already does this. Import it into the page under decision and pass `param` and `arms`, plus `mountInto` when the decision sits inside a modal. It reads the parameter, applies the active arm, and renders the switcher.

1. Write the arms: an id, a label naming what the arm costs, and the CSS when the decision is a treatment. Use `0` for what ships, so the baseline is an arm.
2. Where the decision is a value the page reads at runtime rather than a stylesheet, leave the arm's CSS out and have the module holding that value read the active id off `document.documentElement.dataset[param]`.
3. Mount the component on the page and hand over the links.
4. Stop. The operator drives the arms and picks.
5. Delete the arms and the call site in the same change that applies the pick. The component stays: it is scaffolding a decision reaches for and puts back, so a branch with no open visual decision holds no call site.

### Rules

- Do not hand-roll the parameter and the switcher. That was the shape before the harness existed, five times in one run with no two alike, and rebuilding it is what the component was written to stop.
- The harness renders nothing on a bare page and nothing in a production build, since it sits behind `import.meta.env.DEV`. Prove the first with a check counting the switcher's own elements on the page with no parameter.
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
- Fold batches into one record entry where they are one story. Three batches that together gave the page one elevation language read as three unrelated styling changes when written up separately.
- Keep one batch's commits contiguous. A later fix to an earlier batch goes on that batch's own commits, not on the end of the branch, since a batch interrupted by another cannot be lifted onto its own branch afterward. One run landed a fix to its ripple batch after the next batch's two commits and lost the split with that one commit.
- Root `CLAUDE.md` § Shipping owns when a commit and a push are allowed. Follow it rather than a copy, and do not infer a shipping rule from this file.
- Hand over to `stack-ship` on the ship signal. It cuts one branch per batch in commit order, opens the chain, and rebases it as each branch merges. Everything from that signal onward belongs to it, including the observability test a batch has to pass before it earns a branch of its own.

## Closing a batch

Every batch ends the same four ways. Run them in order once the operator has judged the batch, before the next one opens.

1. Run `claude-docs`.
2. Commit, per `## Holding the diff` above, carrying that record with the batch.
3. Re-run `bun run screenshot` for the surfaces the batch touched.
4. Hand over the address, per `.claude/rules/ui/445-screenshot.md` § Handoff.

### Rules

- Run `claude-docs` per batch rather than per commit or once at ship. Per commit is too often, since outcomes close per batch and not per commit. At the end of the run is too late: the architecture entries then get written from a summary rather than from the measurements that produced them, which is how a record loses the failed attempts and the numbers that decided it. A run that skipped this reported its early batches reading as unrelated changes afterward.
- Run it ahead of the commit rather than behind it. It reads the working tree and untracked files as well as the committed diff, so it needs no commit to see the batch, and a record written afterward sits outside the commit that closes the batch. The next boundary then sweeps it up, and since `stack-ship` cuts one branch per slice in commit order, batch N's record ships on batch N+1's branch.
- Render the address as a scannable code beside the link wherever the project ships a renderer for one. A link is what the operator opens on the machine they are already at, and the code is the only one of the two a phone can act on, so a handoff carrying the link alone cannot be judged on the device half the decisions are about.
- Close the batch even when nothing about it looked wrong. The steps run on the batch being finished rather than on a session noticing it needs them, which is what makes them a sequence rather than a judgment.

## Voice

The page is personal and reads as one document. Copy is written for a person, in connected prose rather than fragments, and every surface follows the same design language so nothing reads as imported from another site. Load `write-human` before drafting anything a visitor reads.

## What this delegates

Cite these rather than restating them. A step reimplemented here rots against the skill that owns it.

- `claude-worktree` enters the worktree this runs in
- `claude-tasks` writes and archives the task files phase 1 produces
- `e2e/inventory.ts` reads every control on every page and groups them by treatment, which is what `## Sweeping` is measured with
- `claude-docs` refreshes the record at every batch boundary, per `## Closing a batch`
- `stack-ship` cuts the batches into a chain of pull requests on the ship signal and rebases it behind each merge
- `git-stage`, `git-pr`, and `git-followup` carry the commits and the pull request
- `claude-review` and `claude-address-review` run the review pass
