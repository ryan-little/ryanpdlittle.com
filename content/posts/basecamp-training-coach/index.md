---
title: "Basecamp — When the Dashboard Became a Coach"
date: 2026-05-01
tags: ["python", "ai", "fitness", "garmin", "claude"]
group: "projects"
project: "Basecamp"
summary: "I built a rules engine to tell me how to train. Then Claude analyzed the same data and was better at it. So I threw out the dashboard, kept the metrics, and let Claude be the coach."
draft: true
---

*This is Part 3 of a series on my fitness project's evolution from Claude-Fit to Garboard to Basecamp. [Part 1](/posts/claude-fit-the-ai-fitness-app-that-didnt-need-ai) covers Claude-Fit, the AI agent prototype. [Part 2](/posts/garboard-from-chatbot-to-dashboard) covers Garboard, the dashboard that outgrew its AI.*

---

## The Moment

On March 29th I was debugging Garboard's USB FIT import when I decided to run both the training engine and Claude on the same day's data, just to compare. The engine said HARD EFFORT HIKING, 5-9.1 MILES based on an ACWR of 0.087. Claude caught that the ACWR was wrong because CSV-imported activities were missing load values, noticed I'd run four of the last five days, saw elevated stress trends averaging 45-57 with spikes into the 90s, recognized my body was still recovering from a Zion trip the week before, and recommended an easy 2.5-3 mile flat run with heart rate under 140.

The engine couldn't know I was tired. Claude asked. The engine couldn't see that its own data was garbage. Claude cross-referenced and caught it. The engine produced a confident prescription from broken inputs. Claude produced a reasoned recommendation from messy reality.

That was the end of Garboard as my training tool.

## What Was Wrong with Rules

Garboard's training engine was genuinely good engineering. Four layers, each independently testable: a weekly template anchored on Sunday long hikes, daily modifiers based on readiness and HRV and body battery, growth-adjusted load targeting with 7/5/3% tiers, and load steering for quality session upgrades. 401 tests passing. 9/10 code quality by my own honest assessment. The problem wasn't the code.

The problem was that fitness training has variables that resist programmatic modeling. Subjective fatigue doesn't have an API. Diet changes like switching back to OMAD for a week affect recovery capacity in ways no sensor captures. Life stress, route-specific knowledge like knowing that Pyles Peak at an average heart rate of 174 is a death march when you're fatigued, sleep quality nuances where REM consistently takes the biggest hit from stacked training days, weight fluctuations and their causes. The engine could see that my HRV dropped. It couldn't understand why, and it couldn't ask.

Claude can process all of those things in natural language alongside the structured data. Not as a replacement for the metrics, but as the reasoning layer on top of them. The insight that came out of March 29th was simple: metrics as context, not decisions. Calculate the numbers deterministically, store them in SQLite, and then let Claude read the snapshot and talk through what it means with me.

## Why Not Just Fix Garboard

The interaction model was fundamentally different. Garboard was a web dashboard you look at. Basecamp is a conversation you have. Only about 20-30% of Garboard's code was relevant to the new model, mostly the FIT parsing, the ACWR math, and the SQLite patterns. Everything else was dead weight: FastAPI, the frontend, API routes, the achievement system, the six-tab dashboard with Canvas 2D charts and Leaflet maps. All of that was built to show you data, and showing you data turned out to be the wrong goal.

Cherry-picking good pieces into clean architecture beats pruning dead code from a project that's aimed at the wrong target. So I started a new repo.

## What Basecamp Actually Is

Basecamp is a Claude-native training coach powered by Garmin data. No dashboard, no web server, no rules engine. Claude Code is the interface. The system generates structured fitness metrics and passes them to Claude, which combines them with how I'm actually feeling that day to produce evidence-based training recommendations.

The daily workflow looks like this. A Python script pulls today's data from the Garmin Connect API, which takes about 18 seconds and 6 API calls via pirate-garmin's OAuth2 flow. That data goes into a SQLite database with 24 tables covering activities, wellness, sleep, HRV, training load, readiness, VO2max, and more. Then a snapshot generator reads the database and assembles a 14-section daily context document covering everything from load ratios to mileage pacing to anomaly detection. Claude reads the snapshot and starts the conversation.

