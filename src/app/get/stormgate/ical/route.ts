import { createMatchEvents } from '@/icalendar/icalendarMatch';
import { getMatches } from '../matches';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	// TODO: stormgate iCal
	// const matches = await getMatches(request);
	// const ical = createMatchEvents(matches);
	const ical = 'BEGIN:VCALENDAR\nEND:VCALENDAR';
	return new NextResponse<string>(ical, { status: 200 });
}
