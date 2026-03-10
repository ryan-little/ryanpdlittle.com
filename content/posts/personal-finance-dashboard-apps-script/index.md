---
title: "A Personal Finance Dashboard on Pure Google Apps Script"
date: 2026-04-07
tags: ["finance", "google-apps-script", "automation"]
group: "projects"
project: "Financial Dashboard"
summary: "My entire financial dashboard runs on a Google Sheet with no server, no database, and no cron. SimpleFIN feeds the data, Apps Script does the work, and it's better than Mint ever was."
draft: true
---

My entire financial dashboard runs on a Google Sheet and it's better than Mint ever was.

No server. No database. No cron job. SimpleFIN Bridge feeds bank data into a Google Apps Script that runs on a daily trigger. The Sheet is the database, the dashboard, and the UI, all in one.

## Why a Google Sheet?

<!-- TODO: Mint is dead. YNAB is $100/year for something you could build yourself. A Sheet is free, always accessible, editable from your phone, and you own the data. -->

## The Stack

<!-- TODO: SimpleFIN Bridge ($1.50/month) → Google Apps Script (daily trigger, 6-7AM PT) → Google Sheet with 5 tabs (Dashboard, Manual Entry, Categories, Transactions, History) -->

## The Killer Feature: Re-Categorization on Every Sync

<!-- TODO: When you add or change a categorization rule, the next sync re-categorizes ALL existing transactions, not just new ones. Categories are always in sync with rules. This is the thing that makes it better than any app. -->

## Transaction Deduplication

<!-- TODO: SimpleFIN provides stable unique IDs. 90-day fetch window, dedup by ID, pending → settled updates in place. Safe to re-run anytime. -->

## What the Dashboard Shows

<!-- TODO: Monthly income/spending/savings rate, savings trend, current balances + net worth, net worth over time (line + stacked composition), monthly spending by category, 401K holdings, uncategorized transactions -->

## The Manual Entry Workaround

<!-- TODO: Fidelity isn't on SimpleFIN. Manual balance entry tab that the script reads but never writes. Ugly but functional. -->

## What I'd Improve

<!-- TODO: The Sheet gets slow with a year of transaction data. The categorization regex could be smarter. Could add budget targets per category. But honestly it works and I barely touch it. -->
