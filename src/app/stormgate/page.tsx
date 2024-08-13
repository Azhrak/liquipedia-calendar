import { Header } from '@/components/Header';
import { Links } from '@/components/Links';
import { MainContainer } from '@/components/MainContainer';
import { FiltersProvider } from '@/components/providers/FiltersProvider';
import { Sources } from '@/components/Sources';
import { StormgateFilters } from '@/components/StormgateFilters';

export default function Stormgate() {
	const icalUrl = '/get/stormgate/ical';
	const jsonUrl = '/get/stormgate/json';

	return (
		<MainContainer>
			<Header />

			<FiltersProvider>
				<div className="border-2 border-pink-300 p-4">
					<StormgateFilters />
				</div>

				<Links icalUrl={icalUrl} jsonUrl={jsonUrl} />
			</FiltersProvider>

			<Sources />
		</MainContainer>
	);
}
