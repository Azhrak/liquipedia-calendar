import * as cheerio from 'cheerio'
import { DateTime } from 'luxon'
import { cache } from 'react'
import { SC2Match, SC2MatchStream, SC2MatchTeam } from '@/@types/starcraft'

type AnyNode = Exclude<Parameters<typeof cheerio.load>[0], string | Buffer | readonly unknown[]>

import { config } from '@/config'
import { fetchMatchTickerHtml } from '@/liquipedia/fetch-page'
import { simpleHash } from '@/utils/utils'

export const revalidate = 300

function sc2Url(path: string): string {
	return new URL(path, config.sc2WikiRootUrl).toString()
}

function parseTeam($: cheerio.CheerioAPI, el: AnyNode, score: string | null): SC2MatchTeam | null {
	const $el = $(el)
	const name = $el.find('.name').text().trim()
	if (!name || name === 'TBD') return null

	const race = $el.find('.race img').first().attr('alt')?.toLowerCase() ?? null

	const flagSrc = $el.find('.flag img').first().attr('src') ?? ''
	const countryMatch = flagSrc.match(/\/([A-Za-z]{2})_hd\.png/)
	const country = countryMatch ? countryMatch[1].toLowerCase() : null

	const linkHref = $el.find('.name a').first().attr('href')
	const link = linkHref ? sc2Url(linkHref) : null

	return { name, country, race, link, score }
}

function parseStreams($: cheerio.CheerioAPI, matchEl: AnyNode): SC2MatchStream[] {
	const streams: SC2MatchStream[] = []
	$(matchEl)
		.find('.match-info-links a')
		.each((_, el) => {
			const href = $(el).attr('href') ?? ''
			const m = href.match(/Special:Stream\/(\w+)\/(.+)/)
			if (m) {
				streams.push({
					provider: m[1],
					channel: m[2],
					link: sc2Url(href),
				})
			}
		})
	return streams
}

function parseMatch($: cheerio.CheerioAPI, el: AnyNode): SC2Match | null {
	const $el = $(el)

	const timestampStr = $el.find('[data-timestamp]').first().attr('data-timestamp')
	if (!timestampStr) return null
	const tsSeconds = parseInt(timestampStr, 10)
	if (Number.isNaN(tsSeconds)) return null

	const leftEl = $el.find('.match-info-header-opponent-left').first()[0]
	const rightEl = $el
		.find('.match-info-header-opponent:not(.match-info-header-opponent-left)')
		.first()[0]

	if (!leftEl || !rightEl) return null

	const scoreEls = $el.find('.match-info-header-scoreholder-score')
	const scoreLeft = scoreEls.eq(0).text().trim() || null
	const scoreRight = scoreEls.eq(1).text().trim() || null

	const teamLeft = parseTeam($, leftEl, scoreLeft)
	const teamRight = parseTeam($, rightEl, scoreRight)

	if (!teamLeft && !teamRight) return null

	const formatText = $el.find('.match-info-header-scoreholder-lower').text().trim()
	const boMatch = formatText.match(/[Bb]o(\d+)|[Bb]est[ -]of[ -](\d+)/)
	const bestOf = boMatch ? parseInt(boMatch[1] ?? boMatch[2]) : null

	const tournamentAnchor = $el.find('.match-info-tournament-name a').first()
	const tournamentName =
		tournamentAnchor.find('span').text().trim() || tournamentAnchor.text().trim() || null
	const tournamentHref = tournamentAnchor.attr('href')
	const tournamentLink = tournamentHref ? sc2Url(tournamentHref) : null

	const time = DateTime.fromSeconds(tsSeconds).toISO()
	const streams = parseStreams($, el)

	const match: SC2Match = {
		teamLeft,
		teamRight,
		bestOf,
		time,
		tournament: tournamentName ? { name: tournamentName, link: tournamentLink } : null,
		featured: false,
		streams,
	}

	match.hash = simpleHash(
		`${teamLeft?.name ?? ''}${teamRight?.name ?? ''}${bestOf ?? ''}${time ?? ''}`,
	)

	return match
}

export const extractStarCraft2Matches = cache(async (): Promise<SC2Match[]> => {
	const html = await fetchMatchTickerHtml(config.sc2WikiRootUrl)
	const $ = cheerio.load(html)

	const matches: SC2Match[] = []
	$('div.match-info').each((_, el) => {
		const match = parseMatch($, el)
		if (match) matches.push(match)
	})

	const seen = new Set<string>()
	const unique = matches.filter((m) => {
		if (!m.hash || seen.has(m.hash)) return false
		seen.add(m.hash)
		return true
	})

	return unique.sort((a, b) => (new Date(a.time ?? '') > new Date(b.time ?? '') ? 1 : -1))
})
