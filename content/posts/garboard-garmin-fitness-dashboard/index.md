---
title: "Garboard — A Fitness Dashboard That Outgrew Its AI"
date: 2026-03-31
tags: ["python", "ai", "fitness", "garmin", "fastapi"]
group: "projects"
project: "Garboard"
summary: "I built a fitness dashboard with AI agents as the backend, then stripped them out. What survived: Garmin integration, training load math, and a daily summary trick that reconstructs untracked activity from passive watch data."
draft: true
---

Most AI fitness apps bolt a chatbot onto a workout tracker. I wanted the opposite — a real dashboard where AI handles the thinking without a chat interface at all. So I built one, and then I ripped the AI out.

## The Vision (v0.1)

<!-- TODO: Four agents (fitness, nutrition, food recognition, chat orchestrator). Claude Code CLI (claude -p) as async subprocess. Prompt templates as the "agent" logic. SQLite for persistence. Garmin integration, USDA nutrition API, Google Places for restaurants. The full vision. -->

## What Survived (v0.2)

<!-- TODO: Stripped the AI agents entirely. Kept: Garmin sync, ACWR training load, HR zone analysis, rule-based training guidance, mileage quest with XP/leveling, achievements. The rule engine replaced the AI for daily recommendations. FastAPI + SQLite + vanilla frontend. Chart.js for trends. -->

## Why the AI Agents Got Cut

<!-- TODO: Honest take — the AI layer added latency and cost without being meaningfully better than rules for daily workout recommendations. The rule engine (readiness + ACWR + recent activity pattern) is fast, free, and deterministic. Now I just use Claude Code chat conversationally for workout recs when I want them. -->

## The Garmin Daily Summary Trick

My watch said I was detraining. I was actually hauling furniture up three flights of stairs.

I'd been consistently active through all of February, running and hiking and walking almost every day, and then I got sick, moved apartments, and went a week without recording a single activity. My Garmin Instinct 2X showed DETRAINING with an acute-to-chronic workload ratio of 0.1, but those move days weren't rest days, my body knew it even if my watch didn't.

<!-- TODO: The gap — Feb training consistency, then sick + move, the ACWR cliff -->

### What Your Watch Tracks Without an Activity

<!-- TODO: Steps, floors, HR (all-day), active calories, intensity minutes, stress — all passively tracked 24/7. The data is there, it's just not in your activity log. -->

### Pulling the Data with Python

<!-- TODO: garminconnect library, get_user_summary() and get_heart_rates(), what the return data looks like -->

```python
# Example: pulling daily summary for a specific date
stats = client.get_user_summary('2026-02-27')
# Steps: 15,608 | Floors: 70 | Active cal: 1,817 | HR max: 157
```

### Synthesizing Activities

<!-- TODO: Creating synthetic entries with real physiological data, what fields to populate, what to leave null (GPS, start_lat/lon). Before/after training status view. -->

## What I'd Bring Back

<!-- TODO: Food recognition from photos is genuinely useful. Chat for ad-hoc questions. But daily recommendations work fine as rules + occasional Claude Code conversation. -->
