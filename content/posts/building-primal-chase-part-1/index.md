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

The first time the encounter generator ran, it put me in a dry riverbed with a vulture circling overhead while the hunters closed from 12 miles out. I hadn't written that combination by hand. The terrain picked itself, the opportunity matched from a compatibility list, and the pressure triggered because the hunter distance had crossed a threshold, three independent systems composing a moment that felt authored.

That was maybe four hours into February 13th. I'd opened the [design doc](/posts/building-primal-chase-part-0) that morning, started a blank `index.html`, and the [CONFIG-driven approach](/posts/building-primal-chase-part-0#the-non-negotiable) made the translation almost mechanical. The stat system reads death thresholds from `CONFIG.death`, actions pull their costs from `CONFIG.actions`, the hunter advances by `CONFIG.hunter.baseSpeed` plus its daily escalation. Wiring, not architecture.

The game loop was the part that took real thought, specifically how phases sequence and how the UI should breathe between player decisions. Generate the encounter, present the situation, unlock actions, wait for input, resolve, check death, advance the hunter, start the next phase or show the death screen. Getting the timing right so the player has space to read and think without the game feeling sluggish was harder than any of the game logic, and it's the kind of problem that doesn't show up in a design doc because you can only feel it when you're playing.

### The Encounter System

I covered the [three-layer design in Part 0](/posts/building-primal-chase-part-0#the-encounter-system), but the implementation is where it got interesting. The combinatorial generator needed each terrain to know what belongs alongside it, so you wouldn't get a vulture circling while walking through dense jungle.

```javascript
{
  id: 'dry_riverbed',
  name: 'a dry riverbed',
  text: 'The cracked earth stretches ahead, pale and lifeless...',
  actions: [{ key: 'drink', name: 'Dig for Water', chance: 0.5 }],
  compatible: ['vulture', 'bones', 'animal_tracks', 'shade_scrub', ...]
}
```

That `compatible` array is what keeps the generator from feeling random, because a dry riverbed can have vultures and animal tracks but not a cave or a river crossing. Each terrain can also offer its own situational actions on top of the standard five, so the riverbed lets you dig for water at a 50% chance while an acacia grove lets you climb for a vantage point.

Pressures were the most satisfying piece to wire up because they're purely condition-based. `overheating` only fires when heat is above 60%, `hunters_gaining` triggers within 10 miles. As your situation gets worse the encounters start reflecting it, and as the hunters close in the text shifts from exploration to desperation, all without a single line of narrative scripting.

<!-- TODO: Screenshot of V1.1 gameplay -->

## V1.2: The Visual Refresh (and the 17-Minute Background)

With the game playable I went straight to the visual side. V1.2 was a full-width layout, a redesigned title screen with horizontal buttons, and a typewriter cinematic intro that sets the tone before your first decision. The typewriter was a dark overlay with text typing character by character, skippable if you've seen it before, and it turns the game from "here are some buttons" into "you are being hunted."

Then I tried a layered CSS parallax landscape with sky gradients, mountain silhouettes, acacia trees, and swaying foreground grass with day/night transitions. 235 lines of CSS and 101 lines of HTML for the parallax layers, and it looked like a CSS demo, not a game. The savannah felt flat and artificial without proper generated or hand-drawn assets, so about 17 minutes after I finished writing it I reverted the whole thing, kept the layout improvements and typewriter, and moved on. The real visual overhaul would come in V1.9 with pixel art and atmospheric effects, but a simple texture was more honest than an impressive animation that undermined the tone.

<!-- TODO: Screenshot of V1.2 title screen -->

## V1.3: Giving It Personality

V1.3 is where the game found its voice, and it happened through small choices that added up. An options screen with localStorage persistence meant players could toggle the typewriter and opening sequence, which seems minor but signals that the game respects your time when you're on your fifth run. Difficulty selection went in here too, though the real difficulty system wouldn't come until V1.7.

The phase transitions changed the feel more than I expected. Before V1.3 the shift from day to night was instant, one frame you're in daylight and the next you're not, and it was jarring in a way I hadn't noticed until I added a 1.5-second color shift with stat bar animations and a 2-second action lockout. That pause gives the player a breath between decisions and makes the day/night cycle feel like something that's happening to you rather than a UI state change.

I also wrote fixed tutorial encounters for Day 1, "The Ridge" for the first day phase and "First Darkness" for the first night, that teach the mechanics without a tutorial screen. Heat builds during the day, rest recovers it, the hunters are always gaining. You learn by playing, and the encounters are designed so the lessons emerge from the decisions rather than from instructions.

The typewriter expanded too, now typing situation text phase by phase with action buttons locked until it finished. I wanted the player to *read* the encounter before reacting, not just scan for the best button, and locking the buttons until the text completes was a deliberate friction choice because it's a text game and if you skip the text you're skipping the game.

<!-- TODO: Screenshot of V1.3 options screen and phase transition -->

By the end of February 13th the game was playable and had a voice, but it wasn't *shippable*. The typewriter had reflow bugs that would haunt me into V1.4, the share image didn't work on HTTP, and the how-to-play was a wall of text, so there was plenty to fix before I could put it in front of anyone, which is what [Part 2](/posts/building-primal-chase-part-2) is about.
