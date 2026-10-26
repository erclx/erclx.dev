#!/usr/bin/env bash
set -euo pipefail

# Recaptures the committed surface frames from scratch, so a case removed from
# e2e/capture/cases.ts leaves no stale frame behind.
rm -rf .github/evidence/surfaces

SCREENSHOT_FILTER="--default" bash "$(dirname "${BASH_SOURCE[0]}")/screenshot.sh"
