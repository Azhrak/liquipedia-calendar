import { CopyToClipboard } from '@/components/CopyToClipboard';
import { Filters } from '@/components/Filters';
import { Links } from '@/components/Links';
import { FiltersProvider } from '@/components/providers/FiltersProvider';

export default function Home() {
	const icalUrl = '/get/starcraft2/ical';
	const jsonUrl = '/get/starcraft2/json';

	return (
		<main className="flex flex-col items-center justify-center p-24">
			<div className="mb-8 flex max-w-lg flex-col gap-2 text-center">
				<h1 className="mb-5">Liquipedia Calendar</h1>
				<p className="text-xl font-bold">Get them matches into your calendar!</p>
				<p className="text-l">
					Pick desired filters (if any), and get the link below to paste into your calendar app.
				</p>
				<p className="text-sm">Currently only supporting the StarCraft II Liquipedia.</p>
			</div>

			<FiltersProvider>
				<div className="border-2 border-pink-300 p-4">
					<Filters />
				</div>

				<Links icalUrl={icalUrl} jsonUrl={jsonUrl} />
			</FiltersProvider>

			<div className="mt-8">
				Sources:
				<br />
				<a href="https://liquipedia.net/starcraft2/Liquipedia:Upcoming_and_ongoing_matches">
					https://liquipedia.net/starcraft2
				</a>
			</div>
		</main>
	);
}
