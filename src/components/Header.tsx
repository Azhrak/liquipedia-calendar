export const Header = () => (
	<div className="mb-8 flex max-w-lg flex-col gap-2 text-center">
		<h1 className="mb-5">Liquipedia Calendar</h1>
		<p className="text-xl font-bold">Get them matches into your calendar!</p>
		<p className="text-l">
			Pick desired filters (if any), and get the link below to paste into your calendar app.
		</p>
		<p className="text-l">
			Syncing external calendars with Google Calendar is pain, so{' '}
			<a href="https://github.com/derekantrican/GAS-ICS-Sync">this script</a> might help you.
		</p>
		<p className="text-sm">Currently only supporting the StarCraft II Liquipedia.</p>
	</div>
);
