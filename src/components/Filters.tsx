'use client';

import { useFilters } from '@/components/providers/FiltersProvider';
import Image from 'next/image';

export const Filters = () => {
	const {
		state,
		filterPlayer,
		filterRace,
		filterCountry,
		filterTournament,
		filterFeatured,
		clearFilters,
	} = useFilters();

	const handleClear = () => {
		clearFilters();
	};

	return (
		<>
			<div className="mb-3 flex items-center justify-between">
				<h3 className="text-2xl">Filters</h3>
				<button
					onClick={handleClear}
					className="rounded-sm border-2 border-gray-400 border-opacity-50 px-2 py-1"
				>
					<span className="flex gap-1">
						<Image
							src="/rubbish-bin.svg"
							height={18}
							width={18}
							alt="Bin icon"
							priority
							className="dark:invert"
						/>{' '}
						Clear
					</span>
				</button>
			</div>

			<div className="flex flex-col gap-3">
				<label>
					<span className="inline-block w-20">Player:</span>
					<input
						type="text"
						name="player"
						value={state.player ?? ''}
						onChange={(e) => filterPlayer(e.target.value)}
						className="px-2 py-1 dark:bg-gray-800"
						maxLength={32}
					></input>
				</label>

				<label className="min-w-min">
					<span className="inline-block w-20">Race:</span>
					<select
						name="race"
						value={state.race ?? ''}
						onChange={(e) => filterRace(e.target.value)}
						className="px-2 py-1 dark:bg-gray-800 "
					>
						<option value=""></option>
						<option value="protoss">Protoss</option>
						<option value="terran">Terran</option>
						<option value="zerg">Zerg</option>
						<option value="random">Random</option>
					</select>
				</label>

				<label>
					<span className="inline-block w-20">Country:</span>
					<input
						type="text"
						name="country"
						value={state.country?.toUpperCase() ?? ''}
						onChange={(e) => filterCountry(e.target.value)}
						className="px-2 py-1 dark:bg-gray-800 "
						maxLength={2}
						placeholder="2-letter country code"
					></input>
				</label>

				<div className="flex items-center justify-between gap-3">
					<label>
						<span className="inline-block w-20">Featured:</span>
					</label>

					<label>
						Yes{' '}
						<input
							type="radio"
							name="featured"
							value={'true'}
							onChange={(e) => filterFeatured(e.target.value)}
							className="h-6 w-6 align-middle accent-fuchsia-500 dark:bg-gray-800 "
							checked={state.featured === 'true'}
						></input>
					</label>

					<label>
						No{' '}
						<input
							type="radio"
							name="featured"
							value={'false'}
							onChange={(e) => filterFeatured(e.target.value)}
							className="h-6 w-6 align-middle accent-fuchsia-500 dark:bg-gray-800 "
							checked={state.featured === 'false'}
						></input>
					</label>

					<label>
						All{' '}
						<input
							type="radio"
							name="featured"
							value={''}
							onChange={(e) => filterFeatured(e.target.value)}
							className="h-6 w-6 align-middle accent-fuchsia-500 dark:bg-gray-800 dark:text-white"
							checked={!state.featured}
						></input>
					</label>
				</div>
			</div>
		</>
	);
};
