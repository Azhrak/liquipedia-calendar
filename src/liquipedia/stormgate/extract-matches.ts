import { fetchWikiParsed } from '../fetch-page';
import { StormgateMatch } from '@/@types/stormgate';
import { MatchParserStormgate } from './match-parser';
import { cache } from 'react';
import { config } from '@/config';

const MATCHES_PAGE_SG = 'Liquipedia:Upcoming_and_ongoing_matches_on_mainpage/dynamic';

export const revalidate = 300;

export const extractStormgateMatches = cache(async (): Promise<StormgateMatch[]> => {
	console.log('extractStormgateMatches');
	const htmlString = await fetchWikiParsed(MATCHES_PAGE_SG, config.sgWikiRootUrl);
	const matches = new MatchParserStormgate().parseMatches(htmlString);

	return matches;
});
