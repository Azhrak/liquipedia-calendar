'use client';

import Image from 'next/image';
import { useState } from 'react';

export const HeaderImage = () => {
	const [expanded, setExpanded] = useState(false);
	return (
		<div className="flex justify-center">
			<Image
				className="max-w-full cursor-pointer"
				src="/liquipedia-calendar-example-sc2.png"
				width={expanded ? 900 : 400}
				height={expanded ? 600 : 200}
				alt="Calendar Example"
				onClick={() => setExpanded(!expanded)}
			/>
		</div>
	);
};
