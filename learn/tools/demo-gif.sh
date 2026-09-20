#!/usr/bin/env bash
# Turn the newest demo recording into the README's hero GIF.
#
#   cd learn/web && npx playwright test -c playwright.demo.config.ts
#   bash learn/tools/demo-gif.sh
#
# Two-pass palette (one global palette, then Floyd–Steinberg dithering against it)
# is what keeps a 900 px screen recording of flat UI under 3 MB without banding.
# gifsicle -O3 --lossy is applied afterwards when it happens to be installed.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo="$(cd "$here/../.." && pwd)"
src="${1:-$(ls -t "$repo"/learn/web/e2e/.demo-results/*/video.webm | head -1)}"
out="${2:-$repo/docs/assets/demo.gif}"

mkdir -p "$(dirname "$out")"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

# 12 fps and 900 px are the README budget; `head` drops the blank frames before the
# first paint. A Bayer dither compresses flat UI far better than Floyd-Steinberg's
# noise does. 96 colours rather than 128 keeps the file under the README's 3 MB
# budget now that the loop types a longer answer; the UI has few enough flat tones
# that the difference is not visible.
filters="fps=12,scale=900:-1:flags=lanczos"
head="0.6"
ffmpeg -v error -y -ss "$head" -i "$src" \
  -vf "$filters,palettegen=max_colors=96:stats_mode=diff" "$tmp/pal.png"
ffmpeg -v error -y -ss "$head" -i "$src" -i "$tmp/pal.png" \
  -lavfi "$filters [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" \
  -loop 0 "$out"

if command -v gifsicle >/dev/null 2>&1; then
  gifsicle -O3 --lossy=65 "$out" -o "$tmp/opt.gif" && mv "$tmp/opt.gif" "$out"
fi

printf '%s  %s  %s\n' "$out" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")s" \
  "$(du -h "$out" | cut -f1)"
