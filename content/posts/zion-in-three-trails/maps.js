/**
 * Zion Maps — Leaflet + Chart.js interactive maps
 * For: zion-in-three-trails blog post
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
      layers: [satellite],
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

  function lockBounds(map, bounds) {
    map.fitBounds(bounds, { padding: [20, 20] });
    map.once("moveend", function () {
      map.setMinZoom(map.getZoom());
      map.setMaxBounds(bounds.pad(0.1));
    });
  }

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
    if (lat == null) return;

    var label = (name ? name + "<br>" : "") + (ele ? Math.round(ele).toLocaleString() + " ft" : "");
    var icon = L.divIcon({
      className: "peak-marker",
      html: '<div class="peak-marker-dot"></div><div class="peak-marker-label">' + label + "</div>",
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    L.marker([lat, lon], { icon: icon, interactive: false }).addTo(map);
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

  function initSingleTrackMap(mapId, data, peakName, peakCoords) {
    var mapEl = document.getElementById(mapId);
    if (!mapEl || !data || !data.points || data.points.length < 2) return;

    var map = createMap(mapId);
    if (!map) return;

    var points = data.points;
    var bounds = L.latLngBounds();
    var colorize = makeHRColorizer(points);

    for (var i = 0; i < points.length - 1; i++) {
      L.polyline(
        [
          [points[i].lat, points[i].lon],
          [points[i + 1].lat, points[i + 1].lon],
        ],
        {
          color: colorize(points[i].hr),
          weight: 3.5,
          opacity: 0.9,
        }
      ).addTo(map);
    }

    points.forEach(function (p) {
      bounds.extend([p.lat, p.lon]);
    });
    lockBounds(map, bounds);

    if (peakName) addPeakMarker(map, points, peakName, peakCoords);
    addHRLegend(map);

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

  // ---------- Trip Step Timeline ----------

  var ACTIVITY_COLOR = "rgba(80, 200, 120, 1)";
  var VEGAS_COLOR = "rgba(255, 200, 50, 0.8)";
  var WALKING_COLOR = "rgba(200, 200, 200, 0.5)";
  // Vegas day ranges (hours from trip start)
  var VEGAS_RANGES = [[16, 26.63], [110, 122.9]];

  // Custom plugin: draw sleep bands and day boundary lines (labels are in HTML)
  var sleepBandPlugin = {
    id: "sleepBands",
    beforeDraw: function (chart) {
      var meta = chart._sleepMeta;
      if (!meta) return;

      var ctx = chart.ctx;
      var xScale = chart.scales.x;
      var yScale = chart.scales.y;
      var top = yScale.top;
      var bottom = yScale.bottom;

      // Draw sleep bands
      if (meta.sleepBands) {
        ctx.save();
        meta.sleepBands.forEach(function (band) {
          var x1 = xScale.getPixelForValue(band.startHour);
          var x2 = xScale.getPixelForValue(band.endHour);
          ctx.fillStyle = "rgba(60, 60, 120, 0.25)";
          ctx.fillRect(x1, top, x2 - x1, bottom - top);
        });
        ctx.restore();
      }

      // Draw day boundary lines
      if (meta.dayMarkers) {
        ctx.save();
        meta.dayMarkers.forEach(function (dm, i) {
          if (i > 0) {
            var x = xScale.getPixelForValue(dm.hour);
            ctx.strokeStyle = "rgba(128, 128, 128, 0.3)";
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });
        ctx.restore();
      }

      // Draw inline activity labels — positioned at the end of each green segment
      if (meta.activities) {
        ctx.save();
        var dataset = chart.data.datasets[0];
        meta.activities.forEach(function (act) {
          var labelHour = act.startHour;
          var x = xScale.getPixelForValue(labelHour);
          // Find y value at the start of the activity
          var labels = chart.data.labels;
          var yVal = null;
          for (var i = 0; i < labels.length - 1; i++) {
            if (labels[i] <= labelHour && labels[i + 1] >= labelHour) {
              var t = (labelHour - labels[i]) / (labels[i + 1] - labels[i]);
              yVal = dataset.data[i] + t * (dataset.data[i + 1] - dataset.data[i]);
              break;
            }
          }
          if (yVal == null) return;
          var y = yScale.getPixelForValue(yVal);

          // Per-activity nudge offsets [right, up]
          var nudge = {
            "Watchman Trail": [10, 2],
            "Angels Landing": [22, 8],
            "The Narrows": [20, 1],
          };
          var n = nudge[act.name] || [10, 2];

          ctx.font = "bold 9px -apple-system, sans-serif";
          ctx.fillStyle = "rgba(80, 200, 120, 0.9)";
          ctx.textAlign = "left";
          ctx.fillText(act.name, x + n[0], y - n[1]);
        });
        ctx.restore();
      }
    },
  };

  // Build HTML day labels above the chart
  function buildDayLabels(container, data) {
    var labelRow = document.createElement("div");
    labelRow.className = "timeline-day-labels";
    var maxHour = data.timeline[data.timeline.length - 1].hour;

    data.dayMarkers.forEach(function (dm, i) {
      var nextHour = (i < data.dayMarkers.length - 1) ? data.dayMarkers[i + 1].hour : maxHour;
      var startPct = (dm.hour / maxHour) * 100;
      var widthPct = ((nextHour - dm.hour) / maxHour) * 100;

      var cell = document.createElement("div");
      cell.className = "timeline-day-cell";
      cell.style.left = startPct + "%";
      cell.style.width = widthPct + "%";

      var dateEl = document.createElement("span");
      dateEl.className = "timeline-day-date";
      dateEl.textContent = dm.label;

      cell.appendChild(dateEl);
      labelRow.appendChild(cell);
    });

    container.insertBefore(labelRow, container.firstChild);
  }

  function initStepTimeline(data) {
    var container = document.getElementById("step-timeline-wrap");
    var chartEl = document.getElementById("step-timeline-chart");
    if (!chartEl || !container || typeof Chart === "undefined" || !data || !data.timeline) return;

    // Build day labels above chart
    buildDayLabels(container, data);

    var timeline = data.timeline;
    var hours = timeline.map(function (p) { return p.hour; });
    var steps = timeline.map(function (p) { return p.steps; });

    // Green during tracked hikes, gold on Vegas days, gray otherwise
    var activities = data.activities || [];
    function isActivity(hour) {
      for (var i = 0; i < activities.length; i++) {
        if (hour >= activities[i].startHour && hour <= activities[i].endHour) return true;
      }
      return false;
    }
    function isVegas(hour) {
      for (var i = 0; i < VEGAS_RANGES.length; i++) {
        if (hour >= VEGAS_RANGES[i][0] && hour < VEGAS_RANGES[i][1]) return true;
      }
      return false;
    }
    function getSegmentColor(hour) {
      if (isActivity(hour)) return ACTIVITY_COLOR;
      if (isVegas(hour)) return VEGAS_COLOR;
      return WALKING_COLOR;
    }

    var chart = new Chart(chartEl.getContext("2d"), {
      type: "line",
      data: {
        labels: hours,
        datasets: [{
          data: steps,
          borderWidth: 2,
          pointRadius: 0,
          pointHitRadius: 6,
          fill: true,
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          tension: 0.1,
          segment: {
            borderColor: function (ctx) {
              return getSegmentColor(hours[ctx.p0DataIndex]);
            },
          },
        }],
      },
      plugins: [sleepBandPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: function (items) {
                var hour = parseFloat(items[0].label);
                var day = Math.floor(hour / 24);
                var dayHour = hour % 24;
                var h = Math.floor(dayHour);
                var m = Math.round((dayHour - h) * 60);
                var ampm = h >= 12 ? "PM" : "AM";
                var h12 = h % 12 || 12;
                var dates = ["Mar 18", "Mar 19", "Mar 20", "Mar 21", "Mar 22", "Mar 23"];
                var label = (dates[day] || "Day " + (day + 1)) + " " + h12 + ":" + (m < 10 ? "0" : "") + m + " " + ampm;
                if (isActivity(hour)) {
                  for (var i = 0; i < activities.length; i++) {
                    if (hour >= activities[i].startHour && hour <= activities[i].endHour) {
                      label += " — " + activities[i].name;
                      break;
                    }
                  }
                }
                return label;
              },
              label: function (item) {
                return item.raw.toLocaleString() + " total steps";
              },
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            display: true,
            min: 0,
            max: hours[hours.length - 1],
            ticks: {
              color: "#888",
              font: { size: 9 },
              maxTicksLimit: 12,
              callback: function (val) {
                var dayHour = val % 24;
                if (dayHour === 0 || dayHour === 12) {
                  return dayHour === 0 ? "12a" : "12p";
                }
                return "";
              },
            },
            grid: { display: false },
          },
          y: {
            display: true,
            title: { display: true, text: "Cumulative Steps", color: "#999", font: { size: 11 } },
            ticks: {
              color: "#888",
              font: { size: 10 },
              maxTicksLimit: 5,
              callback: function (val) {
                if (val >= 1000) return (val / 1000).toFixed(0) + "k";
                return val;
              },
            },
            grid: { color: "rgba(128, 128, 128, 0.15)" },
            beginAtZero: true,
          },
        },
      },
    });

    // Attach metadata for the plugin
    chart._sleepMeta = {
      sleepBands: data.sleepBands,
      dayMarkers: data.dayMarkers,
      activities: data.activities,
    };
    chart.update();
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

  function initZionMaps() {
    var scripts = document.querySelectorAll('script[src*="maps.js"]');
    var basePath = "";
    if (scripts.length > 0) {
      var src = scripts[0].getAttribute("src");
      basePath = src.substring(0, src.lastIndexOf("/") + 1);
    }

    var files = {
      watchman: basePath + "watchman-track.json",
      angels: basePath + "angels-landing-track.json",
      narrows: basePath + "narrows-track.json",
      timeline: basePath + "step-timeline.json",
    };

    Promise.all([
      fetchJSON(files.watchman),
      fetchJSON(files.angels),
      fetchJSON(files.narrows),
      fetchJSON(files.timeline),
    ]).then(function (results) {
      // Markers placed at specific distances along each track
      if (results[0]) initSingleTrackMap("watchman-map", results[0], "Watchman Overlook", [37.19865, -112.97621, 4355]);
      if (results[1]) initSingleTrackMap("angels-landing-map", results[1], "Angels Landing", [37.26966, -112.94827, 5795]);
      if (results[2]) initSingleTrackMap("narrows-map", results[2], "The Narrows", [37.28553, -112.94810, 4488]);
      if (results[3]) initStepTimeline(results[3]);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initZionMaps);
  } else {
    initZionMaps();
  }
})();
