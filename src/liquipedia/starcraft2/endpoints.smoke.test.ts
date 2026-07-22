import assert from 'node:assert/strict'
import { test } from 'node:test'
import { setTimeout as sleep } from 'node:timers/promises'

import { extractStarCraft2Matches } from '@/liquipedia/starcraft2/extract-matches'
import { extractStarCraft2Tournaments } from '@/liquipedia/starcraft2/extract-tournaments'

// Live smoke tests: hit the real Liquipedia API through the extract pipeline.
// Catches upstream contract drift (e.g. renamed Lua functions, changed HTML
// structure) that unit tests can't see. Run on push to main and on a daily cron.
//
// Rate limiting: both extract fns issue an `action=parse` request, which
// Liquipedia's API Terms of Use cap at 1 request / 30s (other actions: 1 / 2s).
// Unlike the app, this runner has no Next.js data cache to dedupe requests, so
// we must space the parse calls out ourselves or the run trips a 429. The sleep
// below runs before the second parse request regardless of test ordering or
// concurrency, keeping the two calls >30s apart.
const PARSE_RATE_LIMIT_MS = 31_000

test('matches: extract returns parsed upcoming matches', async () => {
	const matches = await extractStarCraft2Matches()

	assert.ok(matches.length > 0, 'expected at least one match from Liquipedia')

	const withNames = matches.filter((m) => m.teamLeft?.name || m.teamRight?.name)
	assert.ok(withNames.length > 0, 'expected matches with parsed team names')

	const withTime = matches.filter((m) => m.time)
	assert.ok(withTime.length > 0, 'expected matches with a parsed start time')
})

test('tournaments: extract returns parsed tournaments', async () => {
	// Respect Liquipedia's parse rate limit: wait out the window opened by the
	// matches test's parse request before issuing our own.
	await sleep(PARSE_RATE_LIMIT_MS)

	const tournaments = await extractStarCraft2Tournaments()

	assert.ok(tournaments.length > 0, 'expected at least one tournament from Liquipedia')

	const withNames = tournaments.filter((t) => t.name)
	assert.ok(withNames.length > 0, 'expected tournaments with parsed names')

	const withDates = tournaments.filter((t) => t.startDate)
	assert.ok(withDates.length > 0, 'expected tournaments with a parsed start date')
})
