'use client';

import { CopyToClipboard } from '@/components/CopyToClipboard';
import { useFilters } from './providers/FiltersProvider';
import qs from 'qs';

type Props = {
	icalUrl: string;
	jsonUrl: string;
};

export const Links = ({ icalUrl, jsonUrl }: Props) => {
	const { state } = useFilters();

	const query = (url: string) => {
		const q = qs.stringify(state);
		if (q) {
			return `${url}?${q}`;
		}
		return url;
	};

	return (
		<div className="mt-8 flex-col gap-10">
			<div className="p-8 text-center text-xl">
				<h3 className="text-4xl">iCal</h3>
				<div className="flex gap-3">
					➡ <a href={query(icalUrl)}>{icalUrl}</a>
					<CopyToClipboard text={query(icalUrl)} prependUrl />
				</div>
			</div>

			<div className="p-8 text-center text-xl">
				<h3 className="text-4xl">json</h3>
				<div className="flex gap-3">
					➡ <a href={query(jsonUrl)}>{jsonUrl}</a>
					<CopyToClipboard text={query(jsonUrl)} prependUrl />
				</div>
			</div>
		</div>
	);
};
