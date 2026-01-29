#!/usr/bin/env bash
# Download F1 2026 team car images in one shot.
# Run from repo root: ./scripts/download-team-cars.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUT_DIR="$REPO_ROOT/frontend/public/team-cars"
BASE="https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000000/common/f1/2026"

mkdir -p "$OUT_DIR"
cd "$OUT_DIR"

curl -sS -o 2026alpinecarright.webp "$BASE/alpine/2026alpinecarright.webp"
curl -sS -o 2026astonmartincarright.webp "$BASE/astonmartin/2026astonmartincarright.webp"
curl -sS -o 2026williamscarright.webp "$BASE/williams/2026williamscarright.webp"
curl -sS -o 2026audicarright.webp "$BASE/audi/2026audicarright.webp"
curl -sS -o 2026cadillaccarright.webp "$BASE/cadillac/2026cadillaccarright.webp"
curl -sS -o 2026ferraricarright.webp "$BASE/ferrari/2026ferraricarright.webp"
curl -sS -o 2026haasf1teamcarright.webp "$BASE/haasf1team/2026haasf1teamcarright.webp"
curl -sS -o 2026mclarencarright.webp "$BASE/mclaren/2026mclarencarright.webp"
curl -sS -o 2026mercedescarright.webp "$BASE/mercedes/2026mercedescarright.webp"
curl -sS -o 2026racingbullscarright.webp "$BASE/racingbulls/2026racingbullscarright.webp"
curl -sS -o 2026redbullracingcarright.webp "$BASE/redbullracing/2026redbullracingcarright.webp"

echo "Downloaded 11 team car images to $OUT_DIR"
ls -la
