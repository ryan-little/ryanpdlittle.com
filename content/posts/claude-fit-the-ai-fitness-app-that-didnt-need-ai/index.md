---
title: "Claude-Fit — The AI Fitness App That Didn't Need AI"
date: 2026-04-17
tags: ["python", "ai", "fitness", "garmin", "fastapi", "claude"]
group: "projects"
project: "Garboard"
summary: "I designed a fitness app with four AI agents, a nutrition coach, and a restaurant finder. It lasted about eight hours before I started ripping it apart. Part 1 of 4 on the evolution from Claude-Fit to Garboard to Basecamp."
draft: false
---

*This is Part 1 of a 4-part series on my fitness project's evolution. Part 1 covers Claude-Fit, the original vision. [Part 2](/posts/garboard-from-chatbot-to-dashboard) covers Garboard, the dashboard that survived. [Part 3](/posts/basecamp) covers Basecamp, where Claude became the interface instead of the backend. Part 4 covers the coach in practice and what it's caught.*

---

The design document was 419 lines long. Four AI agents, a Garmin integration pipeline, USDA nutrition lookups, Google Places restaurant search, a food photo recognition system, and a chat interface that could route questions to specialized prompt templates running through the Claude Code CLI. I wrote the whole thing on a Saturday morning in February 2026, and by that evening I had a working prototype. By the next morning I was deleting agents.

## The Premise

I had goals. Get leaner, build functional muscle, train for Mt. Whitney, start a trail running base, eat better, learn to cook. I'd been tracking activity on my Garmin Instinct 2X since April 2024, and I had a Renpho scale syncing weight and body fat to Garmin Connect, so the data was there. What I didn't have was anything pulling it together into a plan.

The idea behind Claude-Fit was to use Claude as the intelligence layer for a local fitness and nutrition app, not a chatbot with a workout database but a system where AI agents could look at my actual Garmin data, my food log, my goals, and generate recommendations that were specific to what my body was doing that week. I was paying $200/month for a Claude Max subscription anyway, and the CLI tool (`claude -p`) let me call it asynchronously from Python without an API key. The whole thing could run locally, no cloud services besides the LLM calls, no subscription fees beyond what I was already paying.

The architecture was a FastAPI backend with SQLite for storage and the Claude Code CLI as the AI layer. Each "agent" was really just a Python function that queried the database for context, built a prompt from a template, called `claude -p` as a subprocess, parsed the JSON response, and stored the results. No LangChain, no vector databases, no retrieval pipelines. Just prompt templates and database queries.

## The Four Agents

The fitness agent was the one I was most excited about, and it pulled your full workout history from Garmin with emphasis on the last 14 days for load management, looked at body metrics and trends, checked your active goals, factored in yesterday's workout so it wouldn't pile a hard day on top of a hard day, and generated two or three workout options for the day. Each option came with exercises, duration, intensity, location with estimated drive time, and a rationale for why it made sense given where you were in your training. The system prompt told it to act as a trail running and functional fitness coach.

**The Nutrition Agent** was more ambitious. It would look at your last seven days of food logs, today's workout, your calorie and macro targets, nearby restaurants from Google Places, and your current eating pattern, which at the time was OMAD around 1pm on workdays. For each meal it would generate three options: a home-cooked meal that taught you a cooking skill, an eat-out option at a specific nearby restaurant with a specific menu item and estimated macros, and a fast food option that stayed on track. The system prompt said to acknowledge my current eating pattern and make a case before recommending changes.

**The Food Recognition Agent** handled photo uploads and text entries. You'd snap a picture of your meal or type what you ate, and it would identify the foods, estimate portions with specificity ("6oz grilled chicken breast" not "chicken"), and return structured data. The key detail was that Claude's estimates were just the identification step. Python would take those identified foods and look them up in the USDA FoodData Central database for verified nutrition numbers. The USDA data got stored, not Claude's guesses.

Tying all of it together was the chat orchestrator, which held the last 10 messages of conversation, today's recommendations, your recent progress summary, and your active goals. Python handled the routing, detecting when a chat message needed a specialized agent ("what should I eat" went to nutrition, "what should I do today" went to fitness) and dispatching accordingly.

## The Stack

The design called for Python 3.11 with FastAPI, SQLite through the stdlib `sqlite3` module, garminconnect for Garmin data access, RenphoGarminSync-CLI to pipe scale data into Garmin Connect before each pull, the USDA FoodData Central API for nutrition lookups, Google Places for nearby restaurants, and a vanilla HTML/CSS/JS frontend with Chart.js. No framework on the frontend. The Claude Code CLI ran via `asyncio.create_subprocess_exec` with `--output-format json`, and I tracked token usage in a shadow cost table so I could see what the AI layer was actually "costing" against my fixed $200/month subscription.

I even built a schedule config that knew my work hours (6am to 4pm Monday through Thursday, Fridays off), my meal window, and my travel radius preferences for different activity types, because the fitness agent was supposed to factor drive time into its workout location recommendations.

## Building It

The implementation plan was 21 tasks, TDD-style, and Claude built the whole thing in a single afternoon session. Database schema and connection helpers, CRUD operations for all the tables, Garmin service with Renpho sync and activity fetching, USDA nutrition service, Google Places service, the async CLI runner, all four agent prompt templates, the dispatcher with intent detection and routing, the FastAPI app, API routes for dashboard and chat and food logging and metrics, and a frontend with dashboard, chat, food log, and activities tabs.

