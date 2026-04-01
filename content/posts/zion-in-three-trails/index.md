---
title: "Zion in Three Trails"
date: 2026-04-07
tags: ["hiking", "garmin", "fitness"]
group: "personal"
project: ""
summary: "Three days of hiking Zion National Park with GPS data from my Garmin, from the Watchman Trail warmup to Angels Landing and The Narrows."
draft: true
---

{{< rawhtml >}}
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<link rel="stylesheet" href="maps.css" />
<script src="maps.js" defer></script>
{{< /rawhtml >}}

The last line of my [Hiking San Diego](/posts/hiking-san-diego-with-gps-data/) post mentioned I was heading to Zion the week it went live. That was true, and the Garmin was running the whole time. Three days, three trails, and a stop in Vegas on either side that probably added more steps to the watch than any of the actual hikes did.

Zion was the first national park trip I've done where I had GPS and heart rate data for everything, and looking at the tracks afterward made the whole experience more interesting in retrospect. You remember how a trail felt, but the data shows you things you didn't notice in the moment, like how flat The Narrows actually is despite feeling like a full day of effort, or how Angels Landing pushed my heart rate higher than anything I've recorded since I started hiking with the Instinct 2X.

The chart below is step data from my Garmin for the entire trip, pulled in 15 minute intervals and stitched together as one continuous timeline. The blue shaded bands are sleep periods, and the green segments are the three tracked hikes. You can see the rhythm of the whole week in one picture: the drive to Vegas on the 18th where the step count is flat until we hit the Strip around 4 PM, the Zion days with big afternoon spikes from actual hiking, the return to Vegas on the 22nd with another late-night ramp, and the drive home on the 23rd where I barely moved at all.

{{< rawhtml >}}
<div id="step-timeline-wrap" class="step-timeline-wrap">
  <div class="step-timeline-container"><canvas id="step-timeline-chart"></canvas></div>
  <div class="timeline-legend">
    <span class="timeline-legend-item"><span class="timeline-legend-swatch" style="background:rgba(80,200,120,1)"></span> Tracked Hike</span>
    <span class="timeline-legend-item"><span class="timeline-legend-swatch" style="background:rgba(255,200,50,0.8)"></span> Vegas</span>
    <span class="timeline-legend-item"><span class="timeline-legend-swatch" style="background:rgba(200,200,200,0.5)"></span> Walking</span>
    <span class="timeline-legend-item"><span class="timeline-legend-swatch sleep"></span> Sleep</span>
  </div>
</div>
{{< /rawhtml >}}

94,773 steps in six days. The Vegas bookends are the gold sections, and what stands out is when those steps happened. On March 18th, I walked 12,593 steps but almost all of them came after 8 PM, walking the Strip with friends after a late dinner. The Garmin clocked a sleep score of 44 that night with a "late bed time" warning, and the next night was worse, a score of 40 after not getting to bed until almost 2 AM. Compare that to the Zion nights where I was asleep by 9 PM and the sleep scores jumped to 87 and 58. The watch basically told me that two nights in Vegas did more damage to my recovery than three days of hiking in a national park.

<!-- TODO: Ryan — add a photo here if you have a good establishing shot of the canyon/park entrance -->

## Watchman Trail

We got into Springdale late on the 18th after driving from Vegas, and the next afternoon I wanted something short to stretch my legs and get a feel for the park before the bigger days. The Watchman Trail starts right near the visitor center and climbs to an overlook above the town, and it felt like the right call for a first-day hike.

{{< rawhtml >}}
<div id="watchman-map" class="hiking-map"></div>
<div class="hiking-elevation-chart"><canvas id="watchman-map-elevation"></canvas></div>
{{< /rawhtml >}}

3.1 miles, 525 feet of elevation gain, about 82 minutes of moving time. My average heart rate was 118, which is basically a walking pace for me, and the max of 164 only hit on a couple of short steep sections near the overlook. You can see on the map how the trail loops around the base of the Watchman before climbing to the viewpoint, with the Virgin River cutting through the valley below.

The overlook itself is worth the walk. You're looking straight down at Springdale and up-canyon toward the main valley, and at 5:30 in the evening the light was hitting the sandstone walls in a way that made the whole place look like it was on fire. It's an easy hike by any standard, but Zion isn't the kind of place where easy means boring. The scale of the canyon walls makes even a short trail feel like you're somewhere significant.

<!-- TODO: Ryan — watchman overlook photo here? -->

## Angels Landing

This was the day. Angels Landing is the hike in Zion, the one everyone talks about, and the one that now requires a permit during peak season. We had ours for March 20th, which turned out to be a perfect weather window with clear skies and temperatures in the upper 60s.

