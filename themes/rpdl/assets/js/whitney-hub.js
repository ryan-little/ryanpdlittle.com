/**
 * Whitney hub — the combined overview map for the whitney-2026 series page.
 *
 * No mapping logic of its own: this composes the primitives the theme already
 * exposes on window.HikeMap (createMap, drawTrack, marker, addHRLegend,
 * fetchJSON) over the track manifest the hub partial emits. Individual post
 * maps keep using the hikemap shortcode; this is the one place that needs
 * every track at once.
 *
 * Decimation is the reason this file isn't just a loop over trackMap(). Seven
 * tracks is roughly 12,000 points, and drawTrack lays down one polyline per
 * segment so it could colorize each by heart rate — 12,000 polylines on one
 * Leaflet map is enough to stall a phone. Taking every 4th point drops that to
 * about 3,000, which at the zoom level an overview map lives at is visually
 * identical. Full resolution stays on the individual post maps, where a single
 * track can afford it.
 */
(function () {
  "use strict";

  var MAP_ID = "whitney-hub-map";
  var MANIFEST_ID = "whitney-hub-tracks";

  // Keep every Nth point, always including the last so the track doesn't end early.
  var DECIMATE = 4;

  function decimate(points, step) {
    if (points.length <= 2) return points;
    var out = [];
    for (var i = 0; i < points.length; i += step) out.push(points[i]);
    var last = points[points.length - 1];
    if (out[out.length - 1] !== last) out.push(last);
    return out;
  }

  function highestPoint(points) {
    var best = null;
    for (var i = 0; i < points.length; i++) {
      if (points[i].ele == null) continue;
      if (!best || points[i].ele > best.ele) best = points[i];
    }
    return best;
  }

  /**
   * HikeMap.marker draws the label but is intentionally non-interactive, so
   * clicking through to the post needs its own hit target. A transparent
   * circleMarker sitting on the same coordinate keeps the label styling shared
   * with every other map on the site while still being clickable.
   */
  function linkedSummit(map, point, name, elevation, postUrl) {
    var H = window.HikeMap;
    H.marker(map, point.lat, point.lon, name, elevation != null ? elevation : point.ele);

    L.circleMarker([point.lat, point.lon], {
      radius: 14,
      color: "transparent",
      fillColor: "transparent",
      fillOpacity: 0,
      interactive: true,
    })
      .addTo(map)
      .bindTooltip(name)
      .on("click", function () {
        window.location.href = postUrl;
      });
  }

  function init() {
    var el = document.getElementById(MAP_ID);
    var manifestEl = document.getElementById(MANIFEST_ID);
    if (!el || !manifestEl || !window.HikeMap || typeof L === "undefined") return;

    var H = window.HikeMap;
    var manifest;
    try {
      manifest = JSON.parse(manifestEl.textContent);
    } catch (err) {
      console.warn("Whitney hub: bad track manifest", err);
      return;
    }
    if (!manifest.length) return;

    Promise.all(
      manifest.map(function (entry) {
        return H.fetchJSON(entry.trackUrl).then(function (data) {
          return { entry: entry, data: data };
        });
      })
    ).then(function (loaded) {
      var usable = loaded.filter(function (t) {
        return t.data && t.data.points && t.data.points.length > 1;
      });

      if (!usable.length) {
        H.showUnavailable(MAP_ID, false);
        return;
      }

      usable.forEach(function (t) {
        t.points = decimate(t.data.points, DECIMATE);
      });

      var map = H.createMap(MAP_ID, { defaultLayer: "satellite" });
      if (!map) return;

      // One colorizer across every track, so heart rate is comparable
      // mountain-to-mountain instead of rescaled per hike.
      var allPoints = [];
      usable.forEach(function (t) {
        allPoints = allPoints.concat(t.points);
      });
      var colorize = H.makeHRColorizer(allPoints);

      var bounds = L.latLngBounds();
      usable.forEach(function (t) {
        H.drawTrack(map, t.points, colorize, bounds, 2.5);
      });

      usable.forEach(function (t) {
        var summit = highestPoint(t.points);
        if (summit) {
          linkedSummit(map, summit, t.entry.name, t.entry.elevation, t.entry.postUrl);
        }
      });

      // Plain fitBounds rather than HikeMap.lockBounds: these tracks span the
      // San Gabriels to the Sierra, and pinning min zoom to that extent would
      // stop anyone from pulling back far enough to see where they sit in
      // California.
      map.fitBounds(bounds, { padding: [24, 24] });

      H.addHRLegend(map);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
