import { createMatchEvents } from '@/icalendar/icalendarMatch';
import { getMatches } from '../matches';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	// const matches = await getMatches(request);
	// const ical = createMatchEvents(matches);
	// return new NextResponse<string>(ical, { status: 200 });
}
