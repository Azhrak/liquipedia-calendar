import { DateTime } from 'luxon';
import { Match, MatchStream } from '../@types/match';
import { findMatches, simpleHash } from '../utils/utils';
import { config } from '../config';

type SearchDirection = 'asc' | 'desc';

export const splitMatches = (data: string[]) => {
	const matches: string[][] = [];
	let matchIndex = -1;
	let rowIndex = 0;
	for (let index = 0; index < data.length; index++) {
		if (data[index].indexOf('infobox_matches_content') > -1) {
			matches[++matchIndex] = [];
			rowIndex = 0;
		}
		if (matchIndex > -1) {
			matches[matchIndex][rowIndex++] = data[index];
		}
	}
	return matches;
};

export const parseMatches = (data: string[][]) => {
	const matches = data.map(getMatchValues);
	const uniqueMatches = matches.filter(
		(match, i) =>
			match && !matches.find((duplicate, j) => duplicate && match.hash === duplicate.hash && i < j),
	);
	return (uniqueMatches as Match[]).sort((a, b) => {
		return new Date(a.time ?? '') > new Date(b.time ?? '') ? 1 : -1;
	});
};

const getMatchValues = (match: string[]): Match | null => {
	const isTeam = findValueIndex(match, 'team-template-text') > -1;

	const {
		teamLeftName,
		teamLeftRace,
		teamLeftCountry,
		teamRightName,
		teamRightRace,
		teamRightCountry,
	} = isTeam ? getTeamRowValues(match) : getSoloRowValues(match);

	const [bestOf] = getValueRow(match, ['Best of ']);
	const [tournament] = getValueRow(match, ['tournament-text']);
	const [timeAndStreams] = getValueRow(match, ['match-countdown']);
	const timeExists = timeAndStreams && timeAndStreams.indexOf('data-timestamp') > -1;

	if ((!teamLeftName && !teamRightName) || !timeExists) {
		return null;
	}

	const values = formatMatchValues(
		{
			teamLeftName,
			teamLeftRace,
			teamLeftCountry,
			teamRightName,
			teamRightRace,
			teamRightCountry,
			bestOf,
			tournament,
			timeAndStreams,
		},
		isTeam,
	);

	return { ...values, hash: getMatchHash(values) };
};

const getMatchHash = (match: Match) => {
	return simpleHash(
		`${match.teamLeft?.name ?? ''}
     ${match.teamRight?.name ?? ''}
     ${match.bestOf ?? ''}
     ${match.time ?? ''}`,
	);
};

const getSoloRowValues = (match: string[]) => {
	const teamLeftCells = match.slice(
		match.indexOf('class="team-left"'),
		match.indexOf('class="versus"'),
	);
	let [name] = getValueRow(teamLeftCells, ['starcraft-inline-player']);
	const teamLeftName = name === 'TBD' ? null : name;
	const [teamLeftRace, teamLeftCountry] = (() => {
		if (!teamLeftName) {
			return [null, null];
		}
		return [
			getValueRow(teamLeftCells, ['race icon'], {
				directMatch: true,
			}).shift(),
			getValueRow(teamLeftCells, ['flag']).shift(),
		];
	})();

	const teamRightCells = match.slice(
		match.indexOf('class="team-right"'),
		match.indexOf('class="match-countdown"'),
	);
	[name] = getValueRow(teamRightCells, ['race icon']);
	const teamRightName = name === 'TBD' ? null : name;
	const [teamRightRace, teamRightCountry] = (() => {
		if (!teamRightName) {
			return [null, null];
		}
		return [
			getValueRow(teamRightCells, ['race icon'], {
				directMatch: true,
			}).shift(),
			getValueRow(teamRightCells, ['flag']).shift(),
		];
	})();

	return {
		teamLeftName,
		teamLeftRace,
		teamLeftCountry,
		teamRightName,
		teamRightRace,
		teamRightCountry,
	};
};

const getTeamRowValues = (match: string[]) => {
	let [name] = getValueRow(match, ['team-left', 'team-template-text']);
	const teamLeftName = name === 'TBD' ? null : name;

	[name] = getValueRow(match, ['team-right', 'team-template-text']);
	const teamRightName = name === 'TBD' ? null : name;

	return {
		teamLeftName,
		teamLeftRace: null,
		teamLeftCountry: null,
		teamRightName,
		teamRightRace: null,
		teamRightCountry: null,
	};
};

const formatMatchValues = (match: any, isTeam: boolean): Match => ({
	teamLeft: parseTeam(match.teamLeftName, match.teamLeftCountry, match.teamLeftRace, isTeam),
	teamRight: parseTeam(match.teamRightName, match.teamRightCountry, match.teamRightRace, isTeam),
	bestOf: match.bestOf ? parseInt(match.bestOf.replace('Bo', '')) : null,
	tournament: parseTournament(match.tournament),
	...formatTimeAndStreamValues(match.timeAndStreams),
});

