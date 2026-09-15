---
description: Post-implementation check, PR body hygiene, and push-signal discipline
---

# Shipping standards

## Before a PR

- After implementing a feature, run `bun run check` plus the test suite for the surfaces touched. Fix failures before opening a PR
- Keep PR bodies evergreen. Put run logs, follow-up notes, and polish narratives into PR comments via `gh pr comment`, never the body

## Push discipline

- After a local commit on a feature branch, stop and hand control back. Push only on a signal after browser verification
- Do not treat a user-invoked skill that pushes by design (`git-ship`, `git-followup`) as authorization beyond that one invocation. A manual edit made between skill invocations needs a fresh push signal
- Do not commit between visual-tuning iterations or between items in a multi-item batch. Hold the diff across multi-step flows and commit on explicit ship signal, via `git-stage` for focused commits
