export type MatchTournament = {
	name: string | null;
	link: string | null;
};

export type MatchStream = {
	provider: string;
	channel: string;
	link: string;
};

export type FilterParams = {
	player?: string | null;
	race?: string | null;
	faction?: string | null;
	country?: string | null;
	tournament?: string | null;
	featured?: string | null;
};
