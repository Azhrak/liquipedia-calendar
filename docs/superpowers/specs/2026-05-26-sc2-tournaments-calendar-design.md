# SC2 Tournament Calendar — Design Spec

Date: 2026-05-26

## Overview

Add SC2 tournament data to the calendar via two new separate endpoints (`/json` and `/ical`). Source: `Portal:Tournaments` parsed HTML. Tournaments appear as all-day calendar events (single-day or multi-day). Filter by tier (S, 1, 2, 3, 4).

---

## Data Source

- **Page:** `https://liquipedia.net/starcraft2/Portal:Tournaments`
- **Fetch method:** `fetchWikiParsed('Portal:Tournaments', wikiRoot)` (existing function in `fetch-page.ts`)
- **Why Portal page:** Structured `table2--generic tournaments-listing` tables with clean CSS classes. Direct Lua invoke fails with memory error. Main_Page tournament list is less structured.
- **Caching:** Same 5-minute revalidation as matches.

---

## Data Extraction

New file: `src/liquipedia/starcraft2/extract-tournaments.ts`

Parse HTML with cheerio. Select rows from `.tournaments-listing` tables. Per row, extract:

| Field | Source |
|-------|--------|
| `name` | `.column__tournament a` text |
| `link` | `.column__tournament a` href → absolute URL |
| `tier` | Tier column text, normalized to `"S"`, `"1"`, `"2"`, `"3"`, `"4"` |
| `startDate` | Date column text, parsed to ISO date string (`YYYY-MM-DD`) |
| `endDate` | Date column text (end of range), null if same as start or absent |
| `prizePool` | Prize pool column text, raw string (e.g. `"$50,000"`) |
| `location` | Location column text, country/city name stripped of flag markup |

**Date parsing:** Date column contains ranges like `"Apr 29 – May 17, 2026"` or single dates. Parse with Luxon. If single date or both dates are equal, `endDate` is `null`.

**Deduplication:** Hash of `name + startDate`, discard duplicates.

**Sorting:** Ascending by `startDate`.

**Scope:** Only ongoing and upcoming tournaments (Portal page shows these at top; skip completed rows — identify by presence of winner data or a `status` class if available, otherwise take all rows and let date filtering handle it naturally).

---

## Data Types

`src/@types/starcraft.ts` — add:

```ts
export type SC2Tournament = {
  hash?: string
  name: string
  link: string | null
  tier: string | null       // "S", "1", "2", "3", "4"
  startDate: string | null  // ISO date YYYY-MM-DD
  endDate: string | null    // ISO date YYYY-MM-DD, null if single-day
  prizePool: string | null  // raw string e.g. "$50,000", null if absent
  location: string | null   // country/city name, null if absent
}
```

`src/@types/common.ts` — add:

```ts
export type TournamentFilterParams = {
  tier?: string | null  // comma-separated, e.g. "1,2" or single "S"
}
```

---

## Filtering

New file: `src/liquipedia/starcraft2/filter-tournaments.ts`

Accept `TournamentFilterParams`. Filter by tier: split comma-separated value, match against `tournament.tier`. No tier param = return all.

---

## Calendar Output

New file: `src/icalendar/icalendarTournament.ts`

`createTournamentEvents(tournaments: SC2Tournament[]): string`

**Event rules:**
- If `endDate` is null → single all-day event on `startDate`
- If `endDate` differs from `startDate` → multi-day all-day event from `startDate` to `endDate` (inclusive)
- All-day events use date-only arrays `[YYYY, MM, DD]` (no time component)

**Event fields:**
- `calName`: `'Liquipedia Tournament Calendar'`
- `title`: `[Tier X] Tournament Name` (e.g. `[Tier 1] ESL Pro Tour`)
- `description`: plain-text block with tournament link, prize pool, location (each on own line, omit if null)
- `htmlContent`: HTML version of description with `<a href="...">Liquipedia</a>` link
- `categories`: `[tier]`

---

## API Routes

### Shared helper
`src/app/get/starcraft2/tournaments/tournaments.ts`
```ts
export async function getTournaments(request: Request): Promise<SC2Tournament[]>
```
Reads `?tier=` param, calls extract + filter.

### JSON endpoint
`src/app/get/starcraft2/tournaments/json/route.ts`
- `GET /get/starcraft2/tournaments/json?tier=1,2`
- Returns `SC2Tournament[]` as JSON

### iCal endpoint
`src/app/get/starcraft2/tournaments/ical/route.ts`
- `GET /get/starcraft2/tournaments/ical?tier=1,2`
- Returns iCal string

---

## New Files Summary

| File | Purpose |
|------|---------|
| `src/liquipedia/starcraft2/extract-tournaments.ts` | Fetch + parse Portal:Tournaments HTML |
| `src/liquipedia/starcraft2/filter-tournaments.ts` | Filter by tier |
| `src/icalendar/icalendarTournament.ts` | Convert to iCal events |
| `src/app/get/starcraft2/tournaments/tournaments.ts` | Shared request handler |
| `src/app/get/starcraft2/tournaments/json/route.ts` | JSON route |
| `src/app/get/starcraft2/tournaments/ical/route.ts` | iCal route |

## Modified Files

| File | Change |
|------|--------|
| `src/@types/starcraft.ts` | Add `SC2Tournament` type |
| `src/@types/common.ts` | Add `TournamentFilterParams` type |

---

## Out of Scope

- Participant count not included in calendar events
- No merging with matches endpoints
- No pagination of Portal:Tournaments (first page sufficient for upcoming/ongoing)
