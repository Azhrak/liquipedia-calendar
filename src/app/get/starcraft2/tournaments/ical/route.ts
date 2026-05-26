import { NextResponse } from 'next/server'
import { createTournamentEvents } from '@/icalendar/icalendarTournament'
import { getTournaments } from '../tournaments'

export async function GET(request: Request) {
	const tournaments = await getTournaments(request)
	const ical = createTournamentEvents(tournaments)
	return new NextResponse<string>(ical, { status: 200 })
}
