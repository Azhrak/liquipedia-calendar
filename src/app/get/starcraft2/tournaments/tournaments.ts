import { extractStarCraft2Tournaments } from '@/liquipedia/starcraft2/extract-tournaments'
import { filterStarCraft2Tournaments } from '@/liquipedia/starcraft2/filter-tournaments'

export async function getTournaments(request: Request) {
	const tournaments = await extractStarCraft2Tournaments()
	const { searchParams } = new URL(request.url)
	return filterStarCraft2Tournaments(tournaments, {
		tier: searchParams.get('tier'),
	})
}