{{< rawhtml >}}
<div id="angels-landing-map" class="hiking-map"></div>
<div class="hiking-elevation-chart"><canvas id="angels-landing-map-elevation"></canvas></div>
{{< /rawhtml >}}

7.6 miles, 2,556 feet of elevation gain, 4 hours and 47 minutes total time. Look at that elevation profile. The first couple miles follow the West Rim Trail up a series of switchbacks, then you hit Walter's Wiggles, which is a set of 21 short tight switchbacks carved into the cliff face that gains about 250 feet in a quarter mile. After that you reach Scout Lookout, where most people stop, and from there the final half mile to the summit is the chain section that gives Angels Landing its reputation.

My average heart rate for the whole hike was 139 and it maxed out at 188, which is the highest I've ever recorded on a hike. The HR coloring on the map tells the story, green on the relatively flat canyon floor sections and solid red through the switchbacks and the chain section. I spent 79 minutes in vigorous intensity zones and burned 1,882 calories, which is close to what I burned on El Cajon Mountain despite the distance being shorter, because the climbing is steeper and more sustained here.

The chain section itself is a different kind of hiking. You're on a narrow rock fin with drops of over a thousand feet on both sides, holding onto chains bolted into the rock, and the trail is maybe three feet wide in places. My heart rate in that section wasn't just from the physical effort. The exposure is real, and I'm not someone who's naturally comfortable with heights, but the chains felt solid and I kept moving. The summit is a flat-ish area maybe the size of a basketball court, and the views are the best I've seen from any trail I've hiked.

<!-- TODO: Ryan — Angels Landing photos here (chain section, summit view, Walter's Wiggles) -->

The "+More" in the Garmin activity name is because we explored some of the lower canyon trails after coming back down, which added mileage but not much elevation. I was tired enough after the descent that the flat walking felt earned.

## The Narrows

Day three, and the legs were feeling the 2,500 feet of climbing from the day before. The Narrows is Zion's other iconic hike, and it's completely different from Angels Landing. Instead of climbing a cliff face, you're walking up the Virgin River through a slot canyon with walls a thousand feet tall and barely any elevation change.

{{< rawhtml >}}
<div id="narrows-map" class="hiking-map"></div>
<div class="hiking-elevation-chart"><canvas id="narrows-map-elevation"></canvas></div>
{{< /rawhtml >}}

8.3 miles, only 486 feet of elevation gain over the whole route, 4 hours and 16 minutes total. That elevation profile is almost flat compared to Angels Landing, and my average heart rate of 116 reflects that. But 116 doesn't mean it was easy. You're wading through a river for most of the hike, sometimes knee-deep, sometimes thigh-deep, over slippery rocks you can't see through the water. Every step is deliberate because one wrong foot placement and you're sitting in a cold river. We rented neoprene socks and hiking poles from one of the outfitters in Springdale, and both were absolutely necessary. The water in March was cold enough that I wouldn't have lasted an hour without the neoprene.

The GPS track on this one is worth looking at, but take it with some skepticism. The canyon walls are so tall and narrow that the Garmin's GPS signal bounces all over the place, and you can see the track jumping between the canyon walls in spots where I was definitely just walking straight up the river. It's still fun to see the route laid out, and it gives you a sense of how the canyon twists and tightens, but this is what happens when you ask a satellite to find you at the bottom of a slot canyon with a few hundred feet of sandstone on either side. There's no maintained path, no boardwalk, no packed dirt. The river is the trail, and the canyon is so narrow in places that the sky is just a thin strip of blue above you.

<!-- TODO: Ryan — narrows photos here (river hiking, canyon walls, the tight sections) -->

My watch logged 12,228 steps, which feels low for 8.3 miles until you realize how slow river hiking is. Each step is measured and careful, not the rhythmic stride you get on dry trail. The Garmin had my moving time at about 2.5 hours versus 4.3 hours total, which means I spent almost two hours stopped, resting, taking photos, or just standing in the river looking up at the walls. That's more time standing still than I've spent on any other hike I've tracked, and it speaks to how much of The Narrows is about the experience of being in the canyon rather than the physical act of hiking through it.

The thing about Zion is that every trail tells you something different. Watchman told me the park is worth visiting even when you're tired from a drive. Angels Landing told me what my body can do when the stakes feel real and the climbing never stops. The Narrows told me that the hardest hikes aren't always the ones with the most elevation, and that sometimes the best part of a trail is just standing in the middle of it. I've been building toward a Mt. Whitney attempt later this year, and Zion gave me data points I didn't have before, sustained climbing at altitude, recovery between big days, and how my heart rate responds to effort that's more psychological than physical. The Garmin has all of it on record.
