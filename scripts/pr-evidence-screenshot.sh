#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/lib/preview-server.sh"

SCREENSHOT_BASE_URL="http://localhost:$PREVIEW_PORT" SCREENSHOT_FILTER="desktop--light" bun e2e/screenshot.ts

mkdir -p .github/evidence/surfaces
for capture in .canon/review/screenshots/*/desktop--light.png; do
  surface=$(basename "$(dirname "$capture")")
  cp "$capture" ".github/evidence/surfaces/$surface.png"
done
