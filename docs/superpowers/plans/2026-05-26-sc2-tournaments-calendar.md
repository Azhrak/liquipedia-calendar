# SC2 Tournament Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add SC2 tournament calendar endpoints (`/json` and `/ical`) sourced from `Portal:Tournaments`, with tier filtering and all-day iCal events.

**Architecture:** Fetch parsed HTML from `Portal:Tournaments` via existing `fetchWikiParsed`. Parse with cheerio into `SC2Tournament[]`. Filter by tier. Render as JSON or iCal. Pattern mirrors the existing matches pipeline.

**Tech Stack:** Next.js 15 App Router, cheerio, luxon, ics, TypeScript, pnpm, biome (linter/formatter)

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `src/@types/starcraft.ts` | Add `SC2Tournament` type |
| Modify | `src/@types/common.ts` | Add `TournamentFilterParams` type |
| Create | `src/liquipedia/starcraft2/extract-tournaments.ts` | Fetch + parse Portal:Tournaments HTML → `SC2Tournament[]` |
| Create | `src/liquipedia/starcraft2/filter-tournaments.ts` | Filter `SC2Tournament[]` by tier |
| Create | `src/icalendar/icalendarTournament.ts` | Convert `SC2Tournament[]` → iCal string |
| Create | `src/app/get/starcraft2/tournaments/tournaments.ts` | Shared request helper: extract + filter |
| Create | `src/app/get/starcraft2/tournaments/json/route.ts` | `GET /get/starcraft2/tournaments/json` |
| Create | `src/app/get/starcraft2/tournaments/ical/route.ts` | `GET /get/starcraft2/tournaments/ical` |

---

## Task 1: Add Types

**Files:**
- Modify: `src/@types/starcraft.ts`
- Modify: `src/@types/common.ts`

- [ ] **Step 1: Add `SC2Tournament` to starcraft types**

Open `src/@types/starcraft.ts`. Append at the end of the file:

```ts
export type SC2Tournament = {
	hash?: string
	name: string
	link: string | null
	tier: string | null
	startDate: string | null
	endDate: string | null
	prizePool: string | null
	location: string | null
}
```

- [ ] **Step 2: Add `TournamentFilterParams` to common types**

Open `src/@types/common.ts`. Append at the end of the file:

```ts
export type TournamentFilterParams = {
	tier?: string | null
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/@types/starcraft.ts src/@types/common.ts
git commit -m "feat(sc2): add SC2Tournament and TournamentFilterParams types"
```

---

## Task 2: Tournament Extraction

**Files:**
- Create: `src/liquipedia/starcraft2/extract-tournaments.ts`

The Portal:Tournaments page HTML uses `.tournaments-listing` tables. Each row has columns for tier, tournament name (with link), dates, prize pool, and location. Ongoing/upcoming tournaments appear before completed ones — the page is ordered so we can stop at the first section containing completed results.

Date column contains ranges like `"Apr 29 – May 17, 2026"` or single dates like `"May 26, 2026"`. Use Luxon to parse.

Tier column text is something like `"S-Tier"`, `"A-Tier"`, `"B-Tier"`, `"C-Tier"`, `"Weekly"` — normalize to `"S"`, `"1"`, `"2"`, `"3"`, `"4"` mapping S→S, A→1, B→2, C→3, D/Weekly/etc→4.

- [ ] **Step 1: Create the extraction file**

Create `src/liquipedia/starcraft2/extract-tournaments.ts`:

