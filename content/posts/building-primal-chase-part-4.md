---
title: "Building Primal Chase — Part 4: Visual Identity (V1.9)"
date: 2026-03-07
tags: ["primal-chase", "game-dev", "javascript", "dev-log", "css"]
group: "projects"
project: "Primal Chase"
summary: "Fireflies, rain at 15 degrees, three tiers of lightning, and a screen that darkens as you die. How V1.9 turned a text game into something you can feel."
draft: true
---

*This is Part 4 of a 5-part series on building [Primal Chase](https://primalchase.com), a browser-based survival game about being hunted by persistence hunters. [Part 0](/posts/building-primal-chase-part-0) covers the idea. [Part 1](/posts/building-primal-chase-part-1) covers the prototype. [Part 2](/posts/building-primal-chase-part-2) covers making it shippable. [Part 3](/posts/building-primal-chase-part-3) covers systems and balance.*

---

## The Missing Layer

By V1.8, Primal Chase played well. The balance was simulation-validated, the monologue system reacted to terrain and pressure, the difficulty modes worked, and the encounter system generated 9,000+ unique situations. But playing it felt like reading a well-written spreadsheet, where the text said *"your heat is rising, the hunters are close, a storm is building"* and you looked at colored bars and plain text on a white page.

V1.9 was about closing the gap between what the game *says* and what the game *shows*. No new mechanics, no new encounters, just visual systems that make the existing game feel visceral.

Remember the CSS landscape background I tried and reverted in [V1.2](/posts/building-primal-chase-part-1)? That failed because I was trying to add visual complexity without proper assets or systems, and V1.9 approached the same problem differently, building atmospheric systems that respond to game state instead of painting a static background.

## The Screen Degrades With You

The centerpiece of V1.9 is visual escalation, where as the cat's condition worsens the screen itself communicates desperation through a darkening vignette that closes in from the edges and colors that desaturate toward grayscale.

```javascript
updateVisualEscalation(gameState) {
  const dangers = [
    gameState.heat / 100,
    (100 - gameState.stamina) / 100,
    gameState.thirst / 100,
    gameState.hunger / 100
  ];
  const worst = Math.max(...dangers);
  const hunterDanger = Math.max(0, 1 - (gameState.hunterDistance / 15));
  const desperation = Math.max(worst, hunterDanger);

  // Match desperation to visual stage
  // 50% → subtle vignette
  // 55% → moderate vignette, slight desaturation
  // 70% → heavy vignette, noticeable desaturation
  // 85% → intense vignette, significant desaturation
}
```

The configuration is four threshold stages:

```javascript
visualEscalation: {
  stages: [
    { threshold: 0.5,  vignette: 0.15, desaturation: 0 },
    { threshold: 0.55, vignette: 0.3,  desaturation: 0.1 },
    { threshold: 0.7,  vignette: 0.45, desaturation: 0.2 },
    { threshold: 0.85, vignette: 0.6,  desaturation: 0.35 }
  ]
}
```

Two design decisions that matter here: the desperation score considers hunter distance alongside stats, where being within 15 miles starts contributing and at 0 miles it's 100% danger, and the vignette uses `box-shadow` with cached shadow strings to avoid redundant repaints. The escalation is subtle enough that you don't notice it ramping up, but by the time you're near death the screen looks and feels different from when you started.

## Weather That Comes From the Game

The weather system doesn't run on a timer or a random chance per turn, it's encounter-driven, meaning rain falls when the encounter says it's raining.

```javascript
function getWeatherCondition(encounter, skipRandom) {
  // Signature storms = heavy rain + lightning
  if (encounter.id === 'sig_rainstorm' || encounter.id === 'rare_lightning_fire') {
    return 'heavy';
  }
  // Storm pressure = light rain
  if (encounter.pressure?.id === 'storm_approaching') {
    return 'light';
  }
  // 20% random rain chance (rolled once per encounter, cached)
  if (encounter._weatherRoll === undefined) {
    encounter._weatherRoll = Math.random() < 0.20 ? 'light' : null;
  }
  return encounter._weatherRoll;
}
```

This means weather is tied to narrative. When the encounter generator picks the "storm approaching" pressure, rain starts, and when a signature rainstorm fires you get heavy rain with lightning. The 20% random chance gives ambient variety, but the dramatic moments are scripted.

### Rain at an Angle

The rain system generates DOM particles where each raindrop is a div with a falling animation, and the angle and speed are randomized per rain event rather than per drop, so each storm has a consistent character:

```javascript
// Randomize per storm, not per drop
const angle = cfg.angle[0] + Math.random() * (cfg.angle[1] - cfg.angle[0]);
const direction = Math.random() < 0.5 ? 1 : -1;
const speedMult = cfg.speedMultiplier[0] +
  Math.random() * (cfg.speedMultiplier[1] - cfg.speedMultiplier[0]);
```

Heavy rain spawns 100-200 drops with longer streaks and faster fall, and light rain spawns 40-100 shorter drops. On mobile with `prefers-reduced-motion` the count drops to a quarter. When rain starts, fireflies and other ambient particles clear to stay within a mobile performance budget, not because the device is slow but because stacking particle systems is asking for trouble.

### Three Tiers of Lightning

Lightning comes in three tiers, weighted by probability:

- **Sheet lightning (60%)** is a brief, dim white flash, atmospheric but not startling.
- **Strike (30%)** is a brighter flash that fades to a brief darkening, like your eyes adjusting.
- **Thunder (10%)** is the full experience with a bright flash, a fade to dark, and a CSS shake on the game container.

```javascript
if (tier === 'thunder') {
  overlay.style.animation = 'lightning-strike 400ms ease-out forwards';
  const main = document.querySelector('main');
  if (main) {
    main.style.animation = 'lightning-shake 150ms ease-in-out';
    setTimeout(() => { main.style.animation = ''; }, 150);
  }
}
```

The shake is 150ms and moves the container 1-2 pixels in random directions, which is barely perceptible consciously but it registers. Heavy rain shortens the interval between flashes by 2-3 seconds, making storms feel more intense without changing the visual effect itself.

## Night Has Texture

V1.2 through V1.8, night was a CSS color change and nothing else, so V1.9 gives night its own visual identity.

**Stars** spawn 100-250 per night phase, sized 1-3 pixels with 70% being 1px for a realistic distribution. 30% twinkle with randomized timing, and 8% are "bright" with a subtle glow. Each night regenerates the starfield to imply the cat has moved, because you're looking at different sky since you're somewhere else, and stars drift slowly to the left to suggest the passage of time.

**Fireflies** appear during warm nights as 15-24 sprites with randomized float paths and glow pulses. They use actual sprite sheets with two variants and 12 frames each, and independent animation timings so no two fireflies move in sync. When rain starts fireflies clear, and when the night ends they fade.

These effects don't affect gameplay and exist entirely to make night feel different from day in a way that stat bars and text color can't.

<!-- TODO: Screenshot of night scene with fireflies and stars -->

## The Performance Question

All of this runs in a zero-dependency vanilla JS browser game with no canvas rendering loop, no WebGL, and no animation library. Every particle is a DOM element with CSS animations, which sounds expensive but the numbers tell a different story:

- Rain caps at 200 drops (50 on reduced-motion mobile)
- Stars cap at 250
- Fireflies cap at 24
- Lightning is a single overlay div
- Particle systems clear each other (rain clears fireflies/insects)
- Shadow strings are cached to prevent redundant repaints
- Animations use `transform` and `opacity` (GPU-composited, no layout thrashing)

The total particle count never exceeds ~300 DOM elements, all animated via CSS, and modern browsers handle this without breaking a sweat. The favicon optimization (571KB to 5KB) and logo compression (1.6MB to 75KB) did more for load performance than any animation optimization.

## What the Screen Became

The game went from a design doc to a thing with atmosphere, all in vanilla HTML, CSS, and JavaScript with zero dependencies, hosted on GitHub Pages. Every balance number lives in one config file, a simulation engine plays thousands of games to validate changes, a 32x52x22 encounter generator produces novel situations without repeating, and now there's a visual layer that makes it *feel* like being hunted.

I started this series talking about the gap between what a text game tells you and what it makes you feel, and V1.9 was my attempt to close that gap without reaching for canvas or WebGL or any tool heavier than what the browser already gives you. The screen darkens as you weaken, rain falls at an angle when the story calls for it, fireflies drift through warm nights, and lightning shakes the ground in a 10% chance that always feels earned.

You can play it at [primalchase.com](https://primalchase.com), and the hunters are already walking.
