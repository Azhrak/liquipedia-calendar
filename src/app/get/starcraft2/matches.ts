import { extractMatches } from '@/liquipedia/starcraft2/extract-matches';
import { filterMatches } from '@/liquipedia/starcraft2/filter-matches';

export async function getMatches(request: Request) {
	const matches = await extractMatches();
	const { searchParams } = new URL(request.url);
	const filtered = filterMatches(matches, {
		player: searchParams.get('player'),
		race: searchParams.get('race'),
		country: searchParams.get('country'),
		tournament: searchParams.get('tournament'),
		featured: searchParams.get('featured'),
	});
	return filtered;
}
