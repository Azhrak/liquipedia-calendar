import { minutesInSeconds } from '@/utils/utils';

export const fetchWikiContent = async (page: string, wikiRoot: string): Promise<string> => {
	const url = `${wikiRoot}/api.php?action=query&prop=revisions&titles=${page}&rvslots=*&rvprop=content&formatversion=2&format=json`;
	const data = await fetch(url, { next: { revalidate: minutesInSeconds(5) } });
	const json = await data.json();
	return json.query?.pages[0]?.revisions[0]?.slots?.main?.content ?? '';
};

export const fetchWikiParsed = async (page: string, wikiRoot: string): Promise<string> => {
	const url = `${wikiRoot}/api.php?action=parse&page=${page}&format=json&prop=text`;
	const data = await fetch(url, { next: { revalidate: minutesInSeconds(5) } });
	const json = await data.json();
	return json.parse?.text['*'] ?? '';
};
