import { extractStarCraft2Matches } from '@/liquipedia/starcraft2/extract-matches'
import { config } from '../config'
import { createMatchEvents } from '../icalendar/icalendarMatch'
import { transformStarCraft2Matches } from '../icalendar/transformMatch'
import { setToFileCache } from '../utils/fileCache'
import { getPageFile, getPageUrl } from '../utils/utils'

const getMatches = async (url: string) => {
	const matches = await extractStarCraft2Matches()
	const ical = createMatchEvents(transformStarCraft2Matches(matches))

	if (config.fileCacheDir) {
		const pageUrl = getPageUrl(url)
		const pagefile = getPageFile(pageUrl)
		setToFileCache(`${pagefile}_matches_json`, matches)
		setToFileCache(`${pagefile}_matches_ical`, ical)
	}
}

const main = async (url: string) => {
	return await getMatches(url)
}

const url = 'https://liquipedia.net/starcraft2/Liquipedia:Upcoming_and_ongoing_matches'

// url = 'wikiarray.json';

main(url)
