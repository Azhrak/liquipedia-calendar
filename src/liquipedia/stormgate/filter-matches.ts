import { FilterParams } from '@/@types/common';
import { StormgateMatch } from '@/@types/stormgate';
import { config } from '@/config';

export const filterStormgateMatches = (matches: StormgateMatch[], params: FilterParams) => {
	if (Object.values(params).every((p) => !p)) {
		return matches;
	}

	const player = params.player?.toLowerCase().slice(0, 32);
	const faction = params.faction?.toLowerCase().slice(0, 16);
	const country = params.country?.toLowerCase().slice(0, 3);
	const tournament = params.tournament
		?.toLowerCase()
		.replace(config.sgWikiRootUrl, '')
		.slice(0, 256);
	const featured = params.featured?.slice(0, 6);

	const filterFunctions: [(m: StormgateMatch) => boolean] = [() => true];

	if (player) {
		const testPlayers = (match?: StormgateMatch) => {
			return (
				match?.teamLeft?.name.toLowerCase() === player ||
				match?.teamRight?.name.toLowerCase() === player
			);
		};
		filterFunctions.push(testPlayers);
	}

	if (faction) {
		const testFactions = (match?: StormgateMatch) => {
			return match?.teamLeft?.faction === faction || match?.teamRight?.faction === faction;
		};
		filterFunctions.push(testFactions);
	}

	if (country) {
		const testCountries = (match?: StormgateMatch) => {
			return match?.teamLeft?.country === country || match?.teamRight?.country === country;
		};
		filterFunctions.push(testCountries);
	}

	if (tournament) {
		const testTournament = (match: StormgateMatch) => {
			return !!match.tournament?.link?.toLowerCase().endsWith(tournament);
		};
		filterFunctions.push(testTournament);
	}

	if (featured && featured.length > 0) {
		const testFeatured = (match: StormgateMatch) => {
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
