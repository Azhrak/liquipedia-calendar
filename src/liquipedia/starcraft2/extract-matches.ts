import { fetchWikiLuaContent } from '../fetch-page';
import { wikitextToArray } from '../parse-wikitext';
import { SC2Match } from '@/@types/starcraft';
import { MatchParserStarCraft2 } from './match-parser';
import { cache } from 'react';
import { config } from '@/config';

export const revalidate = 300;

export const extractStarCraft2Matches = cache(async (): Promise<SC2Match[]> => {
	const matchesEndpoint = getSc2MatchesEndpoint();
	const wikitext = await fetchWikiLuaContent(matchesEndpoint, config.sc2WikiRootUrl);
	const wikiArray = wikitextToArray(wikitext);
	const matches = new MatchParserStarCraft2().parseMatches(wikiArray);

	return matches;
});

function getSc2MatchesEndpoint() {
	const baseUrl = '/api.php';

	const params = new URLSearchParams({
		action: 'parse',
		format: 'json',
		contentmodel: 'wikitext',
		maxage: '600',
		smaxage: '600',
		disablelimitreport: 'true',
		uselang: 'content',
		prop: 'text',
		text: `{{#invoke:Lua|invoke
    | module=MatchTicker/Custom
    | fn=newMainPage
    | dev=false
    | type=recent
    | limit=30
    | filterbuttons-liquipediatier=1,2,3,4,-1
    | filterbuttons-liquipediatiertype=monthly,weekly,biweekly,showmatch,daily,archon,ffa,4v4,1v2,3v3,2v2,qualifier,charity
  }}`.replace(/\s+/g, ' '),
	});

	const url = `${baseUrl}?${params.toString()}`;

	return url;
}
