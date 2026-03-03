---
title: "ClaudeFit — Building a Fitness Dashboard with AI as the Backend"
date: 2026-03-03
tags: ["python", "ai", "fitness", "fastapi"]
group: "projects"
project: "ClaudeFit"
summary: "A personal fitness app where Claude Code CLI is the intelligence layer — not a chatbot, but the actual backend. Here's the architecture and what survived the v0.2 refactor."
draft: true
---

Most AI fitness apps bolt a chatbot onto a workout tracker. I wanted the opposite: a real dashboard where AI handles the thinking — training load analysis, workout recommendations, nutrition planning — without a chat interface at all.

## The Idea

<!-- TODO: Claude Code CLI (claude -p) as async subprocess, not an SDK call. Prompt templates as the "agent" logic. SQLite for persistence across stateless CLI invocations. -->

## What I Built (v0.1)

<!-- TODO: Four agents (fitness, nutrition, food recognition, chat orchestrator), Garmin integration, USDA nutrition API, Google Places for restaurants. The full vision. -->

## What Survived (v0.2)

<!-- TODO: Stripped the AI agents entirely. Kept: Garmin sync, ACWR training load, HR zone analysis, rule-based training guidance, mileage quest with XP/leveling, achievements. The rule engine replaced the AI for daily recommendations. -->

## The Architecture That Worked

<!-- TODO: FastAPI + SQLite + vanilla frontend. garminconnect for data. Chart.js for trends. The service-wrapper pattern (one module per external integration). Normalization at the boundary. -->

## Why the AI Agents Got Cut

<!-- TODO: Honest take — the AI layer added latency and cost without being meaningfully better than rules for daily workout recommendations. The rule engine (readiness + ACWR + recent activity pattern) is fast, free, and deterministic. -->

## What I'd Bring Back

<!-- TODO: Food recognition from photos is genuinely useful. Chat for ad-hoc questions. But the daily recommendations work fine as rules. -->
