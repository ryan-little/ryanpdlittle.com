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

**Day-of-week rules:** Fridays are for series and technical posts. Tuesdays are for one-offs, personal, and non-technical posts. Always slot posts on the right day type.

## Writing Rules

Writing style lives in the knowledge hub, not here. Read it before writing or editing:

`~/Desktop/Projects/knowledge-hub/projects/ryanpdlittle-com/writing-style.md`

The short version:
- Casual but substantive. First person. Blog-as-learning-log.
- No em dashes. Comma-chained sentences preferred over fragments.
- No AI vocabulary (delve, leverage, showcase, robust, pivotal, etc.)
- Lead with a moment, not a summary. No "Wrapping Up" headers.
- One visual element every 150-300 words. Never screenshot code.

## Hiking Maps

Interactive GPS maps (Leaflet track + Chart.js elevation profile, colored by
heart rate) come from the `hikemap` shortcode. Leaflet and Chart.js are
self-hosted under `themes/rpdl/static/vendor/`; the shared logic lives in
`themes/rpdl/assets/js/hikemap.js` and `themes/rpdl/assets/css/hikemap.css`.
Do **not** add per-post CDN `<script>` tags or copy a `maps.js`/`maps.css` into
the bundle — the shortcode loads everything once per page automatically.

Drop the track JSON (`{ "points": [{ lat, lon, ele, hr }, ...] }`) in the post
bundle and add:

```
{{</* hikemap id="wilson-map" track="wilson-track.json" peak="Mt Wilson" */>}}
```

The map div is `id`; the elevation canvas is `<id>-elevation`. Params:

| param         | purpose                                                        |
|---------------|----------------------------------------------------------------|
| `id`          | map element id (required with `track`)                         |
| `track`       | JSON filename in the bundle (required with `id`)               |
| `peak`        | summit label; marks the highest point on the track            |
| `peakcoords`  | `"lat,lon,ele"` to pin the peak at a fixed spot instead        |
| `peaksplit`   | `"true"` to mark the highest point in each half of the track  |
| `peaknames`   | `"First,Second"` labels used with `peaksplit`                 |
| `baselayer`   | `"satellite"` (default) or `"dark"`                           |
| `noelevation` | `"true"` to omit the elevation chart                          |
| `script`      | extra bundle JS to load for bespoke maps (see below)          |

Use it once per map; call it multiple times for multiple maps on one page.

**Bespoke maps** (multi-track overlays, custom markers, non-track charts like a
step timeline) live in a small per-post `hikemap.custom.js` in the bundle that
calls the primitives on `window.HikeMap` (`createMap`, `drawTrack`,
`addPeakMarker`, `marker`, `addHRLegend`, `elevationChart`, `makeHRColorizer`,
`fetchJSON`, `trackMap`). Load it once with `{{</* hikemap script="hikemap.custom.js" */>}}`.
See `zion-in-three-trails` (step timeline) and `hiking-san-diego-with-gps-data`
(19-track Cowles overlay) for examples.

## Tags

Keep tags broad and reusable. Current tags in use: `gis`, `python`, `hugo`, `fitness`, `garmin`, `game-dev`, `ai`, `tools`, `san-diego`, `soccer`, `career`.

Avoid one-off tags per post. Tags should work as meaningful categories across multiple posts.

## Images

- Store in the post's bundle directory (not `static/images/`) for new posts
- **Always convert to WebP** — use `cwebp -q 75` for photos (recommended quality), `-q 90` for screenshots/text
- **Resize to max 1600px wide** before converting — full-resolution phone photos are way too large
- Target under 500KB per image after conversion at 1600px wide. Occasional high-detail photos may slightly exceed this. If significantly over, lower quality or resize further.
- Never screenshot code
- Alt text under 125 characters, describes purpose not appearance
- See knowledge hub `writing/media-and-code.md` for full media guidelines
