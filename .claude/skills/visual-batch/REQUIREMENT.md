---
name: visual-batch
description: Why a visual run needs its own workflow, and where its boundary against the planning and shipping skills falls
---

# Visual batch requirement

## Gap

Without this skill, a session working on a visual surface:

- Reports that a change looks right without rendering it, because nothing in the default flow requires looking. A claim about appearance then rests on the code having been written rather than on the page having been seen.
- Judges motion from a screenshot. The capture harness runs under `prefers-reduced-motion` and every image it produces is a still, so a session comparing animated treatments compares identical pictures and concludes there is no difference between them.
- Describes two design options in prose and asks the operator to choose. The operator decides by looking, so a described option is not an option and the answer that comes back is arbitrary.
- Commits between iterations of a visual tuning pass, leaving a history of intermediate states the operator never approved.
- Treats an earlier approval as a standing one, and pushes work the operator has not seen.
- Edits rendered page copy directly, which reintroduces the drift between the page and its canonical upstream source that the split exists to close, with no check reporting it.
- Sequences a dump into batches without recording where one pull request should end, so a dependency chain forms across every batch and the whole run lands in one review surface. Measured once at 68 files and 2951 insertions, of which three batches touched disjoint files and could have shipped separately.
- Leaves the batches undocumented, so the run exists only in a conversation and nothing survives it.

## Must

- Group a dump into batches and file one task per batch before implementing any of them.
- Decide the pull request boundary during planning, from the file sets the batches touch, and state it in the batch table.
- Render and look at every visual change before reporting on it, and prefer a measurement whenever the claim is about a number.
- Use a live query-parameter variant for anything that moves, and reserve a composed contact sheet for static layout.
- Hand back a localhost URL with one or two lines naming what needs the operator's eye, then stop.
- Run the four-step copy cycle before changing any rendered text, and apply the pick upstream in the same pass.
- Hold the tree uncommitted until the operator says to commit, and hold the commits back until they say to ship.
- Mark the recommended option in its own label when escalating a choice.

## Boundaries

- `claude-feature` plans a feature from a request. This plans a visual run from a dump and owns the batch-to-pull-request mapping, which that skill has no reason to carry.
- `claude-ux-audit` reads source to find roughness and reports it. This changes surfaces with the operator judging each one, and takes its input from the operator rather than from a scan.
- `claude-ux-measure` measures what a running interface costs to paint. This measures whatever a visual claim depends on, which is usually geometry or contrast rather than cost.
- `claude-tasks`, `claude-docs`, `git-stage`, `git-pr`, and `claude-review` are invoked by this skill and own their own steps. Nothing here restates them.
- `.claude/rules/ui/445-screenshot.md` is the floor under the capture step and fires on a file match whether or not this skill was invoked. This carries the procedure around it, not the invariant.

## Not this skill

- A copy correction with no visual change, which is the copy cycle alone and needs no batch or loop.
- A non-visual feature, however large.
- The content-sync handoff from the career repo, which the `landing-page` skill in that repo owns and which explicitly excludes editing files under `public/erclx.dev/`.
