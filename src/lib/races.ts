export type Race = {
	id: 'protoss' | 'terran' | 'zerg' | 'random'
	label: string
	short: 'P' | 'T' | 'Z' | 'R'
	/** Tailwind gradient classes for the active swatch fill */
	hue: string
	/** Tailwind text color class for the inactive label */
	text: string
}

export const RACES: Race[] = [
	{
		id: 'protoss',
		label: 'Protoss',
		short: 'P',
		hue: 'from-amber-300 to-yellow-500',
		text: 'text-amber-200',
	},
	{
		id: 'terran',
		label: 'Terran',
		short: 'T',
		hue: 'from-sky-300 to-blue-500',
		text: 'text-sky-200',
	},
	{
		id: 'zerg',
		label: 'Zerg',
		short: 'Z',
		hue: 'from-fuchsia-400 to-purple-600',
		text: 'text-fuchsia-200',
	},
	{
		id: 'random',
		label: 'Random',
		short: 'R',
		hue: 'from-slate-300 to-slate-500',
		text: 'text-slate-200',
	},
]
