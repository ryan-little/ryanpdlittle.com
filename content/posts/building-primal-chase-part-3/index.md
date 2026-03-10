---
title: "Building Primal Chase, Part 3: Systems Thinking (V1.7–V1.8)"
date: 2026-03-07
tags: ["primal-chase", "game-dev", "javascript", "dev-log", "simulation"]
group: "projects"
project: "Primal Chase"
summary: "A difficulty system built on config snapshots, a monologue engine with 387 tagged fragments, and 5 rounds of simulation-driven balance tuning. The versions where the game got deep."
draft: true
---

*This is Part 3 of a 5-part series on building [Primal Chase](https://primalchase.com), a browser-based survival game about being hunted by persistence hunters. [Part 0](/posts/building-primal-chase-part-0) covers the idea. [Part 1](/posts/building-primal-chase-part-1) covers the prototype. [Part 2](/posts/building-primal-chase-part-2) covers making it shippable. [Part 4](/posts/building-primal-chase-part-4) covers visual identity.*

---

## When the Game Needed Depth

V1.4 through V1.6 was about polish, about making the game work well and feel finished. V1.7 and V1.8 were about making it work *deeply*, and three systems defined this stretch: difficulty modes, the monologue engine, and simulation-driven balance tuning. Each one started simple and got complicated for good reasons.

## V1.7: Difficulty Without Duplication

### Why Three Configs Is a Trap

Adding Easy/Normal/Hard modes to most games means maintaining three parallel sets of balance values, where you change a number for Normal and then have to decide if Easy and Hard need updating too. Multiply that by every tunable in the game and you get a maintenance nightmare.

### Snapshot and Override

The config-driven philosophy from [Part 0](/posts/building-primal-chase-part-0) paid off here. Instead of three complete configs, difficulty modes are *overrides*, sparse objects that only specify what's different from Normal.

```javascript
difficulty: {
  easy: {
    starting: { hunterDistance: 30 },
    hunter: { baseSpeed: 4.5, dailyEscalation: 0.08 },
    passiveDrain: {
      day:   { heat: 5, stamina: 0, thirst: 3, hunger: 2 },
      night: { heat: -8, stamina: 5, thirst: 1, hunger: 2 }
    }
  },
  hard: {
    starting: { hunterDistance: 22 },
    hunter: { baseSpeed: 6.3, dailyEscalation: 0.13, escalationPerLoss: 1.0 },
    passiveDrain: {
      day:   { heat: 6, stamina: 0, thirst: 7, hunger: 3.5 },
      night: { heat: -6, stamina: 3, thirst: 3, hunger: 3.5 }
    }
  }
}
```

Easy mode only changes 7 values and Hard changes 9, and everything else inherits from the base config. The implementation snapshots CONFIG at load time, then restores and deep-merges on each new game:

```javascript
applyDifficulty(level) {
  if (!CONFIG._base) return;
  // Restore to base values
  const base = JSON.parse(JSON.stringify(CONFIG._base));
  for (const key of Object.keys(base)) {
    if (key === '_base') continue;
    CONFIG[key] = base[key];
  }
  // Apply difficulty overrides
  if (level && level !== 'normal' && CONFIG.difficulty[level]) {
    this._deepMerge(CONFIG, CONFIG.difficulty[level]);
  }
}
```

The deep-merge walks the override object and only replaces values that are explicitly specified, so if I add a new CONFIG property like a weather intensity tunable, it automatically works for all difficulties without touching the difficulty configs.

This pattern is common in commercial game development but I've rarely seen it in solo projects. It's one of those decisions that costs an hour upfront and saves dozens of hours later.

## The Monologue Engine

### From Generic to Reactive

The internal monologue system started in V1.1 as mood-based flavor text, the animal's thoughts between decisions that escalate from confident to desperate as the game progresses. It worked, but the fragments felt disconnected from what was actually happening. You'd read about a dry riverbed and the monologue might say something about running, which is fine but not *interesting*.

V1.7 added terrain and pressure awareness, where the game now tags each fragment with triggers that match against the current game state:

```javascript
// Terrain-aware fragments
{ mood: 'confident', triggers: ['terrain_water'],
  text: 'I smell water on the air. The land still offers its palm to those who know where to look.' }

{ mood: 'desperate', triggers: ['terrain_water'],
  text: 'Water. The smell of it is a knife in my throat. Every instinct screams to drink.' }

// Pressure-aware fragments
{ mood: 'concerned', triggers: ['pressure_injury'],
  text: 'Every step sends a jolt through me. The body keeps count of debts the mind tries to ignore.' }

// Combined triggers — specific terrain + state combos
{ mood: 'desperate', triggers: ['terrain_water', 'high_thirst'],
  text: 'The water is right there. I can see it shimmer. But stopping means they gain ground.' }
```

The `getTriggers()` function builds a list of everything that's true right now, including what action was just taken, which stats are critical, how close the hunters are, what terrain you're on, and what pressure is active:

```javascript
// Vital stat triggers
if (gameState.heat >= 70) triggers.push('high_heat');
if (gameState.stamina <= 30) triggers.push('low_stamina');
if (gameState.thirst >= 60) triggers.push('high_thirst');
if (gameState.hunterDistance < 8) triggers.push('hunters_close');

// Terrain categories
if (gameState.currentEncounter?.terrain?.id) {
  const terrainId = gameState.currentEncounter.terrain.id;
  for (const [category, ids] of Object.entries(CONFIG.terrainCategories)) {
    if (ids.includes(terrainId)) triggers.push('terrain_' + category);
  }
}

// Pressure categories
if (gameState.currentEncounter?.pressure?.id) {
  const pressureId = gameState.currentEncounter.pressure.id;
  for (const [category, ids] of Object.entries(CONFIG.pressureCategories)) {
    if (ids.includes(pressureId)) triggers.push('pressure_' + category);
  }
}
```

Fragment selection prioritizes triggered fragments over generic ones, and a recent buffer prevents repeats, so the monologue actually reacts to what's happening. When you're in rocky terrain with an injury, the animal thinks about the rocks and the pain. When you're near water with high thirst, it thinks about the water and the cost of stopping.

By V1.8 the system had **387 tagged fragments**, up from around 100 in V1.1. The game went from "here's a mood-appropriate thought" to "here's a thought that reflects exactly what you're experiencing right now," and even though it's still just text selection, the whole thing feels alive in a way it didn't before.

## V1.8: Balance Through Simulation

### The Simulation Engine

Primal Chase is intentionally unwinnable because the hunters escalate every day and death is inevitable, but "unwinnable" still needs to feel fair. If the GTO strategy dies on day 5 the game is too hard, and if a random button-masher survives 15 days the balance is too loose.

The simulation engine in `test/simulate.js` plays thousands of games automatically using different strategies, where each strategy models a type of player:

**Random** picks actions uniformly at random as the baseline.

**Newbie** always pushes, panics, and grabs every drink/eat opportunity even when stats are fine:
```javascript
// Always grab drink/eat if available (even if not needed)
if (situational.length > 0) return situational[0];
// Only rest when about to collapse
if (state.stamina <= 15 && standard.rest) return standard.rest;
// Panic: always push
if (standard.push) return standard.push;
```

**Intermediate** has basic day/night awareness and moderate thresholds, pushing during the day when healthy and resting at night when tired.

**Smart** uses a priority system based on stat urgency and handles the most critical stat first:
```javascript
if (state.thirst >= 60 && situational.drink) return situational.drink;
if (state.hunger >= 60 && situational.eat) return situational.eat;
if (state.stamina <= 25 && standard.rest) return standard.rest;
if (state.heat >= 70 && standard.rest) return standard.rest;
if (state.hunterDistance < 5 && standard.push) return standard.push;
```

**GTO** scores every action by expected survival value, using exponential death penalties where stats near lethal thresholds are penalized much harder than stats at moderate levels, and a geometric mean to ensure no single stat axis can be ignored:

```javascript
const heatSurvival    = 1 - Math.pow(nextHeat / 100, 3);
const staminaSurvival = 1 - Math.pow((100 - nextStamina) / 100, 3);
const thirstSurvival  = 1 - Math.pow(nextThirst / 100, 2.5);
const hungerSurvival  = 1 - Math.pow(nextHunger / 100, 2);

// Geometric mean penalizes any single weak axis
const survivalScore = Math.pow(
  heatSurvival * staminaSurvival * thirstSurvival * hungerSurvival,
  0.25
) * 40;
```

### Five Rounds of Tuning

V1.8 ran five simulation rounds, 15,000 games total, to get the balance right. After each round I'd adjust CONFIG values and re-simulate. The targets:

| Strategy | Target | Actual (V1.8) |
|----------|--------|---------------|
| GTO | ~10 days | ~10 days |
| Smart | ~9 days | ~9 days |
| Intermediate | ~8 days | ~8 days |
| Newbie | ~5 days | ~5 days |
| Random | ~6 days | ~6 days |

The key insight from simulation was that **dehydration and being caught were the dominant death causes**, which is exactly right thematically. The hunters are the primary threat and water scarcity is the secondary constraint that forces risky decisions, and if starvation or exhaustion were dominant the balance would feel wrong because those aren't what persistence hunting is about.

Specific balance changes from the simulation data:
- Night heat drain reduced from -10 to -8 (nights were too forgiving)
- Day rest heat recovery reduced from -25 to -20 (resting was too powerful)
- Eat thirst reduction changed from -50 to -30 (eating was solving too much of the thirst problem)
- Hard difficulty eased slightly (was essentially unplayable, the Smart strategy was dying by day 4)
- Hunger drain standardized at 3.5 across difficulties

Each of these changes came from the data, not intuition. Without the simulation engine, tuning a game where death is inevitable would be pure guesswork because you wouldn't know if "hard" was survivable for a few days or always fatal in two.

### Content and Late-Game Texture

V1.8 also added 102 new monologue fragments, 11 late-game signature encounters gated behind day 8+, and 11 night-specific opportunity variants. The late-game signatures matter because long runs were starting to feel repetitive, where the generator kept producing novel combinations but without scripted peaks in the late game day 12 didn't feel different from day 6. The signatures give exceptional runs their own narrative payoff.

### Accessibility as Baseline

V1.8 added focus-visible outlines, `prefers-reduced-motion` support, ARIA labels, and a skip link, all invisible to sighted mouse-and-keyboard users. These aren't features to promote, they're baseline expectations for a web game. I mention them because they're easy to forget in solo projects and worth doing early rather than retrofitting.

## Where V1.8 Left Things

By the end of V1.8 the game had three difficulty modes built on config overrides, 387 context-aware monologue fragments, simulation-validated balance across five player archetypes, late-game content that rewards long runs, and baseline accessibility. Mechanically, Primal Chase was complete, but it still *looked* like a text game with colored bars, and the screen didn't communicate the desperation that the monologue was working so hard to create. That visual gap between what the game *said* and what it *showed* is what [Part 4](/posts/building-primal-chase-part-4) is about.
