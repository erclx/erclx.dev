# Project

[One-line description]

@.claude/LOCAL.md

## Context

- Check `.claude/` state docs (`TASKS.md`, `ARCHITECTURE.md`, `REQUIREMENTS.md`, `DESIGN.md`, `wireframes/`) for context before making changes, when present. The `claude-feature` skill reads them in parallel when planning a feature.
- Coding standards live in `.claude/rules/` and load automatically. Always-on rules apply every session. Path-scoped rules apply to files matching their `paths:` glob.

## Behavior

- Flag concerns or alternatives when a proposed change has tradeoffs worth discussing.
- When facing a judgment call with 2-3 reasonable options mid-flow, pick one and state the tradeoff in one sentence. Enumerate options only when the user's preference is the deciding factor.
- Match edit scope to the request. Ship minimal v1 and queue extensions as follow-ups. Edit only what the user named on simplification requests. Do not add features they did not ask for.
- When rewriting a section, preserve existing code blocks, tables, and grouped examples unless the user asked to remove them.
- When planning an edit to `CLAUDE.md`, show the proposed change as a fenced `diff` block in chat first, then wait for approval before calling `Edit`.
- This is a public repo. Do not write personal names into READMEs, `docs/`, `.claude/` planning docs, source comments, or commit messages. Use neutral phrasing like "the user", "a recruiter", or "a local file". Brief content under `.tmp/` is local context, not output.
- Do not cite `.claude/` paths (TASKS.md, plans, review, .tmp) from PR bodies, READMEs, or other artifacts a reviewer reads. Inline the context or use neutral phrasing like "queued as a follow-up".
- For deploy infrastructure (Vercel, Cloudflare), prefer CLI over the dashboard. Run inspection, redeploy, env-var, and domain commands from Bash rather than asking the user to click through. Confirm before destructive operations (delete project, force-push production, change live DNS).
- Before any multi-path `rm` or `rm -rf`, list every target path in chat and wait for explicit confirmation. "Clean up X" authorizes a different destructive action than a previous one, never a blanket nuke.
- Before proposing a new doc home for a convention (screenshot output path, fixture format, scratch convention), grep `CLAUDE.md` and `docs/` for the topic. Extend the existing entry over creating a new section.

## Indexes

- When a folder has an `index.md`, check it before reading individual files in that folder.
- For folders where an agent browses to pick a document, `index.md` is regenerated from each file's frontmatter. Do not hand-edit `index.md`. Code folders and scratch folders do not need one.
- Every `index.md` carries its own frontmatter (`title`, `subtitle`) that the walker preserves. To keep a folder's `index.md` hand-edited, add `auto: false` to its frontmatter.

## Markdown

- When editing any markdown file, follow `standards/prose.md`.
- Before writing or editing an artifact with a matching standard in `standards/` (READMEs, PRs, commits, branches, snippets, skills, prose), read that file first and follow it.
- When editing `README.md`, follow `standards/readme.md`. Keep it user-facing. Technical detail belongs in `docs/` or `.claude/`.

## Commands

- Run `bun run check` before committing. Full script reference in `docs/development.md`.

## Shipping

- After implementing a feature, run `bun run check` plus any test suite for the surfaces you touched. Fix what fails before opening a PR.
- After implementing a feature, run it end-to-end against the real surface (deployed preview, live page) and paste the output into the PR body under a `## Live smoke` section. If a live run is impossible, say so explicitly instead of claiming success.
- Keep PR bodies evergreen. Beyond the `## Live smoke` block, run logs, follow-up notes, and polish narratives go into PR comments via `gh pr comment`, not the body.
- After a local commit on a feature branch, stop and hand control back. Push only when the user signals after browser verification. User-invoked skills that push by design (`/toolkit:git-ship`, `/toolkit:git-followup`) are exempt for that invocation only. Manual edits made between skill invocations require a fresh push signal.
- Hold the diff in the worktree across multi-step flows. Do not commit between visual-tuning iterations or between items in a multi-item batch. Commit on explicit ship signal and use `/toolkit:git-stage` to split into focused commits at that point.
- After pushing a UI branch and stopping short of opening the PR, end with the running dev-server URL and a 4-7 item visual-review checklist (hierarchy, breakpoints, animation triggers, dark mode, narrow-viewport overflow, regressions).

## Local development

