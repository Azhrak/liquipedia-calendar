/**
 * Tier values match the existing route filter (`src/components/TournamentSection.tsx`):
 * 'S' = S-Tier, '1' = A, '2' = B, '3' = C, '4' = Other.
 */
export type TierValue = 'S' | '1' | '2' | '3' | '4'

export type Tier = {
	value: TierValue
	label: string
	/** Short subtitle shown beneath the value */
	desc: string
}

export const TIERS: Tier[] = [
	{ value: 'S', label: 'S-Tier', desc: 'Premier' },
	{ value: '1', label: 'A-Tier', desc: 'Major' },
	{ value: '2', label: 'B-Tier', desc: 'Mid' },
	{ value: '3', label: 'C-Tier', desc: 'Minor' },
	{ value: '4', label: 'Other', desc: 'Misc' },
]
