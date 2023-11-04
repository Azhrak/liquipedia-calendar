import { getMatches } from '../matches';

export async function GET(request: Request) {
	const matches = await getMatches(request);
	return Response.json(matches);
}
