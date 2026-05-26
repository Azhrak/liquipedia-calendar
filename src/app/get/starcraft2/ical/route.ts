import { NextResponse } from 'next/server'
import { createMatchEvents } from '@/icalendar/icalendarMatch'
import { transformStarCraft2Matches } from '@/icalendar/transformMatch'
import { getMatches } from '../matches'

export async function GET(request: Request) {
	const matches = await getMatches(request)
	const ical = createMatchEvents(transformStarCraft2Matches(matches))
	return new NextResponse<string>(ical, { status: 200 })
}
