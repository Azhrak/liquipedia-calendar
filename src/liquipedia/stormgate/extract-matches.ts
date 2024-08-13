import { fetchWikiContent } from '../fetch-page';
import { wikitextToArray } from '../parse-wikitext';
import { StormgateMatch } from '@/@types/stormgate';
import { MatchParserStormgate } from './match-parser';
import { cache } from 'react';
import { config } from '@/config';

const MATCHES_PAGE_SG = 'Liquipedia:Upcoming_and_ongoing_matches_on_mainpage/dynamic';

export const revalidate = 300;

export const extractStormgateMatches = cache(async (): Promise<StormgateMatch[]> => {
	const wikitext = await fetchWikiContent(MATCHES_PAGE_SG, config.sgWikiRootUrl);
	const wikiArray = wikitextToArray(wikitext);
	console.log(wikiArray);
	const matches = new MatchParserStormgate().parseMatches(wikiArray);

	return matches;
});
