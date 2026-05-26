'use client'

type Props = {
	id?: string
	value: string
	onChange: (next: string) => void
	placeholder?: string
	maxLength?: number
	/** Renders the input in uppercase monospace (used for country codes). */
	mono?: boolean
}

export function TextInput({ id, value, onChange, placeholder, maxLength, mono = false }: Props) {
	return (
		<input
			id={id}
			type="text"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			maxLength={maxLength}
			className={[
				'w-full rounded-md bg-ink-900 border border-ink-700 hover:border-ink-600',
				'focus:border-accent/60 focus:bg-ink-850 focus:outline-none',
				'px-3 py-2 text-sm text-white placeholder:text-ink-500 transition-colors',
				mono ? 'font-mono uppercase tracking-wider' : '',
			].join(' ')}
		/>
	)
}
