'use client'

import { useMemo } from 'react'
import { buildMatchUrl } from '@/lib/buildFeedUrl'
import { useFilters } from './providers/FiltersProvider'
import { FeedCard } from './ui/FeedCard'
import { FieldLabel } from './ui/FieldLabel'
import { RacePicker } from './ui/RacePicker'
import { Segmented } from './ui/Segmented'
import { TextInput } from './ui/TextInput'
import { UrlBlock } from './ui/UrlBlock'

const ICAL_PATH = '/get/starcraft2/ical'
const JSON_PATH = '/get/starcraft2/json'

type FeaturedValue = 'all' | 'yes' | 'no'

/**
 * The "Matches" card: player/race/country/featured filters + iCal/JSON URLs.
 * Must be rendered inside a `<FiltersProvider>` (see page.tsx).
 */
export function MatchesFeed() {
	const {
		state,
		filterPlayer,
		filterRace,
		filterCountry,
		filterFeatured,
		clearFilters,
	} = useFilters()

	const player = state.player ?? ''
	const race = Array.isArray(state.race) ? state.race : state.race ? [state.race] : []
	const country = state.country ?? ''
	const featured = (state.featured as FeaturedValue) ?? 'all'

	const hasFilters = Boolean(player || race.length > 0 || country || (featured && featured !== 'all'))

	const urlState = useMemo(
		() => ({
			player: player || undefined,
			race: race.length > 0 ? race : undefined,
			country: country || undefined,
			featured: featured !== 'all' ? featured : undefined,
		}),
		[player, race, country, featured],
	)

	const icalUrl = useMemo(() => buildMatchUrl(ICAL_PATH, urlState), [urlState])
	const jsonUrl = useMemo(() => buildMatchUrl(JSON_PATH, urlState), [urlState])

	return (
		<div className="space-y-4">
			<FeedCard
				title="Matches"
				subtitle="Individual games as separate events"
				badge="per-game"
				iconWrapperClass="bg-accent/10 ring-1 ring-accent/30"
				accentStripeClass="bg-gradient-to-b from-accent/80 to-accent/0"
				icon={<MatchesIcon />}
				onClear={clearFilters}
				hasFilters={hasFilters}
			>
				<div className="space-y-5">
					<div className="flex flex-col gap-1.5">
						<FieldLabel htmlFor="player">Player</FieldLabel>
						<TextInput
							id="player"
							value={player}
							onChange={filterPlayer}
							placeholder="e.g. Serral, Maru, herO"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<FieldLabel>Race</FieldLabel>
						<RacePicker value={race} onChange={filterRace} />
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="flex flex-col gap-1.5">
							<FieldLabel htmlFor="country">Country</FieldLabel>
							<TextInput
								id="country"
								value={country}
								onChange={(v) => filterCountry(v.slice(0, 2))}
								placeholder="FI"
								maxLength={2}
								mono
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<FieldLabel>Featured only</FieldLabel>
							<Segmented<FeaturedValue>
								value={featured}
								onChange={filterFeatured}
								options={[
									{ value: 'all', label: 'All' },
									{ value: 'yes', label: 'Yes' },
									{ value: 'no', label: 'No' },
								]}
							/>
						</div>
					</div>
				</div>
			</FeedCard>

			<div className="space-y-2.5 pl-2">
				<FeedUrlsHeading />
				<UrlBlock format="ical" url={icalUrl} />
				<UrlBlock format="json" url={jsonUrl} />
			</div>
		</div>
	)
}

function FeedUrlsHeading() {
	return (
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
	)
}

function MatchesIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#7cf6c2"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden
		>
			<path d="M14.5 2v3M9.5 2v3M3 8h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
			<circle cx="8" cy="13" r="1" fill="#7cf6c2" />
			<circle cx="12" cy="13" r="1" fill="#7cf6c2" />
			<circle cx="16" cy="13" r="1" fill="#7cf6c2" />
		</svg>
	)
}
