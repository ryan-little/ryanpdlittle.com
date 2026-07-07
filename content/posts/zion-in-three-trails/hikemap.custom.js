/**
 * Zion — trip step timeline.
 *
 * The three trail maps are rendered by the `hikemap` shortcode; this only
 * covers the bespoke six-day step chart (custom Chart.js plugin for sleep
 * bands, day boundaries, and inline activity labels). Loaded after hikemap.js,
 * so window.HikeMap and Chart are available.
 */
(function () {
  "use strict";

  var VEGAS_COLOR = "rgba(255, 200, 50, 0.8)";
  var ACTIVITY_COLOR = "rgba(80, 200, 120, 1)";
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
            displayColors: false,
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

  function start() {
    var url = new URL("step-timeline.json", document.baseURI).href;
    HikeMap.fetchJSON(url).then(function (data) {
      if (data) initStepTimeline(data);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
