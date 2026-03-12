# ryanpdlittle.com

Hugo static blog at ryanpdlittle.com. Custom `rpdl` theme, GitHub Pages hosting, Cloudflare DNS + analytics, scheduled publishing via GitHub Actions.

## Writing Style

Always read the style guide before writing or editing blog posts: `~/Desktop/Projects/knowledge-hub/projects/ryanpdlittle-com/writing-style.md`

It's the hub doc. Load the relevant spoke docs from `writing/` for the specific aspect of the post you're working on (voice, narrative structure, prose craft, anti-AI rules, media/code).

## Commands

```bash
hugo server          # dev server at localhost:1313, live reload
hugo server -D       # include drafts
hugo --minify        # production build → public/
hugo new content posts/<slug>/index.md   # create new post (use archetype)
```

## Project Structure

```
content/posts/           ← page bundles (one dir per post)
themes/rpdl/
  layouts/_default/      ← baseof.html, list.html, single.html
  layouts/partials/      ← head.html, header.html, footer.html
  layouts/shortcodes/
  static/css/style.css   ← all styles (light/dark mode, responsive)
  static/images/
static/
  CNAME
  fonts/                 ← self-hosted Inter
  images/                ← global images
archetypes/posts/        ← post template (index.md)
hugo.toml                ← site config
publish-schedule.yml     ← upcoming post dates
.github/workflows/
  deploy.yml             ← push to main → build + deploy
  scheduled-publish.yml  ← Tue/Fri 6am PDT auto-publish
```

## Content Workflow

1. Create post: `hugo new content posts/<slug>/index.md` (creates page bundle from archetype)
2. Write with `draft: true` — won't appear in production build
3. Add entry to `publish-schedule.yml` with target date
4. The scheduled workflow handles the rest: flips `draft: false`, commits, triggers deploy

To publish immediately: set `draft: false` and push to `main`.

## Conventions

See [CONVENTIONS.md](CONVENTIONS.md) for post front matter, page bundle structure, and content rules.

## Architecture Reference

See [ARCHITECTURE.md](ARCHITECTURE.md) for deploy pipeline details.

## Hub Reference

Knowledge hub: `~/Desktop/Projects/knowledge-hub/projects/ryanpdlittle-com/`
- `overview.md` — status, origin, stack summary
- `architecture.md` — full architecture doc
- `decisions.md` — design decisions and rationale
- `ideas.md` — post ideas and schedule backlog
- `writing-style.md` — style guide hub
- `writing/` — 5 deep-dive style docs
