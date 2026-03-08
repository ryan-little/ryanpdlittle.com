/**
 * Hiking Maps — Leaflet + Chart.js interactive maps
 * For: hiking-san-diego-with-gps-data blog post
 */

(function () {
  "use strict";

  const CARTO_DARK =
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const CARTO_ATTR =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

  const OPEN_TOPO = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
  const OPEN_TOPO_ATTR =
    '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';

  const ESRI_SAT =
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const ESRI_SAT_ATTR =
    '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics';

  // Dynamic HR color: green (low) → yellow → red (high)
  // Uses 5th/95th percentiles so outliers don't wash out the scale
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
      // Green → Yellow → Orange → Red
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

  // Haversine distance in miles between two points
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

  function createMap(elementId) {
    var el = document.getElementById(elementId);
    if (!el) return null;

    var dark = L.tileLayer(CARTO_DARK, {
      attribution: CARTO_ATTR,
      maxZoom: 18,
    });
    var topo = L.tileLayer(OPEN_TOPO, {
      attribution: OPEN_TOPO_ATTR,
      maxZoom: 17,
    });
    var satellite = L.tileLayer(ESRI_SAT, {
      attribution: ESRI_SAT_ATTR,
      maxZoom: 18,
    });

    var map = L.map(elementId, {
      scrollWheelZoom: true,
      attributionControl: true,
      layers: [dark],
    });

    L.control
      .layers(
        { Dark: dark, Terrain: topo, Satellite: satellite },
        null,
        { position: "topright", collapsed: true }
      )
      .addTo(map);

    return map;
  }

  // Lock map so track bounds are the maximum zoom-out extent
  function lockBounds(map, bounds) {
    map.fitBounds(bounds, { padding: [20, 20] });
    // After fitBounds resolves, set minZoom to current level so user can't zoom out further
    map.once("moveend", function () {
      map.setMinZoom(map.getZoom());
      map.setMaxBounds(bounds.pad(0.1));
    });
  }

  // ---------- Peak Marker ----------

  function addPeakMarker(map, points, name) {
    var maxEle = -Infinity;
    var peakPt = null;
    for (var i = 0; i < points.length; i++) {
      if (points[i].ele != null && points[i].ele > maxEle) {
        maxEle = points[i].ele;
        peakPt = points[i];
      }
    }
    if (!peakPt) return;

    var label = (name ? name + '<br>' : '') + Math.round(maxEle).toLocaleString() + ' ft';
    var icon = L.divIcon({
      className: "peak-marker",
      html: '<div class="peak-marker-dot"></div><div class="peak-marker-label">' + label + '</div>',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    L.marker([peakPt.lat, peakPt.lon], { icon: icon, interactive: false }).addTo(map);
  }

  // ---------- HR Zone Legend ----------

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

  // ---------- Cowles Overlay Map ----------

  function initCowlesOverlay(tracks) {
    var map = createMap("cowles-overlay-map");
    if (!map) return;

    var bounds = L.latLngBounds();

    // Collect all HR points across all tracks for a global colorizer
    var allPoints = [];
    tracks.forEach(function (track) {
      allPoints = allPoints.concat(track.points);
    });
    var colorize = makeHRColorizer(allPoints);

    tracks.forEach(function (track) {
      var points = track.points;

      // Draw HR-colored segments
      for (var i = 0; i < points.length - 1; i++) {
        var seg = L.polyline(
          [
            [points[i].lat, points[i].lon],
            [points[i + 1].lat, points[i + 1].lon],
          ],
          {
            color: colorize(points[i].hr),
            weight: 2.5,
            opacity: 0.8,
          }
        ).addTo(map);
      }

      // Invisible thick line for hover/tooltip
      var latlngs = points.map(function (p) { return [p.lat, p.lon]; });
      var hitLine = L.polyline(latlngs, {
        color: "transparent",
        weight: 12,
        opacity: 0,
      }).addTo(map);

      var date = track.start_time
        ? track.start_time.split(" ")[0]
        : "Unknown";
      var dist = track.distance_miles
        ? track.distance_miles.toFixed(1) + " mi"
        : "—";
      var hr = track.avg_heart_rate ? track.avg_heart_rate + " bpm" : "—";
      var dur = track.duration_seconds
        ? Math.round(track.duration_seconds / 60) + " min"
        : "—";
      var name = track.name || "Cowles Mountain";

      hitLine.bindTooltip(
        "<strong>" +
          name +
          "</strong><br>" +
          date +
          "<br>" +
          dist +
          " &middot; " +
          dur +
          " &middot; " +
          hr,
        {
          className: "cowles-tooltip",
          sticky: true,
        }
      );

      latlngs.forEach(function (ll) {
        bounds.extend(ll);
      });
    });

    // Peak marker from all tracks combined
    var allPts = [];
    tracks.forEach(function (t) { allPts = allPts.concat(t.points); });
    addPeakMarker(map, allPts, "Cowles Mountain");

    addHRLegend(map);
    lockBounds(map, bounds);
  }

  // ---------- Cowles Elevation Profile (standalone, below overlay map) ----------

  function initCowlesElevation(data) {
    var chartEl = document.getElementById("cowles-elevation");
    if (!chartEl || typeof Chart === "undefined" || !data || !data.points) return;

    var points = data.points;
    var colorize = makeHRColorizer(points);
    var dists = cumulativeDistances(points);
    var elevations = points.map(function (p) {
      return p.ele != null ? p.ele : null;
    });
    var hrColors = points.map(function (p) {
      return colorize(p.hr);
    });

    new Chart(chartEl.getContext("2d"), {
      type: "bar",
      data: {
        labels: dists.map(function (d) { return d.toFixed(2); }),
        datasets: [{
          data: elevations,
          backgroundColor: hrColors,
          borderColor: hrColors,
          borderWidth: 0,
          barPercentage: 1.0,
          categoryPercentage: 1.0,
        }],
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
              color: "#888", font: { size: 10 }, maxTicksLimit: 8,
              callback: function (val, idx) {
                var num = parseFloat(this.getLabelForValue(idx));
                if (num === 0 || Math.abs(num - Math.round(num * 2) / 2) < 0.03) return num.toFixed(1);
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

  // ---------- Pyles Peak Map (two peaks: Cowles + Pyles) ----------

  function initPylesMap(data) {
    var mapEl = document.getElementById("pyles-map");
    if (!mapEl || !data || !data.points || data.points.length < 2) return;

    var map = createMap("pyles-map");
    if (!map) return;

    var points = data.points;
    var bounds = L.latLngBounds();
    var colorize = makeHRColorizer(points);

    for (var i = 0; i < points.length - 1; i++) {
      L.polyline(
        [[points[i].lat, points[i].lon], [points[i + 1].lat, points[i + 1].lon]],
        { color: colorize(points[i].hr), weight: 3.5, opacity: 0.9 }
      ).addTo(map);
    }

    points.forEach(function (p) { bounds.extend([p.lat, p.lon]); });
    lockBounds(map, bounds);

    // Cowles summit = highest point south of 32.815
    var cowlesPts = points.filter(function (p) { return p.lat < 32.815 && p.ele != null; });
    var cowlesPeak = cowlesPts.reduce(function (a, b) { return (a.ele > b.ele) ? a : b; });
    addPeakMarker(map, [cowlesPeak], "Cowles Mountain");

    // Pyles Peak = highest point north of 32.815
    var pylesPts = points.filter(function (p) { return p.lat >= 32.815 && p.ele != null; });
    var pylesPeak = pylesPts.reduce(function (a, b) { return (a.ele > b.ele) ? a : b; });
    addPeakMarker(map, [pylesPeak], "Pyles Peak");

    addHRLegend(map);

    // Elevation chart
    var chartEl = document.getElementById("pyles-map-elevation");
    if (!chartEl || typeof Chart === "undefined") return;

    var dists = cumulativeDistances(points);
    var elevations = points.map(function (p) { return p.ele != null ? p.ele : null; });
    var hrColors = points.map(function (p) { return colorize(p.hr); });

    new Chart(chartEl.getContext("2d"), {
      type: "bar",
      data: {
        labels: dists.map(function (d) { return d.toFixed(2); }),
        datasets: [{
          data: elevations, backgroundColor: hrColors, borderColor: hrColors,
          borderWidth: 0, barPercentage: 1.0, categoryPercentage: 1.0,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: function (items) { return items[0].label + " mi"; },
              label: function (item) {
                var idx = item.dataIndex;
                var ele = elevations[idx]; var hr = points[idx].hr;
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
              color: "#888", font: { size: 10 }, maxTicksLimit: 8,
              callback: function (val, idx) {
                var num = parseFloat(this.getLabelForValue(idx));
                if (num === 0 || Math.abs(num - Math.round(num * 2) / 2) < 0.03) return num.toFixed(1);
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

  // ---------- Single Track Map with Dynamic HR Gradient + Elevation ----------

  function initSingleTrackMap(mapId, data, peakName) {
    var mapEl = document.getElementById(mapId);
    if (!mapEl || !data || !data.points || data.points.length < 2) return;

    var map = createMap(mapId);
    if (!map) return;

    var points = data.points;
    var bounds = L.latLngBounds();
    var colorize = makeHRColorizer(points);

    // Draw polyline segments colored by dynamic HR
    for (var i = 0; i < points.length - 1; i++) {
      var color = colorize(points[i].hr);
      L.polyline(
        [
          [points[i].lat, points[i].lon],
          [points[i + 1].lat, points[i + 1].lon],
        ],
        {
          color: color,
          weight: 3.5,
          opacity: 0.9,
        }
      ).addTo(map);
    }

    points.forEach(function (p) {
      bounds.extend([p.lat, p.lon]);
    });
    lockBounds(map, bounds);

    addPeakMarker(map, points, peakName);
    addHRLegend(map);

    // Elevation profile chart
    var chartId = mapId + "-elevation";
    var chartEl = document.getElementById(chartId);
    if (!chartEl || typeof Chart === "undefined") return;

    var dists = cumulativeDistances(points);
    var elevations = points.map(function (p) {
      return p.ele != null ? p.ele : null;
    });
    var hrColors = points.map(function (p) {
      return colorize(p.hr);
    });

    var ctx = chartEl.getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: dists.map(function (d) {
          return d.toFixed(2);
        }),
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
              title: function (items) {
                return items[0].label + " mi";
              },
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
            title: {
              display: true,
              text: "Distance (mi)",
              color: "#999",
              font: { size: 11 },
            },
            ticks: {
              color: "#888",
              font: { size: 10 },
              maxTicksLimit: 8,
              callback: function (val, idx) {
                var label = this.getLabelForValue(idx);
                var num = parseFloat(label);
                if (num === 0 || Math.abs(num - Math.round(num * 2) / 2) < 0.03)
                  return num.toFixed(1);
                return "";
              },
            },
            grid: { display: false },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Elevation (ft)",
              color: "#999",
              font: { size: 11 },
            },
            ticks: {
              color: "#888",
              font: { size: 10 },
              maxTicksLimit: 5,
            },
            grid: {
              color: "rgba(128, 128, 128, 0.15)",
            },
            beginAtZero: false,
          },
        },
      },
    });
  }

  // ---------- Pendleton Map (memorial marker) ----------

  function initPendletonMap(data) {
    var mapEl = document.getElementById("pendleton-map");
    if (!mapEl || !data || !data.points || data.points.length < 2) return;

    var map = createMap("pendleton-map");
    if (!map) return;

    var points = data.points;
    var bounds = L.latLngBounds();
    var colorize = makeHRColorizer(points);

    for (var i = 0; i < points.length - 1; i++) {
      L.polyline(
        [[points[i].lat, points[i].lon], [points[i + 1].lat, points[i + 1].lon]],
        { color: colorize(points[i].hr), weight: 3.5, opacity: 0.9 }
      ).addTo(map);
    }

    points.forEach(function (p) { bounds.extend([p.lat, p.lon]); });
    lockBounds(map, bounds);

    // Memorial Hill at Camp Horno
    var memLat = 33.36879952795406;
    var memLon = -117.49907659549399;
    bounds.extend([memLat, memLon]);
    var memIcon = L.divIcon({
      className: "peak-marker",
      html: '<div class="peak-marker-dot"></div><div class="peak-marker-label">Memorial Hill<br>Camp Horno</div>',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
    L.marker([memLat, memLon], { icon: memIcon, interactive: false }).addTo(map);

    addHRLegend(map);

    // Elevation chart
    var chartEl = document.getElementById("pendleton-map-elevation");
    if (!chartEl || typeof Chart === "undefined") return;

    var dists = cumulativeDistances(points);
    var elevations = points.map(function (p) { return p.ele != null ? p.ele : null; });
    var hrColors = points.map(function (p) { return colorize(p.hr); });

    new Chart(chartEl.getContext("2d"), {
      type: "bar",
      data: {
        labels: dists.map(function (d) { return d.toFixed(2); }),
        datasets: [{
          data: elevations, backgroundColor: hrColors, borderColor: hrColors,
          borderWidth: 0, barPercentage: 1.0, categoryPercentage: 1.0,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: function (items) { return items[0].label + " mi"; },
              label: function (item) {
                var idx = item.dataIndex;
                var ele = elevations[idx]; var hr = points[idx].hr;
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
              color: "#888", font: { size: 10 }, maxTicksLimit: 8,
              callback: function (val, idx) {
                var num = parseFloat(this.getLabelForValue(idx));
                if (num === 0 || Math.abs(num - Math.round(num * 2) / 2) < 0.03) return num.toFixed(1);
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

  // ---------- Methuselah Map (custom marker for the tree) ----------

  function initMethuselahMap(data) {
    var mapEl = document.getElementById("methuselah-map");
    if (!mapEl || !data || !data.points || data.points.length < 2) return;

    var map = createMap("methuselah-map");
    if (!map) return;

    var points = data.points;
    var bounds = L.latLngBounds();
    var colorize = makeHRColorizer(points);

    for (var i = 0; i < points.length - 1; i++) {
      L.polyline(
        [[points[i].lat, points[i].lon], [points[i + 1].lat, points[i + 1].lon]],
        { color: colorize(points[i].hr), weight: 3.5, opacity: 0.9 }
      ).addTo(map);
    }

    points.forEach(function (p) { bounds.extend([p.lat, p.lon]); });

    // Methuselah tree: 37°22'44.9"N 118°09'57.5"W
    var treeLat = 37 + 22/60 + 44.9/3600;
    var treeLon = -(118 + 9/60 + 57.5/3600);
    bounds.extend([treeLat, treeLon]);

    lockBounds(map, bounds);

    // Mark the tree location
    var treeIcon = L.divIcon({
      className: "peak-marker",
      html: '<div class="peak-marker-dot"></div><div class="peak-marker-label">Methuselah<br>~4,856 years old</div>',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
    L.marker([treeLat, treeLon], { icon: treeIcon, interactive: false }).addTo(map);

    addHRLegend(map);

    // Elevation chart
    var chartEl = document.getElementById("methuselah-map-elevation");
    if (!chartEl || typeof Chart === "undefined") return;

    var dists = cumulativeDistances(points);
    var elevations = points.map(function (p) { return p.ele != null ? p.ele : null; });
    var hrColors = points.map(function (p) { return colorize(p.hr); });

    new Chart(chartEl.getContext("2d"), {
      type: "bar",
      data: {
        labels: dists.map(function (d) { return d.toFixed(2); }),
        datasets: [{
          data: elevations, backgroundColor: hrColors, borderColor: hrColors,
          borderWidth: 0, barPercentage: 1.0, categoryPercentage: 1.0,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: function (items) { return items[0].label + " mi"; },
              label: function (item) {
                var idx = item.dataIndex;
                var ele = elevations[idx]; var hr = points[idx].hr;
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
              color: "#888", font: { size: 10 }, maxTicksLimit: 8,
              callback: function (val, idx) {
                var num = parseFloat(this.getLabelForValue(idx));
                if (num === 0 || Math.abs(num - Math.round(num * 2) / 2) < 0.03) return num.toFixed(1);
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

  // ---------- Fetch and Initialize ----------

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

  function initHikingMaps() {
    var scripts = document.querySelectorAll('script[src*="maps.js"]');
    var basePath = "";
    if (scripts.length > 0) {
      var src = scripts[0].getAttribute("src");
      basePath = src.substring(0, src.lastIndexOf("/") + 1);
    }

    var files = {
      cowles: basePath + "cowles-tracks.json",
      cowlesSingle: basePath + "cowles-single-track.json",
      pyles: basePath + "pyles-track.json",
      elcajon: basePath + "elcajon-track.json",
      pendleton: basePath + "pendleton-track.json",
      methuselah: basePath + "methuselah-track.json",
    };

    Promise.all([
      fetchJSON(files.cowles),
      fetchJSON(files.cowlesSingle),
      fetchJSON(files.pyles),
      fetchJSON(files.elcajon),
      fetchJSON(files.pendleton),
      fetchJSON(files.methuselah),
    ]).then(function (results) {
      if (results[0]) initCowlesOverlay(results[0]);
      if (results[1]) initCowlesElevation(results[1]);
      if (results[2]) initPylesMap(results[2]);
      if (results[3]) initSingleTrackMap("elcajon-map", results[3], "El Cajon Mountain");
      if (results[4]) initPendletonMap(results[4]);
      if (results[5]) initMethuselahMap(results[5]);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHikingMaps);
  } else {
    initHikingMaps();
  }
})();