By commit `f693715`, tagged as Claude-Fit v0.1, the whole system was running. Garmin sync pulled activities, the setup wizard walked you through connecting your accounts, and the frontend had a working chat interface that could route questions to the right agent. I added a macOS Dock launcher so I could start and stop the whole stack with one click.

![Claude-Fit v0.1 dashboard with a Today's Plan card that reads "Chat with Claude-Fit to generate a plan," plus an API Cost Tracker and Goals. Empty because I pulled this screenshot from a fresh checkout of the v0.1 commit — the project's long since been shelved.](v01-dashboard.webp)

## Where It Broke

I used it for about a day, and the gap between what the agents produced and what I actually needed became obvious fast.

The fitness agent would generate three workout options with detailed rationales, and I'd look at them and think, I already know what I'm doing today. I'd been hiking Cowles Mountain regularly, I had a running schedule forming, and the watch was tracking everything. What I wanted was to see my data laid out clearly, not to have an AI tell me to go for a Zone 2 run when I could see from my ACWR that a rest day made more sense. The recommendations weren't wrong exactly, they just weren't better than looking at the numbers myself, and they added latency and complexity to every interaction.

The nutrition agent was worse. Three meal options per meal, each with a home-cooked variant and a restaurant variant and a fast food variant, plus macros, plus restaurant locations? I was eating one meal a day. I didn't need a nutrition coach generating nine options. I needed to eat better, and the path to eating better was learning to cook, not having an AI pick restaurants for me.

The food recognition was genuinely useful. Photo-to-macros with USDA-verified numbers is a real workflow improvement. But it didn't need a chat interface, it didn't need to be part of a larger agent system, and it definitely didn't need the overhead of routing through a dispatcher.

The chat orchestrator was the most telling. I had built a system where Claude managed conversations, tracked context, routed to specialized agents, and maintained state across stateless CLI invocations, and the whole time I had Claude Code itself open in a terminal tab where I could just ask it questions directly. I'd built a worse version of a tool I already had.

## Ripping It Out

The commit history tells the story pretty cleanly. Within hours of v0.1, I started pulling things apart.

First the chat and the fitness/nutrition agent prompts got deleted. Then the dispatcher got simplified to food logging only. Then the food photo upload endpoint went away. Then the dashboard routes got rebuilt around Garmin data and goal tracking instead of AI recommendations. Then the chat tab disappeared from the frontend entirely, replaced with a wellness row showing training readiness, sleep, and body battery.

By commit `57dc44f`, tagged as Claude-Fit v0.2, the app had been rebuilt as a focused Garmin dashboard. No AI agents, no chat, no nutrition coaching, no restaurant recommendations. What survived was the Garmin sync, the SQLite database, the FastAPI backend, and the vanilla frontend, now showing training load, heart rate zones, mileage goal progress, and body metrics. The rule engine, which was just Python logic checking readiness and ACWR and recent activity patterns, replaced Claude entirely for daily training guidance. It was fast, free, and deterministic.

The whole arc from ambitious AI fitness coach to straightforward Garmin dashboard happened in a single day. Design document at 9:54am, v0.1 at 10:42am, the first agent deletion by early afternoon, v0.2 by 5:11pm. Eight hours from vision to reality check.

![Claude-Fit v0.2 dashboard after the teardown. The chat tab is gone, the API cost card is gone, and in their place is a row of Garmin metrics — readiness, sleep, body battery, training status — with weight and distance trends below. Same empty-state disclaimer: the project's shelved, there's no live data to show.](v02-dashboard.webp)

## What I Learned

The instinct to reach for AI when you have a hammer is strong, especially when you're paying for the hammer. But the best version of this project turned out to be the one where the AI was a build tool, not a runtime dependency. Claude built the database schema, the API routes, the Garmin integration, the frontend, all of it, and then got out of the way. The thing it built was better without it running inside.

That's not a knock on AI for fitness, it's a knock on where I put it. The agents were doing inference on data that was already structured and legible. Garmin gives you training load, readiness, sleep scores, heart rate zones, and acute-to-chronic workload ratios. Those numbers don't need interpretation by a language model, they need a clean display and some threshold logic. The AI was adding a translation layer between data I could read and recommendations I could have derived myself, and that translation layer was the slowest and most expensive part of the stack.

Food recognition from photos is genuinely hard to do without AI. Identifying "6oz grilled chicken breast, half cup brown rice, steamed broccoli" from a photo and then looking up verified nutrition data is real value. That's the kind of thing I'd bring back, and eventually did in a different form.

The dashboard that survived the teardown turned out to be more interesting than the AI system I'd planned. Once the agents were gone, I could focus on making the Garmin data useful instead of making Claude interpret it for me. Training load tracking, GPS heatmaps, personal records, heart rate trend analysis, an achievement system, all layered on top of a clean data pipeline from the watch to a local SQLite database.

The project got renamed to Garboard about three weeks later, which was both a rebrand and an acknowledgment that the thing I'd actually built wasn't what I'd set out to build. The Claude-Fit name didn't fit anymore because Claude wasn't running the fitness coaching, it was just the tool I used to build the dashboard.

A couple of weeks after the rename, I couldn't log into Garmin anymore, and the dashboard I'd just finished polishing had nothing to show. That's where [Part 2](/posts/garboard-from-chatbot-to-dashboard) picks up.
