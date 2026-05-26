'use client'

import { useState } from 'react'
import { removeTrailingSlash } from '@/utils/utils'

type Props = {
	/** Path or URL to copy. If `prependOrigin` is true, `window.location.origin` is prefixed. */
	text: string
	prependOrigin?: boolean
	label?: string
	ariaLabel?: string
}

/**
 * Drop-in replacement for `CopyToClipboard.tsx`, but with built-in "copied" state
 * and no `next/image` dependency (inlines an SVG icon).
 */
export function CopyButton({ text, prependOrigin = true, label = 'Copy', ariaLabel }: Props) {
	const [copied, setCopied] = useState(false)

	const handleClick = async () => {
		const origin =
			prependOrigin && typeof window !== 'undefined'
				? removeTrailingSlash(window.location.origin)
				: ''
		try {
			await navigator.clipboard.writeText(origin + text)
			setCopied(true)
			setTimeout(() => setCopied(false), 1400)
		} catch {
			// Fail silently — the URL is still visible on screen.
		}
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-label={ariaLabel ?? `${label} ${text}`}
			className={[
				'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors',
				copied
					? 'bg-accent text-ink-950'
					: 'bg-ink-700 hover:bg-ink-600 text-ink-300 hover:text-white',
			].join(' ')}
		>
			{copied ? (
				<>
					<svg
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth={3}
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="20 6 9 17 4 12" />
					</svg>
					Copied
				</>
			) : (
				<>
					<svg
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
						<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
					</svg>
					{label}
				</>
			)}
		</button>
	)
}
