---
title: "Claude Code as a Development Environment"
date: 2026-04-14
tags: ["ai", "tools"]
group: ""
project: ""
summary: "How I use Claude Code with custom skills, CLI tools, a knowledge hub, and subagents to build software. Not a review, a workflow walkthrough."
draft: false
---

The first thing Claude Code does when I start a session is run a shell script. Not a prompt, not a greeting, a script that checks whether my knowledge hub has any stale docs. By the time I type my first message, Claude already knows which project I'm in, what CLI tools I have installed, how I like my commits formatted, and where to find context about whatever I'm working on.

That's what this post is about. Not Claude Code the product, but the environment I've built around it, where custom skills, CLI tools, a searchable knowledge hub, and hooks tie together into a development workflow that carries context across sessions and projects.

## The Layered Config

Claude Code reads CLAUDE.md files, plain markdown that tells it how to behave. I have two layers: a global file at `~/.claude/CLAUDE.md` that applies to every session, and per-project files that live in each repo.

The global file is where I put things Claude would get wrong without explicit instruction. My GitHub username, my timezone, which CLI tools are installed and how to use them, preferences like "don't end responses with suggestions for what to do next." It's about 60 lines, and I've intentionally kept it tight. There's research suggesting Claude's compliance with CLAUDE.md instructions drops as the file gets longer, and I did a cleanup session where I pruned anything that failed the test of "would removing this cause Claude to make mistakes?" If the answer was no, it got cut.

Per-project CLAUDE.md files are more specific. This blog's file describes the Hugo setup, content workflow, and points to the writing style guide in my knowledge hub. My fitness tracking app's file explains the database schema and Garmin API patterns. Fifteen of my projects have their own CLAUDE.md files, and each one means Claude can drop into that project cold and be productive without me re-explaining context.

## Skills

Skills are markdown files that load on demand when I invoke them, like scripts Claude follows for workflows I repeat. I have 11 custom ones.

`/blog` scaffolds a new post for this site by loading the writing style guide from the knowledge hub, checking the blog ideas list, and creating the file with proper frontmatter and page bundle structure. `/end` is my session exit workflow that updates the project tracker, captures decisions to the knowledge hub, syncs the todo list, and commits everything before I close out. `/fitness` pulls my Garmin data from Basecamp, asks how I'm feeling, and delegates the actual coaching recommendation to a subagent. `/goals` is context-aware, showing project-specific milestones when I'm in a project directory and the full 2026 goals dashboard when I'm in my home directory.

The thing I figured out building these is that skills should be rigid where the workflow is deterministic and flexible where it needs judgment. `/commit` always runs the same git commands in the same order, but `/blog` adapts based on whether I'm writing a technical series post or a personal one, and `/socratic-exploration` is almost entirely open-ended, designed to ask me questions rather than produce output.

Three official plugins round things out: `commit-commands` for git workflows, `frontend-design` for building web interfaces, and `feature-dev` for guided feature development with codebase analysis.

## CLI Tools Over MCP

Claude Code supports MCP servers for extending its capabilities with external tools, but I deliberately moved away from them for most things. The reason is token economics: every MCP server adds its tool definitions to every prompt, and a typical 5-server setup with 58 tools burns ~55K tokens before the conversation even starts. CLI tools cost nothing until you actually invoke them.

So instead of an MCP server for file search, Claude uses `fd`. Instead of a code formatter server, it runs `ruff`. Instead of an HTTP client server, it calls `xh`. I installed 12 CLI tools in a single session, documented each one in my global CLAUDE.md with usage examples, and Claude uses them naturally because it knows they're available.

```markdown
# From my global CLAUDE.md
- **`duckdb`** — SQL against CSV/JSON/Parquet/SQLite directly.
- **`fd`** — Fast find replacement, respects .gitignore.
- **`ruff`** — Python linter + formatter. Use instead of flake8/black/isort.
- **`typos`** — Source code spell checker. Zero config.
```

The ones I reach for most are `duckdb` for querying data files with SQL, `fd` for finding files by pattern, `ruff` for Python formatting, and `typos` for catching variable name misspellings in source code. Each one is a single binary installed via Homebrew, no configuration, no daemon, no token overhead.

## The Knowledge Hub

I wrote a [whole post about the knowledge hub](/posts/building-a-personal-knowledge-hub), so I won't rehash the qmd search engine or the auto-reindex hooks here. The part that matters for Claude Code is how the hub acts as shared memory across projects.

Every project has a counterpart directory in the knowledge hub with decisions, research notes, and context that doesn't belong in the codebase. When Claude starts a session in my blog repo, it can search `qmd` for the writing style guide, past editorial decisions, and the blog ideas backlog. When it's in my fitness project, it can pull up training philosophy docs and Garmin API research. The context lives in one place and is accessible from any project, which means I don't have to re-explain background every session or stuff project history into CLAUDE.md files where it would burn tokens on every prompt.

Claude also has a MEMORY.md file per project for lighter-weight cross-session persistence, things like "this user prefers integration tests over mocks" or "the blog publishes Tuesdays and Fridays at 6am PDT." These load every session automatically and carry forward preferences without searching the full hub. The hub is for deep context, MEMORY.md is for quick recall, and they complement each other well enough that I rarely have to repeat myself across sessions.

## Subagents

Claude Code can spawn subagents, separate Claude instances that work on independent tasks in parallel. I use three models depending on the complexity: Haiku for simple lookups and searches, Sonnet for implementation work, and Opus for complex orchestration that needs strong reasoning.

The `/fitness` skill is a good example of this. The main session collects my training data and how I'm feeling, then delegates the actual coaching recommendation to a subagent that has the training philosophy and periodization docs loaded. The main session handles orchestration while the subagent does domain-specific reasoning with its own focused context.

For code exploration I'll send an Explore agent to trace through an unfamiliar part of a codebase while I keep working in the main session. When I needed blog post screenshots captured from different git commits, I dispatched parallel agents to check out separate commits and run Playwright against each one simultaneously, which would have been tedious to do sequentially.

## What This Actually Looks Like

Here's a real example: writing a blog post for this site.

I type `/blog`. The skill loads the writing style guide from the knowledge hub, five deep-dive docs covering voice, narrative structure, prose craft, anti-AI rules, and media guidelines. It checks `blog-ideas.md` for the next idea in the queue and creates a page bundle with proper Hugo frontmatter. I write the post in collaboration with Claude, who has the style guide in context, including rules about no em dashes, no AI vocabulary, and the comma-chaining sentence style that matches my voice.

When the draft is done, I add it to `publish-schedule.yml` with a target date and the GitHub Actions workflow handles the rest, flipping `draft: false` on the right morning and triggering a deploy.

When I'm done I type `/end`. Claude reviews what we did, updates the project tracker, syncs the todo list, captures any research or decisions worth keeping, and commits everything. The session closes cleanly, and the next one picks up with full context through CLAUDE.md files, MEMORY.md, and a searchable knowledge hub that grew slightly since last time.

The whole setup is about 60 lines of global config, 11 custom skills, 12 CLI tools, a hook configuration, and a knowledge hub that gets richer with every session. None of it required a framework or a build step. It's markdown files, shell scripts, and CLI tools, which is exactly the kind of stack I keep reaching for.
