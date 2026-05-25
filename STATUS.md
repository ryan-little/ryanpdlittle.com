# Status

**Active** — Friday weekly publishing cadence, posts scheduled through end of May 2026.

Last updated: 2026-05-24

## Current Schedule

Friday at 12:07pm PST. Trip reports through summer.

| Date | Day | Post | Status |
|------|-----|------|--------|
| May 15 | Fri | Basecamp — The Training Coach (fitness Pt 4) | Published |
| May 24 | Sat | Whitney Goal | Published — full Q&A rewrite; 2 RYAN placeholders remain (Wilson moment, Cucamonga/Ontario day) + 2 photo slots (Ryan to fill) |
| May 29 | Fri | Learning Geospatial Python Pt 1 | Existing draft — needs pre-publish review |

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
- **Garboard — From Chatbot to Dashboard** (fitness Pt 2) — 2026-04-24
- **Three Trees: Tallest, Largest, Oldest** — 2026-04-28
- **Basecamp — From Dashboard to System** (fitness Pt 3) — 2026-05-01
- **Highway 395, March 2022** — 2026-05-08

## Recent Changes

- Whitney Goal (5/24): full Q&A-driven rewrite. Original subagent draft fabricated the opening (Pyles Peak moment), the altitude section premise ("what scares me"), and early long-run stats. Replaced via Q&A: El Cajon opening → two-tier structure → what's done (Wilson SAR incident, Cucamonga+Ontario new longest day) → altitude non-fear framing based on Fort Collins + RMNP + Eastern Sierra history → ankle story (three incidents, 90% resolved) → running cadence (10.2mi longest run, 30-35mi/wk 80/20) → "ready" defined as 2x El Cajon in one day. Date pushed from 5/22 to 5/24. 2 RYAN placeholders + 2 photo slots remain.
- Whitney Goal: fixed AI-fabricated "Half Dome in 2022" → "Half Dome, whenever that was" — AI conflated Ryan's actual ~2016 Half Dome trip with the 2022 Highway 395 road trip. Year unknown so kept vague.
- Pre-publish pass on Basecamp Pt 4 (basecamp-training-coach, publishes 5/15): cut the Zion section (vague, redundant with ankle story, unfilled placeholder), added three terminal screenshots converted to WebP (coach session input showing the feeling prompt, recommendation block, Monday QA report), fixed image order so the recommendation screenshot follows the decision-order paragraph it illustrates rather than preceding it. Anti-AI scan clean. Committed and pushed 5/14.


