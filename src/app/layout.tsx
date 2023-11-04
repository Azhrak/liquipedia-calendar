import type { Metadata } from 'next';
import { Josefin_Sans, M_PLUS_2 } from 'next/font/google';
import './globals.css';

const josefin = Josefin_Sans({ subsets: ['latin'], variable: '--font-josefin' });
const mplus = M_PLUS_2({ subsets: ['latin'], variable: '--font-mplus' });

export const metadata: Metadata = {
	title: 'Liquipedia Match Calendar',
	description: 'Get the matches you choose to you calendar!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={`${josefin.variable} ${mplus.variable}`}>{children}</body>
		</html>
	);
}
