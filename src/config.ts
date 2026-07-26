export const config = {
	liquipediaUrl: process.env.LIQUIPEDIA_URL ?? '',
	sc2WikiRootUrl: process.env.SC2_WIKI_ROOT_URL ?? '',
	sgWikiRootUrl: process.env.SG_WIKI_ROOT_URL ?? '',
	fileCacheDir: process.env.FILE_CACHE_DIR ?? 'tmp',
	// How long fetch-page.ts keeps retrying a rate-limited Liquipedia response
	// before giving up. The default covers the 30s `action=parse` window without
	// outliving a serverless request; the smoke tests raise it, since they run
	// from shared CI IPs where a block can last minutes.
	liquipediaRetryBudgetMs:
		Number.parseInt(process.env.LIQUIPEDIA_RETRY_BUDGET_MS ?? '', 10) || 35_000,
}
