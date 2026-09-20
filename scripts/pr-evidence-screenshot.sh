#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/lib/preview-server.sh"

SURFACES=(header about experience projects looking-for footer canon jobtriage diction stackr caret)

SCREENSHOT_BASE_URL="http://localhost:$PREVIEW_PORT" SCREENSHOT_FILTER="desktop--light" bun e2e/screenshot.ts

mkdir -p .github/evidence/surfaces
for surface in "${SURFACES[@]}"; do
  cp ".canon/review/screenshots/$surface/desktop--light.png" ".github/evidence/surfaces/$surface.png"
done
