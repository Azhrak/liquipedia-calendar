import { setTimeout as sleep } from 'node:timers/promises'
import { minutesInSeconds } from '@/utils/utils'

const HEADERS = {
	'User-Agent': 'liquipedia-calendar/1.0 (nieminen.juho@gmail.com)',
	'Accept-Encoding': 'gzip',
}

// Liquipedia's API Terms of Use cap action=parse at 1 request / 30s (other
// actions: 1 / 2s). The app normally stays under this via the Next.js data
// cache, but on a 429 we back off and retry rather than surface an error —
// honoring Retry-After when present, otherwise exponential (2/4/8/16s). The
// cap covers the 30s parse window without hanging indefinitely.
const MAX_RETRIES = 4
const BASE_BACKOFF_MS = 2_000
const MAX_BACKOFF_MS = 35_000

function backoffDelayMs(attempt: number, retryAfter: string | null): number {
	const seconds = retryAfter ? Number.parseInt(retryAfter, 10) : Number.NaN
	if (!Number.isNaN(seconds)) return Math.min(seconds * 1000, MAX_BACKOFF_MS)
	return Math.min(BASE_BACKOFF_MS * 2 ** attempt, MAX_BACKOFF_MS)
}

async function fetchJson(url: string, revalidate: number): Promise<unknown> {
	for (let attempt = 0; ; attempt++) {
		const data = await fetch(url, { next: { revalidate }, headers: HEADERS })

		if (data.status === 429 && attempt < MAX_RETRIES) {
			const delayMs = backoffDelayMs(attempt, data.headers.get('retry-after'))
			await data.body?.cancel() // release the connection before retrying
			await sleep(delayMs)
			continue
		}

		const contentType = data.headers.get('content-type') ?? ''
		if (!contentType.includes('application/json')) {
			const text = await data.text()
			throw new Error(
				`Liquipedia API returned non-JSON (status ${data.status}): ${text.slice(0, 200)}`,
			)
		}
		return data.json()
	}
}

export const fetchWikiContent = async (page: string, wikiRoot: string): Promise<string> => {
	const url = `${wikiRoot}/api.php?action=query&prop=revisions&titles=${page}&rvslots=*&rvprop=content&formatversion=2&format=json`
	const json = (await fetchJson(url, minutesInSeconds(5))) as Record<string, unknown>
	const pages = (
		json as {
			query?: { pages?: Array<{ revisions?: Array<{ slots?: { main?: { content?: string } } }> }> }
		}
	).query?.pages
	return pages?.[0]?.revisions?.[0]?.slots?.main?.content ?? ''
}

export const fetchWikiParsed = async (page: string, wikiRoot: string): Promise<string> => {
	const url = `${wikiRoot}/api.php?action=parse&page=${page}&format=json&prop=text`
	const json = (await fetchJson(url, minutesInSeconds(5))) as {
		parse?: { text?: { '*'?: string } }
	}
	return json.parse?.text?.['*'] ?? ''
}

export const fetchMatchTickerHtml = async (wikiRoot: string): Promise<string> => {
	const url =
		`${wikiRoot}/api.php?action=parse&format=json` +
		'&contentmodel=wikitext&maxage=600&smaxage=600&disablelimitreport=true' +
		'&uselang=content&prop=text' +
		'&text=%7B%7B%23invoke%3ALua%7Cinvoke%7Cmodule%3DMatchTicker%2FCustom%7Cfn%3DmainPage' +
		'%7Cdev%3Dfalse%7Ctype%3Dupcoming%7Climit%3D50' +
		'%7Cfilterbuttons-liquipediatier%3D1%2C2%2C3%2C4%2C-1' +
		'%7Cfilterbuttons-liquipediatiertype%3Dmonthly%2Cweekly%2Cbiweekly%2Cshowmatch' +
		'%2Cdaily%2Carchon%2Fffa%2C4v4%2C1v2%2C3v3%2C2v2%2Cqualifier%2Ccharity%7D%7D'
	const json = (await fetchJson(url, minutesInSeconds(5))) as {
		parse?: { text?: { '*'?: string } }
	}
	return json.parse?.text?.['*'] ?? ''
}
