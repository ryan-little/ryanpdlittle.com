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

## V1.4: The First Shippable Version

During playtesting the typewriter was the thing I couldn't stop noticing. Every character the encounter text typed out caused the browser to recalculate the layout, so the whole block of text was bouncing, words shifting, the container resizing, everything moving at the speed of the typewriter while I was trying to read it. It was bad enough on desktop that I stopped reading the encounters and started watching the text jump around.

The fix ended up being obvious once I saw the problem clearly: the text was moving because it didn't exist yet. If the full text was already there but invisible, the typewriter just reveals characters in place and nothing moves.

```javascript
// Set full text immediately so layout is stable
p.textContent = text;

const render = () => {
  const typed = text.substring(0, charIndex);
  const untyped = text.substring(charIndex);
  p.innerHTML = typed + '<span class="tw-hidden">' + untyped + '</span>';
};

render(); // start with all text hidden
```

The CSS is one line: `.tw-hidden { color: transparent; }`. The text takes up space but is invisible, no reflow, no jitter, smooth typing on every device. This was the single most satisfying bug fix in the whole project, a problem that had bugged me across three versions solved by inverting the approach.

Then there was the problem of sitting through the typewriter on every playthrough. The first few times the effect is charming, but when you're playtesting your twentieth run and the encounter text is typing out character by character for the hundredth time, it stops being fun. I'd already added a toggle for the opening typewriter in V1.3, and in V1.4 I expanded that to the situation text too, with a speed slider so you could keep the effect but not wait for it.

### Natural Language Hunter Info

V1.3 showed hunter distance as raw numbers in a sidebar, which felt like an alpha-version holdover as the rest of the game got more polished. V1.4 replaced it with natural language woven into the situation text: *"The hunters are 8 miles behind. You can see the dust they kick up on the horizon."* Six distance tiers, each with flavor text variants for day and night, and the sidebar went away entirely. It's a text game, and the more information lives *in* the narrative the more immersive the whole thing feels.

### The Share Card

I'd seen games like Wordle use share cards as a fun way to show results, and thought it could work as a decent marketing tool too. The Canvas API can generate images for exactly this, but loading an external image onto a canvas taints it, and a tainted canvas can't be exported or copied to the clipboard. During local development on `file://` every image taints the canvas, and even in production cross-origin issues can cause the same thing, so the first version skipped images entirely and built the share card from pure canvas drawing, gradients and text only. For clipboard copying I used the Clipboard API on HTTPS with a download fallback for HTTP. It was functional but didn't look great, and I'd come back to redesign it in V1.6.

<!-- TODO: Screenshot of V1.4 share card -->

## V1.5: Putting My Name On It

The game had reached a point where I was proud enough to put my name on it, so I did, *"A game by Ryan Little"* on the title screen and *"Made by Ryan Little"* on the death screen, both linking to ryan-little.com. A small thing, but it was the moment the game went from "a thing I'm building" to "a thing I made."

I also built an analytics dashboard. I'd been running simulations to tune balance, thousands of games across different strategies, and the results were JSON files and ASCII tables. I built a visual dashboard at [primalchase.com/stats](https://primalchase.com/stats/) mostly as an easier way to digest the simulation data, and polished it up to see if I could pull trend data from it visually, survival distributions, death cause breakdowns, encounter frequency charts. The frequency analysis ended up revealing 8 opportunity IDs that were referenced in terrain compatibility lists but never defined, invisible holes in the content that the game was silently skipping over, so I filled them in.

<!-- TODO: Screenshot of analytics dashboard -->

## V1.6: Cleanup and Polish

By V1.6 the base game was solid enough that I could start polishing around the edges and cleaning up things that either weren't the right fit or had never been wired up in the first place.

The share card got a proper redesign. The V1.4 version was a basic gradient, functional but plain. The new version has a warm savannah gradient, per-pixel noise for texture, and eight rotating taglines like *"How long can a King outrun a shadow?"* that give each share a bit of personality.

```javascript
const gradient = ctx.createLinearGradient(0, 0, 0, H);
gradient.addColorStop(0, '#2e1c10');
gradient.addColorStop(0.4, '#1a0f08');
gradient.addColorStop(1, '#2a1a0e');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, W, H);

// Per-pixel noise grain
const imageData = ctx.getImageData(0, 0, W, H);
for (let i = 0; i < imageData.data.length; i += 4) {
  const noise = (Math.random() - 0.5) * 18;
  imageData.data[i] += noise;
  imageData.data[i + 1] += noise;
  imageData.data[i + 2] += noise;
}
```

The biggest cleanup was removing dead code that looked functional. The CONFIG had terrain-based hunter speed modifiers like `mountainPenalty: 0.7` and `plainBoost: 1.2`, and the hunter code referenced a `currentTerrain` variable to apply them, but `currentTerrain` was never set anywhere. The terrain modifiers had never worked. Dead code that *looks* functional is worse than no code because someone reading `hunters.js`, including future me, would assume terrain affects hunter speed and make decisions based on that assumption. We might go back to something like terrain-based modifiers in a future version, but I wanted to simplify and keep things grounded while still working out the base kinks.

The GTO (game theory optimal) simulation strategy was using hardcoded balance values instead of reading from CONFIG, exactly the kind of bug that the config-driven philosophy was designed to prevent, so I fixed that too. The rest was the same kind of work: unused CSS variables, duplicate style rules, an orphaned `sparkline()` function, hardcoded hex colors that should have been variables.

None of it is exciting to write about, but all of it makes the codebase trustworthy. When I went into V1.7 to build the difficulty system I could trust that CONFIG was the single source of truth and that the code did what it looked like it did, and that trust is what let me start building real systems on top of it. Next up was figuring out what "difficulty" even means when your game is about slowly being run down by something that never stops, and that's [Part 3](/posts/building-primal-chase-part-3).
