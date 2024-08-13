export const wikitextToArray = (data: string) => {
	const formatted = data.replaceAll('\\"', '"');
	console.log(formatted);
	const matches = formatted.matchAll(
		/<(?:div|span|tr|td|p|table|abbr)\s*([^>]*)|(\[\[[^\]]+\]\])|>(?![\[<&\)}\\n])([^<]+)(?<![\( ])/g,
	);

	const wikiTextArray = [];
	for (const match of matches) {
		match[1] && wikiTextArray.push(match[1]);
		match[2] && wikiTextArray.push(match[2].replaceAll('&nbsp;', ''));
		match[3] && wikiTextArray.push(match[3]);
		match[4] && wikiTextArray.push(match[4]);
	}
	return wikiTextArray;
};
