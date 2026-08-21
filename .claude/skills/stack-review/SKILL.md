---
name: stack-review
description: Reviews a chain of stacked pull requests as one unit, testing each base against the head below it, reading every branch before posting anything, then posting a close-out on each and one handback naming the branch each finding sits on. Use when asked to "review the stack", "review the chain", "read all four pull requests", or "recommend the merge order". Do NOT use to review a single pull request, which is `claude-pr-review`, and do NOT use to fix what it finds, which is `stack-address`.
allowed-tools: Bash, Read, Grep, Glob, Skill
---

# Stack review

A stack is read as one unit or it is not read. Two branches can each be correct alone and wrong as a pair, and posting on the bottom while the top is still unread strands the chain.

Read `.claude/context/stacked-shipping.md` before the first branch. It carries how git behaves under a stack and why the thread outranks the session channel.

## Guards

- If the chain's branches and their bases cannot be resolved, stop: `❌ Cannot resolve the chain. Ask the worker which branch each pull request targets.`
- If the dispatch does not say the whole chain is open and pushed, stop: `❌ Chain not declared complete. A review of a partial chain is a review of nothing.`

## Phase 1: resolve the chain and test its bases

1. List every open pull request and read the base each targets. The chain is the order those bases form.
2. Trial-merge each branch against the head of the one below it with `git merge-tree --write-tree <base-head> <branch-head>`. It reports a conflict in one command, touches no working tree, and leaves no rebase to undo.
3. Report every stale base to the worker before reading anything. A branch based on a commit that no longer exists at the head of its own base is a rebase the worker owes, not a finding.
4. Read the merge base of each branch against the trunk head, and the file count on its diff against what the branch is meant to touch.

### Rules

- Test the bases first, never last. Findings posted on the bottom branch while the ones above are still being read get fixed inside the hour, which strands every branch above on a commit that no longer exists.
- Never accept the mergeable flag as evidence a base is current. It reports clean on a stale branch whose content the trunk already holds, and the two branches of one chain reported opposite symptoms from that single cause.
- Resolve the dispatch target by naming it rather than by looking it up. A session listing reported four branches as held by nobody while one session held every one, because linked worktrees surface as neither. Open by naming the worktree and branch the reader is believed to hold, and ask to be corrected.

## Phase 2: read every branch before posting anything

1. Read each branch bottom to top, each against the head of the one below rather than against the trunk.
2. Hold every finding. Post nothing until the last branch is read.
3. Read the chain a second time as a whole, looking for the defect no single branch carries.

### Rules

- Look for the pair that is correct twice and wrong together. One branch renumbered a set of values that a second branch's observer then overwrote, and each read clean alone. Nothing but holding all of them at once finds that.
- Apply the observability test `.claude/skills/stack-ship/SKILL.md` § Phase 1 states to every slice, since a cut that failed it reads as a clean coherent change on the branch it sits on.
- Re-read a branch only when its content moved. `git diff <reviewed-oid> <new-head>` reports empty on a pure rebase, which settles it in one command. A full re-read was paid twice on one run before this was written down.

## Phase 3: close every thread

The operator merges by reading the thread, so every branch owes a visible close-out every time, which on a stack is one per branch rather than one per stack.

1. Post a pass on every branch, including branches carrying no finding. A thread with no closing comment reads as one nobody answered.
2. Post a close-out after a pure rebase as well. No pass is owed and a close-out still is, because the standing one names a commit the branch no longer carries and reads as a review predating the head whatever the trees say. Name the comparison that cleared it.
3. Post one handback covering the whole stack, naming the branch each finding sits on.
4. State the merge order and what each merge unlocks.

### Rules

- Route by what a later reader needs. The thread carries anything that decides a merge and the session channel carries everything else, since the channel is scrollback that dies with the session.
- A finding answered anywhere other than the thread does not close it. A fix reported only through the channel, or a correction posted only as a reply while the description still says the old thing, both leave the operator reading a branch that looks unresolved.
- Correct the pull request body as well as the thread when a finding invalidates something the body claims.

## The merge order

This section owns the order. `stack-ship` and `stack-address` cite it rather than deriving one.

1. Merge the bottom branch first, always. It is the only one the checks gate.
2. That merge retargets the branch above onto the trunk and gives it checks for the first time.
3. Wait for those checks, then merge it, and repeat upward.
4. Between each merge the worker rebases every surviving branch, so nothing merges on a base a merge has moved.

The order is forced rather than chosen, because `verify.yml` fires on a pull request targeting the trunk alone. Read it as the consequence of that trigger, so a reader can tell which half moves if the trigger does. See `.claude/context/stacked-shipping.md` § The merge order is forced by the check trigger.

## What this delegates

Cite these rather than restating them. A step reimplemented here rots against the skill that owns it.

- `.claude/context/stacked-shipping.md` carries the git behavior under a stack and the four-role model
- `claude-pr-review` owns what a review looks for on one branch, applied here per branch
- `stack-ship` cut the chain and rebases it behind each merge
- `stack-address` receives the handback and fixes every branch in one pass
