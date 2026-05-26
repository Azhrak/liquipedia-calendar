import type { ReactNode } from 'react'

const GAS_ICS_SYNC_URL = 'https://github.com/derekantrican/GAS-ICS-Sync'

type Card = {
	num: string
	title: string
	body: ReactNode
	recommended?: boolean
}

const CARDS: Card[] = [
	{
		num: '01',
		title: 'Apple Calendar',
		body: 'File → New Calendar Subscription. Paste the iCal URL. Set refresh to Every Hour.',
	},
	{
		num: '02',
		title: 'Outlook / others',
		body: 'Find "Subscribe from web" in calendar settings and paste the iCal URL there.',
	},
	{
		num: '03',
		title: 'Google Calendar',
		recommended: true,
		body: (
			<>
				Google's native subscribe refreshes slowly. For near-real-time sync, use{' '}
				<a
					href={GAS_ICS_SYNC_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="text-accent hover:underline underline-offset-2"
				>
					GAS-ICS-Sync
				</a>{' '}
				— a small Google Apps Script that pulls the feed every 15 min.
			</>
		),
	},
]

export function HowToSubscribe() {
	return (
		<section className="mt-16">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{CARDS.map((c) => (
					<HowCard key={c.num} {...c} />
				))}
			</div>
		</section>
	)
}

function HowCard({ num, title, body, recommended }: Card) {
	return (
		<article
			className={[
				'relative rounded-xl border p-5',
				recommended ? 'border-accent/30 bg-accent/[0.04]' : 'border-ink-800 bg-ink-900/30',
			].join(' ')}
		>
			<div className="flex items-center justify-between mb-3">
				<span
					className={[
						'font-mono text-[11px] font-semibold tracking-wider',
						recommended ? 'text-accent' : 'text-ink-500',
					].join(' ')}
				>
					{num}
				</span>
				{recommended && (
					<span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/15 text-accent">
						recommended
					</span>
				)}
			</div>
			<h3 className="font-display font-semibold text-white text-[15px]">{title}</h3>
			<div className="text-sm text-ink-300 mt-1.5 leading-relaxed">{body}</div>
		</article>
	)
}
