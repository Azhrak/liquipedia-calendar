import assert from 'node:assert/strict'
import { type TestContext, test } from 'node:test'

import { LiquipediaRateLimitError } from '@/liquipedia/fetch-page'
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
//
// The limit is per client IP, though, and CI runs from shared datacenter IPs
// whose budget is regularly spent by unrelated traffic before we even start —
// there the block outlives any reasonable retry budget. That's an environment
// problem, not the contract drift these tests exist to catch, so a rate limit
// that survives the retries skips the test instead of failing the run. Set
// SMOKE_STRICT=1 to fail on it instead.

const STRICT = process.env.SMOKE_STRICT === '1'

/**
 * Runs `fn`, returning undefined (and marking the test skipped) if Liquipedia
 * rate limited us for the entire retry budget. Every other error propagates.
 */
async function unlessRateLimited<T>(t: TestContext, fn: () => Promise<T>): Promise<T | undefined> {
	try {
		return await fn()
	} catch (error) {
		if (!STRICT && error instanceof LiquipediaRateLimitError) {
			t.diagnostic(`skipped: ${error.message}`)
			t.skip('Liquipedia rate limited this runner — cannot verify the live contract')
			return undefined
		}
		throw error
	}
}

test('matches: extract returns parsed upcoming matches', async (t) => {
	const matches = await unlessRateLimited(t, extractStarCraft2Matches)
	if (!matches) return

	assert.ok(matches.length > 0, 'expected at least one match from Liquipedia')

	const withNames = matches.filter((m) => m.teamLeft?.name || m.teamRight?.name)
	assert.ok(withNames.length > 0, 'expected matches with parsed team names')

	const withTime = matches.filter((m) => m.time)
	assert.ok(withTime.length > 0, 'expected matches with a parsed start time')
})

test('tournaments: extract returns parsed tournaments', async (t) => {
	const tournaments = await unlessRateLimited(t, extractStarCraft2Tournaments)
	if (!tournaments) return

	assert.ok(tournaments.length > 0, 'expected at least one tournament from Liquipedia')

	const withNames = tournaments.filter((t) => t.name)
	assert.ok(withNames.length > 0, 'expected tournaments with parsed names')

	const withDates = tournaments.filter((t) => t.startDate)
	assert.ok(withDates.length > 0, 'expected tournaments with a parsed start date')
})
