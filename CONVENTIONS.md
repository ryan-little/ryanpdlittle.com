# Conventions

## Post Front Matter

Every post uses this front matter (from the archetype at `archetypes/posts/index.md`):

```yaml
---
title: "Post Title Here"
date: YYYY-MM-DD
tags: [tag1, tag2]
group: ""        # optional grouping (e.g., "primal-chase", "geospatial-python")
project: ""      # related project slug if applicable
summary: ""      # one-sentence description for the post card
draft: true      # always start as draft, flip to false on publish
---
```

`draft: true` posts are excluded from production builds. The scheduled publish workflow flips this automatically.

## Page Bundle Structure

Each post is a page bundle — a directory containing the post and all its assets:

```
content/posts/
  my-post-slug/
    index.md     ← post content
    image.png    ← images co-located with the post
    screenshot.jpg
```

Reference images in Markdown with relative paths: `![alt text](image.png)`. Hugo resolves them from the bundle.

## Creating a New Post

```bash
hugo new content posts/<slug>/index.md
```

This creates the bundle directory and populates `index.md` from the archetype. Slug should be lowercase kebab-case: `why-i-follow-san-diego-fc`.

## Scheduling a Post

1. Write the post with `draft: true`
2. Add an entry to `publish-schedule.yml`:
   ```yaml
   - path: content/posts/<slug>/index.md
     date: YYYY-MM-DD
   ```
3. Push to `main` — the scheduled workflow handles the rest

To publish immediately, set `draft: false` manually and push.

## Writing Rules

Writing style lives in the knowledge hub, not here. Read it before writing or editing:

`~/Desktop/Projects/knowledge-hub/projects/ryanpdlittle-com/writing-style.md`

The short version:
- Casual but substantive. First person. Blog-as-learning-log.
- No em dashes. Comma-chained sentences preferred over fragments.
- No AI vocabulary (delve, leverage, showcase, robust, pivotal, etc.)
- Lead with a moment, not a summary. No "Wrapping Up" headers.
- One visual element every 150-300 words. Never screenshot code.

## Tags

Keep tags broad and reusable. Current tags in use: `gis`, `python`, `hugo`, `fitness`, `garmin`, `game-dev`, `ai`, `tools`, `san-diego`, `soccer`, `career`.

Avoid one-off tags per post. Tags should work as meaningful categories across multiple posts.

## Images

- Store in the post's bundle directory (not `static/images/`) for new posts
- Under 200KB per image — compress PNGs, use WebP where possible
- Never screenshot code
- Alt text under 125 characters, describes purpose not appearance
- See knowledge hub `writing/media-and-code.md` for full media guidelines
