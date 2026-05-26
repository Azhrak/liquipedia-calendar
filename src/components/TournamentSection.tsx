'use client'

import qs from 'qs'
import { useState } from 'react'
import { CopyToClipboard } from '@/components/CopyToClipboard'

const TIERS = [
	{ value: 'S', label: 'S-Tier' },
	{ value: '1', label: 'A-Tier' },
	{ value: '2', label: 'B-Tier' },
	{ value: '3', label: 'C-Tier' },
	{ value: '4', label: 'Other' },
]

export const TournamentSection = () => {
	const [selectedTiers, setSelectedTiers] = useState<string[]>([])

	const toggleTier = (tier: string) => {
		setSelectedTiers((prev) =>
			prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier],
		)
	}

	const buildUrl = (base: string) => {
		if (selectedTiers.length === 0) return base
		return `${base}?${qs.stringify({ tier: selectedTiers.join(',') })}`
	}

	const icalUrl = '/get/starcraft2/tournaments/ical'
	const jsonUrl = '/get/starcraft2/tournaments/json'

	return (
		<div className="border-2 border-blue-300 p-4">
			<div className="mb-3 flex items-center justify-between">
				<h3 className="text-2xl">Tournament Filters</h3>
				<button
					onClick={() => setSelectedTiers([])}
					className="rounded-sm border-2 border-gray-400 border-opacity-50 px-2 py-1 text-sm"
				>
					Clear
				</button>
			</div>

			<div className="flex flex-wrap gap-2">
				{TIERS.map(({ value, label }) => (
					<button
						key={value}
						onClick={() => toggleTier(value)}
						className={`rounded-sm border-2 px-3 py-1 text-sm ${
							selectedTiers.includes(value)
								? 'border-blue-400 bg-blue-400 text-white dark:bg-blue-600'
								: 'border-gray-400 border-opacity-50'
						}`}
					>
						{label}
					</button>
				))}
			</div>

			<div className="mt-6 flex-col gap-10">
				<div className="p-4 text-center text-xl">
					<h3 className="text-4xl">iCal</h3>
					<div className="flex gap-3">
						➡ <a href={buildUrl(icalUrl)}>{icalUrl}</a>
						<CopyToClipboard text={buildUrl(icalUrl)} prependUrl />
					</div>
				</div>

				<div className="p-4 text-center text-xl">
					<h3 className="text-4xl">json</h3>
					<div className="flex gap-3">
						➡ <a href={buildUrl(jsonUrl)}>{jsonUrl}</a>
						<CopyToClipboard text={buildUrl(jsonUrl)} prependUrl />
					</div>
				</div>
			</div>
		</div>
	)
}
