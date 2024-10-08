import { FilterParams } from '@/@types/common';
import { SC2Match } from '@/@types/starcraft';
import { config } from '@/config';

export const filterStarCraft2Matches = (matches: SC2Match[], params: FilterParams) => {
	if (Object.values(params).every((p) => !p)) {
		return matches;
	}

	const player = params.player?.toLowerCase().slice(0, 32);
	const race = params.race?.toLowerCase().slice(0, 16);
	const country = params.country?.toLowerCase().slice(0, 3);
	const tournament = params.tournament
		?.toLowerCase()
		.replace(config.sc2WikiRootUrl, '')
		.slice(0, 256);
	const featured = params.featured?.slice(0, 6);

	const filterFunctions: [(m: SC2Match) => boolean] = [() => true];

	if (player) {
		const testPlayers = (match?: SC2Match) => {
			return (
				match?.teamLeft?.name.toLowerCase() === player ||
				match?.teamRight?.name.toLowerCase() === player
			);
		};
		filterFunctions.push(testPlayers);
	}

	if (race) {
		const testRaces = (match?: SC2Match) => {
			return match?.teamLeft?.race === race || match?.teamRight?.race === race;
		};
		filterFunctions.push(testRaces);
	}

	if (country) {
		const testCountries = (match?: SC2Match) => {
			return match?.teamLeft?.country === country || match?.teamRight?.country === country;
		};
		filterFunctions.push(testCountries);
	}

	if (tournament) {
		const testTournament = (match: SC2Match) => {
			return !!match.tournament?.link?.toLowerCase().endsWith(tournament);
		};
		filterFunctions.push(testTournament);
	}

	if (featured && featured.length > 0) {
		const testFeatured = (match: SC2Match) => {
			return match.featured.toString() === featured;
		};
		filterFunctions.push(testFeatured);
	}

	filterFunctions.shift(); // remove 1st empty placeholder function

	const filtered = matches.filter((match) => {
		for (let index = 0; index < filterFunctions.length; index++) {
			const func = filterFunctions[index];
			if (!func(match)) {
				return false;
			}
		}

		return true;
	});

	return filtered;
};
