'use client'

import type { ReactNode } from 'react'

type Props = {
	title: string
	subtitle: string
	/** Small monospace tag rendered next to the title (e.g. "per-game", "series"). */
	badge?: string
	/** Decorative icon — sized 18×18 inside a 36×36 tinted square. */
	icon: ReactNode
	/** Tailwind classes for the tinted icon background (e.g. "bg-accent/10 ring-1 ring-accent/30"). */
	iconWrapperClass: string
	/** Tailwind gradient for the accent stripe along the left edge. */
	accentStripeClass: string
	onClear?: () => void
	hasFilters?: boolean
	children: ReactNode
}

/**
 * Shared card shell used by both MatchesFeed and TournamentsFeed.
 * Renders an accent stripe, header with title/subtitle/icon, and a Reset button.
 */
export function FeedCard({
	title,
	subtitle,
	badge,
	icon,
	iconWrapperClass,
	accentStripeClass,
	onClear,
	hasFilters = false,
	children,
}: Props) {
	return (
		<section className="relative">
			{/* Accent stripe along the left edge */}
			<div className={`absolute -left-px top-6 bottom-6 w-px ${accentStripeClass}`} />

			<div className="rounded-xl border border-ink-800 bg-ink-900/40 backdrop-blur-sm overflow-hidden">
				<header className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-ink-800/80">
					<div className="flex items-start gap-3">
						<div
							className={`mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center ${iconWrapperClass}`}
						>
							{icon}
						</div>
						<div>
							<h2 className="font-display text-[19px] font-semibold text-white leading-tight flex items-center gap-2">
								{title}
								{badge && (
									<span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-ink-800 text-ink-500 border border-ink-700">
										{badge}
									</span>
								)}
							</h2>
							<p className="text-[12.5px] text-ink-500 mt-0.5">{subtitle}</p>
						</div>
					</div>

					{onClear && (
						<button
							type="button"
							onClick={onClear}
							disabled={!hasFilters}
							className={[
								'text-[11px] font-medium px-2.5 py-1 rounded transition-colors',
								hasFilters
									? 'text-ink-300 hover:text-white hover:bg-ink-800'
									: 'text-ink-600 cursor-not-allowed',
							].join(' ')}
						>
							Reset
						</button>
					)}
				</header>

				<div className="px-5 py-5">{children}</div>
			</div>
		</section>
	)
}
