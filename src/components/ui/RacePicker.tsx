'use client'

import { RACES, type Race } from '@/lib/races'

type Props = {
	value: string[]
	onChange: (next: string[]) => void
}

export function RacePicker({ value, onChange }: Props) {
	const toggle = (id: string) => {
		const next = new Set(value)
		if (next.has(id)) next.delete(id)
		else next.add(id)
		onChange([...next])
	}

	return (
		<div className="grid grid-cols-5 gap-1.5">
			{/* "Any" tile */}
			<button
				type="button"
				onClick={() => onChange([])}
				aria-pressed={value.length === 0}
				className={[
					'group flex flex-col items-center justify-center gap-1 py-2.5 rounded-md border text-[11px] font-medium transition-all',
					value.length === 0
						? 'border-accent/50 bg-accent/10 text-accent shadow-[inset_0_0_0_1px_rgba(124,246,194,0.15)]'
						: 'border-ink-700 bg-ink-900 text-ink-500 hover:text-ink-300 hover:border-ink-600',
				].join(' ')}
			>
				<span className="text-[15px] font-display font-semibold">∗</span>
				<span>Any</span>
			</button>

			{RACES.map((r) => (
				<RaceTile key={r.id} race={r} active={value.includes(r.id)} onClick={toggle} />
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
	onClick: (id: string) => void
}) {
	return (
		<button
			type="button"
			aria-pressed={active}
			onClick={() => onClick(race.id)}
			className={[
				'group relative flex flex-col items-center justify-center gap-1 py-2.5 rounded-md border text-[11px] font-medium transition-all',
				active
					? 'border-accent/50 bg-accent/10 text-accent shadow-[inset_0_0_0_1px_rgba(124,246,194,0.15)]'
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
			<span className="opacity-80">{race.label}</span>
		</button>
	)
}
