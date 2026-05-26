import * as cheerio from 'cheerio'
import { DateTime } from 'luxon'
import { cache } from 'react'
import { SC2Tournament } from '@/@types/starcraft'
import { config } from '@/config'
import { fetchWikiParsed } from '@/liquipedia/fetch-page'
import { simpleHash } from '@/utils/utils'

type AnyNode = Exclude<Parameters<typeof cheerio.load>[0], string | Buffer | readonly unknown[]>

export const revalidate = 300

function sc2Url(path: string): string {
	return new URL(path, config.sc2WikiRootUrl).toString()
}

function normalizeTier(raw: string): string | null {
	const t = raw.trim().toUpperCase()
	if (t.startsWith('S')) return 'S'
	if (t.startsWith('A')) return '1'
	if (t.startsWith('B')) return '2'
	if (t.startsWith('C')) return '3'
	if (t.length > 0) return '4'
	return null
}

function parseDateRange(raw: string): { startDate: string | null; endDate: string | null } {
	const trimmed = raw.trim()
	if (!trimmed) return { startDate: null, endDate: null }

	// Split on en-dash or em-dash
	const parts = trimmed.split(/\s*[–—-]\s*/)

	const parseDate = (s: string, referenceYear?: number): string | null => {
		// Try full date first: "May 17, 2026"
		let d = DateTime.fromFormat(s.trim(), 'MMM d, yyyy')
		if (d.isValid) return d.toISODate()

		// Try short date with reference year: "Apr 29" (year from end date)
		if (referenceYear) {
			d = DateTime.fromFormat(`${s.trim()} ${referenceYear}`, 'MMM d yyyy')
			if (d.isValid) return d.toISODate()
		}
		return null
	}

	if (parts.length === 1) {
		const startDate = parseDate(parts[0])
		return { startDate, endDate: null }
	}

	// Two parts: start may lack year, end has year
	const endDate = parseDate(parts[1])
	const endYear = endDate ? parseInt(endDate.slice(0, 4)) : undefined
	const startDate = parseDate(parts[0], endYear) ?? parseDate(parts[0])

	const finalEndDate = startDate === endDate ? null : endDate
	return { startDate, endDate: finalEndDate }
}

function parseRow($: cheerio.CheerioAPI, el: AnyNode): SC2Tournament | null {
	const $el = $(el)

	const tierRaw = $el.find('td').eq(0).text()
	const tier = normalizeTier(tierRaw)

	const tournamentAnchor = $el.find('.column__tournament a').first()
	const name = tournamentAnchor.text().trim()
	if (!name) return null

	const href = tournamentAnchor.attr('href')
	const link = href ? sc2Url(href) : null

	const dateRaw = $el
		.find('td')
		.filter((_, td) => {
			return $(td).find('a[href*="/"]').length === 0 && /[A-Za-z]{3}/.test($(td).text())
		})
		.first()
		.text()
	const { startDate, endDate } = parseDateRange(dateRaw)

	const prizePoolRaw = $el
		.find('td')
		.filter((_, td) => {
			return $(td).text().trim().startsWith('$')
		})
		.first()
		.text()
		.trim()
	const prizePool = prizePoolRaw || null

	// Location: td with .flag span but not the league icon td
	const locationTd = $el
		.find('td')
		.filter((_, td) => {
			return (
				$(td).find('.flag').length > 0 &&
				$(td).find('.league-icon-small-image').length === 0
			)
		})
		.first()
	const city = locationTd.text().trim() || null
	const country = locationTd.find('.flag img').first().attr('alt') ?? null
	const location =
		city && country && city !== country ? `${city}, ${country}` : city ?? country ?? null

	const tournament: SC2Tournament = {
		name,
		link,
		tier,
		startDate,
		endDate,
		prizePool,
		location,
	}

	tournament.hash = simpleHash(`${name}${startDate ?? ''}`)
	return tournament
}

export const extractStarCraft2Tournaments = cache(async (): Promise<SC2Tournament[]> => {
	const html = await fetchWikiParsed('Portal:Tournaments', config.sc2WikiRootUrl)
	const $ = cheerio.load(html)

	const tournaments: SC2Tournament[] = []

	$('.tournaments-listing tbody tr').each((_, el) => {
		const t = parseRow($, el)
		if (t) tournaments.push(t)
	})

	const seen = new Set<string>()
	const unique = tournaments.filter((t) => {
		if (!t.hash || seen.has(t.hash)) return false
		seen.add(t.hash)
		return true
	})

	return unique.sort((a, b) => {
		if (!a.startDate) return 1
		if (!b.startDate) return -1
		return a.startDate < b.startDate ? -1 : 1
	})
})
