import { MatchStream, MatchTournament } from './common';

export type CalendarMatch = {
	teamLeft: CalendarMatchTeam | null;
	teamRight: CalendarMatchTeam | null;
	bestOf: number | null;
	time: string | null;
	tournament: MatchTournament | null;
	featured: boolean;
	streams: MatchStream[];
};

export type CalendarMatchTeam = {
	name: string;
	country: string | null;
	category: string | null;
};
