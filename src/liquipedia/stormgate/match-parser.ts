import { MatchStream } from '@/@types/common';
import { simpleHash } from '../../utils/utils';
import { StormgateMatch, StormgateMatchTeam } from '@/@types/stormgate';
import { config } from '@/config';
import * as cheerio from 'cheerio';
import { DateTime } from 'luxon';
import { format } from 'path';

export class MatchParserStormgate {
	parseMatches = (data: string) => {
		const $ = cheerio.load(data);
		const $htmlMatches = $('table.infobox_matches_content');
		const matches: StormgateMatch[] = [];
		$htmlMatches.each((_index, element) => {
			const match = this.getMatchValues($(element), $);
			if (match) {
				matches.push(match);
			}
		});
		return matches.sort((a, b) => {
			return new Date(a.time ?? '') > new Date(b.time ?? '') ? 1 : -1;
		});
	};

	private getMatchValues = ($match: cheerio.Cheerio, $: cheerio.Root): StormgateMatch | null => {
		const $teamLeft = $match.find('.team-left');
		const teamLeft: StormgateMatchTeam = this.parseTeam($teamLeft);

		const $teamRight = $match.find('.team-right');
		const teamRight: StormgateMatchTeam = this.parseTeam($teamRight);

		const $versus = $match.find('.versus');
		const info = this.parseVersus($versus);
		teamLeft.score = info.score[0] ?? null;
		teamRight.score = info.score[1] ?? null;

		const $filler = $match.find('.match-filler');
		const info2 = this.parseFiller($filler, $);

		const values = {
			teamLeft,
			teamRight,
			bestOf: info.bestOf ? parseInt(info.bestOf, 10) : null,
			tournament: info2.tournament,
			featured: false, // TODO: implement featured
			streams: [],
			time: info2.time,
		};

		return { ...values, hash: this.getMatchHash(values) };
	};

	private getMatchHash = (match: StormgateMatch) =>
		simpleHash(
			`${match.teamLeft?.name ?? ''}
     		${match.teamRight?.name ?? ''}
     		${match.bestOf ?? ''}
     		${match.time ?? ''}`,
		);

	private parseTeam = ($team: cheerio.Cheerio) => {
		const $name = $team.find('a');
		const name = $name.text();
		const link = $name.attr('href') ?? null;
		const $flag = $team.find('.flag > img');
		const countryName = $flag.attr('alt');
		const country = (() => {
			const m = $flag?.attr('src')?.match(/\/([a-z]{2})_hd\.png/i);
			return m ? m[1].toLowerCase() : null;
		})();
		const faction = (() => {
			const m = $team
				.find('img[src*="Stormgate"]')
				?.attr('src')
				?.match(/(infernal_host|human_vanguard|celestial_armada)/i);
			return m ? m[1].toLowerCase() : null;
		})();

		return {
			name,
			link: link ? `${config.liquipediaUrl}${link}` : null,
			faction: this.formatFaction(faction),
			country,
			countryName,
			score: null,
		};
	};

	private formatFaction = (faction: string | null) => {
		if (faction === 'infernal_host') {
			return 'infernal';
		}
		if (faction === 'human_vanguard') {
			return 'vanguard';
		}
		if (faction === 'celestial_armada') {
			return 'celestial';
		}
		return null;
	};

	private parseVersus = ($info: cheerio.Cheerio) => {
		const score = $info.find('.versus-upper').text();
		const bestOf = $info.find('.versus-lower > abbr').text().toLowerCase().replace('bo', '');

		return {
			score: score.split(':'),
			bestOf,
		};
	};

	private parseFiller = ($data: cheerio.Cheerio, $: cheerio.Root) => {
		const time = $data.find('.match-countdown > .timer-object').attr('data-timestamp');
		const $tournament = $data.find('.tournament-text-flex > a');
		const tournament = {
			name: $tournament.text(),
			link: `${config.liquipediaUrl}${$tournament.attr('href')}`,
		};
		const $streams = $data.find('.match-countdown > a[href*="/Special:Stream/"]');
		const streams: MatchStream[] = [];
		$streams.each((_index, element) => {
			const $stream = $(element);
			const match = $stream.attr('href')?.match(/\/Special:Stream\/([^/]+)\/([^/]+)/);
			if (match) {
				streams.push({
					provider: match[1],
					channel: match[2],
					link: `${config.liquipediaUrl}${$stream.attr('href')}`,
				});
			}
		});
		return {
			time: time ? DateTime.fromSeconds(parseInt(time)).toISO() : null,
			tournament,
			streams,
		};
	};
}
