'use client'

import { RACES, type Race } from '@/lib/races'

type Props = {
	/** Empty string = "Any race" (no filter). */
	value: string
	onChange: (next: string) => void
}

export function RacePicker({ value, onChange }: Props) {
	return (
		<div className="grid grid-cols-5 gap-1.5">
			{/* "Any" tile */}
			<button
				type="button"
				onClick={() => onChange('')}
				aria-pressed={value === ''}
				className={[
					'group flex flex-col items-center justify-center gap-1 py-2.5 rounded-md border text-[11px] font-medium transition-all',
					value === ''
						? 'border-ink-600 bg-ink-800 text-white'
						: 'border-ink-700 bg-ink-900 text-ink-500 hover:text-ink-300 hover:border-ink-600',
				].join(' ')}
			>
				<span className="text-[15px] font-display font-semibold">∗</span>
				<span>Any</span>
			</button>

			{RACES.map((r) => (
				<RaceTile key={r.id} race={r} active={value === r.id} onClick={onChange} />
			))}
		</div>
	)
}

function RaceTile({
	race,
	active,
	onClick,
}: {
	race: Race
	active: boolean
	onClick: (next: string) => void
}) {
	return (
		<button
			type="button"
			aria-pressed={active}
			onClick={() => onClick(active ? '' : race.id)}
			className={[
				'group relative flex flex-col items-center justify-center gap-1 py-2.5 rounded-md border text-[11px] font-medium transition-all',
				active
					? `border-transparent bg-gradient-to-br ${race.hue} text-ink-950`
					: 'border-ink-700 bg-ink-900 text-ink-500 hover:text-ink-300 hover:border-ink-600',
			].join(' ')}
		>
			<span
				className={[
					'text-[15px] font-display font-bold',
					active ? '' : `${race.text} opacity-70 group-hover:opacity-100`,
				].join(' ')}
			>
				{race.short}
			</span>
			<span className={active ? 'text-ink-950/80' : ''}>{race.label}</span>
		</button>
	)
}