The conversation part is what matters. Claude doesn't just dump recommendations. It asks how I'm feeling, what my energy level is, whether anything hurts, what my schedule looks like. Then it combines my answers with the metrics, the periodization context, the research documentation, and the training history to reason through what today should look like. Some days that means running. Some days it means resting even when the numbers say I could push. Some days it means adjusting the weekly plan because something changed that no sensor picked up.

## The Data Pipeline

The Garmin Connect API is the primary data source now, which is its own story. During Garboard's final weeks I went through a Garmin authentication crisis that burned through garminconnect, garth, cookie-based workarounds, and a full USB FIT import system before finding pirate-garmin, which uses native Android OAuth2 and just works. Tokens cache locally and auto-refresh silently. One library solved a problem that three others couldn't.

Daily ingest hits nine API endpoints and pulls everything: daily wellness with steps and stress and heart rate and body battery, sleep with all 11 score types and stage breakdowns, HRV with rolling averages and baseline status, training load and readiness with their component scores, VO2max, heat acclimation, activities with GPS tracks and HR zones and weather data. There's also a file-based fallback for when the API is unavailable, using bulk export ZIPs and daily FIT files that I reverse-engineered the undocumented message types out of. The METRICS FIT files contain training readiness, load ratios, race predictions, and body battery data in message types that Garmin doesn't document anywhere, and I decoded them by cross-referencing against the bulk export JSON.

All of this feeds into a normalized SQLite schema designed directly from Garmin's data structures, not from an ORM or a third-party tool. The `daily_snapshot` view joins all daily tables by date into 42 columns that give Claude a single-query look at any given day. COALESCE upserts mean partial API responses never overwrite existing data with nulls, and every major table has a `raw_json` column so I can extract new fields later without re-importing anything.

## The Metrics Layer

The metrics module is pure deterministic math, no AI anywhere near it. Efficiency factor tracks aerobic economy as average speed divided by average heart rate. Aerobic decoupling compares the first and second halves of a run to see if heart rate drifted, and below 5% means the effort was truly aerobic. Training stress balance shows freshness as chronic load minus acute load. ACWR zones flag risk at thresholds: below 0.8 is detraining territory, 0.8-1.3 is optimal, above 1.3 is elevated risk, above 1.5 is danger. YTD mileage pacing tracks my 1,000-mile annual goal at 19.6 miles per week.

The GPS track analysis module does terrain splitting to show what percentage of a run was uphill, flat, or downhill with heart rate for each segment. It detects climbs, calculates vertical gain rate in feet per hour, and builds elevation profiles. When I run Cowles or Pyles, it can tell me exactly how my heart rate responded to each climb compared to the last time I did the same route.

147 tests cover the metrics module. All passing. These numbers are trustworthy because they're tested, deterministic, and decoupled from the coaching layer. Claude reads them as context. It doesn't generate them.

## Research-Backed Coaching

Every major training decision in the system is grounded in documented research. I went through the 2024-2026 literature on periodization models, HRV interpretation, ACWR evidence, ramp rate myths, sleep effects, and altitude physiology, and compiled it into markdown files that Claude reads as part of its coaching context.

Some of the findings shaped the project directly. The 10% weekly mileage increase rule has no scientific basis. The real injury predictor is single-session spikes exceeding 10% of your longest run in the past 30 days. Subjective self-report outperforms objective measures for detecting well-being changes in 85% of instances where sensitivity differed, which means my answer to "how do you feel today" is more predictive than any metric my watch records. HRV should be read as a 7-day rolling average, not single daily values, because the noise in individual readings makes them almost useless for decision-making.

The zone 2 aerobic development research was particularly important because Garmin's zone naming is confusing. Garmin's Zone 2 labeled "Easy" is actually research Zone 2, the aerobic development zone at 60-69% of heart rate reserve. Garmin's Zone 3 labeled "Aerobic" is above LT1 for most people and is not the aerobic base-building zone despite the name. My working target is 145-160 bpm until a lactate threshold test confirms the exact boundary. This mapping is documented and aligned project-wide so Claude never confuses the terminology.

There's also altitude research specific to my Whitney goal. VO2max drops roughly 1.9% per 1,000 feet of elevation. At Whitney's 14,505 feet, that's a 27-28% reduction. Sea-level heart rate bands don't apply at altitude because submaximal heart rate rises 10-20+ bpm while max heart rate drops. Physical fitness does not reduce acute mountain sickness, only acclimatization does, which means staging at 8,000-10,000 feet for 2-3 nights before the summit bid.

