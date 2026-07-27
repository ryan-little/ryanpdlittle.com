#!/usr/bin/env python3
"""Shrink GPS track JSON by dropping meaningless coordinate precision.

The exported tracks carry lat/lon at full float repr (17 significant digits,
e.g. 36.45318397320807). A Garmin watch is accurate to a few meters; the 6th
decimal place is already 0.11 m, and everything past it is noise that costs
about 25 bytes per point to transmit.

This rounds coordinates to 5 decimals (~1.1 m), elevation to 0.1 ft, and
writes compact JSON with no whitespace. It does NOT drop points, so the
elevation profile and the highest-point peak marker are bit-for-bit the same
features they were before.

Idempotent: running it twice changes nothing the second time.

    python3 scripts/trim-tracks.py [--dry-run]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "posts"

COORD_DP = 5   # ~1.1 m at the equator
ELE_DP = 1     # tenths of a foot


def trim_point(pt: dict) -> dict:
    out = dict(pt)
    for key in ("lat", "lon"):
        if isinstance(out.get(key), float):
            out[key] = round(out[key], COORD_DP)
    if isinstance(out.get("ele"), float):
        out["ele"] = round(out["ele"], ELE_DP)
    if isinstance(out.get("hr"), float) and out["hr"].is_integer():
        out["hr"] = int(out["hr"])
    return out


def trim_obj(obj):
    """Walk any of the shapes these files come in and trim every points list."""
    if isinstance(obj, list):
        return [trim_obj(o) for o in obj]
    if isinstance(obj, dict):
        if "points" in obj and isinstance(obj["points"], list):
            obj = dict(obj)
            obj["points"] = [trim_point(p) for p in obj["points"]]
            return obj
        return {k: trim_obj(v) for k, v in obj.items()}
    return obj


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    files = sorted(CONTENT.glob("*/*.json"))
    if not files:
        print("no track JSON found", file=sys.stderr)
        return 1

    before = after = 0
    for f in files:
        try:
            data = json.loads(f.read_text())
        except json.JSONDecodeError as exc:
            print(f"  skip {f.relative_to(ROOT)}: {exc}")
            continue

        orig = f.stat().st_size
        payload = json.dumps(trim_obj(data), separators=(",", ":"))
        new = len(payload.encode())

        before += orig
        after += new

        if not args.dry_run and new < orig:
            f.write_text(payload)

        pct = (1 - new / orig) * 100 if orig else 0
        print(f"  {orig // 1024:4d}KB -> {new // 1024:4d}KB  ({pct:4.1f}% off)  {f.relative_to(ROOT)}")

    print(f"\ntotal {before // 1024}KB -> {after // 1024}KB "
          f"({(1 - after / before) * 100:.1f}% smaller)"
          f"{'  [dry run, nothing written]' if args.dry_run else ''}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
