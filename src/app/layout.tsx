import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-sans',
})

const spaceGrotesk = Space_Grotesk({
	subsets: ['latin'],
	variable: '--font-display',
})

const jetbrainsMono = JetBrains_Mono({
	subsets: ['latin'],
	variable: '--font-mono',
})

export const metadata: Metadata = {
	title: 'Liquipedia Calendar — StarCraft II match & tournament feeds',
	description:
		'Subscribe to a live feed of pro StarCraft II matches and tournaments, filtered to exactly what you care about.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="dark">
			<body
				className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans bg-ink-950 text-white antialiased`}
			>
				{children}
			</body>
		</html>
	)
}