## The Trail Progression

The goal is to summit Mt. Whitney by late July or August 2026. Getting there from San Diego means building distance, vertical gain, altitude tolerance, and running fitness systematically. I laid out a 13-step trail progression that starts at Cowles Mountain, my 3-mile home trail with 950 feet of gain, and ends at Whitney's 22-mile, 6,100-foot, 14,505-foot summit.

Each step builds a specific capability. Cowles establishes base trail fitness. Iron Mountain adds distance. Pyles Peak adds steepness. Cuyamaca adds sustained climbing at moderate elevation. The middle steps push into bigger days with more vertical. San Jacinto via the tram is the first real altitude test at 10,834 feet. Cactus to Clouds is 21 miles with 10,400 feet of gain, which is the dress rehearsal. San Gorgonio at 11,503 feet is the altitude dress rehearsal. Whitney is the goal.

The success condition for each step is running emphasis with heart rate under 175 bpm. The progression naturally builds altitude exposure from sea level up through 10,834, then 11,503, then 14,505 feet. It's a guide, not a rigid plan. Claude adjusts the timeline based on how I'm responding to training, and some steps might get skipped or repeated depending on what the data shows.

The system tracks this with a mountain visualization, an ASCII trail progression that shows where I am on the path and what's next. Monthly and yearly goals feed into it. As of March 29th, I'm at 224.7 miles year-to-date against a 241-mile on-pace target, about 16 miles behind from January ramp-up. March pace is 26.3 miles per week, well above the 19.6 needed, so the gap is closing.

## Two Days, From Scratch

Basecamp went from founding session to comprehensive system in two days. 50 commits, 6,600 lines of Python, 1,300 lines of research documentation, 147 tests, 24 database tables, 5 Claude subagents, and a full daily coaching workflow. The speed came from three things: clear architecture decisions made up front, Garboard code to cherry-pick from where it applied, and Claude Code as the development environment.

The subagents handle different concerns. The coach agent runs daily training intelligence and can analyze data autonomously. A separate coach QA agent does weekly reviews on Mondays to check whether last week's recommendations actually matched what happened, which is the kind of feedback loop a rules engine never had. There are also agents for data imports, research lookups, and a full QA suite that validates everything from test coverage to documentation consistency.

## Where It Stands

I've been using Basecamp daily since March 29th and it works the way I hoped it would. All the import pipelines are built and tested, the API integration is hardened so partial responses never corrupt existing data, and GPS tracks are cached for 140 of 143 activities in the database. The snapshot generator gives Claude everything it needs in one shot, and the coaching conversations have already caught things I would have missed on my own, like a recovery pattern after Zion that was still affecting my readiness three days later.

What's still coming is mostly on the training side, not the engineering side. I need a lactate threshold test to confirm my aerobic zone boundary instead of working from research estimates. The trail progression milestones will fill in as I work through the steps this spring and summer. And whatever the data surfaces as I push into harder terrain and higher altitude, the system is built to handle, because Claude can read new patterns that I haven't anticipated yet. That's exactly what a rules engine can't do.

## The Arc

Claude-Fit started with AI agents as the backend for a fitness app. Garboard stripped them out and replaced them with a rules engine and a dashboard. Basecamp brought Claude back, but as the interface itself rather than a hidden backend process, and with structured metrics as the foundation rather than raw API calls.

The through-line is that each version got closer to the right abstraction. Claude-Fit tried to do too much with too little data. Garboard had the data but trapped it behind deterministic rules. Basecamp has the data, the research, and the reasoning, and it puts them together in a conversation where I can say "I'm tired, I switched back to OMAD, and I have a work dinner tonight" and get a recommendation that actually accounts for all of that.

I'm not sure I would have built Basecamp without building Garboard first. The training engine taught me what metrics matter and how they interact. The dashboard taught me that looking at data is less useful than talking about it. The USB FIT import crisis taught me that pirate-garmin exists. And the founding session on March 29th, where the engine said one thing and Claude said something meaningfully better, taught me where the value actually lives.

Whitney is in four months. The system is ready. Now I just have to do the work.
