# Conventions

## Post Front Matter

Every post uses this front matter (from the archetype at `archetypes/posts/index.md`):

```yaml
---
title: "Post Title Here"
date: YYYY-MM-DD
categories: ["trail"]     # required, exactly one: trail | build | life | meta
series: ["whitney-2026"]  # optional, omit if not part of a series
tags: []                  # 0-3, from the closed set below
summary: ""               # one-sentence description for the post card
draft: true               # always start as draft, flip to false on publish
---
```

`draft: true` posts are excluded from production builds. The scheduled publish workflow flips this automatically.

`categories` and `series` are registered Hugo taxonomies, so each value gets a
real term page (`/trail/`, `/series/whitney-2026/`). The older `group` and
`project` fields were unregistered page params that only fed a client-side
homepage filter; they were removed in the 2026-07 IA migration.

**Categories** — the post's primary type, exactly one:

| Category | Covers |
|---|---|
| `trail` | hiking, peaks, trip reports, road trips, parks |
| `build` | making software |
| `life` | sports, gear, opinion, other personal |
| `meta` | the blog talking about itself |

**Series** — a multi-part run. A series exists at 2+ posts, or when the first
post is explicitly titled "Part 1". Registered: `whitney-2026`,
`primal-chase`, `fitness-project`, `whats-coming`, `rf-viewshed`,
`geospatial-python`. Each needs `content/series/<slug>/_index.md`.

**Never hand-number series parts.** `partials/series-nav.html` derives "Part N
of M" from date order within the series, so inserting a post renumbers
everything downstream automatically.

### Hike front matter

Trail posts covering an actual hike carry a `hike:` block used by the Whitney
hub's stats and peak table:

```yaml
hike:
  peak: "San Gorgonio"
  elevation_ft: 11499   # official summit elevation, not the Garmin reading
  distance_mi: 18.37
  gain_ft: 5617
  moving_time: "7:08:36"
  hiked: 2026-06-28     # the hike date, NOT the publish date
  track: "gorgonio-track.json"
  sixpack: true
```

Pull every number from `~/Desktop/Projects/basecamp/data/basecamp.db`
(`activities` table), not from post prose. `hiked` is required and separate
from `date:` because publish dates lag hikes by 12-26 days, so anything sorted
by publish date comes out in the wrong order.

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

**Day-of-week rule:** Posts publish on Fridays. The site ran a Tuesday+Friday
cadence from launch through 2026-04-28 and has been Friday-only since
2026-05-01; the scheduled workflow's cron fires Friday only.

## Writing Rules

Writing style lives in the knowledge hub, not here. Read it before writing or editing:

`~/knowledge-hub/projects/ryanpdlittle-com/writing-style.md`

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

Tags are a **closed set of 11**. They are secondary to `categories` and
`series` and exist only for cross-cutting topics those two can't express (e.g.
`garmin` spans both trail and build posts).

`garmin`, `hiking`, `ai`, `python`, `game-dev`, `javascript`, `sports`, `gis`,
`travel`, `san-diego`, `tools`

Use 0-3 per post. **Do not add a new tag** without deciding it earns a place in
this list — the previous free-form scheme drifted to 37 tags with 21 used
exactly once, which is what the 2026-07 migration cleaned up. If a post needs a
grouping this list can't express, it probably wants a `series`, not a tag.

## Images

- Store in the post's bundle directory (not `static/images/`) for new posts
- **Always convert to WebP** — use `cwebp -q 75` for photos (recommended quality), `-q 90` for screenshots/text
- **Resize to max 1600px wide** before converting — full-resolution phone photos are way too large
- Target under 500KB per image after conversion at 1600px wide. Occasional high-detail photos may slightly exceed this. If significantly over, lower quality or resize further.
- Never screenshot code
- Alt text under 125 characters, describes purpose not appearance
- See knowledge hub `writing/media-and-code.md` for full media guidelines
