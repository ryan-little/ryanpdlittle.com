# ryanpdlittle.com

Hugo static blog at ryanpdlittle.com. Custom `rpdl` theme, GitHub Pages hosting, Cloudflare DNS + analytics, scheduled publishing via GitHub Actions.

## Writing Style

Always read the style guide before writing or editing blog posts: `~/knowledge-hub/projects/ryanpdlittle-com/writing-style.md`

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
content/series/          ← series landing pages (_index.md per series)
data/mileage.json        ← exported Basecamp mileage totals (build-time input)
themes/rpdl/
  layouts/_default/      ← baseof.html, list.html, single.html, terms.html, 404.html
  layouts/_default/_markup/  ← render-image.html (srcset), render-table.html
  layouts/series/        ← term.html (series landing), taxonomy.html
  layouts/partials/      ← head, header, footer, series-nav, whitney-hub, mileage-meter
  layouts/shortcodes/    ← hikemap, photogrid, rawhtml
  assets/css/            ← style.css (all styles), hikemap.css
  assets/js/             ← hikemap.js, whitney-hub.js
  static/vendor/         ← self-hosted Leaflet + Chart.js
static/
  CNAME
  fonts/                 ← self-hosted Inter
  images/                ← global images
archetypes/posts/        ← post template (index.md)
scripts/                 ← optimize-images.sh, export-mileage.py
hugo.toml                ← site config (taxonomies: categories, series, tags)
publish-schedule.yml     ← upcoming post dates
.github/workflows/
  deploy.yml             ← push to main → build + deploy
  scheduled-publish.yml  ← Friday 12:07pm PST auto-publish
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

These live in the knowledge hub at `~/knowledge-hub/projects/ryanpdlittle-com/`,
not in this repo:

- `decisions.md` — design decisions and rationale
- `ideas.md` — post ideas and schedule backlog
- `writing-style.md` — style guide hub
- `writing/` — 5 deep-dive style docs
