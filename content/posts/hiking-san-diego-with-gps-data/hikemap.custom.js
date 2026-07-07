/**
 * Hiking San Diego — bespoke maps.
 *
 * The generic single-track case lives in the theme's HikeMap library; this
 * covers the one-off compositions this post needs: the 19-track Cowles overlay
 * with per-track tooltips, the two-peak Pyles split, and the Pendleton /
 * Methuselah fixed markers. Loaded after hikemap.js, so window.HikeMap and
 * Chart are available. All maps default to the dark base layer.
 */
(function () {
  "use strict";

  var H = window.HikeMap;
  var DARK = { defaultLayer: "dark" };

  // ---------- Cowles Overlay Map (19 tracks, one global HR scale) ----------

  function initCowlesOverlay(tracks) {
    var map = H.createMap("cowles-overlay-map", DARK);
    if (!map) return;

    var bounds = L.latLngBounds();

    // Global colorizer across every track so the HR scale is comparable
    var allPoints = [];
    tracks.forEach(function (track) { allPoints = allPoints.concat(track.points); });
    var colorize = H.makeHRColorizer(allPoints);

    tracks.forEach(function (track) {
      var points = track.points;

      for (var i = 0; i < points.length - 1; i++) {
        L.polyline(
          [
            [points[i].lat, points[i].lon],
            [points[i + 1].lat, points[i + 1].lon],
          ],
          { color: colorize(points[i].hr), weight: 2.5, opacity: 0.8 }
        ).addTo(map);
      }

      // Invisible thick line for hover/tooltip
      var latlngs = points.map(function (p) { return [p.lat, p.lon]; });
      var hitLine = L.polyline(latlngs, {
        color: "transparent",
        weight: 12,
        opacity: 0,
      }).addTo(map);

      var date = track.start_time ? track.start_time.split(" ")[0] : "Unknown";
      var dist = track.distance_miles ? track.distance_miles.toFixed(1) + " mi" : "—";
      var hr = track.avg_heart_rate ? track.avg_heart_rate + " bpm" : "—";
      var dur = track.duration_seconds
        ? Math.round(track.duration_seconds / 60) + " min"
        : "—";
      var name = track.name || "Cowles Mountain";

      hitLine.bindTooltip(
        "<strong>" + name + "</strong><br>" +
          date + "<br>" +
          dist + " &middot; " + dur + " &middot; " + hr,
        { className: "cowles-tooltip", sticky: true }
      );

      latlngs.forEach(function (ll) { bounds.extend(ll); });
    });

    H.addPeakMarker(map, allPoints, "Cowles Mountain");
    H.addHRLegend(map);
    H.lockBounds(map, bounds);
  }

  // ---------- Pyles Peak Map (Cowles + Pyles, split by latitude) ----------

  function initPylesMap(data) {
    if (!data || !data.points || data.points.length < 2) return;
    var map = H.createMap("pyles-map", DARK);
    if (!map) return;

    var points = data.points;
    var bounds = L.latLngBounds();
    var colorize = H.makeHRColorizer(points);
    H.drawTrack(map, points, colorize, bounds);
    H.lockBounds(map, bounds);

    // Cowles summit = highest point south of 32.815
    var cowlesPts = points.filter(function (p) { return p.lat < 32.815 && p.ele != null; });
    H.addPeakMarker(map, cowlesPts, "Cowles Mountain");

    // Pyles Peak = highest point north of 32.815
    var pylesPts = points.filter(function (p) { return p.lat >= 32.815 && p.ele != null; });
    H.addPeakMarker(map, pylesPts, "Pyles Peak");

    H.addHRLegend(map);
    H.elevationChart("pyles-map-elevation", points, colorize);
  }

  // ---------- Pendleton Map (memorial marker) ----------

  function initPendletonMap(data) {
    if (!data || !data.points || data.points.length < 2) return;
    var map = H.createMap("pendleton-map", DARK);
    if (!map) return;

    var points = data.points;
    var bounds = L.latLngBounds();
    var colorize = H.makeHRColorizer(points);
    H.drawTrack(map, points, colorize, bounds);

    // Memorial Hill at Camp Horno
    var memLat = 33.36879952795406;
    var memLon = -117.49907659549399;
    bounds.extend([memLat, memLon]);
    H.lockBounds(map, bounds);
    H.marker(map, memLat, memLon, "Memorial Hill<br>Camp Horno");

    H.addHRLegend(map);
    H.elevationChart("pendleton-map-elevation", points, colorize);
  }

  // ---------- Methuselah Map (tree marker) ----------

  function initMethuselahMap(data) {
    if (!data || !data.points || data.points.length < 2) return;
    var map = H.createMap("methuselah-map", DARK);
    if (!map) return;

    var points = data.points;
    var bounds = L.latLngBounds();
    var colorize = H.makeHRColorizer(points);
    H.drawTrack(map, points, colorize, bounds);

    // Methuselah tree: 37°22'44.9"N 118°09'57.5"W
    var treeLat = 37 + 22 / 60 + 44.9 / 3600;
    var treeLon = -(118 + 9 / 60 + 57.5 / 3600);
    bounds.extend([treeLat, treeLon]);
    H.lockBounds(map, bounds);
    H.marker(map, treeLat, treeLon, "Methuselah<br>~4,856 years old");

    H.addHRLegend(map);
    H.elevationChart("methuselah-map-elevation", points, colorize);
  }

  // ---------- Cowles standalone elevation (below the overlay map) ----------

  function initCowlesElevation(data) {
    if (!data || !data.points) return;
    var colorize = H.makeHRColorizer(data.points);
    H.elevationChart("cowles-elevation", data.points, colorize);
  }

  // ---------- Fetch and Initialize ----------

  function url(name) {
    return new URL(name, document.baseURI).href;
  }

  function start() {
    Promise.all([
      H.fetchJSON(url("cowles-tracks.json")),
      H.fetchJSON(url("cowles-single-track.json")),
      H.fetchJSON(url("pyles-track.json")),
      H.fetchJSON(url("elcajon-track.json")),
      H.fetchJSON(url("pendleton-track.json")),
      H.fetchJSON(url("methuselah-track.json")),
    ]).then(function (r) {
      if (r[0]) initCowlesOverlay(r[0]);
      if (r[1]) initCowlesElevation(r[1]);
      if (r[2]) initPylesMap(r[2]);
      if (r[3]) H.trackMap({ id: "elcajon-map", points: r[3].points, peak: "El Cajon Mountain", defaultLayer: "dark" });
      if (r[4]) initPendletonMap(r[4]);
      if (r[5]) initMethuselahMap(r[5]);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
