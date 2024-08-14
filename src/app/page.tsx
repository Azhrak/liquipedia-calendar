import { GameTabs } from '@/components/GameTabs';
import { Header } from '@/components/Header';
import { Links } from '@/components/Links';
import { MainContainer } from '@/components/MainContainer';
import { FiltersProvider } from '@/components/providers/FiltersProvider';
import { Sources } from '@/components/Sources';
import { StarCraft2Filters } from '@/components/StarCraft2Filters';

export default function Home() {
	const icalUrl = '/get/starcraft2/ical';
	const jsonUrl = '/get/starcraft2/json';

	return (
		<MainContainer>
			<Header />

			<GameTabs />

			<FiltersProvider>
				<div className="border-2 border-pink-300 p-4">
					<StarCraft2Filters />
				</div>

				<Links icalUrl={icalUrl} jsonUrl={jsonUrl} />
			</FiltersProvider>

			<Sources />
		</MainContainer>
	);
}
