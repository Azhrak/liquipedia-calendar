'use client';

import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

export const GameTabs = () => {
	const pathname = usePathname();
	return (
		<nav className="flex justify-center">
			<div className="flex gap-4">
				<a
					href="/"
					className={twMerge(
						'bg-cyan-950 p-4 font-josefin text-xl no-underline',
						pathname === '/' && 'bg-cyan-800 font-bold',
					)}
				>
					StarCraft 2
				</a>
				<a
					href="/stormgate"
					className={twMerge(
						'bg-cyan-950 p-4 font-josefin text-xl no-underline',
						pathname === '/stormgate' && 'bg-cyan-800 font-bold',
					)}
				>
					Stormgate
				</a>
			</div>
		</nav>
	);
};
