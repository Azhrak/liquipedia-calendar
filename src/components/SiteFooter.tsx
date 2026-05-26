const LIQUIPEDIA_SC2 = 'https://liquipedia.net/starcraft2/Liquipedia:Upcoming_and_ongoing_matches'
const REPO_URL = 'https://github.com/Azhrak/liquipedia-calendar'

export function SiteFooter() {
	return (
		<footer className="mt-20 pt-8 border-t border-ink-800/80">
			<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
				<div>
					<p className="font-display font-semibold text-white text-[15px]">Liquipedia Calendar</p>
					<p className="text-[13px] text-ink-500 mt-1 max-w-md leading-relaxed">
						An open-source feed bridge. Not affiliated with Liquipedia, Blizzard, or any tournament
						organizer. All match data sourced live from the community wiki.
					</p>
				</div>
				<nav
					aria-label="Footer links"
					className="flex flex-col sm:items-end gap-1 text-xs font-mono"
				>
					<a
						href={LIQUIPEDIA_SC2}
						target="_blank"
						rel="noopener noreferrer"
						className="text-ink-300 hover:text-accent transition-colors"
					>
						→ liquipedia.net/starcraft2
					</a>
					<a
						href={REPO_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="text-ink-500 hover:text-accent transition-colors"
					>
						→ source on github
					</a>
				</nav>
			</div>
		</footer>
	)
}
