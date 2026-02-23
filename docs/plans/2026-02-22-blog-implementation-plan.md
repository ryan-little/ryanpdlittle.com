# ryanpdlittle.com Blog Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up a minimal dark-themed Hugo blog at ryanpdlittle.com with Markdown + notebook support, tag filtering, and automated GitHub Pages deployment.

**Architecture:** Hugo static site generator with a custom theme (`rpdl`). Posts are Markdown files dropped into `content/posts/`. GitHub Action builds and deploys on push to `main`. Custom domain via CNAME + Cloudflare DNS.

**Tech Stack:** Hugo, HTML/CSS, GitHub Actions, GitHub Pages, Cloudflare DNS

---

### Task 1: Install Hugo and Initialize Site

**Files:**
- Create: `hugo.toml`
- Create: `archetypes/default.md`

**Step 1: Install Hugo via Homebrew**

Run: `brew install hugo`
Expected: Hugo installed successfully

**Step 2: Verify installation**

Run: `hugo version`
Expected: Output showing hugo version (v0.140+ expected)

**Step 3: Initialize Hugo site in the existing directory**

Run: `cd ~/Desktop/Projects/ryanpdlittle.com && hugo new site . --force`
Expected: Hugo scaffolds config and directories (--force because directory already exists with docs/)

**Step 4: Configure hugo.toml**

Replace the generated `hugo.toml` with:

```toml
baseURL = "https://ryanpdlittle.com/"
languageCode = "en-us"
title = "Ryan Little"
theme = "rpdl"

[params]
  subtitle = "Geospatial Analyst — Learning Log & Portfolio"
  description = "Blog by Ryan Little — geospatial analysis, Python, remote sensing, and wildfire research."
  author = "Ryan Little"

[taxonomies]
  tag = "tags"

[markup]
  [markup.highlight]
    style = "monokai"
    lineNos = false
  [markup.goldmark]
    [markup.goldmark.renderer]
      unsafe = true
```

Note: `unsafe = true` is required so that raw HTML (Folium map embeds, iframes) renders in posts.

**Step 5: Set up the default archetype**

Replace `archetypes/default.md` with:

```markdown
---
title: "{{ replace .File.ContentBaseName `-` ` ` | title }}"
date: {{ .Date }}
tags: []
summary: ""
draft: true
---
```

**Step 6: Commit**

```bash
git init
git add hugo.toml archetypes/default.md
git commit -m "feat: initialize Hugo site with config"
```

---

### Task 2: Create Custom Theme — Base Layout

**Files:**
- Create: `themes/rpdl/layouts/_default/baseof.html`
- Create: `themes/rpdl/layouts/partials/head.html`
- Create: `themes/rpdl/layouts/partials/header.html`
- Create: `themes/rpdl/layouts/partials/footer.html`

**Step 1: Create theme directory structure**

Run:
```bash
mkdir -p themes/rpdl/layouts/_default
mkdir -p themes/rpdl/layouts/partials
mkdir -p themes/rpdl/static/css
```

**Step 2: Create baseof.html (base template)**

`themes/rpdl/layouts/_default/baseof.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  {{- partial "head.html" . -}}
</head>
<body>
  {{- partial "header.html" . -}}
  <main>
    {{- block "main" . }}{{- end }}
  </main>
  {{- partial "footer.html" . -}}
</body>
</html>
```

**Step 3: Create head.html partial**

`themes/rpdl/layouts/partials/head.html`:

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ if .IsHome }}{{ .Site.Title }}{{ else }}{{ .Title }} — {{ .Site.Title }}{{ end }}</title>
<meta name="description" content="{{ with .Params.summary }}{{ . }}{{ else }}{{ .Site.Params.description }}{{ end }}">
<meta name="author" content="{{ .Site.Params.author }}">
<link rel="canonical" href="{{ .Permalink }}">

