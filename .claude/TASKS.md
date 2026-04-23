# Tasks

Track what is being built and why, at the level of features and outcomes. No code-level steps or technical decisions. Those live in `ARCHITECTURE.md`. Update this doc whenever a task is started, completed, or scope changes.

When a task needs execution detail beyond this board, create a plan in `.claude/plans/` and add a `Plan:` line under the title pointing to it. On ship, delete the plan file.

What belongs:

- Task entries describing observable behavior: short bullet per item, one outcome per line
- A test strategy line per task block: the mechanism and what is being verified, not specific file or method names
- Inline notes on blockers or dependencies, attached to the relevant Up next entry

What does not belong:

- Class names, file paths, function names, or prop names in any entry or section title
- "In progress" or "Blocked" sections. Note these inline on the Up next entry instead.
- Code-level steps or implementation details (behavioral specifics are fine)

Title form by task type:

- Feature: outcome describing what the user can now do
- Fix: problem statement describing what is wrong
- Chore: imperative describing what is being done

One section only: Up next. Completed blocks stay in Up next until archived manually. Do not move them automatically. When Up next has no real tasks, keep the `### Nothing queued` placeholder. Remove it when adding the first real task.

Task block format. Include the `Plan:` line only when a `.claude/plans/` file exists for the task:

```markdown
### Title

Plan: .claude/plans/feature-<slug>.md

- [ ] Outcome: what done looks like
- [ ] Outcome: what done looks like

> Test strategy: <unit | component | e2e | visual | manual>, what is being verified
```

## Up next

### Visitors see the v1 landing page at the apex

Plan: .claude/plans/feature-landing-v1.md

- [ ] Visitors land on erclx.dev and see identity, role, headline, and contact links above the fold
- [ ] Visitors scroll to a narrative section describing what Eric does and why
- [ ] Visitors see project cards for Stackr, Caret, and Toolkit with concise descriptions
- [ ] Visitors find identity links and a downloadable resume in the footer
- [ ] Page title and meta description reflect the site, not the Astro scaffold default
- [ ] README explains what the repo is and how to run it locally

> Test strategy: e2e visits the apex and asserts each section is visible by role or test ID, plus a screenshot pair for desktop and mobile widths

### Wire dark mode so prefers-color-scheme actually applies

- [ ] Visitors arriving with system dark mode see the dark theme on first paint
- [ ] Theme tokens swap without a flash of the wrong scheme
- [ ] Screenshot pair for light and dark renders byte-different output

> Test strategy: visual, screenshot diff between forced light and forced dark using emulateMedia plus the `.dark` class on `documentElement`
