'use client'

type Option<T extends string> = { value: T; label: string }

type Props<T extends string> = {
	value: T
	onChange: (next: T) => void
	options: Option<T>[]
}

export function Segmented<T extends string>({ value, onChange, options }: Props<T>) {
	return (
		<div className="inline-flex rounded-md bg-ink-900 border border-ink-700 p-0.5">
			{options.map((o) => {
				const active = value === o.value
				return (
					<button
						key={o.value}
						type="button"
						onClick={() => onChange(o.value)}
						className={[
							'px-3 py-1.5 text-xs font-medium rounded-[5px] transition-colors',
							active ? 'bg-ink-700 text-white shadow-sm' : 'text-ink-500 hover:text-ink-300',
						].join(' ')}
					>
						{o.label}
					</button>
				)
			})}
		</div>
	)
}
