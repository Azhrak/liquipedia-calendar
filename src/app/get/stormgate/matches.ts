import { extractStormgateMatches } from '@/liquipedia/stormgate/extract-matches';
import { filterStormgateMatches } from '@/liquipedia/stormgate/filter-matches';

export async function getMatches(request: Request) {
	const matches = await extractStormgateMatches();
	const { searchParams } = new URL(request.url);
	const filtered = filterStormgateMatches(matches, {
		player: searchParams.get('player'),
		faction: searchParams.get('faction'),
		country: searchParams.get('country'),
		tournament: searchParams.get('tournament'),
		featured: searchParams.get('featured'),
	});
	return filtered;
}
