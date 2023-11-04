export type Match = {
	hash?: string;
	teamLeft: MatchTeam | null;
	teamRight: MatchTeam | null;
	bestOf: number | null;
	time: string | null;
	tournament: MatchTournament | null;
	featured: boolean;
	streams: MatchStream[];
};

export type MatchTeam = {
	name: string;
	country: string | null;
	race: string | null;
	link: string | null;
};

export type MatchTournament = {
	name: string | null;
	link: string | null;
};

export type MatchStream = {
	provider: string;
	channel: string;
	link: string;
};
