import { TournamentFilterParams } from '@/@types/common'
import { SC2Tournament } from '@/@types/starcraft'

export const filterStarCraft2Tournaments = (
	tournaments: SC2Tournament[],
	params: TournamentFilterParams,
): SC2Tournament[] => {
	if (!params.tier) return tournaments

	const tiers = params.tier
		.toLowerCase()
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean)

	if (tiers.length === 0) return tournaments

	return tournaments.filter((t) => t.tier !== null && tiers.includes(t.tier.toLowerCase()))
}