```ts
import { cache } from 'react'
import * as cheerio from 'cheerio'
import { DateTime } from 'luxon'
import { SC2Tournament } from '@/@types/starcraft'
import { config } from '@/config'
import { fetchWikiParsed } from '@/liquipedia/fetch-page'
import { simpleHash } from '@/utils/utils'

export const revalidate = 300

function sc2Url(path: string): string {
	return new URL(path, config.sc2WikiRootUrl).toString()
}

function normalizeTier(raw: string): string | null {
	const t = raw.trim().toUpperCase()
	if (t.startsWith('S')) return 'S'
	if (t.startsWith('A')) return '1'
	if (t.startsWith('B')) return '2'
	if (t.startsWith('C')) return '3'
	if (t.length > 0) return '4'
	return null
}

function parseDateRange(raw: string): { startDate: string | null; endDate: string | null } {
	const trimmed = raw.trim()
	if (!trimmed) return { startDate: null, endDate: null }

	// Split on en-dash or em-dash
	const parts = trimmed.split(/\s*[–—-]\s*/)

	const parseDate = (s: string, referenceYear?: number): string | null => {
		// Try full date first: "May 17, 2026"
		let d = DateTime.fromFormat(s.trim(), 'MMM d, yyyy')
		if (d.isValid) return d.toISODate()

		// Try short date with reference year: "Apr 29" (year from end date)
		if (referenceYear) {
			d = DateTime.fromFormat(`${s.trim()} ${referenceYear}`, 'MMM d yyyy')
			if (d.isValid) return d.toISODate()
		}
		return null
	}

	if (parts.length === 1) {
		const startDate = parseDate(parts[0])
		return { startDate, endDate: null }
	}

	// Two parts: start may lack year, end has year
	const endDate = parseDate(parts[1])
	const endYear = endDate ? parseInt(endDate.slice(0, 4)) : undefined
	const startDate = parseDate(parts[0], endYear) ?? parseDate(parts[0])

	const finalEndDate = startDate === endDate ? null : endDate
	return { startDate, endDate: finalEndDate }
}

function parseRow(
	$: cheerio.CheerioAPI,
	el: cheerio.Element,
): SC2Tournament | null {
	const $el = $(el)

	const tierRaw = $el.find('td').eq(0).text()
	const tier = normalizeTier(tierRaw)

	const tournamentAnchor = $el.find('.column__tournament a').first()
	const name = tournamentAnchor.text().trim()
	if (!name) return null

	const href = tournamentAnchor.attr('href')
	const link = href ? sc2Url(href) : null

	const dateRaw = $el.find('td').filter((_, td) => {
		return $(td).find('a[href*="/"]').length === 0 && /[A-Za-z]{3}/.test($(td).text())
	}).first().text()
	const { startDate, endDate } = parseDateRange(dateRaw)

	const prizePoolRaw = $el.find('td').filter((_, td) => {
		return $(td).text().trim().startsWith('$')
	}).first().text().trim()
	const prizePool = prizePoolRaw || null

	// Location: td with flag image
	const locationTd = $el.find('td').filter((_, td) => {
		return $(td).find('.flag, .flag-icon, img[alt]').length > 0 &&
			!$(td).hasClass('column__tournament')
	}).first()
	const location = locationTd.text().trim() || null

	const tournament: SC2Tournament = {
		name,
		link,
		tier,
		startDate,
		endDate,
		prizePool,
		location,
	}

	tournament.hash = simpleHash(`${name}${startDate ?? ''}`)
	return tournament
}

export const extractStarCraft2Tournaments = cache(async (): Promise<SC2Tournament[]> => {
	const html = await fetchWikiParsed('Portal:Tournaments', config.sc2WikiRootUrl)
	const $ = cheerio.load(html)

	const tournaments: SC2Tournament[] = []

	$('.tournaments-listing tbody tr').each((_, el) => {
		const t = parseRow($, el)
		if (t) tournaments.push(t)
	})

	const seen = new Set<string>()
	const unique = tournaments.filter((t) => {
		if (!t.hash || seen.has(t.hash)) return false
		seen.add(t.hash)
		return true
	})

	return unique.sort((a, b) => {
		if (!a.startDate) return 1
		if (!b.startDate) return -1
		return a.startDate < b.startDate ? -1 : 1
	})
})
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Manually verify extraction works**

Start the dev server: `pnpm dev`

Visit `http://localhost:3000/get/starcraft2/tournaments/json` — this won't exist yet, but you can temporarily add a `console.log` call from a script or check after route is added in Task 5.

Alternatively, create a quick test script `src/scripts/run-sc2-tournaments.ts`:

