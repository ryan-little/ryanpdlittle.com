# Architecture

Hugo static site deployed to GitHub Pages via GitHub Actions. Cloudflare handles DNS, HTTPS, and analytics.

## Site Structure

```
content/posts/           ← page bundles (one dir per post, index.md + images)
themes/rpdl/             ← custom theme (no parent theme)
  layouts/_default/      ← baseof.html, list.html, single.html
  layouts/partials/      ← head.html, header.html, footer.html
  assets/css/style.css   ← full styles: light/dark mode, responsive nav, cards
static/
  CNAME                  ← ryanpdlittle.com
  fonts/                 ← self-hosted Inter
  images/                ← global/shared images
hugo.toml                ← baseURL, theme, Giscus IDs, markup config
```

## Deploy Pipeline

```
git push main
    ↓
.github/workflows/deploy.yml
    ↓
Hugo build (ubuntu-latest, peaceiris/actions-hugo, --minify)
    ↓
Upload artifact → deploy to GitHub Pages
    ↓
Live at ryanpdlittle.com (Cloudflare DNS)
```

## Publishing

Manual: set `draft: false` and push to `main`. The scheduled publishing workflow and `publish-schedule.yml` were removed 2026-09-22; the blog is dormant.

## External Services

| Service | Role |
|---------|------|
| GitHub Pages | Hosting |
| GitHub Actions | CI/CD + scheduled publishing |
| Cloudflare | DNS, HTTPS, Web Analytics |
| Giscus | Comments via GitHub Discussions |

## Hugo Config (hugo.toml)

Key settings:
- `baseURL`: https://ryanpdlittle.com/
- `theme`: rpdl
- `markup.highlight.style`: monokai
- `markup.goldmark.renderer.unsafe`: true (allows raw HTML in Markdown)
- Giscus repo/category IDs in `[params]` — do not change without updating Giscus config
