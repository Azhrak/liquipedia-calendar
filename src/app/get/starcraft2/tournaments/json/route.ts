import { getTournaments } from '../tournaments'

export async function GET(request: Request) {
	const tournaments = await getTournaments(request)
	return Response.json(tournaments)
}
