---
title: "A Personal Finance Dashboard on Pure Google Apps Script"
date: 2026-04-07
tags: ["finance", "google-apps-script", "automation"]
group: "projects"
project: "Financial Dashboard"
summary: "My entire financial dashboard runs on a Google Sheet with no server, no database, and no cron. SimpleFIN feeds the data, Apps Script does the work, and it's better than Mint ever was."
draft: true
---

I check my bank apps too much. SoFi in the morning, Amex after lunch, Fidelity before bed, and sometimes all three again because I forgot what I saw an hour ago. None of them talk to each other, none of them show me the full picture, and the combined time I spend context-switching between them is genuinely embarrassing. I wanted one place to look, once, and then close.

So I built a Google Sheet.

## V1: The Manual Era

The first version wasn't code at all. Just a spreadsheet where I'd copy numbers from bank statements every month, manually type in balances, manually categorize transactions. It worked the way any spreadsheet works, which is to say it was accurate on the day I updated it and increasingly wrong every day after that.

The problem was obvious: I built this to stop obsessively checking my finances, and now I had to manually maintain a spreadsheet to do it. The tool that was supposed to reduce friction was creating its own.

What I needed was a way to get bank data into the sheet automatically, without running a server or a cron job or anything I'd have to babysit. The sheet itself was fine as a database and a dashboard. It just needed a data feed.

## Finding SimpleFIN

SimpleFIN Bridge is a service that connects to your bank accounts and exposes them through a REST API. You link your accounts once, pay $1.50/month, and from then on a single API call returns current balances plus 90 days of transaction history. That's the whole product.

The integration lives entirely in Google Apps Script, the free JavaScript runtime baked into Google Sheets. One function calls the SimpleFIN API, processes what comes back, writes it to the sheet, and rebuilds the dashboard. I trigger it from a custom menu item in the sheet, "FinDocs > Sync Now," whenever I want fresh data. No scheduled trigger, no local scripts, no cloud functions.

The manual sync is deliberate. The 90-day fetch window means I can go weeks without syncing and still get everything on the next run. There's no state that goes stale, no failed job to debug. I sync when I want to look at my finances, which ended up being once or twice a month, a massive improvement over checking three apps daily.

## Transaction Dedup

Every sync fetches the full 90-day window, so the same transactions come back repeatedly. The first time I synced after a week away, I got hundreds of duplicate rows because I hadn't accounted for this at all. The fix keys on SimpleFIN's stable transaction IDs, which don't change between syncs even when a pending charge settles. I build a map of everything already in the sheet, then check each incoming transaction against it:

```javascript
// Build map of existing transactions by ID
const existingMap = new Map();
existingRows.forEach((row, i) => {
  existingMap.set(row[0], { row, index: i });
});

// New ID? Append. Known ID but changed? Update in place. Same? Skip.
```

Pending transactions keep the same ID when they settle, so the amount might shift by a few cents and the pending flag flips, but the row updates in place instead of creating a duplicate. A $0.01 epsilon on amount comparison handles floating-point drift. The whole system is safe to re-run anytime, sync twice in a row and nothing happens.

## Categorization That Isn't a Separate Step

The first version of categorization was manual. I'd sync transactions, then go through the uncategorized ones and assign labels. That lasted about two syncs before I realized there was no reason for this to be a separate process. The rules are just substring matches against merchant names, so the sync should apply them automatically on the way in.

```javascript
function categorizeTransaction_(description, rules) {
  const upper = description.toUpperCase();
  for (const pattern of rules.transfers) {
    if (upper.includes(pattern)) return 'Transfer';
  }
  for (const { category, pattern } of rules.spending) {
    if (upper.includes(pattern)) return category;
  }
  return rules.defaultCategory;
}
```

The rules live in a user-editable Categories tab in the sheet. Add a new rule today, and the next sync re-categorizes every transaction in the sheet, not just new ones. No manual cleanup, no stale labels. Anything that falls through to the default shows up in an "Uncategorized" section on the dashboard, grouped by merchant, so I know exactly which patterns to add.

This ended up being the feature I like most about the whole system. Every finance app I've used categorizes once at ingest and then you're fighting it forever. Here, the Categories tab is always authoritative.

## What the Dashboard Looks Like

The Dashboard tab is ephemeral, fully cleared and rebuilt from scratch on every sync. No cell-state tracking, just a clean slate and a batch write.

Up top is the current month: income, spending, amount saved, savings rate color-coded green, blue, or red depending on how it's going. A 3-month rolling average sits underneath so I can tell if the current month is trending high.

The savings trend table shows every month with at least $100 in expenses, which over time becomes the most interesting part of the dashboard. Patterns emerge that you can't see in a single month's data. Below that, current balances grouped by type with a net worth calculation at the bottom, then net worth over time with a line chart and a stacked composition chart that the script generates and positions automatically.

Monthly spending gets a per-category breakdown table with two donut charts, one for the current month and one year-to-date. There's also a recurring charges section that auto-detects subscriptions by finding merchants that appear at consistent amounts for 3+ consecutive months, which caught a few charges I'd genuinely forgotten about.

## The Fidelity Workaround

SimpleFIN doesn't support Fidelity. I tried a few alternatives: there's a Python package that uses Playwright to scrape the Fidelity site, and there's SnapTrade, a paid B2B aggregation product. The scraper needs a server running somewhere, which breaks the whole "no infrastructure" constraint. SnapTrade's pricing doesn't make sense for one person.

So there's a Manual Entry tab where I type in Fidelity balances by hand. The script reads it but never writes to it. In the dashboard, Fidelity rows use spreadsheet formulas that reference Manual Entry directly, so the numbers update whenever I edit them without triggering a sync. I change two cells once a month and move on. Not elegant, but the alternative was spending more time automating Fidelity than I'd ever save.

## Apps Script Quirks

Two things caught me off guard. The V8 runtime in Apps Script doesn't have the browser `URL` constructor, so parsing the SimpleFIN access URL, which has credentials embedded in it like `https://user:pass@host/path`, means pulling apart the scheme, credentials, and host manually:

```javascript
function parseAccessUrl(url) {
  const afterScheme = url.split('://')[1];
  const [credentials, host] = afterScheme.split('@');
  const [username, password] = credentials.split(':');
  return { username, password, baseUrl: 'https://' + host };
}
```

Not hard, but surprising when you're used to the browser having `new URL()` handle this for you.

The bigger quirk is performance. Writing cells one at a time in Apps Script is brutally slow, orders of magnitude slower than a single `setValues()` call with a 2D array. The dashboard rebuild went from minutes to seconds once I batched everything. All secrets, the SimpleFIN token, account identifiers, sheet ID, live in Apps Script's PropertiesService, encrypted at rest and scoped to the script, nothing in the source code.

The system hasn't been running long enough for me to know if it actually changes my behavior. The whole point was to stop checking three finance apps every day and look at one sheet once a month instead, and so far I'm doing that, but "so far" is a few months. The real test is whether I'm still using it a year from now, whether the monthly sync stays a habit or becomes another thing I forget to do, whether the sheet gets slow enough with a year of transactions that I have to rethink the architecture. I don't know yet. But the daily checking has stopped, and the sheet is the only place I look, which is either exactly what I wanted or just a different kind of obsession with fewer apps.
