import Image from 'next/image'
import { StepDot } from './ui/StepDot'

/**
 * Compact intro row shown above the filter grid:
 *   [ "how it works" flow card  |  framed calendar preview ]
 * On mobile, the calendar preview stacks below the flow card.
 */
export function IntroStrip() {
	return (
		<section className="mb-8 sm:mb-10">
			<div className="flex flex-col sm:flex-row sm:items-stretch gap-5 sm:gap-6">
				<FlowCard />
				<CalendarPreview />
			</div>
		</section>
	)
}

function FlowCard() {
	return (
		<div className="flex-1 rounded-xl border border-ink-800 bg-ink-900/40 px-5 py-4 flex flex-col justify-center">
			<div className="text-[15px] font-mono uppercase tracking-wider text-ink-500 mb-3">
				How it works
			</div>
			<div className="flex flex-col gap-x-8 gap-y-4">
				<StepDot n={1} label="Pick filters" labelSize="lg" active />
				<StepDot n={2} label="Copy URL" labelSize="lg" active />
				<StepDot n={3} label="Paste in your calendar app" labelSize="lg" active />
			</div>
		</div>
	)
}

function CalendarPreview() {
	return (
		<div className="relative w-full sm:w-[340px] shrink-0">
			<div className="absolute -inset-px rounded-xl bg-gradient-to-br from-accent/30 via-transparent to-amber-300/20 blur-sm opacity-60" />
			<div className="relative rounded-xl border border-ink-700 bg-ink-900 overflow-hidden">
				<div className="flex items-center gap-1.5 px-3 py-2 border-b border-ink-800 bg-ink-850">
					<span className="w-2 h-2 rounded-full bg-ink-700" />
					<span className="w-2 h-2 rounded-full bg-ink-700" />
					<span className="w-2 h-2 rounded-full bg-ink-700" />
					<span className="ml-2 text-[10px] font-mono uppercase tracking-wider text-ink-500">
						your calendar · subscribed
					</span>
				</div>
				<Image
					src="/calendar-preview.png"
					alt="Calendar view of subscribed StarCraft II matches"
					width={824}
					height={608}
					priority
					className="block w-full h-auto"
				/>
			</div>
		</div>
	)
}
