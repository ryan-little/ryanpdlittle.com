---
title: "My Setup"
date: 2026-07-31
categories: ["life"]
tags: ["tools", "hiking"]
summary: "The desk, the machines, the terminal, and the gear I carry up mountains. Most of what I build runs on a base-model MacBook Air with 8GB of RAM."
draft: false
---

The most powerful computer on my desk is a gaming PC I barely use for anything but games, and the machine that builds everything I've written about on this blog is a base-model M1 MacBook Air with 8GB of RAM sitting next to it, connected to nothing. No external monitor, no dock, no second keyboard. I open it, I open a terminal, and that's the whole setup.

I've been meaning to write one of these for a while, partly because I read other people's and always find something worth stealing, and partly because writing it down forces me to notice which things I actually use and which ones I just own.

## The Desk

Home office, no standing desk, and the desk itself is the classic two IKEA Alex drawer units with a countertop laid across them, which is cheap and holds an enormous amount of weight and has never given me a reason to replace it. Two monitors on arms, and then more computers than one person needs. The desktop is a 9800X3D with a 4070, 32GB of DDR5, and a couple of terabytes of SSD, and it exists for gaming. My work laptop connects to the same two monitors. There's a Mac mini for my business that isn't doing much right now. And the newest addition is an ASUS ROG Zephyrus G14, which I bought for a couple of specific things I haven't actually gotten around to doing with it yet, and which I already like more than I expected to, arguably more than the MacBook.

The Air is the odd one out because it's the only one that isn't plugged into any of it.

## The Machine That Does the Work

Base model, 8GB, and I keep waiting to regret that. For terminal work I mostly don't. The ceiling shows up in exactly one place, which is anything that wants to load a model into memory. When I built my knowledge hub I [tried vector search first](/posts/building-a-personal-knowledge-hub/) and the local embedding models brought the whole laptop to a stop, twice, because I was curious enough to trigger it a second time. I switched to BM25, which finds what I need in about 30ms and uses no meaningful memory, and the 8GB stopped being a constraint and started being the reason I picked a search approach I now think is the better one anyway.

That's most of my honest opinion about hardware. The limit did the choosing, and the choice was fine.

## Terminal

iTerm2, running a dynamic profile I call Ghostty Mirror. I spent a while with Ghostty, liked how it looked and how it handled scrollback and splits, then came back to iTerm2 for the things it does that Ghostty doesn't, and rather than give up the look I rebuilt Ghostty's font, colors, transparency, blur, and cursor as an iTerm2 profile and set it as my default. The two settings I'd miss most are the system-wide Cmd+` hotkey that drops a terminal in front of whatever I'm doing, and dimming inactive split panes so my eye goes to the pane I'm actually typing in.

Beyond that it's Claude Code, and I've [written a whole post about that environment](/posts/claude-code-as-a-dev-environment/), the skills and CLI tools and the knowledge hub behind it, so I won't do it twice here. The part worth adding is how I got there. I started AI-assisted coding in Cursor, which is a good editor and was the obvious on-ramp coming from a normal editor workflow, and then I moved to Claude Code in the terminal and haven't opened an editor as my main workspace since. Sometimes one's open on the side. Mostly it isn't, and I like it that way more than I expected to.

Browser is Zen. I don't run a task manager, which people find surprising, but my goals live in a markdown file and a few Claude Code skills keep me honest about them, and that's genuinely all the system I've wanted.

## What I Carry

The gear got more attention this year than the computers did, because I spent the year climbing the Six-Pack of Peaks with Whitney at the end of it, and the hikes kept telling me what was wrong with my kit.

The pack situation started with Mt Wilson. Planning that one meant actually adding up what I'd be carrying instead of grabbing whatever was by the door, and my Camelbak Octane Race 4 holds 1.5 liters, which is plenty for a training run and thin for a fourteen mile day in May. Once I'd put that number next to a whole summer of hot exposed peaks I ended up looking at the entire quiver at once.

| Pack | Water | Cargo | What it's for |
|---|---|---|---|
| Camelbak Octane Race 4 | 1.5L | 4L | Training runs, short fast days |
| REI Flash 22 | sleeve only | 22L | Cool-weather day hikes |
| Gregory Citro 24 H2O | 3L | 24L | Hot exposed peaks |
| REI Traverse 32 | 3L capable | 32L | Full kit and overnights |

The gap was a structured 3-liter carrier for mid-summer SoCal, because 3 liters of water is 6.6 pounds riding high on your back and the Flash 22 has no frame and a hip belt that can't do anything with that weight. I landed on the Gregory Citro 24 H2O at around $160. The Osprey Stratos 24 has the same category of tensioned-mesh suspension and I'd have been happy with it, but it doesn't include a bladder, which put it near $215, and on an exposed ridge in August the thing I care about is the air gap between the pack and my back, which both of them have and the cheaper foam-panel options don't.

Shoes are HOKA Speedgoat 7s, which I switched to after the blisters I wrote about [coming off Cucamonga](/posts/cucamonga-ontario-peak/), and I've done Baldy, Gorgonio, and San Bernardino in them since with nothing on my feet at all. That's the gear change this year that most obviously worked. No trekking poles, which I know is a live argument among people who hike a lot more than I do, but I've never wanted my hands occupied.

The rest is short. A Katadyn BeFree for water, which is fast and packs down to nothing. A Nitecore headlamp. Sun hoodies, one Patagonia and one REI, because SoCal exposure is the whole problem on these peaks. Injinji toe socks under Darn Toughs, which is the combination I settled on after the blister stretch. Clif bars, because I've never found a reason to think harder about trail food than that.

## The Watch I Didn't Buy

I wear a Garmin Instinct 2X Solar, and last spring I spent real time researching the upgrade. The Enduro 3 was the winner on paper at $900, the only watch that matched the Instinct's unlimited solar battery while giving me five times the GPS runtime and multi-band accuracy, and I talked myself all the way to the edge of buying it before the actual conclusion showed up, which was that my watch is fine and the thing limiting my data wasn't the watch at all.

So I bought a $50 chest strap instead. It's been on since April, it's what validated my max heart rate at 197 and set the zones I've trained in all year, and it changed the quality of what I'm looking at far more than a new watch would have. The Instinct is still on my wrist.

For running, which is a smaller part of the year than it was, the only thing that's different is the shoes, and those are Brooks Ghosts.

## The Want List

Ultralight, mostly. Hyperlite packs, a tent light enough to make overnights easy instead of a project, and a quilt to replace my sleeping bag. All of it points at the same thing, which is carrying less so the big days get bigger, and none of it is urgent enough that I've pulled the trigger.

The thread running through all of this, and the reason a laptop I bought in 2020 for about a thousand dollars is the one doing the work while a much better computer sits four feet away playing games, is that I've drifted hard toward keep it simple. Every setup I've tried that had more parts got abandoned for the one that had fewer. The 8GB machine picked a better search engine for me. The $50 strap beat the $900 watch. Whitney is on the 23rd, and I'll be carrying almost exactly what's on this list.
