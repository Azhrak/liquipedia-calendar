import { extractStarCraft2Matches } from '@/liquipedia/starcraft2/extract-matches';
import { filterStarCraft2Matches } from '@/liquipedia/starcraft2/filter-matches';

export async function getMatches(request: Request) {
	const matches = await extractStarCraft2Matches();
	const { searchParams } = new URL(request.url);
	const filtered = filterStarCraft2Matches(matches, {
		player: searchParams.get('player'),
		race: searchParams.get('race'),
		country: searchParams.get('country'),
		tournament: searchParams.get('tournament'),
		featured: searchParams.get('featured'),
	});
	return filtered;
}
