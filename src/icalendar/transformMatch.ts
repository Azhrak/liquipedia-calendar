import { CalendarMatch } from '@/@types/calendar';
import { SC2Match } from '@/@types/starcraft';
import { StormgateMatch } from '@/@types/stormgate';

export const transformStarCraft2Matches = (matches: SC2Match[]): CalendarMatch[] => {
	return matches.map((match) => ({
		...match,
		teamLeft: match.teamLeft
			? {
					name: match.teamLeft.name,
					country: match.teamLeft.country,
					category: match.teamLeft.race,
				}
			: null,
		teamRight: match.teamRight
			? {
					name: match.teamRight.name,
					country: match.teamRight.country,
					category: match.teamRight.race,
				}
			: null,
	}));
};

export const tarnsformStormgateMatches = (matches: StormgateMatch[]): CalendarMatch[] => {
	return matches.map((match) => ({
		...match,
		teamLeft: match.teamLeft
			? {
					name: match.teamLeft.name,
					country: match.teamLeft.country,
					category: match.teamLeft.faction,
				}
			: null,
		teamRight: match.teamRight
			? {
					name: match.teamRight.name,
					country: match.teamRight.country,
					category: match.teamRight.faction,
				}
			: null,
	}));
};
