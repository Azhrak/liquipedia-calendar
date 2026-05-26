import ics, { createEvents } from 'ics'
import { SC2Tournament } from '@/@types/starcraft'

export const createTournamentEvents = (tournaments: SC2Tournament[]): string => {
	const { error, value } = createEvents(tournaments.map(tournamentToIcal))
	if (error) {
		console.error(error)
		return ''
	}
	return value ?? ''
}

const tournamentToIcal = (tournament: SC2Tournament): ics.EventAttributes => {
	const start = toDateArray(tournament.startDate)
	const end = tournament.endDate ? toDateArray(tournament.endDate) : undefined

	const tierLabel = tournament.tier ? `[Tier ${tournament.tier}] ` : ''
	const title = `${tierLabel}${tournament.name}`

	if (end) {
		return {
			calName: 'Liquipedia Tournament Calendar',
			start: start ?? [2000, 1, 1],
			end,
			title,
			description: getDescription(tournament),
			htmlContent: getHtmlDescription(tournament),
			categories: tournament.tier ? [tournament.tier] : [],
		}
	}
	return {
		calName: 'Liquipedia Tournament Calendar',
		start: start ?? [2000, 1, 1],
		duration: { days: 1 },
		title,
		description: getDescription(tournament),
		htmlContent: getHtmlDescription(tournament),
		categories: tournament.tier ? [tournament.tier] : [],
	}
}

const toDateArray = (isoDate: string | null): ics.DateArray | null => {
	if (!isoDate) return null
	const [y, m, d] = isoDate.split('-').map(Number)
	return [y, m, d]
}

const getDescription = (t: SC2Tournament): string => {
	const lines: string[] = []
	if (t.link) lines.push(`More info: ${t.link}`)
	if (t.prizePool) lines.push(`Prize pool: ${t.prizePool}`)
	if (t.location) lines.push(`Location: ${t.location}`)
	return lines.join('\n')
}

const getHtmlDescription = (t: SC2Tournament): string => {
	let html = '<!DOCTYPE html><html><body>'
	if (t.link) html += `<a href="${t.link}">Liquipedia</a><br />`
	if (t.prizePool) html += `Prize pool: <strong>${t.prizePool}</strong><br />`
	if (t.location) html += `Location: ${t.location}<br />`
	html += '</body></html>'
	return html
}
