import ics, { createEvents } from 'ics';
import { Match, MatchTeam } from '../@types/match';
import { ucFirst } from '../utils/utils';

export const createMatchEvents = (matches: Match[]) => {
	const { error, value } = createEvents(matches.map(matchToIcal));
	if (error) {
		console.error(error);
		return '';
	}
	return value;
};

const matchToIcal = (match: Match): ics.EventAttributes => {
	return {
		calName: 'Liquipedia Match Calendar',
		start: getTime(match.time as string),
		duration: getDuration(match.bestOf),
		title: getTitle(match),
		description: getDescription(match),
		htmlContent: getHtmlDesription(match),
		categories: getCategories(match),
		// status: "CONFIRMED" as ics.EventStatus,
		// url: match.streams.shift()?.channel,
		// lastModified: ""
		// location: "",
		// busyStatus: "BUSY",
		// organizer: { name: "Admin", email: "Race@BolderBOULDER.com" },
	};
};

const getTime = (isoDate: string): ics.DateArray => {
	const d = new Date(isoDate);
	return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()];
};

const getDuration = (bestOf: number | null): ics.DurationObject => {
	if (!bestOf) {
		return { minutes: undefined };
	}
	return { minutes: bestOf * 25 };
};

const getTitle = (match: Match) => {
	return `${match.teamLeft?.name ?? 'TBD'} vs. ${match.teamRight?.name ?? 'TBD'} | ${
		match.tournament?.name ?? ''
	}`;
};

const getDescription = (match: Match) => {
	const streams =
		match.streams.length > 0 ? `Streams: ${match.streams.map((s) => s.link).join('\n ')}` : '';
	const tournament = match.tournament?.link ? `\r\nMore info: ${match.tournament.link}` : '';
	return `Match: ${getDescriptionTeam(match.teamLeft)} vs. ${getDescriptionTeam(
		match.teamRight,
	)}\nTournament: ${match.tournament?.name ?? '-unknown-'}\n${streams}${tournament}`;
};

const getDescriptionTeam = (team: MatchTeam | null) => {
	if (!team) {
		return 'TBD';
	}
	const prefixes = [];
	team.country && prefixes.push(team.country.toUpperCase());
	team.race && prefixes.push(ucFirst(team.race));
	const prefixString = prefixes.length > 0 ? `[${prefixes.join(' | ')}] ` : '';
	return `${prefixString}${team.name}`;
};

const getHtmlDesription = (match: Match) => {
	let html = '<!DOCTYPE html><html><body>';
	html += `Match: ${getHtmlDescriptionTeam(match.teamLeft)} vs. ${getHtmlDescriptionTeam(
		match.teamRight,
	)}Tournament <strong>${match.tournament?.name ?? '-unknown-'}</strong>`;
	if (match.streams.length > 0) {
		html += `<br />Streams: ${match.streams
			.map((s) => `<a href="${s.link}">${s.channel}</a>`)
			.join('<br />')}`;
	}
	if (match.tournament?.link) {
		html += `<br />More info: <a href="${match.tournament.link}">Liquipedia.net</a>.`;
	}
	html += '</body></html>';
	return html;
};

const getHtmlDescriptionTeam = (team: MatchTeam | null) => {
	if (!team) {
		return '<em>TBD</em>';
	}
	const prefixes = [];
	team.country && prefixes.push(team.country.toUpperCase());
	team.race && prefixes.push(ucFirst(team.race));
	const prefixString =
		prefixes.length > 0 ? `<span style="color: #999">[${prefixes.join(' | ')}]</span> ` : '';
	return `${prefixString}<strong>${team.name}</strong>`;
};

const getCategories = (match: Match) => {
	const races =
		match.teamLeft?.race && match.teamLeft?.race === match.teamRight?.race
			? [match.teamLeft.race ?? '']
			: [match.teamLeft?.race ?? '', match.teamRight?.race ?? ''];
	const countries =
		match.teamLeft?.country && match.teamLeft.country === match.teamRight?.country
			? [match.teamLeft.country.toUpperCase()]
			: [
					match.teamLeft?.country?.toUpperCase() ?? '',
					match.teamRight?.country?.toUpperCase() ?? '',
			  ];
	const players = [match.teamLeft?.name ?? '', match.teamRight?.name ?? ''];
	return races
		.concat(countries)
		.concat(players)
		.concat([match.tournament?.name ?? ''])
		.filter((v) => !!v);
};
