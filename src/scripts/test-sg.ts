import * as cheerio from 'cheerio'
import fs from 'fs'
import { MatchStream } from '@/@types/common'
import { StormgateMatch, StormgateMatchTeam } from '@/@types/stormgate'
import { config } from '@/config'

const main = () => {
	const json = fs.readFileSync('./src/data/sg-matches.json').toString()
	const data = JSON.parse(json)
	const html = data.parse.text['*']
	const $ = cheerio.load(html)
	const htmlMatches = $('table.infobox_matches_content')

	const matches: StormgateMatch[] = []
	for (const htmlMatch of htmlMatches) {
		const $htmlMatch = $(htmlMatch)
		const $teamLeft = $htmlMatch.find('.team-left')
		const teamLeft: StormgateMatchTeam = parseTeam($teamLeft)

		const $teamRight = $htmlMatch.find('.team-right')
		const teamRight: StormgateMatchTeam = parseTeam($teamRight)

		const $versus = $htmlMatch.find('.versus')
		const info = parseVersus($($versus))
		teamLeft.score = info.score[0] ?? null
		teamRight.score = info.score[1] ?? null

		const $filler = $htmlMatch.find('.match-filler')
		const info2 = parseFiller($($filler), $)

		matches.push({
			teamLeft,
			teamRight,
			bestOf: info.bestOf ? parseInt(info.bestOf, 10) : null,
			tournament: info2.tournament,
			featured: false, // TODO: implement featured
			streams: info2.streams,
			time: info2.time,
		})
	}

	console.log(matches)

	// fs.writeFileSync('./tmp/wikiarray.json', JSON.stringify(wikiTextArray, null, 2));
	return matches
}

const parseTeam = ($team: ReturnType<cheerio.CheerioAPI>) => {
	const $name = $team.find('a')
	const name = $name.text()
	const link = $name.attr('href') ?? null
	const $flag = $team.find('.flag > img')
	const countryName = $flag.attr('alt')
	const country = (() => {
		const m = $flag?.attr('src')?.match(/\/([a-z]{2})_hd\.png/i)
		return m ? m[1].toLowerCase() : null
	})()
	const faction = (() => {
		const m = $team
			.find('img[src*="Stormgate"]')
			?.attr('src')
			?.match(/(infernal_host|human_vanguard|celestial_armada)/i)
		return m ? m[1].toLowerCase() : null
	})()
	return {
		name,
		link: link ? `${config.liquipediaUrl}${link}` : null,
		faction,
		country,
		countryName,
		score: null,
	}
}

const parseVersus = ($info: ReturnType<cheerio.CheerioAPI>) => {
	const score = $info.find('.versus-upper').text()
	const bestOf = $info.find('.versus-lower > abbr').text().toLowerCase().replace('bo', '')
	return {
		score: score.split(':'),
		bestOf,
	}
}

const parseFiller = ($data: ReturnType<cheerio.CheerioAPI>, $: cheerio.CheerioAPI) => {
	const time = $data.find('.match-countdown > .timer-object').attr('data-timestamp')
	const $tournament = $data.find('.tournament-text-flex > a')
	const tournament = {
		name: $tournament.text(),
		link: `${config.liquipediaUrl}${$tournament.attr('href')}`,
	}
	const $streams = $data.find('.match-countdown > a[href*="/Special:Stream/"]')
	const streams: MatchStream[] = []
	$streams.each((_index, element) => {
		const $stream = $(element)
		const match = $stream.attr('href')?.match(/\/Special:Stream\/([^/]+)\/([^/]+)/)
		if (match) {
			streams.push({
				provider: match[1],
				channel: match[2],
				link: `${config.liquipediaUrl}${$stream.attr('href')}`,
			})
		}
	})
	return {
		time: time ? new Date(parseInt(time, 10)).toISOString() : null,
		tournament,
		streams,
	}
}

main()
