---
title: "Building Primal Chase — Part 2: Making It Real (V1.4–V1.6)"
date: 2026-03-07
tags: ["primal-chase", "game-dev", "javascript", "dev-log"]
group: "projects"
project: "Primal Chase"
summary: "The typewriter reflow bug that haunted three versions, a share card that couldn't use images, and the unsexy cleanup work that made Primal Chase shippable."
draft: true
---

*This is Part 2 of a 5-part series on building [Primal Chase](https://primalchase.com), a browser-based survival game about being hunted by persistence hunters. [Part 0](/posts/building-primal-chase-part-0) covers the idea. [Part 1](/posts/building-primal-chase-part-1) covers the prototype. [Part 3](/posts/building-primal-chase-part-3) covers systems and balance. [Part 4](/posts/building-primal-chase-part-4) covers visual identity.*

---

## The "Would I Let Someone Play This?" Test

After V1.3, Primal Chase was *functional*. You could play it start to finish, the encounter system worked, and the typewriter gave it personality, but there was still a gap between "it works" and "I'd send someone a link." V1.4 through V1.6 is where I closed that gap, and the hardest part wasn't adding features, it was fixing the details that break immersion when you're not the one who built it.

## V1.4: The First Shippable Version

### The Typewriter Reflow Bug

The typewriter effect from V1.3 had a problem where every new character caused the browser to recalculate the layout, which meant text would shift, containers would resize, and the whole screen jittered as encounter text typed out. It was subtle on desktop but obvious on mobile, and it made the game feel broken in a way that was hard to ignore.

The fix was what I call the "invisible-first" approach, and the idea is simple: instead of adding characters to an empty container, I set the full text immediately but make it transparent, and then the typewriter "reveals" characters by moving them from a hidden span to visible text. The container never changes size because the full text is always there, you just can't see the untyped part yet.

```javascript
typewriteText(element, text, speed, callback) {
  const p = document.createElement('p');
  element.appendChild(p);

  // Set full text immediately so layout is stable
  p.textContent = text;

  let charIndex = 0;

  const render = () => {
    const typed = text.substring(0, charIndex);
    const untyped = text.substring(charIndex);
    p.innerHTML = typed + '<span class="tw-hidden">' + untyped + '</span>';
  };

  render(); // start with all text hidden

  const typeNext = () => {
    if (charIndex >= text.length) {
      p.textContent = text;
      if (callback) callback();
      return;
    }
    charIndex++;
    render();
    setTimeout(typeNext, speed);
  };

  typeNext();
}
```

The CSS is one line:

```css
.tw-hidden { color: transparent; }
```

The text takes up space but is invisible, so there's no reflow, no jitter, and smooth typing on every device. This was the single most satisfying bug fix in the entire project, a problem that had bugged me across three versions solved with a simple inversion of approach.

### Natural Language Hunter Info

V1.3 showed hunter distance as raw numbers in a sidebar, and V1.4 replaced that with natural language: *"The hunters are 8 miles behind. You can see the dust they kick up on the horizon."* I built out six distance tiers, each with flavor text variants for day and night, removed the sidebar entirely, and wove the hunt info into the situation text where it actually belongs.

This was more of a design philosophy decision than a technical one. Primal Chase is a text game, and the more information lives *in* the narrative rather than alongside it in some UI widget, the more immersive the whole thing feels.

### The Share Card Problem

I wanted players to share their results as an image with things like days survived, death cause, and achievements, and the Canvas API can generate images for exactly this kind of thing, but there's a catch: if you load an external image onto a canvas like a logo, the canvas becomes "tainted" and you can't export it or copy it to the clipboard.

During local development on `file://`, every image taints the canvas. Even in production, cross-origin issues can cause the same problem. So the solution was to not use images at all, and instead the share card is a pure canvas drawing with gradients, text, and procedural noise.

```javascript
// Background: warm savannah gradient
const gradient = ctx.createLinearGradient(0, 0, 0, H);
gradient.addColorStop(0, '#2e1c10');
gradient.addColorStop(0.4, '#1a0f08');
gradient.addColorStop(0.7, '#1c1209');
gradient.addColorStop(1, '#2a1a0e');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, W, H);

// Noise grain texture
const imageData = ctx.getImageData(0, 0, W, H);
const pixels = imageData.data;
for (let i = 0; i < pixels.length; i += 4) {
  const noise = (Math.random() - 0.5) * 18;
  pixels[i] += noise;
  pixels[i + 1] += noise;
  pixels[i + 2] += noise;
}
ctx.putImageData(imageData, 0, 0);
```

The gradient gives it warmth, the per-pixel noise gives it texture, and eight rotating taglines like *"How long can a King outrun a shadow?"* and *"Even Kings have shadows."* give each share a bit of personality. No images, no tainting, and it works everywhere.

For clipboard copying, I used the Clipboard API on HTTPS with a download fallback for HTTP, so the share card works in both environments without special handling.

<!-- TODO: Screenshot of V1.4 share card -->

## V1.5: Building Tools for Yourself

V1.5 added two things, creator credit and an analytics dashboard.

The credit was simple, just *"A game by Ryan Little"* on the title screen and *"Made by Ryan Little"* on the death screen, both linking to ryan-little.com. It's a small thing, but it was the moment the game went from "a thing I'm building" to "a thing I made."

The analytics dashboard was more interesting. I'd been running simulations to tune balance, thousands of games across different strategies, and the results were just JSON files and ASCII tables. V1.5 turned that data into a visual dashboard at [primalchase.com/stats](https://primalchase.com/stats/) with survival distributions, death cause breakdowns, and encounter frequency charts.

The encounter frequency analysis turned out to be the most useful part. With ~9,000 possible encounter combinations, some opportunities were appearing far more often than others because of how the compatibility lists were structured, and the frequency charts made these imbalances obvious at a glance. I also found 8 opportunity IDs that were referenced in terrain compatibility lists but never actually defined, which were invisible holes in the content that the game silently skipped over. I wouldn't have found them without building the tool.

This is a pattern I keep coming back to: build the tool that shows you what's wrong, then fix what you see. Staring at code or JSON dumps is slow, but a dashboard that visualizes the data makes problems jump out at you.

<!-- TODO: Screenshot of analytics dashboard -->

## V1.6: The Cleanup

V1.6 is the least exciting version and maybe the most important. No new features, just removing things that shouldn't be there.

The original CONFIG had terrain-based hunter speed modifiers like `mountainPenalty: 0.7`, `junglePenalty: 0.6`, and `plainBoost: 1.2`. The hunter code referenced a `currentTerrain` variable to apply these, but `currentTerrain` was never set anywhere. The terrain modifiers had never worked, they were dead code from the design doc that got implemented in isolation but never wired into the game loop.

I removed them. The terrain-based hunter speed idea is good and might come back in V2, but dead code that *looks* functional is worse than no code because someone reading `hunters.js`, including future me, would assume terrain affects hunter speed and make decisions based on that assumption. Better to delete it and re-implement properly if it's ever needed.

The rest of the cleanup was similar: unused CSS variables, duplicate style rules, an orphaned `sparkline()` function in the reporting code, hardcoded hex colors that should have been CSS variables, a red death overlay tint that wasn't visible, and redundant media query overrides.

I also fixed the GTO simulation strategy because it was using hardcoded balance values instead of reading from CONFIG, which meant simulation results wouldn't reflect config changes. This is exactly the kind of bug that the config-driven philosophy was designed to prevent, and exactly the kind of bug that slips through when you're moving fast.

None of this is interesting to write about, but all of it makes the codebase trustworthy. When I went into V1.7 to build the difficulty system, I could trust that CONFIG was the single source of truth and that the code did what it looked like it did, and that trust is worth the boring afternoon of cleanup.

By V1.6 the game had a stable typewriter, natural language narrative instead of raw numbers, working share cards on any protocol, an analytics dashboard for data-driven balance tuning, and a codebase where the code actually matched the behavior. The foundation was solid, and I was ready to build real systems on top of it, which meant figuring out what "difficulty" even means when your game is about slowly being run down by something that never stops, and that's [Part 3](/posts/building-primal-chase-part-3).
