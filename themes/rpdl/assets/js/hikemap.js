/**
 * HikeMap — shared Leaflet + Chart.js helpers for hiking posts.
 *
 * Exposes window.HikeMap with the primitives every hiking map needs
 * (HR colorizer, distance math, tile map, peak markers, elevation chart)
 * plus trackMap() for the common single-track case. The `hikemap` shortcode
 * queues single-track maps on window.__hikemaps; bespoke posts (multi-track
 * overlays, step timelines) call the primitives directly from a small bundle
 * script.
 */
(function () {
  "use strict";

  var CARTO_DARK =
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  var CARTO_ATTR =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

  var OPEN_TOPO = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
  var OPEN_TOPO_ATTR =
    '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';

  var ESRI_SAT =
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  var ESRI_SAT_ATTR =
    '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics';

  // Dynamic HR color: green (low) -> yellow -> red (high).
  // Uses 5th/95th percentiles so outliers don't wash out the scale.
  function makeHRColorizer(points) {
    var hrs = points.map(function (p) { return p.hr; }).filter(Boolean);
    if (hrs.length === 0) return function () { return "#888"; };
    hrs.sort(function (a, b) { return a - b; });
    var p5 = hrs[Math.floor(hrs.length * 0.05)];
    var p95 = hrs[Math.floor(hrs.length * 0.95)];
    var range = p95 - p5 || 1;

    return function (hr) {
      if (!hr) return "#888";
      var t = (hr - p5) / range;
      if (t < 0) t = 0;
      if (t > 1) t = 1;
      var r, g;
      if (t < 0.5) {
        r = Math.round(255 * (t * 2));
        g = 255;
      } else {
        r = 255;
        g = Math.round(255 * (1 - (t - 0.5) * 2));
      }
      return "rgb(" + r + "," + g + ",0)";
    };
  }

  // Haversine distance in miles between two points.
  function haversine(lat1, lon1, lat2, lon2) {
    var R = 3958.8;
    var dLat = ((lat2 - lat1) * Math.PI) / 180;
    var dLon = ((lon2 - lon1) * Math.PI) / 180;
    var a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function cumulativeDistances(points) {
    var dists = [0];
    for (var i = 1; i < points.length; i++) {
      dists.push(
        dists[i - 1] +
          haversine(
            points[i - 1].lat,
            points[i - 1].lon,
            points[i].lat,
            points[i].lon
          )
      );
    }
    return dists;
  }

  // Create a Leaflet map with the three shared tile layers.
  // opts.defaultLayer: "satellite" (default) or "dark".
  function createMap(elementId, opts) {
    var el = document.getElementById(elementId);
    if (!el) return null;
    opts = opts || {};

    var dark = L.tileLayer(CARTO_DARK, { attribution: CARTO_ATTR, maxZoom: 18 });
    var topo = L.tileLayer(OPEN_TOPO, { attribution: OPEN_TOPO_ATTR, maxZoom: 17 });
    var satellite = L.tileLayer(ESRI_SAT, { attribution: ESRI_SAT_ATTR, maxZoom: 18 });

    var active = opts.defaultLayer === "dark" ? dark : satellite;

    var map = L.map(elementId, {
      scrollWheelZoom: true,
      attributionControl: true,
      layers: [active],
    });

    L.control
      .layers(
        { Satellite: satellite, Terrain: topo, Dark: dark },
        null,
        { position: "topright", collapsed: true }
      )
      .addTo(map);

    return map;
  }

  // Lock the map so the track bounds are the maximum zoom-out extent.
  function lockBounds(map, bounds) {
    map.fitBounds(bounds, { padding: [20, 20] });
    map.once("moveend", function () {
      map.setMinZoom(map.getZoom());
      map.setMaxBounds(bounds.pad(0.1));
    });
  }

  // Draw HR-colored polyline segments, extending `bounds` as it goes.
  function drawTrack(map, points, colorize, bounds, weight) {
    weight = weight || 3.5;
    for (var i = 0; i < points.length - 1; i++) {
      L.polyline(
        [
          [points[i].lat, points[i].lon],
          [points[i + 1].lat, points[i + 1].lon],
        ],
        { color: colorize(points[i].hr), weight: weight, opacity: 0.9 }
      ).addTo(map);
    }
    if (bounds) {
      points.forEach(function (p) { bounds.extend([p.lat, p.lon]); });
    }
  }

  // A pin + label at a location. `ele` optional; if given it's appended as "N ft".
  function marker(map, lat, lon, name, ele) {
    if (lat == null) return;
    var label =
      (name ? name : "") +
      (ele != null ? (name ? "<br>" : "") + Math.round(ele).toLocaleString() + " ft" : "");
    var icon = L.divIcon({
      className: "peak-marker",
      html:
        '<div class="peak-marker-dot"></div><div class="peak-marker-label">' +
        label +
        "</div>",
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
    L.marker([lat, lon], { icon: icon, interactive: false }).addTo(map);
  }

  // Peak marker: highest point in `points`, or a fixed [lat, lon, ele].
  function addPeakMarker(map, points, name, fixedCoords) {
    var lat, lon, ele;
    if (fixedCoords) {
      lat = fixedCoords[0];
      lon = fixedCoords[1];
      ele = fixedCoords[2];
    } else {
      var maxEle = -Infinity;
      for (var i = 0; i < points.length; i++) {
        if (points[i].ele != null && points[i].ele > maxEle) {
          maxEle = points[i].ele;
          lat = points[i].lat;
          lon = points[i].lon;
          ele = maxEle;
        }
      }
    }
    marker(map, lat, lon, name, ele);
  }

  function addHRLegend(map) {
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
      var div = L.DomUtil.create("div", "hr-legend");
      div.innerHTML =
        '<div class="hr-legend-title">Heart Rate</div>' +
        '<div class="hr-legend-bar"></div>' +
        '<div class="hr-legend-labels"><span>Low</span><span>High</span></div>';
      return div;
    };
    legend.addTo(map);
  }

  // Standard distance/elevation bar chart, colored by HR.
  function elevationChart(canvasId, points, colorize) {
    var chartEl = document.getElementById(canvasId);
    if (!chartEl || typeof Chart === "undefined") return;

    var dists = cumulativeDistances(points);
    var elevations = points.map(function (p) { return p.ele != null ? p.ele : null; });
    var hrColors = points.map(function (p) { return colorize(p.hr); });

    new Chart(chartEl.getContext("2d"), {
      type: "bar",
      data: {
        labels: dists.map(function (d) { return d.toFixed(2); }),
        datasets: [
          {
            data: elevations,
            backgroundColor: hrColors,
            borderColor: hrColors,
            borderWidth: 0,
            barPercentage: 1.0,
            categoryPercentage: 1.0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: function (items) { return items[0].label + " mi"; },
              label: function (item) {
                var idx = item.dataIndex;
                var ele = elevations[idx];
                var hr = points[idx].hr;
                var parts = [];
                if (ele != null) parts.push(Math.round(ele) + " ft");
                if (hr) parts.push(hr + " bpm");
                return parts.join(" | ");
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            title: { display: true, text: "Distance (mi)", color: "#999", font: { size: 11 } },
            ticks: {
              color: "#888",
              font: { size: 10 },
              maxTicksLimit: 8,
              callback: function (val, idx) {
                var num = parseFloat(this.getLabelForValue(idx));
                if (num === 0 || Math.abs(num - Math.round(num * 2) / 2) < 0.03)
                  return num.toFixed(1);
                return "";
              },
            },
            grid: { display: false },
          },
          y: {
            display: true,
            title: { display: true, text: "Elevation (ft)", color: "#999", font: { size: 11 } },
            ticks: { color: "#888", font: { size: 10 }, maxTicksLimit: 5 },
            grid: { color: "rgba(128, 128, 128, 0.15)" },
            beginAtZero: false,
          },
        },
      },
    });
  }

  // Replace an empty map (and its elevation chart, if any) with a visible
  // message instead of leaving a blank sized box when track data fails to load.
  function showUnavailable(id, hasElevation) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = "Map data unavailable.";
      el.classList.add("hiking-map-unavailable");
    }
    if (hasElevation) {
      var chartEl = document.getElementById(id + "-elevation");
      if (chartEl && chartEl.parentNode) {
        var msg = document.createElement("p");
        msg.className = "hiking-elevation-unavailable";
        msg.textContent = "Elevation data unavailable.";
        chartEl.parentNode.replaceChild(msg, chartEl);
      }
    }
  }

  function fetchJSON(url) {
    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("Failed to fetch " + url);
        return r.json();
      })
      .catch(function (err) {
        console.warn("Map data unavailable:", url, err);
        return null;
      });
  }

  // Generic single-track map + elevation chart. Options:
  //   id           map element id (chart canvas is `${id}-elevation`)
  //   track        JSON url (fetched) — or pass `points` directly
  //   peak         peak label; marks the highest point
  //   peakCoords   [lat, lon, ele] to pin the peak at a fixed spot instead
  //   peakSplit    true -> mark the highest point in each half of the track
  //   peakNames    [nameA, nameB] labels used with peakSplit
  //   markers      [{ coords: [lat, lon], label }] extra pinned markers
  //   defaultLayer "satellite" | "dark"
  //   weight       polyline weight
  //   elevation    set false to skip the elevation chart
  function trackMap(opts) {
    var id = opts.id || opts.mapId;
    if (!document.getElementById(id)) return;

    function build(data) {
      if (!data || !data.points || data.points.length < 2) {
        showUnavailable(id, opts.elevation !== false);
        return;
      }
      var points = data.points;
      var map = createMap(id, opts);
      if (!map) return;

      var colorize = makeHRColorizer(points);
      var bounds = L.latLngBounds();
      drawTrack(map, points, colorize, bounds, opts.weight);

      (opts.markers || []).forEach(function (m) {
        marker(map, m.coords[0], m.coords[1], m.label);
        bounds.extend([m.coords[0], m.coords[1]]);
      });

      lockBounds(map, bounds);

      if (opts.peakSplit && opts.peakNames) {
        var mid = Math.floor(points.length / 2);
        addPeakMarker(map, points.slice(0, mid), opts.peakNames[0]);
        addPeakMarker(map, points.slice(mid), opts.peakNames[1]);
      } else if (opts.peak || opts.peakCoords) {
        addPeakMarker(map, points, opts.peak, opts.peakCoords);
      }

      addHRLegend(map);

      if (opts.elevation !== false) {
        elevationChart(id + "-elevation", points, colorize);
      }
    }

    if (opts.points) build({ points: opts.points });
    else fetchJSON(opts.track).then(build);
  }

  function processQueue() {
    var q = window.__hikemaps || [];
    q.forEach(function (spec) { trackMap(spec); });
    // Replace the array with a live one so any late pushes still run.
    window.__hikemaps = { push: function (spec) { trackMap(spec); } };
  }

  window.HikeMap = {
    makeHRColorizer: makeHRColorizer,
    haversine: haversine,
    cumulativeDistances: cumulativeDistances,
    createMap: createMap,
    lockBounds: lockBounds,
    drawTrack: drawTrack,
    marker: marker,
    addPeakMarker: addPeakMarker,
    addHRLegend: addHRLegend,
    elevationChart: elevationChart,
    fetchJSON: fetchJSON,
    showUnavailable: showUnavailable,
    trackMap: trackMap,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", processQueue);
  } else {
    processQueue();
  }
})();
