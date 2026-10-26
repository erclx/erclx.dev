#!/usr/bin/env bash
set -euo pipefail

# Project-specific. The README shows the landing page's header section alone,
# so the frame comes from that section's own capture rather than the page.
README_FILTER='home/1280'
README_SECTION='header'
README_EVIDENCE_DIR='.github/evidence/readme'

source "$(dirname "${BASH_SOURCE[0]}")/lib/preview-server.sh"

SCREENSHOT_BASE_URL="http://localhost:$PREVIEW_PORT" SCREENSHOT_FILTER="$README_FILTER" bun e2e/screenshot.ts

# The filter's case and viewport name the folder and the file prefix the
# capture wrote under screenshots/<hostname>/, and each section sits one
# folder below its case.
frame_dir="screenshots/localhost/$(dirname "$README_FILTER")/$README_SECTION"
frame_prefix="$(basename "$README_FILTER")"

mkdir -p "$README_EVIDENCE_DIR"
cp "$frame_dir/$frame_prefix--default.png" "$README_EVIDENCE_DIR/light.png"
cp "$frame_dir/$frame_prefix--dark.png" "$README_EVIDENCE_DIR/dark.png"