const parseTeam = (name: string, country: string, race: string, isTeam: boolean) => {
	const linkName = parseValue(name, /\[\[([^\|]+)/);
	const pName = parseValue(name, /\|([^\]]+)\]\]/);
	if (!pName || !linkName) {
		return null;
	}
	const pCountry = parseValue(country, /File:(\w\w)_/);
	const pRace = parseValue(race, /File:(\w+) race/)?.toLowerCase() ?? null;
	return {
		name: isTeam ? linkName : pName,
		country: pCountry,
		race: pRace,
		link: linkName ? `${config.wikiRootUrl}/${linkName.replaceAll(' ', '_')}` : null,
	};
};

const parseTournament = (tournament: string) => {
	const match = tournament?.match(/\[\[([^|]+)\|([^\]]+)/);
	return match
		? {
				link: `${config.wikiRootUrl}/${match[1]}`,
				name: match[2],
		  }
		: null;
};

const parseValue = (value: string | null, regex: RegExp) => {
	const match = value?.match(regex);
	return match ? match[1] : null;
};

const formatTimeAndStreamValues = (timeAndStreams: string | null) => {
	let time = null;
	let streams: MatchStream[] = [];
	if (!timeAndStreams) {
		return { time, streams };
	}
	const timeMatch = timeAndStreams?.match(/data-timestamp="(\d+)"/);
	if (timeMatch) {
		time = DateTime.fromSeconds(parseInt(timeMatch[1])).toISO();
	}
	const streamMatches = findMatches(/data-stream-(\w+)="([^"]+)"/g, timeAndStreams);
	if (streamMatches.length > 0) {
		for (let index = 0; index < streamMatches.length; index++) {
			const element = streamMatches[index];
			streams.push({
				provider: element[1],
				channel: element[2],
				link: `${config.wikiRootUrl}/Special:Stream/${element[1]}/${element[2]}`,
			});
		}
	}

	return { time, streams };
};

type GetValueRowOptions = {
	startIndex?: number;
	direction?: SearchDirection;
	stopString?: string;
	directMatch?: boolean;
	rowCount?: number;
};

const getValueRow = (
	data: string[],
	searchStrings: string[],
	options: GetValueRowOptions = {
		startIndex: -1,
		direction: 'asc',
		rowCount: 1,
	},
): string[] | null[] => {
	if (searchStrings.length > 1) {
		// Multiple strings used: find the first element, and continue from there with the rest
		const [firstStr, ...rest] = searchStrings;
		const index = findValueIndex(
			data,
			firstStr,
			options.direction,
			options.stopString,
			options.startIndex,
		);
		if (index > -1) {
			return getValueRow(data, rest, {
				startIndex: index,
				direction: options.direction,
				stopString: options.stopString,
				directMatch: options.directMatch,
				rowCount: options.rowCount,
			});
		}

		return [null];
	}

	const rows = getRowSlice(data, options.startIndex ?? 0, options.direction);

	const alternateStrings = searchStrings[0].split(' || ');
	for (let j = 0; j < alternateStrings.length; j++) {
		const searchString = alternateStrings[j];
		const index = findValueIndex(rows, searchString, options.direction, options.stopString);
		if (index > -1 && index < rows.length) {
			const order = options.direction === 'desc' ? -1 : 1;
			const returnRows = [];
			for (let k = 1; k <= (options.rowCount ?? 1); k++) {
				const multiply = options.directMatch ? k - 1 : k;
				returnRows.push(rows[index + multiply * order]);
			}
			return returnRows;
		}
	}

	return [null];
};

const getRowSlice = (data: string[], startIndex: number, direction: SearchDirection = 'asc') => {
	const start = direction === 'desc' || startIndex < 0 ? 0 : startIndex;
	const end = direction === 'desc' ? startIndex : data.length;
	return data.slice(start, end);
};

const findValueIndex = (
	rows: string[],
	searchString: string,
	direction: SearchDirection = 'asc',
	stopString?: string,
	startIndex: number = 0,
) => {
	const start = startIndex < 0 ? 0 : startIndex;
	for (let index = start; index < rows.length; index++) {
		const i = direction === 'desc' ? rows.length - 1 - index : index;
		if (matchingFunc(rows[i], searchString)) {
			return i;
		} else if (stopString && matchingFunc(rows[i], stopString)) {
			return -1;
		}
	}

	return -1;
};

const matchingFunc = (haystack: string, searchString: string) => {
	if (searchString.startsWith('/') && searchString.endsWith('/')) {
		const regex = searchString.substring(1, searchString.length - 1);
		const match = haystack.match(new RegExp(regex, 'i'));
		return match && match.length > 0;
	}
	return haystack.indexOf(searchString) > -1;
};
