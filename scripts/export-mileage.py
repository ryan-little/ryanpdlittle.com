#!/usr/bin/env python3
"""Export the public mileage aggregates from Basecamp into data/mileage.json.

Basecamp already owns the pacing math (src/metrics/mileage.ytd_pacing) and the
definition of which activity types count toward the annual goal
(MILEAGE_ACTIVITIES, which deliberately excludes multi_sport parents so their
child walking/running legs aren't double-counted). This script imports both
rather than reimplementing either, so the blog can never drift from the coach.

Privacy boundary: this writes to a public site, so the whitelist below is the
whole contract. Only aggregates leave the database. Heart rate, sleep, weight,
readiness, and per-activity rows stay in Basecamp, and that rule lives here in
the exporter rather than in the Hugo template, because the template only ever
sees what this file chose to hand it.

Usage:
    python3 scripts/export-mileage.py           # writes data/mileage.json
    python3 scripts/export-mileage.py --print   # dump to stdout, write nothing

Exits 0 and leaves any existing data/mileage.json untouched if the database
isn't reachable, so a build on a machine without Basecamp still works off the
last committed numbers.
"""

from __future__ import annotations

import argparse
import json
import sqlite3
import sys
from datetime import date
from pathlib import Path

BASECAMP = Path.home() / "Desktop" / "Projects" / "basecamp"
DB_PATH = BASECAMP / "data" / "basecamp.db"
OUT_PATH = Path(__file__).resolve().parent.parent / "data" / "mileage.json"

# Fields allowed onto the public site. Nothing else is written, ever.
PUBLIC_FIELDS = (
    "ytd",
    "goal",
    "pct_complete",
    "remaining",
    "required_weekly",
    "on_pace",
    "expected_pct",
    "elevation_ft",
    "updated",
)


def _load_basecamp():
    """Import Basecamp's mileage module, or return None if it isn't installed."""
    if not BASECAMP.is_dir():
        return None
    if str(BASECAMP) not in sys.path:
        sys.path.insert(0, str(BASECAMP))
    try:
        from src.metrics.mileage import (  # noqa: PLC0415
            ANNUAL_GOAL,
            MILEAGE_ACTIVITIES,
            ytd_pacing,
        )
    except ImportError:
        return None
    return ANNUAL_GOAL, MILEAGE_ACTIVITIES, ytd_pacing


def collect(today: date | None = None, db_path: Path = DB_PATH) -> dict | None:
    """Return the public mileage aggregates, or None if Basecamp is unavailable."""
    today = today or date.today()

    basecamp = _load_basecamp()
    if basecamp is None or not db_path.is_file():
        return None
    annual_goal, mileage_activities, ytd_pacing = basecamp

    placeholders = ", ".join("?" * len(mileage_activities))
    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    try:
        row = conn.execute(
            "SELECT COALESCE(SUM(distance_miles), 0) AS miles, "
            "COALESCE(SUM(elevation_gain_ft), 0) AS elev FROM activities "
            f"WHERE activity_type IN ({placeholders}) AND start_time >= ?",
            (*mileage_activities, f"{today.year}-01-01"),
        ).fetchone()

        goal_row = conn.execute(
            "SELECT target_value FROM goals WHERE id = 1"
        ).fetchone()
    finally:
        conn.close()

    goal = int(goal_row[0]) if goal_row and goal_row[0] else annual_goal
    pacing = ytd_pacing(row[0], today, goal=goal)

    data = dict(pacing)

    # Where even pacing would put you today. ytd_pacing() computes this
    # internally to decide on_pace but doesn't return it, and the meter needs
    # the number itself to draw its target marker. Mirrors the same formula
    # rather than inventing a second definition of "on pace".
    day_of_year = today.timetuple().tm_yday
    data["expected_pct"] = round(day_of_year / 365 * 100, 1)

    data["elevation_ft"] = round(row[1])
    data["updated"] = today.isoformat()

    return {k: data[k] for k in PUBLIC_FIELDS}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--print",
        dest="print_only",
        action="store_true",
        help="print the JSON instead of writing data/mileage.json",
    )
    args = parser.parse_args()

    data = collect()
    if data is None:
        print(
            f"basecamp database not found at {DB_PATH}; leaving "
            f"{OUT_PATH.name} as-is",
            file=sys.stderr,
        )
        return 0

    payload = json.dumps(data, indent=2) + "\n"
    if args.print_only:
        print(payload, end="")
        return 0

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(payload)
    print(
        f"wrote {OUT_PATH} — {data['ytd']} / {data['goal']} mi "
        f"({data['pct_complete']}%)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
