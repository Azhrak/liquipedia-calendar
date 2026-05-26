'use client'

import { useMemo, useState } from 'react'
import { buildTournamentUrl } from '@/lib/buildFeedUrl'
import { TIERS, type TierValue } from '@/lib/tiers'
import { FeedCard } from './ui/FeedCard'
import { FieldLabel } from './ui/FieldLabel'
import { TierPicker } from './ui/TierPicker'
import { UrlBlock } from './ui/UrlBlock'

const ICAL_PATH = '/get/starcraft2/tournaments/ical'
const JSON_PATH = '/get/starcraft2/tournaments/json'

const ALL_TIERS = TIERS.map((t) => t.value)
const DEFAULT_TIERS: TierValue[] = ['S', '1']

/**
 * The "Tournaments" card: multi-select tier filter + iCal/JSON URLs.
 * Tier state is local — same approach as the original TournamentSection.
 */
export function TournamentsFeed() {
	const [tiers, setTiers] = useState<TierValue[]>(DEFAULT_TIERS)

	const hasFilters = tiers.length > 0 && tiers.length < ALL_TIERS.length

	const filterTiers = useMemo(() => (tiers.length === ALL_TIERS.length ? [] : tiers), [tiers])

	const icalUrl = useMemo(() => buildTournamentUrl(ICAL_PATH, filterTiers), [filterTiers])
	const jsonUrl = useMemo(() => buildTournamentUrl(JSON_PATH, filterTiers), [filterTiers])

	const handleClear = () => setTiers(ALL_TIERS)

	return (
		<div className="space-y-4">
			<FeedCard
				title="Tournaments"
				subtitle="Whole events as multi-day blocks"
				badge="series"
				iconWrapperClass="bg-amber-300/10 ring-1 ring-amber-300/30"
				accentStripeClass="bg-gradient-to-b from-amber-300/80 to-amber-300/0"
				icon={<TournamentsIcon />}
				onClear={handleClear}
				hasFilters={hasFilters}
			>
				<div className="space-y-5">
					<div className="flex flex-col gap-1.5">
						<FieldLabel>
							Tiers{' '}
							<span className="text-ink-600 normal-case tracking-normal font-normal">
								— include any of
							</span>
						</FieldLabel>
						<TierPicker value={tiers} onChange={setTiers} />
					</div>
					<p className="text-xs text-ink-500 leading-relaxed border-l-2 border-ink-800 pl-3">
						Tier reflects prize pool &amp; prestige. S-Tier covers premier events like GSL Code S,
						WCS Global Finals, and IEM Katowice.
					</p>
				</div>
			</FeedCard>

			<div className="space-y-2.5 pl-2">
				<div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-ink-500 pl-1">
					<svg
						width="11"
						height="11"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth={2.5}
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden
					>
						<path d="M12 5v14M5 12l7 7 7-7" />
					</svg>
					Your feed URL
				</div>
				<UrlBlock format="ical" url={icalUrl} />
				<UrlBlock format="json" url={jsonUrl} />
			</div>
		</div>
	)
}

function TournamentsIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#fcd34d"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden
		>
			<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
			<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
			<path d="M4 22h16" />
			<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
			<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
			<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
		</svg>
	)
}
