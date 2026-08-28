#!/usr/bin/env bash

# Routes a shell command that authors prose to the standard governing it.
#
# The path-scoped rules under `.claude/rules/claude/` load on a file edit, so
# every authoring surface that writes a file is already covered. A pull request
# body written through `gh`, a commit message passed with `-m`, and a branch
# name given to `git checkout -b` write no file at all, so nothing in that
# system can fire and the standard goes unread. This closes those three.
#
# Advisory rather than blocking. The standard is a shape to write toward rather
# than a gate to pass, and a session that has already read it should not have to
# argue with a hook to proceed.

# Claude Code sends a payload and closes stdin. A bare read with nothing feeding
# it blocks forever and holds the session open, so the read is bounded. `read`
# rather than `timeout cat`, which macOS does not ship.
IFS= read -r -d '' -t 2 input
[ -n "$input" ] || {
  printf '%s reads a Claude Code hook payload on stdin and cannot be run by hand.\n' "${0##*/}" >&2
  exit 1
}

tool=$(printf '%s' "$input" | jq -r '.tool_name // empty')
[ "$tool" = Bash ] || exit 0

command=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
[ -n "$command" ] || exit 0

matches() {
  printf '%s' "$command" | grep -qE "$1"
}

# First match wins, so a command authoring one kind of text never draws a second
# reminder. Each test is for the writing form alone: `gh pr edit` reaching only
# for a title or a body, `git commit` that is not an amend keeping its message,
# and the branch forms that name one rather than list or delete one.
#
# The branch rows read the flag apart from the subcommand, since `checkout` and
# `switch` both take flags before it and `git checkout --track -b feat/x` would
# otherwise be missed.
#
# Each row takes every flag that names a branch rather than the one a session
# happens to type, because two passes of naming them one at a time each left
# forms behind: the short flag without its force twin, then the short pair
# without their long forms. A rename and a copy name a branch as much as a
# creation does, and `--orphan` names one on both subcommands.
standard=""
if matches '\bgh pr create\b'; then
  standard='pr'
elif matches '\bgh pr edit\b' && matches '[-][-](title|body)\b'; then
  standard='pr'
elif matches '\bgit commit\b' && ! matches '[-][-]no-edit\b'; then
  standard='commit'
elif matches '\bgit checkout\b' && matches ' (-[bB]\b|--orphan\b)'; then
  standard='branch'
elif matches '\bgit switch\b' && matches ' (-[cC]\b|--(create|force-create|orphan)\b)'; then
  standard='branch'
elif matches '\bgit branch +(-[mMcC]\b|--(move|copy)\b|[^-])'; then
  standard='branch'
fi

[ -n "$standard" ] || exit 0

root="${CLAUDE_PROJECT_DIR:-.}"

case "$standard" in
pr) governs="a pull request title and body" ;;
commit) governs="a commit message" ;;
branch) governs="a branch name" ;;
esac

# A standard resolves only through `aitk`, and this hook is the sole enforcer for
# the three writing surfaces its header names, so a missing binary is reported
# the way `standards-audit.sh` and `tasks-index.sh` report theirs rather than
# exiting clean, which `575-hooks` bars for an only enforcer.
if ! command -v aitk >/dev/null 2>&1; then
  msg=$(printf 'Standards-reminder: cannot point at the %s standard for %s. No `aitk` binary on PATH. Install one with `bun add -g @erclx/aitk`.' "$standard" "$governs")
  jq -nc --arg msg "$msg" '{hookSpecificOutput:{hookEventName:"PreToolUse",additionalContext:$msg}}'
  exit 0
fi

# Once per session per standard. Without this the commit row alone would speak
# on every commit of a run, which is the noise that gets a hook switched off.
session=$(printf '%s' "$input" | jq -r '.session_id // "none"')
key=$(printf '%s__%s' "$session" "$standard" | tr -c 'A-Za-z0-9' '_')
marker_dir="$root/.claude/.tmp/standards-reminder"
marker="$marker_dir/$key"
[ -f "$marker" ] && exit 0
mkdir -p "$marker_dir"
: >"$marker"

msg=$(printf 'This command writes %s, which the %s standard governs. Read it with `aitk standards %s` before writing one rather than working the shape from memory. The %s skill reads it first and is the route that cannot skip it.' \
  "$governs" "$standard" "$standard" "git-$standard")
jq -nc --arg msg "$msg" '{hookSpecificOutput:{hookEventName:"PreToolUse",additionalContext:$msg}}'
