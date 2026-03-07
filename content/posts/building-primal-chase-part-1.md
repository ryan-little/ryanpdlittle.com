---
title: "Building Primal Chase, Part 1: The Prototype (V1.1–V1.3)"
date: 2026-03-07
tags: ["primal-chase", "game-dev", "javascript", "dev-log"]
group: "projects"
project: "Primal Chase"
summary: "How a browser survival game went from design doc to playable prototype in a single afternoon. The persistence hunting concept, a 9,000-combination encounter system, and a landscape background that lasted 17 minutes."
draft: true
---

*This is Part 1 of a 5-part series on building [Primal Chase](https://primalchase.com), a browser-based survival game about being hunted by persistence hunters. [Part 0](/posts/building-primal-chase-part-0) covers the idea. [Part 2](/posts/building-primal-chase-part-2) covers making it shippable. [Part 3](/posts/building-primal-chase-part-3) covers systems and balance. [Part 4](/posts/building-primal-chase-part-4) covers visual identity.*

---

## V1.1: One Afternoon, One Game

With the [design doc in hand](/posts/building-primal-chase-part-0), I sat down on February 13th to build the thing, and the entire first playable version shipped in a single sitting. By the end of the day V1.3 would be done too, but let's start at the beginning.

The game needed four things: a stat system, an action system, an encounter generator, and hunter AI. I wanted everything config-driven from the start, where every balance number lives in one place and never gets hardcoded into game logic, which is standard practice in commercial games but rare in solo projects. It meant I could tweak the entire feel of the game by changing numbers in one file.

Here's what the original CONFIG looked like:

```javascript
const CONFIG = {
  starting: { heat: 0, stamina: 100, thirst: 0, hunger: 0, hunterDistance: 25 },
  death: { maxHeat: 100, minStamina: 0, maxThirst: 100, maxHunger: 100, minHunterDistance: 0 },
  hunter: {
    baseSpeed: 5,
    trackingSpeed: 2,
    waterBoost: 1.5,
    escalationPerDay: 0.1
  },
  actions: {
    day: {
      push:  { distance: 6, heat: 20, stamina: -20, thirst: 15, hunger: 10 },
      trot:  { distance: 3, heat: 10, stamina: -10, thirst: 10, hunger: 5  },
      rest:  { distance: 0, heat: -25, stamina: 20, thirst: 0,  hunger: 3  },
      drink: { distance: 0, heat: 10, stamina: -5, thirst: -100, hunger: 0 },
      eat:   { distance: 0, heat: 15, stamina: -5, thirst: -50, hunger: -100 }
    }
  }
};
```

Clean, flat, readable. Five actions, four stats, two phases for day and night. The hunter escalation at `+0.1 speed per day` is what makes the game unwinnable, because on day 1 the hunters move at 5 miles and by day 10 they're at 6, and you just can't keep up forever.

### The Encounter System

The part I'm proudest of from V1.1 is the encounter system. Instead of hand-writing hundreds of scenarios, I built a three-layer hybrid.

**Layer 1** is combinatorial. Every phase the game picks a terrain, an opportunity, and a pressure, then composes them into a situation. Even at V1.1 this was roughly 20 terrains by 30 opportunities by 15 pressures, which comes out to about **9,000 possible combinations**.

Each terrain defines what text to show and what situational actions are available, like whether you can dig for water in a dry riverbed at a 50% chance, and which opportunities are compatible:

```javascript
{
  id: 'dry_riverbed',
  name: 'a dry riverbed',
  text: 'The cracked earth stretches ahead, pale and lifeless...',
  actions: [{ key: 'drink', name: 'Dig for Water', chance: 0.5 }],
  compatible: ['vulture', 'bones', 'animal_tracks', 'shade_scrub', ...]
}
```

Pressures are condition-based, so they only appear when relevant. `overheating` triggers when your heat is above 60%, and `hunters_gaining` fires when they're within 10 miles, which means the game naturally escalates its own narrative without any scripting.

**Layer 2** is about 50 hand-crafted signature encounters, named story-driven moments like "The River" where you decide whether to risk a crossing to lose the hunters, or "The Eclipse" where you choose between running in the false night and resting in the dark. These override the generator and can only fire once per run.

**Layer 3** is rare events at less than 1% chance per phase, legendary moments that completely change the tone of a run.

What I like about this approach is that no two runs feel the same, but every run *feels coherent*. The generator handles variety, the signatures handle drama, and the rares handle memory.

<!-- TODO: Screenshot of V1.1 gameplay -->

## V1.2: The Visual Refresh (and the 17-Minute Background)

With the game playable I immediately started on the visual side, and V1.2 was about making it *look* like a game with a full-width layout, a redesigned title screen with horizontal buttons, and a typewriter cinematic intro that sets the tone before your first decision.

The typewriter turned out to be a great addition, a dark overlay with text typing character by character that's skippable if you've seen it before. It turns the game from "here are some buttons" into "you are being hunted."

Then I tried something ambitious, a layered CSS parallax landscape with sky gradients, mountain silhouettes, acacia trees, and swaying foreground grass with day/night transitions.

It lasted about 17 minutes.

The landscape was technically impressive at 235 lines of CSS and 101 lines of HTML for the parallax layers, but it looked like a CSS demo and not a game. The savannah felt flat and artificial without proper generated or hand-drawn assets, so I reverted the whole thing, kept the layout improvements and typewriter, and moved on. Animation complexity doesn't equal visual quality, and the game's atmosphere was always going to come from its writing, not its background. The real visual overhaul would come later in V1.9 with proper pixel art and atmospheric effects, but for now a simple texture was honest.

<!-- TODO: Screenshot of V1.2 title screen -->

## V1.3: Giving It Personality

V1.3 is where the game went from "functional prototype" to "something with a voice," and three additions made the difference.

**Options screen with localStorage persistence.** Difficulty selection, typewriter toggle, opening sequence toggle. Small stuff, but it signals that the game respects the player's time and you don't have to watch the intro every run.

**Phase transition animation.** When day shifts to night the stat bars animate, the background color shifts over 1.5 seconds, and actions are locked out for 2 seconds. Before this the phase change was instant and jarring, and the animation gives the player a breath between decisions and makes the day/night cycle feel real.

**Tutorial encounters for Day 1.** Fixed encounters for the first day phase called "The Ridge" and the first night phase called "First Darkness" that teach the core mechanics without a tutorial screen. You learn by playing, but the early encounters are designed to show you what matters, that heat builds during the day, rest recovers it, and the hunters are always gaining.

The typewriter effect also expanded and now typed out situation text phase by phase, with action buttons locked until the text finished. This was a deliberate friction choice because I wanted the player to *read* the encounter before reacting, not just scan for the best button. It's a text game, and if you skip the text you're skipping the game.

<!-- TODO: Screenshot of V1.3 options screen and phase transition -->

## The Score at V1.3

By the end of February 13th, one afternoon, the game had:
- 4 stats, 5 actions, day/night cycle
- ~9,000 encounter combinations plus 50 signatures and 10 rare events
- Typewriter intro, phase transitions, and tutorial encounters
- Options, localStorage persistence, keyboard shortcuts
- A leaderboard, a how-to-play page, and a share system
- Zero dependencies, vanilla HTML/CSS/JS

It was playable and interesting and had a voice, but it wasn't *shippable*. The typewriter had reflow bugs that would haunt me into V1.4, the share image didn't work on HTTP, and the instructions were a wall of text, so there was still plenty to fix before I could put it in front of anyone, which is what [Part 2](/posts/building-primal-chase-part-2) is about.
