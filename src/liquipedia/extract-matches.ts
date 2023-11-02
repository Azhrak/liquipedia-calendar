import { fetchPage } from './fetch-page';
import { wikitextToArray } from './parse-wikitext';
import { Match } from '@/@types/match';
import { parseMatches, splitMatches } from './parse-matches';

const MATCHES_URL = 'https://liquipedia.net/starcraft2/Liquipedia:Upcoming_and_ongoing_matches';

export const extractMatches = async (url: string = MATCHES_URL): Promise<Match[]> => {
	const wikitext = await fetchPage(url);
	const wikiArray = wikitextToArray(wikitext);
	const split = splitMatches(wikiArray);
	const matches = parseMatches(split);

	return matches;
};
