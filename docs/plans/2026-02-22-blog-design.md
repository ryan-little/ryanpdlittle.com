# ryanpdlittle.com Blog Design

**Date:** 2026-02-22
**Status:** Approved

## Goal

A minimal blog at ryanpdlittle.com serving as a learning log and portfolio-adjacent showcase. Hosted on GitHub Pages.

## Content

- Blog posts authored in Markdown or Jupyter notebooks (mix depending on post)
- Posts tagged (e.g., "wildfire", "python", "gis") with tag-based filtering
- Supports both interactive Leaflet/Folium maps and static map images embedded in posts
- Chronological feed as the homepage, blog-only (no separate about/projects pages)

## Tech Stack

- **Generator:** Hugo
- **Hosting:** GitHub Pages
- **Deploy:** GitHub Action (push to main → hugo build → deploy)
- **Domain:** ryanpdlittle.com (Cloudflare DNS)

## Site Structure

```
ryanpdlittle.com/
├── content/
│   └── posts/              # drop .md files here
├── static/
│   └── images/             # post images
├── themes/
│   └── rpdl/               # custom theme
│       ├── layouts/
│       │   ├── _default/
│       │   │   ├── baseof.html    # base template (head, nav, footer)
│       │   │   ├── list.html      # blog feed / tag pages
│       │   │   └── single.html    # individual post
│       │   ├── partials/
│       │   │   ├── head.html
│       │   │   ├── header.html
│       │   │   └── footer.html
│       │   └── index.html         # homepage (= blog feed)
│       └── static/
│           └── css/
│               └── style.css
├── hugo.toml
└── .github/
    └── workflows/
        └── deploy.yml
```

## Post Format

```markdown
---
title: "Post Title"
date: 2026-03-01
tags: ["wildfire", "python", "geopandas"]
summary: "One-line summary for the feed."
---

Content here.
```

## Design

- **Background:** `#0a0a0a` (consistent with ryan-little.com and wildfire project)
- **Text:** `#e0e0e0` primary, `#aaa` secondary
- **Accent:** Gold `#e8a849` (from ryan-little.com) for links and tags
- **Font:** Inter (Google Fonts)
- **Layout:** Single column, max-width ~720px, centered
- **Homepage:** Site title + subtitle, reverse-chronological post list (title, date, tags, summary)
- **Post page:** Title, date, tags, full content
- **Tag pages:** Click a tag → filtered list of posts with that tag
- **Nav:** Minimal header — site name links home
- **Footer:** Links to ryan-little.com, GitHub, LinkedIn

## Interactive Content

- **Folium/Leaflet maps:** nbconvert outputs embedded HTML; Hugo renders inline
- **Standalone interactive maps:** Drop HTML in `static/`, iframe into post
- **Static images:** Standard markdown `![](images/...)`

## Notebook Workflow

1. Author notebook in Jupyter
2. Run `jupyter nbconvert --to markdown notebook.ipynb`
3. Drop output `.md` + extracted images into `content/posts/`
4. Push — GitHub Action builds and deploys

## Deploy Flow

GitHub Action on push to `main`:
1. Install Hugo
2. Run `hugo build`
3. Deploy `public/` to GitHub Pages
4. CNAME file handles custom domain
