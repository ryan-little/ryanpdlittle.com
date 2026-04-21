# Status

**Active** — Tue/Fri publishing cadence, 7 posts scheduled through mid-May 2026.

Last updated: 2026-04-21

## Current Schedule

Fridays: series/technical. Tuesdays: one-offs/personal/non-technical.

| Date | Day | Post | Status |
|------|-----|------|--------|
| Apr 24 | Fri | Garboard — From Chatbot to Dashboard (fitness Pt 2) | Revised, ready |
| Apr 28 | Tue | Three Trees — Tallest, Largest, Oldest | Draft, 3 RYAN placeholders to fill |
| May 1 | Fri | Basecamp — From Dashboard to System (fitness Pt 3) | Revised, ready |
| May 5 | Tue | High Sierra Loop | Draft, 5 RYAN placeholders + needs personal photos |
| May 8 | Fri | Basecamp — The Training Coach (fitness Pt 4) | Draft, 1 RYAN placeholder + "three weeks" refs need updating to ~6 weeks |
| May 12 | Tue | Whitney Goal | Draft, 4 RYAN placeholders + 2 photo slots |
| May 15 | Fri | Learning Geospatial Python Pt 1 | Existing draft |

## Published

- **Welcome** — 2026-02-22
- **Building a Personal Knowledge Hub** — 2026-03-06
- **What's Coming — Spring 2026** — 2026-03-10
- **Building Primal Chase — Part 0: The Idea** — 2026-03-13
- **Hiking San Diego with GPS Data** — 2026-03-17
- **Building Primal Chase — Part 1** — 2026-03-20
- **All In on San Diego FC** — 2026-03-24
- **Building Primal Chase — Part 2** — 2026-03-27
- **Personal Finance Dashboard** — 2026-03-31
- **Building Primal Chase — Part 3** — 2026-04-03
- **Zion in Three Trails** — 2026-04-07
- **Building Primal Chase — Part 4** — 2026-04-10
- **Claude Code as a Development Environment** — 2026-04-14
- **Claude-Fit — The AI Fitness App That Didn't Need AI** (fitness Pt 1) — 2026-04-17
- **Fantasy F1 — Retiring the Model** — 2026-04-21

## Recent Changes

- Scheduled-publish cron shifted from 13:00 UTC → 12:57 UTC (`57 12 * * 2,5`, 5:57am PDT). GitHub Actions cron had been firing 60-110 min late at the top of the hour; off-hour minute dodges the backlog. F1 post (4/21) published via manual `workflow_dispatch` since Tuesday's scheduled run hadn't fired yet when Ryan checked at 6:13 AM.
- Theme: added reading time (homepage + list + single), newer/older post nav on single pages, About link in header → ryan-little.com
- Fixed ghost drafts rendering as blank "January 1, 0001" cards on homepage: four drafts (basecamp-training-coach, high-sierra-loop, three-trees, whitney-goal) had `<!-- Title options -->` comment blocks above the frontmatter; Hugo only parses frontmatter at line 1, so title/date/draft were all unset and they published. Removed the comments.
- Retroactively revised Claude-Fit (Part 1) after auto-publish: added v0.1 + v0.2 UI screenshots, reworked ending to single forward-motion sentence with Part 2 link, normalized Claude-Fit branding, varied H2 headings, dropped "on the other hand"
- Extended fitness series from 3 to 4 parts: split Basecamp Part 3 from Part 4 (renamed `basecamp-training-coach/` → `basecamp/`; new Part 4 at `basecamp-training-coach/`). Retitled Part 3 to `From Dashboard to System` for series chain (Chatbot → Dashboard → System)
- Pre-publish polish on Garboard (Part 2): normalized title to em-dash pattern, added 3 screenshots (v0.3 cyberpunk, Today tab, Achievements tab), tightened ending, compressed March 29 section
- Pre-publish polish on Basecamp (Part 3): added prose hook opening, mountain ASCII + snapshot screenshots, concrete prescription triad, rewrote ending to Cowles callback + Part 4 forward link
- Drafted Basecamp Part 4 (`basecamp-training-coach`): 2,911-word coach-in-practice post via subagent, 1 RYAN placeholder for Zion specifics. Moved from placeholder 6/16 date to confirmed 5/08
- Drafted Three Trees, High Sierra Loop, and Whitney Goal via subagents (Tuesday trip-report mini-arc)
- Full voice/style pass on Fantasy F1: fixed "four of my five" → "three of my five" (real race data shows 3 DNFs/DNS of Ryan's 5 drivers), reframed model recommendation vs. Verstappen override (model actually picked LEC, Ryan overrode), anonymized coworker names to initials (M/A/S/L/D/C) and dropped Team column from standings table, added paragraph on Bahrain/Saudi Arabia cancellations creating the retirement window
- Added 4 visuals to Fantasy F1 post: MIQP optimizer code block in Setup (pulled from retired model code at commit 2adb70b), cumulative league-points chart with light/dark variants (`gen_chart.py` + `league-cumulative-{light,dark}.png`), Limitless model output terminal block (revived `f1-fantasy` at 2adb70b via worktree, ran `scripts/limitless_sim.py` for real numbers)
- Theme: added `.theme-light` / `.theme-dark` class-based image swap in style.css for chart rendering in both modes
- Schedule: pulled felt-gg (not publishing publicly yet), moved geospatial from 5/05 to 5/15

## Next Action

**Before each Tuesday/Friday:** Fill the `<!-- RYAN: -->` placeholders in each draft, supply personal photos for High Sierra Loop and Whitney Goal, and update the "three weeks" references in Basecamp Part 4 to reflect the actual elapsed time by 5/08.

**Not urgent:** Bump `actions/checkout@v4` and `dawidd6/action-send-mail@v3` (both on Node 20, deprecated by GitHub Sept 2026).
