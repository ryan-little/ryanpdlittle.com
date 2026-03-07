---
title: "The Garmin Daily Summary Trick — Reconstructing Untracked Activity"
date: 2026-03-03
tags: ["fitness", "python", "garmin"]
group: "projects"
project: "ClaudeFit"
summary: "My watch said I was detraining. I was actually hauling furniture up three flights of stairs. Here's how I used Garmin's passive tracking data to fill the gap."
draft: true
---

My watch said I was detraining. I was actually hauling furniture up three flights of stairs.

I'd been consistently active through all of February, running and hiking and walking almost every day, and then I got sick, moved apartments, and went a week without recording a single activity. My Garmin Instinct 2X showed DETRAINING with an acute-to-chronic workload ratio of 0.1, but those move days weren't rest days, my body knew it even if my watch didn't.

## The Gap

<!-- TODO: Feb training consistency, then sick + move, the ACWR cliff from 478 chronic to 69 acute -->

## What Your Watch Tracks Even Without an Activity

<!-- TODO: Steps, floors, HR (all-day), active calories, intensity minutes, stress — all passively tracked 24/7. The data is there, it's just not in your activity log. -->

## Pulling the Data with Python

<!-- TODO: garminconnect library, get_user_summary() and get_heart_rates(), what the return data looks like -->

```python
# Example: pulling daily summary for a specific date
stats = client.get_user_summary('2026-02-27')
# Steps: 15,608 | Floors: 70 | Active cal: 1,817 | HR max: 157
```

## Synthesizing Activities

<!-- TODO: Creating synthetic entries with real physiological data, what fields to populate, what to leave null (GPS, start_lat/lon) -->

## The Result

<!-- TODO: Before/after training status view, the move days now visible in the log, more accurate load picture -->

## When This Is Useful

<!-- TODO: Moving, manual labor, forgot to start activity, active vacation days, yard work — any time you were physically active but didn't record it -->