<!-- Open Graph -->
<meta property="og:type" content="{{ if .IsPage }}article{{ else }}website{{ end }}">
<meta property="og:url" content="{{ .Permalink }}">
<meta property="og:title" content="{{ .Title }}">
<meta property="og:description" content="{{ with .Params.summary }}{{ . }}{{ else }}{{ .Site.Params.description }}{{ end }}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{{ "css/style.css" | relURL }}">
```

**Step 4: Create header.html partial**

`themes/rpdl/layouts/partials/header.html`:

```html
<header>
  <nav>
    <a href="{{ "/" | relURL }}" class="site-title">{{ .Site.Title }}</a>
  </nav>
</header>
```

**Step 5: Create footer.html partial**

`themes/rpdl/layouts/partials/footer.html`:

```html
<footer>
  <div class="footer-links">
    <a href="https://ryan-little.com" target="_blank" rel="noopener">Portfolio</a>
    <a href="https://github.com/ryan-little" target="_blank" rel="noopener">GitHub</a>
    <a href="https://linkedin.com/in/rpdlittle" target="_blank" rel="noopener">LinkedIn</a>
  </div>
</footer>
```

**Step 6: Commit**

```bash
git add themes/rpdl/layouts/
git commit -m "feat: add base layout with head, header, footer partials"
```

---

### Task 3: Create Custom Theme — Homepage & List Template

**Files:**
- Create: `themes/rpdl/layouts/index.html`
- Create: `themes/rpdl/layouts/_default/list.html`

**Step 1: Create homepage template**

`themes/rpdl/layouts/index.html`:

```html
{{ define "main" }}
<div class="hero">
  <h1>{{ .Site.Title }}</h1>
  <p class="subtitle">{{ .Site.Params.subtitle }}</p>
</div>

<div class="post-list">
  {{ range where .Site.RegularPages "Section" "posts" }}
  <article class="post-card">
    <a href="{{ .Permalink }}">
      <h2>{{ .Title }}</h2>
    </a>
    <time datetime="{{ .Date.Format "2006-01-02" }}">{{ .Date.Format "January 2, 2006" }}</time>
    {{ with .Params.tags }}
    <div class="tags">
      {{ range . }}<a href="{{ "tags/" | relURL }}{{ . | urlize }}/" class="tag">{{ . }}</a>{{ end }}
    </div>
    {{ end }}
    {{ with .Params.summary }}<p class="summary">{{ . }}</p>{{ end }}
  </article>
  {{ end }}
</div>
{{ end }}
```

**Step 2: Create list template (for tag pages)**

`themes/rpdl/layouts/_default/list.html`:

```html
{{ define "main" }}
<div class="list-header">
  <h1>{{ .Title }}</h1>
</div>

<div class="post-list">
  {{ range .Pages }}
  <article class="post-card">
    <a href="{{ .Permalink }}">
      <h2>{{ .Title }}</h2>
    </a>
    <time datetime="{{ .Date.Format "2006-01-02" }}">{{ .Date.Format "January 2, 2006" }}</time>
    {{ with .Params.tags }}
    <div class="tags">
      {{ range . }}<a href="{{ "tags/" | relURL }}{{ . | urlize }}/" class="tag">{{ . }}</a>{{ end }}
    </div>
    {{ end }}
    {{ with .Params.summary }}<p class="summary">{{ . }}</p>{{ end }}
  </article>
  {{ end }}
</div>
{{ end }}
```

**Step 3: Commit**

```bash
git add themes/rpdl/layouts/index.html themes/rpdl/layouts/_default/list.html
git commit -m "feat: add homepage and list templates with tag support"
```

---

### Task 4: Create Custom Theme — Single Post Template

**Files:**
- Create: `themes/rpdl/layouts/_default/single.html`

**Step 1: Create single post template**

`themes/rpdl/layouts/_default/single.html`:

```html
{{ define "main" }}
<article class="post">
  <header class="post-header">
    <h1>{{ .Title }}</h1>
    <time datetime="{{ .Date.Format "2006-01-02" }}">{{ .Date.Format "January 2, 2006" }}</time>
    {{ with .Params.tags }}
    <div class="tags">
      {{ range . }}<a href="{{ "tags/" | relURL }}{{ . | urlize }}/" class="tag">{{ . }}</a>{{ end }}
    </div>
    {{ end }}
  </header>

  <div class="post-content">
    {{ .Content }}
  </div>