- Fixed Cloudflare Web Analytics beacon SRI hash mismatch: Cloudflare's auto-injected beacon had a stale `integrity` hash causing CORS failures and SRI blocks in the browser. Added the manual JS snippet directly to `head.html` (no `integrity` attribute); Cloudflare detects the beacon is present and stops auto-injecting.
- Title-structure audit across all 25 posts. Fitness series was the one inconsistency: Part 3 used a colon ("Basecamp: From Dashboard to System") while Parts 1, 2, and 4 used em dash. Retitled Part 3 to "Basecamp — From Dashboard to System". Series now reads consistently as `<Project Name> — <Descriptor>`. Primal Chase 5-part series was already consistent (`Building Primal Chase — Part N: <Subtitle> (V<range>)`). RF Viewshed and Geospatial Python single-part drafts use `— Part N` without subtitle; if either becomes multi-part, Primal Chase pattern is the template. Trip reports (Zion in Three Trails, Three Trees, Highway 395) intentionally use distinct structures — they're standalone, not a series.
- Wholesale rewrite of high-sierra-loop post (post-publish, same-day): subagent-drafted version described a fabricated June 2022 Half Dome / Sequoia / White Mountains loop that never happened. Replaced with the actual March 2022 spring break road trip with Max — SD → Death Valley (Star Wars Canyon jet flyover, Badwater, Artist's Palette) → Alabama Hills (the Whitney sighting that planted the climb idea, Denali-at-11 callback) → White Mountain Road snow rescue (followed plow truck, beached on ice, dug for an hour with bare hands, sedan rescue with Ted Nivison from three-trees) → Mono Lake tufa boondock → Carson City state capitol → Tahoe loop with Emerald Bay → Reno oil change → Susanville breakfast → Lassen NF detour with closed-road canyon viewpoint → Burney Falls → Mt Shasta + Pluto's Cave + Weed → Motel 6 + 5 home. Retitled to "Highway 395, March 2022". Added 8 photos (badwater-basin, plow-vehicle, mono-lake-boondock, nevada-capitol, emerald-bay, burney-falls, mount-shasta, plutos-cave) converted JPG→webp via sips+cwebp at q80, max 2000px. Reconciles the snow-rescue with three-trees (same incident, names now consistent). Iterative fabrication catches across the rewrite: (1) shovels — they used bare hands, (2) Half Dome — different trip entirely, (3) "first long road trip without a parent" framing — wrong, was actually first real boondocking trip (corrected opening + closing to lead with public-land car-camping, since "boondocking" now bookends the post). Also fixed Badwater photo rotation (source JPG had no EXIF orientation, scene was sideways in landscape pixels — applied 90° CW rotation, re-shipped). Cache lesson: after re-deploy, Cloudflare proxy cached the old image at the bare URL with `cache-control: max-age=600`; cache-bust query string returned correct file from origin. Pushed five project-repo commits same day: `23b08be` rewrite + photos, `a51abd3` retitle, `d8bfe48` photo rotation, `a79eb5c` STATUS update, `c6bf020` boondocking framing.
- Cadence shift: Tue/Fri 5:57am PDT → Friday 12:07pm PST (`7 20 * * 5`). Whitney training and grad school competing for time; trip reports through summer fill the slot. Friday at noon also gives time to edit the morning of publish. Updated cron, publish-schedule.yml, CLAUDE.md, ARCHITECTURE.md.
- Post-publish revision pass on Three Trees: filled the three Hyperion/Sherman/Methuselah personal-moment placeholders (off-trail Hyperion find with college roommates, General Grant before Sherman + the grove-over-headliner reframe, three-trip Methuselah arc with Ted Nivison snow rescue). Title em dash to colon. Corrected the older-bristlecone story (Tom Harlan researcher reported in 2009, age 5,062, sample/location lost after Harlan's 2013 death). Methuselah age 4,854 → 4,857. Closing line "three trips" → "several trips" since Methuselah was three on its own.
- Post-publish revision pass on Basecamp Part 3: cut "## The Arc" summary section per style guide (Whitney/Cowles/Part-4 paragraph is now the close). Folded the OMAD example forward into the conversation paragraph. Voice drift pass on Data Pipeline, Metrics Layer, Research-Backed Coaching for more peer stance. Restructured five colon-introduced lists. Tightened the seven-number stat flex to three (50 commits, 6,600 lines, 147 tests). Inline gloss for ACWR. "6 API calls" → 9 to match code and the line below.
- Scheduled-publish cron shifted from 13:00 UTC → 12:57 UTC (`57 12 * * 2,5`, 5:57am PDT). GitHub Actions cron had been firing 60-110 min late at the top of the hour; off-hour minute dodges the backlog. F1 post (4/21) published via manual `workflow_dispatch` since Tuesday's scheduled run hadn't fired yet when Ryan checked at 6:13 AM.
- Bumped `actions/checkout@v4 → v6` (both workflows), `dawidd6/action-send-mail@v3 → v16`, `actions/upload-pages-artifact@v3 → v5`, `actions/deploy-pages@v4 → v5` to get off Node 20 before GitHub's Sept 2026 forced migration. send-mail API unchanged between v3 and v16 per its README. `peaceiris/actions-hugo@v3` is still Node 20 but it's the maintainer's latest release — revisit periodically.
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

**Before May 29:** Pre-publish review of Learning Geospatial Python Pt 1 (existing draft). Whitney Goal published 5/24 — 2 `<!-- RYAN: -->` placeholders (Wilson day moment, Cucamonga/Ontario day) and 2 photo slots remain for Ryan to fill manually when ready. Going forward, do a pre-publish review pass on subagent-drafted personal-narrative posts before they auto-publish — the High Sierra Loop incident showed those drafts can fabricate trip details whole-cloth.
