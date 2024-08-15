'use client';

import { removeTrailingSlash } from '@/utils/utils';
import Image from 'next/image';

export const CopyToClipboard = (props: { text: string; prependUrl?: boolean }) => {
	const handleClick = () => {
		const url = props.prependUrl ? removeTrailingSlash(window.location.origin) : '';
		navigator.clipboard.writeText(url + props.text);
	};

	return (
		<div onClick={handleClick} className="flex cursor-pointer items-center gap-1">
			<Image
				src={'/copy-to-clipboard.svg'}
				className="dark:invert"
				alt="Copy to clipboard"
				width={30}
				height={30}
				priority
			/>{' '}
			<span className="text-xs">Copy</span>
		</div>
	);
};
