#!/usr/bin/env bash
# Re-encode any content image over the 500KB budget (see CONVENTIONS.md).
# Tries -q 75 first; drops to -q 70 if still over budget. Never resizes or
# changes format — just re-encodes in place with cwebp.
#
# Usage: scripts/optimize-images.sh [max_kb]

set -euo pipefail

MAX_KB="${1:-500}"
MAX_BYTES=$((MAX_KB * 1024))

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp not found (brew install webp)" >&2
  exit 1
fi

cd "$(dirname "$0")/.."

found=0
while IFS= read -r -d '' file; do
  size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
  if [ "$size" -le "$MAX_BYTES" ]; then
    continue
  fi
  found=1

  case "$file" in
    *.webp) src="$file" ;;
    *)
      echo "Skipping non-webp file (convert manually): $file"
      continue
      ;;
  esac

  tmp="${src}.opt.webp"
  cwebp -quiet -q 75 -m 6 "$src" -o "$tmp"
  new_size=$(stat -f%z "$tmp" 2>/dev/null || stat -c%s "$tmp")

  if [ "$new_size" -gt "$MAX_BYTES" ]; then
    cwebp -quiet -q 70 -m 6 "$src" -o "$tmp"
    new_size=$(stat -f%z "$tmp" 2>/dev/null || stat -c%s "$tmp")
  fi

  if [ "$new_size" -ge "$size" ]; then
    rm -f "$tmp"
    echo "$src: $((size / 1024))KB -> re-encode not smaller, kept original"
    continue
  fi

  mv "$tmp" "$src"
  echo "$src: $((size / 1024))KB -> $((new_size / 1024))KB"
done < <(find content -type f -iname '*.webp' -size +"${MAX_KB}"k -print0)

if [ "$found" -eq 0 ]; then
  echo "No images over ${MAX_KB}KB."
fi
