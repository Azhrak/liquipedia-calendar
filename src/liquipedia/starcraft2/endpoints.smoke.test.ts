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
// 1 request / 30s. The fetch layer (fetch-page.ts) backs off and retries on a
// 429. If it's still throttled after that — common from shared CI runner IPs,
// which Liquipedia blocks at the IP level regardless of request spacing — we
// SKIP rather than fail: a rate-limit block is infrastructure noise, not the
// upstream contract drift these tests exist to catch. A genuine parse/shape
// regression still fails the assertions below.

// Runs `fn`, marking the test skipped (instead of failed) if Liquipedia
// rate-limited us. Any other error propagates and fails the test.
async function runOrSkipOnRateLimit(t: TestContext, fn: () => Promise<void>): Promise<void> {
	try {
		await fn()
	} catch (err) {
		if (err instanceof LiquipediaRateLimitError) {
			t.skip(`Liquipedia rate limited the request: ${err.message}`)
			return
		}
		throw err
	}
}

test('matches: extract returns parsed upcoming matches', async (t) => {
	await runOrSkipOnRateLimit(t, async () => {
		const matches = await extractStarCraft2Matches()

		assert.ok(matches.length > 0, 'expected at least one match from Liquipedia')

		const withNames = matches.filter((m) => m.teamLeft?.name || m.teamRight?.name)
		assert.ok(withNames.length > 0, 'expected matches with parsed team names')

		const withTime = matches.filter((m) => m.time)
		assert.ok(withTime.length > 0, 'expected matches with a parsed start time')
	})
})

test('tournaments: extract returns parsed tournaments', async (t) => {
	await runOrSkipOnRateLimit(t, async () => {
		const tournaments = await extractStarCraft2Tournaments()

		assert.ok(tournaments.length > 0, 'expected at least one tournament from Liquipedia')

		const withNames = tournaments.filter((tournament) => tournament.name)
		assert.ok(withNames.length > 0, 'expected tournaments with parsed names')

		const withDates = tournaments.filter((tournament) => tournament.startDate)
		assert.ok(withDates.length > 0, 'expected tournaments with a parsed start date')
	})
})
