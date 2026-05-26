import { minutesInSeconds } from '@/utils/utils'

const HEADERS = {
	'User-Agent': 'liquipedia-calendar/1.0 (nieminen.juho@gmail.com)',
	'Accept-Encoding': 'gzip',
}

async function fetchJson(url: string, revalidate: number): Promise<unknown> {
	const data = await fetch(url, { next: { revalidate }, headers: HEADERS })
	const contentType = data.headers.get('content-type') ?? ''
	if (!contentType.includes('application/json')) {
		const text = await data.text()
		throw new Error(`Liquipedia API returned non-JSON (status ${data.status}): ${text.slice(0, 200)}`)
	}
	return data.json()
}

export const fetchWikiContent = async (page: string, wikiRoot: string): Promise<string> => {
	const url = `${wikiRoot}/api.php?action=query&prop=revisions&titles=${page}&rvslots=*&rvprop=content&formatversion=2&format=json`
	const json = await fetchJson(url, minutesInSeconds(5)) as Record<string, unknown>
	const pages = (json as { query?: { pages?: Array<{ revisions?: Array<{ slots?: { main?: { content?: string } } }> }> } }).query?.pages
	return pages?.[0]?.revisions?.[0]?.slots?.main?.content ?? ''
}

export const fetchWikiParsed = async (page: string, wikiRoot: string): Promise<string> => {
	const url = `${wikiRoot}/api.php?action=parse&page=${page}&format=json&prop=text`
	const json = await fetchJson(url, minutesInSeconds(5)) as { parse?: { text?: { '*'?: string } } }
	return json.parse?.text?.['*'] ?? ''
}

export const fetchMatchTickerHtml = async (wikiRoot: string): Promise<string> => {
	const url =
		`${wikiRoot}/api.php?action=parse&format=json` +
		'&contentmodel=wikitext&maxage=600&smaxage=600&disablelimitreport=true' +
		'&uselang=content&prop=text' +
		'&text=%7B%7B%23invoke%3ALua%7Cinvoke%7Cmodule%3DMatchTicker%2FCustom%7Cfn%3DnewMainPage' +
		'%7Cdev%3Dfalse%7Ctype%3Dupcoming%7Climit%3D50' +
		'%7Cfilterbuttons-liquipediatier%3D1%2C2%2C3%2C4%2C-1' +
		'%7Cfilterbuttons-liquipediatiertype%3Dmonthly%2Cweekly%2Cbiweekly%2Cshowmatch' +
		'%2Cdaily%2Carchon%2Fffa%2C4v4%2C1v2%2C3v3%2C2v2%2Cqualifier%2Ccharity%7D%7D'
	const json = await fetchJson(url, minutesInSeconds(5)) as { parse?: { text?: { '*'?: string } } }
	return json.parse?.text?.['*'] ?? ''
}
