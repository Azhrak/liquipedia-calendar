import { MatchStream, MatchTournament } from './common';

export type SC2Match = {
	hash?: string;
	teamLeft: SC2MatchTeam | null;
	teamRight: SC2MatchTeam | null;
	bestOf: number | null;
	time: string | null;
	tournament: SC2MatchTournament | null;
	featured: boolean;
	streams: SC2MatchStream[];
};

export type SC2MatchTeam = {
	name: string;
	country: string | null;
	race: string | null;
	link: string | null;
	score: string | null;
};

export type SC2MatchTournament = MatchTournament;
export type SC2MatchStream = MatchStream;