</article>
{{ end }}
```

**Step 2: Commit**

```bash
git add themes/rpdl/layouts/_default/single.html
git commit -m "feat: add single post template"
```

---

### Task 5: Create Custom Theme — Stylesheet

**Files:**
- Create: `themes/rpdl/static/css/style.css`

**Step 1: Create the stylesheet**

`themes/rpdl/static/css/style.css`:

```css
/* === Reset & Base === */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg: #0a0a0a;
  --bg-elevated: #111;
  --text: #e0e0e0;
  --text-secondary: #aaa;
  --accent: #e8a849;
  --accent-hover: #f0bc6a;
  --border: #222;
  --max-width: 720px;
  --font: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  line-height: 1.7;
  min-height: 100vh;
}

a {
  color: var(--accent);
  text-decoration: none;
  transition: color 0.2s;
}

a:hover {
  color: var(--accent-hover);
}

/* === Header === */
header {
  border-bottom: 1px solid var(--border);
  padding: 1.5rem 0;
}

nav {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 1.5rem;
}

.site-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
}

.site-title:hover {
  color: var(--accent);
}

/* === Main === */
main {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

/* === Hero === */
.hero {
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* === Post List === */
.list-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-transform: capitalize;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.post-card {
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border);
}

.post-card:last-child {
  border-bottom: none;
}

.post-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
}

.post-card a {
  color: var(--text);
}

.post-card a:hover {
  color: var(--accent);
}

.post-card time {
  display: block;
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.summary {
  color: var(--text-secondary);
  margin-top: 0.5rem;
  font-size: 0.95rem;
}

/* === Tags === */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.2rem 0.6rem;
  border: 1px solid var(--accent);
  border-radius: 4px;
  color: var(--accent);
  transition: background 0.2s, color 0.2s;
}

.tag:hover {
  background: var(--accent);
  color: var(--bg);
}

/* === Single Post === */
.post-header {
  margin-bottom: 2rem;
}

.post-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.3;
}

.post-header time {
  display: block;
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

/* === Post Content === */
.post-content {
  font-size: 1rem;
  line-height: 1.8;
}

.post-content h2 {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 2rem 0 0.75rem;
}

.post-content h3 {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 1.5rem 0 0.5rem;
}

.post-content p {
  margin-bottom: 1rem;
}

.post-content img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 1.5rem 0;
}

