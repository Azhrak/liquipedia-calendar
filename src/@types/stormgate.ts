import { MatchStream, MatchTournament } from './common';

export type StormgateMatch = {
	hash?: string;
	teamLeft: StormgateMatchTeam | null;
	teamRight: StormgateMatchTeam | null;
	bestOf: number | null;
	time: string | null;
	tournament: StormgateMatchTournament | null;
	featured: boolean;
	streams: StormgateMatchStream[];
};

export type StormgateMatchTeam = {
	name: string;
	country: string | null;
	faction: string | null;
	link: string | null;
	score: string | null;
};

export type StormgateMatchTournament = MatchTournament;
export type StormgateMatchStream = MatchStream;
