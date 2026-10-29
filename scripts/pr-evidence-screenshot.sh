#!/usr/bin/env bash
set -euo pipefail

# Recaptures the committed surface frames. A bare run starts from scratch, so a
# case removed from e2e/capture/cases.ts leaves no stale frame behind. Section
# names narrow the run to those sections' frames, so a change to one section
# leaves every other committed frame untouched.
if [ "$#" -eq 0 ]; then
  rm -rf .github/evidence/surfaces
else
  for name in "$@"; do
    if [[ ! "$name" =~ ^[a-z0-9-]+$ ]]; then
      echo "Invalid section name: $name" >&2
      exit 1
    fi
  done
  export SCREENSHOT_SECTIONS="${*// /,}"
  for name in "$@"; do
    rm -rf ".github/evidence/surfaces/home/$name"
  done
fi

SCREENSHOT_FILTER="--default" bash "$(dirname "${BASH_SOURCE[0]}")/screenshot.sh"