.post-content pre {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
  margin: 1.5rem 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.post-content code {
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.875em;
}

.post-content :not(pre) > code {
  background: var(--bg-elevated);
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  border: 1px solid var(--border);
}

.post-content blockquote {
  border-left: 3px solid var(--accent);
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: var(--text-secondary);
  font-style: italic;
}

.post-content ul, .post-content ol {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.post-content li {
  margin-bottom: 0.35rem;
}

.post-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.post-content th, .post-content td {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  text-align: left;
}

.post-content th {
  background: var(--bg-elevated);
  font-weight: 600;
}

/* Embedded maps / iframes */
.post-content iframe {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 6px;
  margin: 1.5rem 0;
}

/* === Footer === */
footer {
  border-top: 1px solid var(--border);
  padding: 2rem 0;
  text-align: center;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: 0.85rem;
}

.footer-links a {
  color: var(--text-secondary);
}

.footer-links a:hover {
  color: var(--accent);
}

/* === Responsive === */
@media (max-width: 600px) {
  .hero h1 {
    font-size: 1.5rem;
  }

  .post-header h1 {
    font-size: 1.35rem;
  }

  main {
    padding: 1.5rem 1rem 3rem;
  }
}
```

**Step 2: Commit**

```bash
git add themes/rpdl/static/css/style.css
git commit -m "feat: add dark theme stylesheet"
```

---

### Task 6: Add Test Post and Verify Local Build

**Files:**
- Create: `content/posts/hello-world.md`

**Step 1: Create a test post**

`content/posts/hello-world.md`:

```markdown
---
title: "Hello World"
date: 2026-02-22
tags: ["meta"]
summary: "First post — testing the blog setup."
draft: false
---

This is the first post on the blog. Just making sure everything works.

## Code Test

```python
import geopandas as gpd

gdf = gpd.read_file("data/parcels.shp")
print(gdf.head())
```

## Image Test

Images would go here with `![alt text](images/example.png)`.

## Blockquote Test

> Geography is the subject which holds the key to our future.
> — Michael Palin
```

**Step 2: Run Hugo dev server and verify**

Run: `cd ~/Desktop/Projects/ryanpdlittle.com && hugo server -D`
Expected: Server starts at http://localhost:1313, homepage shows the test post with title, date, tag, summary. Clicking through shows the full post. Dark theme renders correctly.

**Step 3: Verify the build**

Run: `hugo`
Expected: Build completes with no errors, `public/` directory created with static HTML.

**Step 4: Commit**

```bash
git add content/posts/hello-world.md
git commit -m "feat: add test post to verify build"
```

---

### Task 7: Set Up GitHub Pages Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `static/CNAME`

**Step 1: Create GitHub Actions workflow**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy Hugo to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: 'latest'
          extended: true

      - name: Build
        run: hugo --minify

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 2: Create CNAME file**

`static/CNAME`:

```
ryanpdlittle.com
```

This goes in `static/` so Hugo copies it to `public/` at build time.

**Step 3: Commit**

```bash
git add .github/workflows/deploy.yml static/CNAME
git commit -m "feat: add GitHub Actions deploy workflow and CNAME"
```

---

### Task 8: Create GitHub Repo and Push

**Step 1: Create the GitHub repository**

Run: `cd ~/Desktop/Projects/ryanpdlittle.com && gh repo create ryanpdlittle.com --public --source=. --remote=origin`

**Step 2: Push to main**

Run: `git push -u origin main`
Expected: Code pushed, GitHub Action triggers.

**Step 3: Enable GitHub Pages in repo settings**

Run: `gh api repos/ryan-little/ryanpdlittle.com/pages -X POST -f build_type=workflow`
Expected: GitHub Pages enabled with Actions as the source.

**Step 4: Verify deployment**

Wait for the Action to complete, then check: `gh run list --limit 1`
Expected: Workflow run completes successfully.

---

### Task 9: Configure Cloudflare DNS

**Step 1: Add DNS records in Cloudflare**

This is a manual step in the Cloudflare dashboard for ryanpdlittle.com:

- `CNAME` record: `ryanpdlittle.com` → `ryan-little.github.io` (DNS only, not proxied)
- Or if using apex domain with A records:
  - `A` → `185.199.108.153`
  - `A` → `185.199.109.153`
  - `A` → `185.199.110.153`
  - `A` → `185.199.111.153`

**Step 2: Verify custom domain**

Run: `gh api repos/ryan-little/ryanpdlittle.com/pages -q '.cname'`
Expected: `ryanpdlittle.com`

**Step 3: Verify HTTPS**

After DNS propagates (may take a few minutes), visit https://ryanpdlittle.com
Expected: Site loads with HTTPS, shows the blog with the test post.

---

### Task 10: Add .gitignore and Clean Up

**Files:**
- Create: `.gitignore`

**Step 1: Create .gitignore**

`.gitignore`:

```
public/
resources/
.hugo_build.lock
.DS_Store
```

**Step 2: Remove test post (optional)**

Delete `content/posts/hello-world.md` once you've verified everything works — or keep it as your first post.

**Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: add .gitignore"
```
