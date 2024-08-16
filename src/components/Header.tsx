import { HeaderImage } from './HeaderImage';

export const Header = () => (
	<div className="mb-8 flex flex-col gap-4 text-center">
		<h1 className="mb-2">Liquipedia Calendar</h1>
		<HeaderImage />
		<div className="mx-auto flex max-w-lg flex-col gap-2 text-center">
			<p className="text-xl font-bold">Get them matches into your calendar!</p>
			<p className="text-l">
				Pick desired filters (if any), and get the link below to paste into your calendar app.
			</p>
			<p className="text-l">
				Syncing external calendars with Google Calendar is pain, so{' '}
				<a href="https://github.com/derekantrican/GAS-ICS-Sync">this script</a> might help you.
			</p>
			<p className="text-sm">
				Currently only supporting the StarCraft II and Stormgate Liquipedia.
			</p>
		</div>
	</div>
);
