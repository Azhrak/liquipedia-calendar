'use client';

import { FilterParams } from '@/@types/common';
import { ReactNode, createContext, useContext, useReducer } from 'react';

type State = FilterParams;
type Action = {
	type: string;
	payload: string;
};
type Context = {
	state: State;
	filterPlayer: (v: string) => void;
	filterRace: (v: string) => void;
	filterFaction: (v: string) => void;
	filterCountry: (v: string) => void;
	filterTournament: (v: string) => void;
	filterFeatured: (v: string) => void;
	clearFilters: () => void;
};

const defaultContext: Context = {
	state: {},
	filterPlayer: () => {},
	filterRace: () => {},
	filterFaction: () => {},
	filterCountry: () => {},
	filterTournament: () => {},
	filterFeatured: () => {},
	clearFilters: () => {},
};

const FiltersContext = createContext<Context>(defaultContext);

const initialState: State = {};

function filtersReducer(state: State, action: Action) {
	const { type, payload } = action;

	switch (type) {
		case 'player':
			return { ...state, player: payload };
		case 'race':
			return { ...state, race: payload };
		case 'faction':
			return { ...state, faction: payload };
		case 'country':
			return { ...state, country: payload };
		case 'tournament':
			return { ...state, tournament: payload };
		case 'featured':
			return { ...state, featured: payload };
		case 'reset':
			return initialState;
		default:
			throw new Error('Unknown action type');
	}
}

export const FiltersProvider = ({ children }: { children: ReactNode }) => {
	const [state, dispatch] = useReducer(filtersReducer, {});

	const filterPlayer = (value: string) => {
		dispatch({
			type: 'player',
			payload: value,
		});
	};

	const filterRace = (value: string) => {
		dispatch({
			type: 'race',
			payload: value,
		});
	};

	const filterFaction = (value: string) => {
		dispatch({
			type: 'faction',
			payload: value,
		});
	};

	const filterCountry = (value: string) => {
		dispatch({
			type: 'country',
			payload: value.trim(),
		});
	};

	const filterTournament = (value: string) => {
		dispatch({
			type: 'tournament',
			payload: value,
		});
	};

	const filterFeatured = (value: string) => {
		console.log(value);
		dispatch({
			type: 'featured',
			payload: value,
		});
	};

	const clearFilters = () => {
		dispatch({
			type: 'reset',
			payload: '',
		});
	};

	const value = {
		state,
		filterPlayer,
		filterRace,
		filterFaction,
		filterCountry,
		filterTournament,
		filterFeatured,
		clearFilters,
	};

	return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
};

export const useFilters = () => useContext(FiltersContext);