- Keep `bun run dev` running in the background on port 4321 during landing-page sessions so visual changes are immediately visible at http://localhost:4321.
- Screenshots run through `bun run screenshot` and bind a separate preview server on port 4173 (`PREVIEW_PORT=4173 bash scripts/screenshot.sh`) so they do not collide with the dev server.
- Pass `SCREENSHOT_FILTER=<section>[,<section>]` to limit capture to specific sections (`header`, `origin`, `projects`, `looking-for`, `footer`). Use it on targeted polish loops so only the touched sections re-snap. Omit it for full-page verification before a PR.
- Outputs land in `.claude/review/screenshots/` (gitignored), named `<route>--<theme>.png`. Read them with the Read tool to verify changes. Both themes render: `--light` by default and `--dark` via `emulateMedia`.

## UI conventions

- Outbound links default to same-tab. Use `target="_blank" rel="noopener"` only when the link opens a long-form resource the visitor likely wants to keep open while the page stays in another tab (resume PDFs, long-form articles).
- Before proposing a UI change, read the current `.claude/review/screenshots/` for the surfaces involved. ASCII wireframes do not capture color, weight, or visual-element collisions. Rendered captures do.
- After editing any file under `src/components/`, `src/layouts/`, `src/pages/`, or `src/styles/global.css`, re-run `bun run screenshot` and verify the diff before reporting work as done.

## Output

- After creating or modifying a file, include its path on its own line so terminal emulators can make it clickable. Do not paraphrase paths into prose ("the seeds folder", "your CLAUDE.md").
- Use the path the user's editor can resolve. The editor is rooted at the main project root.
- In the main worktree: relative from `pwd` works because `pwd` equals the editor root.
- In a linked worktree (under `.claude/worktrees/<name>/`): use absolute paths. Relative paths from worktree `pwd` would not resolve against the editor's project root.
- When the response covers multiple files, group paths under headers: `**Created:**`, `**Modified:**`, `**Deleted:**`. For single-file changes, the path on its own line is enough.

## Playwright MCP

- The Playwright MCP server is configured in `.mcp.json` and runs via `bunx @playwright/mcp@latest`. Use it when verification needs interaction (hover states, responsive viewports, link clicks, computed-style inspection) rather than a static screenshot diff.
- Reach for screenshots when checking pure layout or content-vs-canonical-source. Reach for Playwright MCP when checking behavior, accessibility, or anything that requires the page to react to input.

## Key paths

- `src/`: Astro source for the single-page site (pages, layouts, components, styles, assets)
- `.claude/`: planning docs (requirements, architecture, wireframes, design, tasks)
- `.claude/review/`: gitignored scratch for review and UI-test output, overwritten on each run
- `.claude/TASKS.md`: gitignored task board

## Spelling

- When cspell flags a word, rewrite typos. Add real terms to the appropriate dictionary in `cspell.json`.
- Keep dictionary files sorted alphabetically.

## Snippets

- When a snippet is referenced with `@`, execute its instructions immediately using available session context.

## Tasks

- `.claude/TASKS.md` is gitignored local session scratch. Use it freely without worrying about staging or reverting before commits.
- Only create a task for work that spans multiple sessions or has real dependencies. Handle small edits immediately without a task entry.
- Do not add tasks retroactively for work already completed. Completed work is visible in git.
- When a task needs execution detail beyond `.claude/TASKS.md`, create a plan in `.claude/plans/` and link to it from the task block's intro paragraph. When that task ships, delete its plan file.
- Write the plan in the same session as the task block. The session that executes the plan later inherits reasoning context it would otherwise have to re-derive.

## Memory

- Write all memory files to `.claude/memory/`, not `~/.claude/projects/`.
- Save a feedback memory only when the same mistake happens twice in the session, or when the user explicitly corrects you. First-occurrence slips are noise.
- Keep feedback memories to 3 lines: the rule, a one-line Why, and a one-line How to apply. Capture the pattern, not the recovery narrative.
- Before creating a new memory file, check for an existing one on the same topic. Update rather than duplicate.

## Scratch

- Write temporary files to `.claude/.tmp/<slug>/<file>.md` in the project root. Use a kebab-slug tied to the topic. Never use `/tmp` or a flat `<slug>-<file>.md`.

## Worktrees

- Shared session scratch (`.claude/plans/`, `.claude/review/`, `.claude/memory/`) lives at the main worktree root, not inside a linked worktree. From a linked worktree, resolve these paths against the main root via `git worktree list --porcelain | awk '/^worktree /{print $2}' | head -1`. Fall back to `pwd` if not a git repo.
- From a linked worktree, every `Edit` or `Write` to a tracked file (source, docs, `TASKS.md`) must use a path starting with `pwd`. Only untracked scratch (`.claude/plans/`, `.claude/review/`, `.claude/memory/`) resolves to the main worktree root.
