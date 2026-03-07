# Primal Chase Dev Log Series — Design Doc

## Overview

5-part retrospective blog series documenting the development of Primal Chase from design doc to shipped game. Released weekly, each post covers a narrative arc of versions with a focus on *why* decisions were made, not just what changed.

## Audience & Tone

- Mix of portfolio showcase, indie dev log, and learning-in-public
- Casual but substantive — like explaining decisions to a friend who's interested in the process
- Technical enough to be a real dev blog (code snippets), visual enough to be scannable (screenshots)

## Series Structure

All posts current-dated, framed as a retrospective series (Part 0-4). Released ~1 per week.

### Part 0: The Idea (Pre-code)
~800-1200 words

- Where the persistence hunting idea came from (two-sentence game-idea.md)
- Why an unwinnable game creates better tension than a winnable one
- Hand-calculated status bar math that validated the core design
- The design doc: encounter system architecture, hunter model, example screens as spec
- The CONFIG-driven non-negotiable decision
- Tech stack: vanilla JS, zero dependencies, GitHub Pages
- **Code snippets:** CONFIG structure, example play screen from design doc
- **Screenshots:** N/A (pre-code)

### Part 1: The Prototype (V1.1-V1.3)
~800-1200 words

- The persistence hunting concept and why it works as a game mechanic
- Original design doc to playable V1.1 (core loop: 4 stats, 5 actions, encounter system)
- V1.2 visual refresh — title screen redesign, typewriter intro, why the CSS landscape got reverted
- V1.3 options, tutorial, transitions — giving the game personality beyond mechanics
- **Code snippets:** encounter system basics, CONFIG-driven philosophy
- **Screenshots:** original design mockups, V1.1 gameplay, V1.2 title screen, V1.3 options/tutorial

### Part 2: Making It Real (V1.4-V1.6)
~800-1200 words

- V1.4 as the "would I let someone play this?" milestone
- The invisible-first typewriter fix (layout reflow was the hardest bug)
- Share image: canvas tainting on HTTP, clipboard API on HTTPS, download fallback
- V1.5 analytics dashboard — building dev tooling as a feature (primalchase.com/stats/)
- V1.6 codebase cleanup — dead code removal, CSS variable consolidation, the unglamorous work
- **Code snippets:** invisible-first typewriter approach, share card canvas
- **Screenshots:** V1.4 gameplay (natural language hunter info), share card evolution, analytics dashboard

### Part 3: Systems Thinking (V1.7-V1.8)
~800-1200 words

- Difficulty system: CONFIG override pattern with base snapshot + deep-merge
- Monologue system evolution: generic -> terrain-aware -> pressure-aware -> combined triggers (280 -> 387 fragments)
- Simulation-driven balance tuning — 5 rounds in V1.8, why data beats intuition for "intentionally unwinnable" games
- Replacing abstract strategies with realistic player-behavior models (Random/Newbie/Intermediate/Smart/GTO)
- **Code snippets:** 32x52x22 encounter combinatorics, difficulty deep-merge, monologue trigger system
- **Screenshots:** difficulty selection, dashboard filter system, simulation output

### Part 4: Visual Identity (V1.9)
~800-1200 words

- Why visual polish warranted its own version — the game played well but looked plain
- Atmosphere system, weather effects, pixel art, particle systems
- Performance in a zero-dependency vanilla JS browser game
- Reflecting on the full arc: design doc -> 9 versions, what worked, what I'd do differently
- **Code snippets:** atmosphere/particle system highlights
- **Screenshots:** before/after visual comparison, weather effects, final state

## Format

- Hugo markdown, matching existing site frontmatter format
- `draft: true` — Ryan reviews and publishes on his schedule
- Tags: primal-chase, game-dev, javascript, dev-log
- Group: projects, Project: Primal Chase
- Each post links to the others in the series (prev/next)
- Series intro paragraph at top of each post for context

## Screenshot Strategy

Screenshots captured via Playwright (WebKit) from git checkouts at key commits:
- V1.1: `14d5ed3` (implement playable V1)
- V1.2: `4ba124a` to `b082c90` (layout, landscape bg, revert)
- V1.3: `65889f0` to `d19a2a4` (options, tutorial, transitions)
- V1.4: `befd441` (first shippable)
- V1.5: `afbcca9` (analytics dashboard)
- V1.6: `a79d22c` (share card redesign)
- V1.7: `175eab4` (difficulty, monologues, dashboard)
- V1.8: `edfbc88` (balance, content, accessibility)
- V1.9: `96431e3` (visual polish)

Source material: knowledge hub docs (version-history.md, game-balance-system.md, original-design.md), git commit messages, game source code.

## Deliverables

5 draft markdown files in `content/posts/`:
- `building-primal-chase-part-0.md`
- `building-primal-chase-part-1.md`
- `building-primal-chase-part-2.md`
- `building-primal-chase-part-3.md`
- `building-primal-chase-part-4.md`
