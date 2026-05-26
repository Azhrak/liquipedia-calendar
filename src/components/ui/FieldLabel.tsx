import type { ReactNode } from 'react'

type Props = {
	htmlFor?: string
	children: ReactNode
}

export function FieldLabel({ htmlFor, children }: Props) {
	return (
		<label
			htmlFor={htmlFor}
			className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500"
		>
			{children}
		</label>
	)
}
