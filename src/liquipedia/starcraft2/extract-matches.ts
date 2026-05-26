import { cache } from 'react'
import { SC2Match } from '@/@types/starcraft'
import { config } from '@/config'
import { fetchWikiContent } from '../fetch-page'
import { wikitextToArray } from '../parse-wikitext'
import { MatchParserStarCraft2 } from './match-parser'

const MATCHES_PAGE_SC2 = 'Liquipedia:Upcoming_and_ongoing_matches'

export const revalidate = 300

export const extractStarCraft2Matches = cache(async (): Promise<SC2Match[]> => {
	const wikitext = await fetchWikiContent(MATCHES_PAGE_SC2, config.sc2WikiRootUrl)
	const wikiArray = wikitextToArray(wikitext)
	const matches = new MatchParserStarCraft2().parseMatches(wikiArray)

	return matches
})
