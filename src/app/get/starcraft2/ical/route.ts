import { createMatchEvents } from '@/icalendar/icalendarMatch';
import { getMatches } from '../matches';
import { NextResponse } from 'next/server';
import { transformStarCraft2Matches } from '@/icalendar/transformMatch';

export async function GET(request: Request) {
	const matches = await getMatches(request);
	const ical = createMatchEvents(transformStarCraft2Matches(matches));
	return new NextResponse<string>(ical, { status: 200 });
}
