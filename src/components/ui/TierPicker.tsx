'use client'

import { TIERS, type TierValue } from '@/lib/tiers'

type Props = {
	value: TierValue[]
	onChange: (next: TierValue[]) => void
}

export function TierPicker({ value, onChange }: Props) {
	const toggle = (v: TierValue) => {
		const next = new Set(value)
		if (next.has(v)) next.delete(v)
		else next.add(v)
		onChange([...next])
	}

	return (
		<div className="grid grid-cols-5 gap-1.5">
			{TIERS.map((t) => {
				const active = value.includes(t.value)
				return (
					<button
						key={t.value}
						type="button"
						aria-pressed={active}
						onClick={() => toggle(t.value)}
						className={[
							'flex flex-col items-center justify-center py-2.5 rounded-md border text-[11px] font-medium transition-all',
							active
								? 'border-accent/50 bg-accent/10 text-accent shadow-[inset_0_0_0_1px_rgba(124,246,194,0.15)]'
								: 'border-ink-700 bg-ink-900 text-ink-500 hover:text-ink-300 hover:border-ink-600',
						].join(' ')}
					>
						<span className="text-sm font-display font-bold">{t.label.replace('-Tier', '')}</span>
						<span className="text-[10px] opacity-80">{t.desc}</span>
					</button>
				)
			})}
		</div>
	)
}
