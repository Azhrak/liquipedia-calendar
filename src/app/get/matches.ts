import { extractMatches } from '@/liquipedia/extract-matches';
import { filterMatches } from '@/liquipedia/filter-matches';

export async function getMatches(request: Request) {
	const matches = await extractMatches();
	const { searchParams } = new URL(request.url);
	const filtered = filterMatches(matches, {
		player: searchParams.get('player'),
		race: searchParams.get('race'),
		country: searchParams.get('country'),
		tournament: searchParams.get('tournament'),
	});
	return filtered;
}
