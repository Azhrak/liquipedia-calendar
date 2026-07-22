import assert from 'node:assert/strict'
import { test } from 'node:test'

import { extractStarCraft2Matches } from '@/liquipedia/starcraft2/extract-matches'
import { extractStarCraft2Tournaments } from '@/liquipedia/starcraft2/extract-tournaments'

// Live smoke tests: hit the real Liquipedia API through the extract pipeline.
// Catches upstream contract drift (e.g. renamed Lua functions, changed HTML
// structure) that unit tests can't see. Run on push to main and on a daily cron.
//
// Both extract fns issue an `action=parse` request, which Liquipedia caps at
// 1 request / 30s. Unlike the app, this runner has no Next.js data cache to
// dedupe, so the back-to-back parse calls can trip a 429 — the fetch layer
// (fetch-page.ts) absorbs that by backing off and retrying, so the tests below
// don't need to space requests themselves.

test('matches: extract returns parsed upcoming matches', async () => {
	const matches = await extractStarCraft2Matches()

	assert.ok(matches.length > 0, 'expected at least one match from Liquipedia')

	const withNames = matches.filter((m) => m.teamLeft?.name || m.teamRight?.name)
	assert.ok(withNames.length > 0, 'expected matches with parsed team names')

	const withTime = matches.filter((m) => m.time)
	assert.ok(withTime.length > 0, 'expected matches with a parsed start time')
})

test('tournaments: extract returns parsed tournaments', async () => {
	const tournaments = await extractStarCraft2Tournaments()

	assert.ok(tournaments.length > 0, 'expected at least one tournament from Liquipedia')

	const withNames = tournaments.filter((t) => t.name)
	assert.ok(withNames.length > 0, 'expected tournaments with parsed names')

	const withDates = tournaments.filter((t) => t.startDate)
	assert.ok(withDates.length > 0, 'expected tournaments with a parsed start date')
})
