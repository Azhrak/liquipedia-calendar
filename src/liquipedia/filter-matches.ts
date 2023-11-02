import { Match } from '@/@types/match';
import { config } from '@/config';

type FilterParams = {
	player: string | null;
	race: string | null;
	country: string | null;
	tournament: string | null;
};

export const filterMatches = (matches: Match[], params: FilterParams) => {
	if (Object.values(params).every((p) => !p)) {
		return matches;
	}

	const player = params.player?.toLowerCase();
	const race = params.race?.toLowerCase();
	const country = params.country?.toLowerCase();
	const tournament = params.tournament?.toLowerCase().replace(config.wikiRootUrl, '');

	const filterFunctions: [(m: Match) => boolean] = [() => true];

	if (player) {
		const testPlayers = (match?: Match) => {
			return (
				match?.teamLeft?.name.toLowerCase() === player ||
				match?.teamRight?.name.toLowerCase() === player
			);
		};
		filterFunctions.push(testPlayers);
	}

	if (race) {
		const testRaces = (match?: Match) => {
			return match?.teamLeft?.race === race || match?.teamRight?.race === race;
		};
		filterFunctions.push(testRaces);
	}

	if (country) {
		const testCountries = (match?: Match) => {
			return match?.teamLeft?.country === country || match?.teamRight?.country === country;
		};
		filterFunctions.push(testCountries);
	}

	if (tournament) {
		const testTournament = (match: Match) => {
			return !!match.tournament?.link?.endsWith(tournament);
		};
		filterFunctions.push(testTournament);
	}

	return matches.filter((match) => {
		for (let index = 0; index < filterFunctions.length; index++) {
			const func = filterFunctions[index];
			if (!func(match)) {
				return false;
			}
		}

		return true;
	});
};
