---
name: visual-batch
description: Why a visual run needs its own workflow, and where its boundary against the capture rule and the planning and shipping skills falls
---

# Visual batch requirement

## Gap

Without this skill, a session working on a visual surface:

- Reports that a change looks right without rendering it, because nothing in the default flow requires looking. The claim then rests on the code having been written rather than on the page having been seen.
- Reaches for the default capture without asking what kind of decision is being made. The harness suppresses motion unless told otherwise and the capture rule already says to record a motion decision instead of shooting it, so a session that never classifies the decision compares stills of a moving surface, finds them identical, and concludes there is no difference between the candidates. Measured on a shader review that stalled for several rounds and produced a rate change that made the surface worse.
- Describes two design options in prose and asks the operator to choose. The operator decides by looking, so a described option is not an option and the answer that comes back is arbitrary.
- Commits between iterations of a visual tuning pass, leaving a history of intermediate states the operator never approved.
- Edits rendered page copy and stops there. The canonical source is in another repository, so no branch carries the second edit and no check compares the two, which silently reintroduces the drift the split exists to close.
- Sequences a dump into batches without recording where one pull request should end, so a dependency chain forms across every batch and the whole run lands in one review surface. Measured once at 68 files and 2951 insertions, of which three batches touched disjoint files and could have shipped separately, and twice more at 25 and 30 commits in one review.
- Treats a dependency between batches as a reason to merge them into one review rather than to stack them. The batches are built in order and depend on each other in that order, which is what a stack of pull requests expresses, so the dependency argues for stacking and a session reads it as arguing against splitting.
- Loses the ability to split partway through the run rather than at ship time, by putting a sweep across earlier batches in the middle or by landing a fix to one batch after the next batch's commits. Neither is visible as a mistake when it happens, and both are unrecoverable without rewriting history.
- Leaves the batches undocumented, so the run exists only in a conversation and nothing survives it.
- Builds the scaffold for a live variant from scratch every time one is needed, rather than reaching for the harness that serves it. Measured across one run that served five separate decisions that way, each with its own parameter, its own switcher, and its own removal, none of which resembled the last. `src/components/dev/scenarios.astro` closed the missing shape, so what remains is a session not knowing to reach for it, which a body naming the component is what fixes.
- Calls a failure a regression without taking the baseline the same way. Measured on a three-engine run that reported seven failures against a baseline taken over twenty tests rather than four hundred and fifty, which would have filed three pre-existing failures as new.
- Verifies a surface by its dimensions and never by whether a reader would see it. Measured on a panel that reported a healthy 1517 by 639 for as long as it sat 1868px above the viewport, which every check passed and no reader could have used.

## Must

- Group a dump into batches and file one task per batch before implementing any of them.
- Decide the pull request boundary during planning, from the file sets the batches touch, and state it in the batch table.
- Open one pull request per batch, stacked in commit order with each targeting the one before it, and keep each batch's commits contiguous so that split stays available until ship time.
- Classify a decision as static, motion, or interactive before capturing, and take the matching option from the capture rule.
- Render and look at every visual change before reporting on it, and prefer a measurement whenever the claim is about a number.
- Run the four-step copy cycle before changing any rendered text, and report the upstream edit in the same message as the component edit.
- Hold the tree uncommitted across every iteration within a batch, and commit only once the operator has judged that batch.
- Mark the recommended option in its own label when escalating a choice.
- Serve an interactive decision as live variants through the harness, and remove the arms and the call site in the change that applies the pick. The harness itself stays, unreferenced, between decisions.
- Take a baseline the same way before calling any failure a regression.
- Assert that a surface is where a reader would see it, not only that it has the right shape.

## Must not

- Restate a shipping rule. Root `CLAUDE.md` owns when a commit and a push are allowed, and a copy here drifts from it. An earlier version of this file carried one that already disagreed, barring a push the root file permits.
- Restate capture mechanics. `.claude/rules/ui/445-screenshot.md` owns them and loads on a path match without this skill, so a second copy hands one case two answers.
- Prototype a decision the operator has not asked to make. Variants cost a build each and a run that offers options everywhere spends their attention rather than saving it.

## Guards

The refusal strings sit in the body, since the runtime loads that file and ignores this one. Two conditions stop a run: a request naming no surface and no visual outcome, and a batch the operator has not agreed to.

## Out of scope

- `claude-feature` plans a feature from a request. This plans a visual run from a dump and owns the batch-to-pull-request mapping, which that skill has no reason to carry.
- `claude-ux-audit` reads source to find roughness and reports it. This changes surfaces with the operator judging each one, and takes its input from the operator rather than from a scan.
- `claude-ux-measure` measures what a running interface costs to paint. This measures whatever a visual claim depends on, which is usually geometry or contrast rather than cost.
- `claude-tasks`, `claude-docs`, `git-stage`, `git-pr`, and `claude-review` are invoked by this skill and own their own steps.
- A copy correction with no visual change is the copy cycle alone and needs no batch or loop.
- The content-sync handoff from the career repo belongs to the `landing-page` skill there, which explicitly excludes editing files under `public/erclx.dev/`.

## Collision

`.claude/rules/ui/445-screenshot.md` is the one surface this can contradict, because it fires on a component, layout, page, or stylesheet path match with no decision from the session, while this fires on invocation. A session editing those paths holds both.

They are split so neither answers the other's question. The rule owns every mechanic: which harness call, which flag, composing a sheet, recording with `video: true`, and the handoff. This owns only the classification that decides which of those options applies, and adds one case the rule does not carry, where the operator has to drive the candidate themselves and a live query-parameter variant is served instead of a recording.

An earlier version of this file named that rule as a floor and stated no collision, while the body told a session to serve live variants for motion where the rule says to record it. That is the authoring standard's fourth question going unanswered, and the contradiction it produced is the reason the question exists.
