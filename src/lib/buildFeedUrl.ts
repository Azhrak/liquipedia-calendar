import qs from 'qs'
import type { FilterParams } from '@/@types/common'
import type { TierValue } from './tiers'

/**
 * Build a feed URL with optional query params.
 * Same behaviour as the previous `Links.tsx` — empty params skipped, all others
 * passed through `qs.stringify` for parity with the route handlers.
 */
export function buildMatchUrl(base: string, params: FilterParams): string {
	const clean: Record<string, string> = {}
	for (const [k, v] of Object.entries(params)) {
		if (v == null) continue
		if (Array.isArray(v)) {
			if (v.length > 0) clean[k] = v.join(',')
		} else if (v !== '') {
			clean[k] = String(v)
		}
	}
	const q = qs.stringify(clean)
	return q ? `${base}?${q}` : base
}

/**
 * Tier filter goes on as a single comma-separated `tier` param, matching the
 * existing `TournamentSection.tsx` behaviour.
 */
export function buildTournamentUrl(base: string, tiers: TierValue[]): string {
	if (tiers.length === 0) return base
	return `${base}?${qs.stringify({ tier: tiers.join(',') })}`
}
