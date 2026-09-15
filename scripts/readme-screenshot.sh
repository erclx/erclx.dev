#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/lib/preview-server.sh"

SCREENSHOT_BASE_URL="http://localhost:$PREVIEW_PORT" SCREENSHOT_FILTER="header/desktop" bun e2e/screenshot.ts

mkdir -p .github/evidence/readme
cp .canon/review/screenshots/header/desktop--light.png .github/evidence/readme/light.png
cp .canon/review/screenshots/header/desktop--dark.png .github/evidence/readme/dark.png
