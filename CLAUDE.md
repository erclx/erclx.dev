# erclx.dev

Personal landing site. Astro v6 static build with Tailwind v4, deployed to Cloudflare Pages at https://erclx.dev.

## Context

The project uses a three-tier context model. Know which tier holds what before reading or writing:

- Always loaded: root `CLAUDE.md`, `.claude/REQUIREMENTS.md`, `.claude/ARCHITECTURE.md`, and the `.claude/context/index.md` and `.claude/wireframes/index.md` discovery anchors. Project-wide invariants, product scope, and the anchors for on-demand domain and surface context.
- Path-scoped lazy: `.claude/rules/*.md` with `paths:` frontmatter. Coding standards that load only when files matching the glob are touched. Always-on rules apply every session.
- On-demand lookup: `.claude/context/<domain>.md` entries and `.claude/wireframes/<surface>.md` surfaces. Per-domain narrative and per-surface layout, loaded only when that domain or surface is touched. Use the always-loaded index files to pick which to read.

`claude-docs` populates context entries at ship time.

@.claude/REQUIREMENTS.md
@.claude/ARCHITECTURE.md
@.claude/context/index.md
@.claude/wireframes/index.md

## Behavior

- Flag concerns or alternatives when a proposed change has tradeoffs worth discussing
- When facing a judgment call with 2-3 reasonable options mid-flow, pick one and state the tradeoff in one sentence. Enumerate options only when the user's preference is the deciding factor.
- Match edit scope to the request. Ship minimal v1 and queue extensions as follow-ups.
- On simplification requests, edit only what the user named
- Do not add features the user did not ask for
- When rewriting a section, preserve existing code blocks, tables, and grouped examples unless the user asked to remove them
- This is a public repo. Do not write personal names into READMEs, `.claude/` planning docs and context entries, source comments, or commit messages. Use neutral phrasing like "the user", "a recruiter", or "a local file".
- Do not cite `.claude/` paths (tasks, plans, review, `.tmp`) from PR bodies, READMEs, or other artifacts a reviewer reads. Inline the context or use neutral phrasing like "queued as a follow-up".
- Before any multi-path `rm` or `rm -rf`, list every target path in chat and wait for explicit confirmation. "Clean up X" authorizes a different destructive action than a previous one, never a blanket nuke.
- Before proposing a new doc home for a convention (screenshot output path, fixture format, scratch convention), grep `CLAUDE.md` and `.claude/context/` for the topic. Extend the existing entry over creating a new section.

## Markdown

- Before writing a PR, commit, or branch name, read its standard with `canon standards <name>` and follow it. No standard installs into this repository, so that verb is the only route to one. File-edit standards route automatically via `.claude/rules/canon/claude/`.

## Commands

- Run `bun run check` before committing. Full script reference in `.claude/context/development.md`.

## Shipping

- After implementing a feature, run `bun run check` plus any test suite for the surfaces you touched. Fix what fails before opening a PR.
- After implementing a feature, run it end-to-end against the real surface (deployed preview, live page) and paste the output into the PR body under a `## Live smoke` section. If a live run is impossible, say so explicitly instead of claiming success.
- Keep PR bodies evergreen. Beyond the `## Live smoke` block, run logs, follow-up notes, and polish narratives go into PR comments via `gh pr comment`, not the body.
- After a local commit on a feature branch, stop and hand control back. Push only when the user signals after browser verification. User-invoked skills that push by design (`git-ship`, `git-followup`) are exempt for that invocation only. Manual edits made between skill invocations require a fresh push signal.
- Hold the diff across multi-step flows. Do not commit between visual-tuning iterations or between items in a multi-item batch. Commit on explicit ship signal and use `git-stage` to split into focused commits at that point.

## Output

- Emit a URL the reader is meant to open as a markdown link carrying the URL as its target. A bare address and one in a code span both render as text they have to select and paste, and a served address is the one output whose whole value is being one click away.
- Hand an address meant for a phone or tablet over as a scannable code rather than as text, since no link form reaches a second device. Send one code per variant where several are served, because a query string typed by hand on a tablet is where a live comparison stops being worth running.

## Key paths

- `src/`: Astro source for the single-page site (pages, layouts, components, styles, assets)
- `.claude/`: planning docs (requirements, architecture, wireframes, design, tasks)
- `.claude/context/`: per-domain narrative (how a domain is structured, decisions, gotchas), indexed via `.claude/context/index.md`
- `.claude/wireframes/`: per-surface ASCII layouts loaded on demand, indexed via `.claude/wireframes/index.md`
- `.claude/rules/`: path-scoped coding standards loaded by Claude Code on file match
- `.claude/rules/project/`: the rules this repository authors, which no sync touches
- `.claude/canon/config.json`: the toolkit install stamp, recording what each domain was synced from
- `.canon/review/`: gitignored scratch for review and UI-test output, overwritten on each run
- `.canon/tasks/`: gitignored task board, one file per task
- `.canon/tasks/archive/` and `.canon/plans/archive/`: shipped tasks and their plans, nested inside the folders they archive
