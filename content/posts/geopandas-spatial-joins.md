---
title: "Spatial Joins in GeoPandas"
date: 2026-02-20
tags: ["python", "geopandas"]
group: "projects"
project: "San Diego Wildfire Gap"
summary: "Quick walkthrough of spatial joins — overlaying parcels with fire hazard zones."
draft: false
---

One of the first things I needed for the wildfire project was to figure out which parcels fall inside fire hazard severity zones. Spatial joins make this easy.

## The Setup

```python
import geopandas as gpd

parcels = gpd.read_file("data/parcels.shp")
hazard_zones = gpd.read_file("data/fhsz.shp")

# Make sure CRS matches
parcels = parcels.to_crs(hazard_zones.crs)
```

## The Join

```python
joined = gpd.sjoin(parcels, hazard_zones, how="inner", predicate="intersects")
print(f"{len(joined)} parcels in hazard zones out of {len(parcels)} total")
```

## What I Learned

- Always check your CRS first — mismatched projections give silent wrong results
- `predicate="intersects"` is the most common, but `"within"` is stricter
- The result keeps all columns from both GeoDataFrames, so watch for name collisions

> The map is not the territory, but a good spatial join gets you closer.
