---
name: stack-address
description: Answers a batch of review findings across a chain of stacked pull requests in one bottom-up pass, rebases and pushes every branch together, and posts a response on each branch it touched. Use when a stack handback arrives, or when asked to "address the stack review", "fix the findings across the chain", or "push the whole stack". Do NOT use for findings on a single pull request, which is `claude-address-review`, and do NOT use to open a chain, which is `stack-ship`.
allowed-tools: Bash, Read, Write, Edit, Grep, Glob, Skill
---

# Stack address

A handback covers the whole chain, so the answer does too. Fixing one branch and handing it back leaves every branch above it based on a commit that no longer exists, which is the failure the batched handback exists to avoid.

Read `.claude/context/stacked-shipping.md` before the first fix. It carries how git behaves under a stack and why the thread outranks the session channel.

## Guards

- If the handback names no branch per finding, stop: `❌ Findings are not attributed to branches. Ask the reviewer which branch each sits on.`
- If a finding's branch is not in the resolved chain, stop: `❌ Finding names branch <name>, which is not in this chain. Confirm the target before editing.`

## Phase 1: group and walk

1. Read the handback and group every finding by the branch it sits on.
2. Walk the chain bottom to top. Fix every finding on a branch before moving up.
3. Rebase each branch onto the fixed head of the one below it as the walk reaches it.
4. Run the verify commands root `CLAUDE.md` § Commands names on the branch a fix changed, before moving up.

### Rules

- Fix the whole chain before pushing any of it. Pushing the bottom mid-walk is the same defect as reviewing the bottom mid-read, from the other side.
- Fix a finding on the branch that introduced it, never on the top of the chain. A repair landed above the branch it belongs to welds the two and the split is gone.
- Re-read the fixed file against what the finding claimed. A fix that satisfies the description and not the defect reads as closed on both surfaces.
- Re-verify the whole path when a fix uncovers a second defect, rather than the fix alone. One defect masks another whenever the first suppresses the conditions the second needs, so a run that ships after the first ships both.

## Phase 2: push and answer

1. Force-push every branch in the chain together, bottom to top.
2. Post a response on every branch the walk touched, naming what changed on that branch.
3. State for each push whether it was a pure rebase or one carrying edits. The reviewer checks that claim with `git diff <reviewed-oid> <new-head>` rather than re-reading the branch.
4. Report the batch back through the channel the dispatch arrived on, naming every branch pushed and every finding withdrawn.

### Rules

- A branch that only rebased still gets a comment. The standing close-out names a commit the branch no longer carries, so the thread reads as a review predating the head whatever the trees say.
- Put anything that decides a merge on the thread. The session channel is scrollback that dies with the session, and a fix reported only there leaves the operator reading a branch that looks unresolved.
- Correct the pull request body as well as the thread when a finding invalidates what the body claims. A reply under a description still saying the old thing closes nothing.
- Withdraw a finding on the thread it was posted to, with the reason. A withdrawal that reaches only the channel is lost at merge.

## Phase 3: rebase behind the merges

`stack-review` owns the merge order. Follow it rather than deriving one here.

As each branch merges, rebase every surviving branch above it and confirm the result before the next merge. `.claude/skills/stack-ship/SKILL.md` § Phase 3 owns the commands and what they are checked against.

Never read the mergeable flag as evidence the base is current. It reports clean on a stale branch whose content the trunk already holds, which is the state that merges the branch below a second time under the wrong title.

## What this delegates

Cite these rather than restating them. A step reimplemented here rots against the skill that owns it.

- `.claude/context/stacked-shipping.md` carries the git behavior under a stack and the four-role model
- `claude-address-review` owns how one finding is answered on one branch, applied here per branch
- `stack-review` owns the merge order and checks whether a push carried edits
- `stack-ship` owns the rebase mechanics behind each merge
- Root `CLAUDE.md` § Commands names the verify commands a fix runs
