'use client'

import { CopyButton } from './CopyButton'

type Format = 'ical' | 'json'

type Props = {
	format: Format
	/** Path or full URL, e.g. "/get/starcraft2/ical?player=Serral" */
	url: string
	/**
	 * If passed, rendered as a muted prefix before the path (e.g. the origin).
	 * The CopyButton will copy origin + url at click time.
	 */
	originPrefix?: string
}

const FORMAT_LABEL: Record<Format, string> = { ical: 'iCal', json: 'JSON' }
const FORMAT_HELP: Record<Format, string> = {
	ical: 'Subscribe in any calendar app',
	json: 'Raw data for developers',
}

export function UrlBlock({ format, url, originPrefix }: Props) {
	const isIcal = format === 'ical'

	return (
		<div
			className={[
				'relative rounded-lg border border-ink-700 bg-ink-900/70 backdrop-blur overflow-hidden',
				isIcal ? 'animate-pulse-glow' : '',
			].join(' ')}
		>
			<header className="flex items-center gap-2 px-3 py-2 border-b border-ink-800 bg-ink-850/60">
				<span
					className={[
						'text-[10px] font-mono font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded',
						isIcal ? 'bg-accent/15 text-accent' : 'bg-ink-700 text-ink-500',
					].join(' ')}
				>
					{FORMAT_LABEL[format]}
				</span>
				<span className="text-[11px] text-ink-500">{FORMAT_HELP[format]}</span>
				<div className="ml-auto">
					<CopyButton text={url} ariaLabel={`Copy ${FORMAT_LABEL[format]} URL`} />
				</div>
			</header>

			<div className="px-3 py-2.5 font-mono text-[12.5px] leading-relaxed break-all text-ink-300">
				{originPrefix && <span className="text-ink-500">{originPrefix}</span>}
				<UrlSplit url={url} />
			</div>
		</div>
	)
}

/**
 * Splits a "/path?key=val&key=val" string into colour-coded spans so the
 * filter→param connection is visually obvious.
 */
function UrlSplit({ url }: { url: string }) {
	const [path, query] = url.split('?')
	return (
		<>
			<span className="text-white">{path}</span>
			{query && (
				<>
					<span className="text-ink-500">?</span>
					{query.split('&').map((kv, i) => {
						const [k, v] = kv.split('=')
						return (
							<span key={`${k}-${i}`}>
								{i > 0 && <span className="text-ink-500">&</span>}
								<span className="text-accent">{k}</span>
								<span className="text-ink-500">=</span>
								<span className="text-amber-300">{v}</span>
							</span>
						)
					})}
				</>
			)}
		</>
	)
}
