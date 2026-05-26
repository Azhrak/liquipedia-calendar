import { Header } from '@/components/Header'
import { HowToSubscribe } from '@/components/HowToSubscribe'
import { IntroStrip } from '@/components/IntroStrip'
import { MatchesFeed } from '@/components/MatchesFeed'
import { FiltersProvider } from '@/components/providers/FiltersProvider'
import { SiteFooter } from '@/components/SiteFooter'
import { TournamentsFeed } from '@/components/TournamentsFeed'

export default function Home() {
	return (
		<div className="hex-bg min-h-screen">
			<Header />

			<main className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
				<IntroStrip />

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
					{/* Matches state lives in the existing FiltersProvider context. */}
					<FiltersProvider>
						<MatchesFeed />
					</FiltersProvider>

					{/* Tournament tier state is local to the component. */}
					<TournamentsFeed />
				</div>

				<HowToSubscribe />
				<SiteFooter />
			</main>
		</div>
	)
}
