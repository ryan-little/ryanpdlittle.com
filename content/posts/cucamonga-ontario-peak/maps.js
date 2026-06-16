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
            points[i - 1].lat, points[i - 1].lon,
            points[i].lat, points[i].lon
          )
      );
    }
    return dists;
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

  function addPeakMarker(map, lat, lon, label) {
    var icon = L.divIcon({
      className: "peak-marker",
      html: '<div class="peak-marker-dot"></div><div class="peak-marker-label">' + label + "</div>",
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
    L.marker([lat, lon], { icon: icon, interactive: false }).addTo(map);
  }

  function initTrackMap(mapId, elevationId, data) {
    var el = document.getElementById(mapId);
    if (!el || !data || !data.points) return;

    var dark = L.tileLayer(CARTO_DARK, { attribution: CARTO_ATTR, maxZoom: 18 });
    var topo = L.tileLayer(OPEN_TOPO, { attribution: OPEN_TOPO_ATTR, maxZoom: 17 });
    var satellite = L.tileLayer(ESRI_SAT, { attribution: ESRI_SAT_ATTR, maxZoom: 18 });

    var map = L.map(mapId, { scrollWheelZoom: true, layers: [satellite] });
    L.control.layers(
      { Satellite: satellite, Dark: dark, Terrain: topo },
      null,
      { position: "topright", collapsed: true }
    ).addTo(map);

    var points = data.points;
    var colorize = makeHRColorizer(points);
    var bounds = L.latLngBounds();

    for (var i = 0; i < points.length - 1; i++) {
      L.polyline(
        [[points[i].lat, points[i].lon], [points[i + 1].lat, points[i + 1].lon]],
        { color: colorize(points[i].hr), weight: 3, opacity: 0.9 }
      ).addTo(map);
      bounds.extend([points[i].lat, points[i].lon]);
    }
    bounds.extend([points[points.length - 1].lat, points[points.length - 1].lon]);

    // Mark both summits by finding highest point in each half of the track
    var mid = Math.floor(points.length / 2);
    var maxEle1 = -Infinity, peak1 = null;
    for (var i = 0; i < mid; i++) {
      if (points[i].ele != null && points[i].ele > maxEle1) {
        maxEle1 = points[i].ele;
        peak1 = points[i];
      }
    }
    var maxEle2 = -Infinity, peak2 = null;
    for (var i = mid; i < points.length; i++) {
      if (points[i].ele != null && points[i].ele > maxEle2) {
        maxEle2 = points[i].ele;
        peak2 = points[i];
      }
    }
    if (peak1) addPeakMarker(map, peak1.lat, peak1.lon, "Cucamonga Peak<br>" + Math.round(maxEle1).toLocaleString() + " ft");
    if (peak2) addPeakMarker(map, peak2.lat, peak2.lon, "Ontario Peak<br>" + Math.round(maxEle2).toLocaleString() + " ft");

    addHRLegend(map);

    map.fitBounds(bounds, { padding: [20, 20] });
    map.once("moveend", function () {
      map.setMinZoom(map.getZoom());
      map.setMaxBounds(bounds.pad(0.1));
    });

    if (elevationId && typeof Chart !== "undefined") {
      var chartEl = document.getElementById(elevationId);
      if (!chartEl) return;
      var dists = cumulativeDistances(points);
      var elevations = points.map(function (p) { return p.ele != null ? p.ele : null; });
      var hrColors = points.map(function (p) { return colorize(p.hr); });

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
          animation: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: function (items) { return items[0].label + " mi"; },
                label: function (item) {
                  var ele = item.raw != null ? Math.round(item.raw) + " ft" : "—";
                  var hr = points[item.dataIndex] && points[item.dataIndex].hr
                    ? points[item.dataIndex].hr + " bpm" : "";
                  return hr ? ele + " · " + hr : ele;
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                maxTicksLimit: 9,
                color: "#888",
                font: { size: 10 },
                callback: function (val, idx) {
                  var d = dists[idx];
                  return d != null ? d.toFixed(0) + " mi" : "";
                },
              },
              grid: { color: "rgba(255,255,255,0.05)" },
            },
            y: {
              ticks: { color: "#888", font: { size: 10 } },
              grid: { color: "rgba(255,255,255,0.05)" },
            },
          },
        },
      });
    }
  }

  function loadJSON(url, cb) {
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(cb)
      .catch(function (e) { console.error("Failed to load", url, e); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadJSON("cucamonga-track.json", function (data) {
      initTrackMap("cucamonga-map", "cucamonga-elevation", data);
    });
  });
})();
