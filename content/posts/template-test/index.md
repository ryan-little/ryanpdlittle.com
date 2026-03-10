---
title: "Template Test Post"
date: 2026-02-22
tags: ["python", "gis", "wildfire"]
group: "projects"
project: "San Diego Wildfire Gap"
summary: "A test post demonstrating all content formatting options."
draft: true
---

## Headings

### Third Level Heading

Regular paragraph text goes here. This is what body copy looks like in a post. It should be readable and comfortable at the blog's line length.

## Code Blocks

Inline code looks like `gpd.read_file("data.shp")` in a sentence.

```python
import geopandas as gpd
import rasterio
from shapely.geometry import Point

gdf = gpd.read_file("data/parcels.shp")
gdf = gdf.to_crs(epsg=4326)

# Filter to high-risk parcels
high_risk = gdf[gdf["risk_score"] > 0.8]
print(f"{len(high_risk)} high-risk parcels found")
```

## Lists

Unordered:
- First item
- Second item
- Third item with `inline code`

Ordered:
1. Step one
2. Step two
3. Step three

## Blockquote

> The map is not the territory, but a good spatial join gets you closer.

## Table

| Zone | Risk Score | Parcels |
|------|-----------|---------|
| Very High | 0.8+ | 1,247 |
| High | 0.6–0.8 | 3,891 |
| Moderate | 0.4–0.6 | 8,432 |

## Images

Images go like this (uncomment when you have one):
<!-- ![Alt text](images/example.png) -->

## Embedded Map

Interactive maps via iframe (uncomment when you have one):
<!-- <iframe src="/maps/risk-map.html" height="500"></iframe> -->

## Links

Here's a [link to GeoPandas docs](https://geopandas.org) and one to [the main site](https://ryan-little.com).
