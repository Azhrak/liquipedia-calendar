export function Header() {
	return (
		<header className="border-b border-ink-800/80 bg-ink-950/50 backdrop-blur sticky top-0 z-20">
			<div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
				<div className="flex items-center gap-2.5">
					<LogoMark />
					<div className="leading-tight flex items-baseline gap-2">
						<span className="font-display font-semibold text-sm text-white">
							Liquipedia Calendar
						</span>
						<span className="text-[11px] text-ink-500">·</span>
						<span className="text-[11px] text-ink-300 font-medium">StarCraft II</span>
					</div>
				</div>
			</div>
		</header>
	)
}

function LogoMark() {
	return (
		<div className="relative w-7 h-7" aria-hidden>
			<div className="absolute inset-0 bg-gradient-to-br from-accent to-emerald-400 rounded-md rotate-45" />
			<div className="absolute inset-1.5 bg-ink-950 rotate-45" />
			<div className="absolute inset-0 flex items-center justify-center text-[11px] font-display font-bold text-accent">
				LC
			</div>
		</div>
	)
}
