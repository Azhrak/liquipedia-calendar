import fs from 'fs';

const main = () => {
	const data = fs.readFileSync('./src/data/sc2-wikitext.txt').toString();
	const formatted = data.replaceAll('\\"', '"');
	const matches = formatted.matchAll(
		/(?:<(?:div|span|tr|td|p|table|abbr)\s*([^>]*)>(?:\s*([^<]*))?|(\[\[[^\]]+\]\])|>:?(\d+):?<)/g,
	);

	const wikiTextArray = [];
	for (const match of matches) {
		const element = [];
		match[1] && element.push(match[1]);
		match[2] && element.push(match[2].replaceAll('&nbsp;', ''));
		match[3] && element.push(match[3]);
		match[4] && element.push(match[4]);
		element.length > 0 && wikiTextArray.push(element);
	}

	fs.writeFileSync('./tmp/wikiarray.json', JSON.stringify(wikiTextArray, null, 2));
	return wikiTextArray;
};

main();
