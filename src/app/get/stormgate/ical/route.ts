import { NextResponse } from 'next/server'
import { createMatchEvents } from '@/icalendar/icalendarMatch'
import { tarnsformStormgateMatches } from '@/icalendar/transformMatch'
import { getMatches } from '../matches'

export async function GET(request: Request) {
	const matches = await getMatches(request)
	const ical = createMatchEvents(tarnsformStormgateMatches(matches))
	return new NextResponse<string>(ical, { status: 200 })
}
