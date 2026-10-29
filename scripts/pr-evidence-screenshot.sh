#!/usr/bin/env bash
set -euo pipefail

# Recaptures the committed surface frames. A bare run starts from scratch, so a
# case removed from e2e/capture/cases.ts leaves no stale frame behind. Section
# names narrow the run to those sections' frames, which the capture overwrites
# in place, so a change to one section leaves every other committed frame
# untouched and a name the capture rejects deletes nothing.
if [ "$#" -eq 0 ]; then
  rm -rf .github/evidence/surfaces
else
  names=$(printf '%s,' "$@")
  export SCREENSHOT_SECTIONS="${names%,}"
fi

SCREENSHOT_FILTER="--default" bash "$(dirname "${BASH_SOURCE[0]}")/screenshot.sh"