```ts
import { extractStarCraft2Tournaments } from '@/liquipedia/starcraft2/extract-tournaments'

const main = async () => {
	const tournaments = await extractStarCraft2Tournaments()
	console.log(JSON.stringify(tournaments.slice(0, 3), null, 2))
}
main()
```

Run: `pnpm exec tsx --tsconfig tsconfig.json -r tsconfig-paths/register src/scripts/run-sc2-tournaments.ts`

Expected: array of tournament objects with name, tier, dates visible. If dates parse to `null` or tier is wrong, adjust `parseRow` selectors by inspecting the actual HTML at `https://liquipedia.net/starcraft2/Portal:Tournaments`.

- [ ] **Step 4: Commit**

```bash
git add src/liquipedia/starcraft2/extract-tournaments.ts
git commit -m "feat(sc2): extract SC2 tournaments from Portal:Tournaments"
```

---

## Task 3: Tournament Filtering

**Files:**
- Create: `src/liquipedia/starcraft2/filter-tournaments.ts`

- [ ] **Step 1: Create filter file**

Create `src/liquipedia/starcraft2/filter-tournaments.ts`:

```ts
import { TournamentFilterParams } from '@/@types/common'
import { SC2Tournament } from '@/@types/starcraft'

export const filterStarCraft2Tournaments = (
	tournaments: SC2Tournament[],
	params: TournamentFilterParams,
): SC2Tournament[] => {
	if (!params.tier) return tournaments

	const tiers = params.tier
		.toLowerCase()
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean)

	if (tiers.length === 0) return tournaments

	return tournaments.filter((t) => t.tier !== null && tiers.includes(t.tier.toLowerCase()))
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/liquipedia/starcraft2/filter-tournaments.ts
git commit -m "feat(sc2): add tournament tier filter"
```

---

## Task 4: iCal Tournament Events

**Files:**
- Create: `src/icalendar/icalendarTournament.ts`

The `ics` library's `createEvents` accepts `EventAttributes[]`. For all-day events, use a 3-element date array `[YYYY, MM, DD]` with no time. Multi-day events set both `start` and `end` as date arrays. Single-day events only set `start` (no `end`).

- [ ] **Step 1: Create iCal tournament file**

Create `src/icalendar/icalendarTournament.ts`:

```ts
import ics, { createEvents } from 'ics'
import { SC2Tournament } from '@/@types/starcraft'

export const createTournamentEvents = (tournaments: SC2Tournament[]): string => {
	const { error, value } = createEvents(tournaments.map(tournamentToIcal))
	if (error) {
		console.error(error)
		return ''
	}
	return value ?? ''
}

const tournamentToIcal = (tournament: SC2Tournament): ics.EventAttributes => {
	const start = toDateArray(tournament.startDate)
	const end = tournament.endDate ? toDateArray(tournament.endDate) : undefined

	const tierLabel = tournament.tier ? `[Tier ${tournament.tier}] ` : ''
	const title = `${tierLabel}${tournament.name}`

	return {
		calName: 'Liquipedia Tournament Calendar',
		start: start ?? [2000, 1, 1],
		end,
		title,
		description: getDescription(tournament),
		htmlContent: getHtmlDescription(tournament),
		categories: tournament.tier ? [tournament.tier] : [],
	}
}

const toDateArray = (isoDate: string | null): ics.DateArray | null => {
	if (!isoDate) return null
	const [y, m, d] = isoDate.split('-').map(Number)
	return [y, m, d]
}

const getDescription = (t: SC2Tournament): string => {
	const lines: string[] = []
	if (t.link) lines.push(`More info: ${t.link}`)
	if (t.prizePool) lines.push(`Prize pool: ${t.prizePool}`)
	if (t.location) lines.push(`Location: ${t.location}`)
	return lines.join('\n')
}

const getHtmlDescription = (t: SC2Tournament): string => {
	let html = '<!DOCTYPE html><html><body>'
	if (t.link) html += `<a href="${t.link}">Liquipedia</a><br />`
	if (t.prizePool) html += `Prize pool: <strong>${t.prizePool}</strong><br />`
	if (t.location) html += `Location: ${t.location}<br />`
	html += '</body></html>'
	return html
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/icalendar/icalendarTournament.ts
git commit -m "feat(sc2): create iCal tournament events"
```

