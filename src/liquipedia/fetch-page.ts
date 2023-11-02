import { getPageFile, getPageUrl } from '../utils/utils';
import { config } from '../config';
import { cache } from 'react';

export const revalidate = 300;

export const fetchPage = cache(async (url: string) => {
	if (!url.startsWith(config.wikiRootUrl)) {
		throw new Error('Invalid URL');
	}

	const pageUrl = getPageUrl(url);
	const data = await getWikiContent(pageUrl);

	return data;
});

const getWikiContent = async (pageUrl: string): Promise<string> => {
	const url = `${config.wikiRootUrl}/api.php?action=query&prop=revisions&titles=${pageUrl}&rvslots=*&rvprop=content&formatversion=2&format=json`;
	const data = await fetch(url);
	const json = await data.json();
	return json.query?.pages[0]?.revisions[0]?.slots?.main?.content ?? '';
};