---

## Task 5: API Routes

**Files:**
- Create: `src/app/get/starcraft2/tournaments/tournaments.ts`
- Create: `src/app/get/starcraft2/tournaments/json/route.ts`
- Create: `src/app/get/starcraft2/tournaments/ical/route.ts`

- [ ] **Step 1: Create shared tournaments helper**

Create `src/app/get/starcraft2/tournaments/tournaments.ts`:

```ts
import { extractStarCraft2Tournaments } from '@/liquipedia/starcraft2/extract-tournaments'
import { filterStarCraft2Tournaments } from '@/liquipedia/starcraft2/filter-tournaments'

export async function getTournaments(request: Request) {
	const tournaments = await extractStarCraft2Tournaments()
	const { searchParams } = new URL(request.url)
	return filterStarCraft2Tournaments(tournaments, {
		tier: searchParams.get('tier'),
	})
}
```

- [ ] **Step 2: Create JSON route**

Create `src/app/get/starcraft2/tournaments/json/route.ts`:

```ts
import { getTournaments } from '../tournaments'

export async function GET(request: Request) {
	const tournaments = await getTournaments(request)
	return Response.json(tournaments)
}
```

- [ ] **Step 3: Create iCal route**

Create `src/app/get/starcraft2/tournaments/ical/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { createTournamentEvents } from '@/icalendar/icalendarTournament'
import { getTournaments } from '../tournaments'

export async function GET(request: Request) {
	const tournaments = await getTournaments(request)
	const ical = createTournamentEvents(tournaments)
	return new NextResponse<string>(ical, { status: 200 })
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/get/starcraft2/tournaments/tournaments.ts src/app/get/starcraft2/tournaments/json/route.ts src/app/get/starcraft2/tournaments/ical/route.ts
git commit -m "feat(sc2): add tournament JSON and iCal API routes"
```

---

## Task 6: Manual Verification

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Verify JSON endpoint**

Visit `http://localhost:3000/get/starcraft2/tournaments/json`

Expected: JSON array of tournament objects. Check that `name`, `tier`, `startDate`, `endDate`, `prizePool`, `location`, `link` fields are populated. Some may be null if the Portal page doesn't have data for them.

If array is empty or all fields are null, the CSS selectors in `extract-tournaments.ts` need adjustment. Fetch the raw HTML to inspect:

```bash
curl "https://liquipedia.net/starcraft2/api.php?action=parse&page=Portal:Tournaments&format=json&prop=text" | pnpm exec tsx -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); require('fs').writeFileSync('tmp-portal.html', d.parse.text['*'])"
```

Open `tmp-portal.html` and inspect actual CSS classes and structure, then update selectors in `src/liquipedia/starcraft2/extract-tournaments.ts` accordingly.

- [ ] **Step 3: Verify tier filter**

Visit `http://localhost:3000/get/starcraft2/tournaments/json?tier=1`

Expected: only tier `"1"` (A-tier) tournaments returned.

Visit `http://localhost:3000/get/starcraft2/tournaments/json?tier=S,1`

Expected: S-tier and tier 1 tournaments.

- [ ] **Step 4: Verify iCal endpoint**

Visit `http://localhost:3000/get/starcraft2/tournaments/ical`

Expected: plain text iCal output starting with `BEGIN:VCALENDAR`. Check that:
- Single-day tournaments have no `DTEND`
- Multi-day tournaments have `DTEND` set
- `SUMMARY` starts with `[Tier X]`
- `DESCRIPTION` includes link, prize pool, location

- [ ] **Step 5: Run linter**

```bash
pnpm check
```

Fix any biome errors.

- [ ] **Step 6: Final commit if any lint fixes applied**

```bash
git add -p
git commit -m "fix(sc2): apply biome lint fixes to tournament files"
```
