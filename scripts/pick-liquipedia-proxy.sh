#!/usr/bin/env bash
#
# Picks a working free HTTP proxy for the Liquipedia smoke run, and prints it
# as a proxy URL on stdout (nothing at all if none works).
#
# Why: Liquipedia rate-limits per client IP, and hosted GitHub runners come from
# a shared datacenter pool whose budget is regularly spent by unrelated traffic
# before the job even starts. Fetching through a proxy gives the run an IP that
# isn't shared with every other Actions job.
#
# Free proxies are unreliable by nature, so nothing here is trusted: every
# candidate is probed against the real Liquipedia API first, and a run that
# finds no working proxy prints nothing and connects directly — the rate-limit
# handling in fetch-page.ts still covers that case. This script never fails the
# build.
#
# The candidate order is seeded with the UTC date, so each day's run tries a
# different IP rather than hammering whichever one happens to sort first.
#
# Note on trust: an HTTP CONNECT proxy tunnels TLS, so the operator sees the
# hostname but cannot read or alter the API responses. The smoke run also sends
# no credentials — it reads public wiki pages.

set -uo pipefail

PROXY_LIST_URL="${PROXY_LIST_URL:-https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&protocol=http&proxy_format=protocolipport&format=text&timeout=5000}"
PROBE_URL="${PROBE_URL:-https://liquipedia.net/starcraft2/api.php?action=query&meta=siteinfo&format=json}"
USER_AGENT="${USER_AGENT:-liquipedia-calendar/1.0 (nieminen.juho@gmail.com)}"
MAX_CANDIDATES="${MAX_CANDIDATES:-25}"
PROBE_TIMEOUT_S="${PROBE_TIMEOUT_S:-8}"
LIST_TIMEOUT_S="${LIST_TIMEOUT_S:-20}"

log() { echo "pick-proxy: $*" >&2; }

list=$(curl -sS --max-time "$LIST_TIMEOUT_S" "$PROXY_LIST_URL" 2>/dev/null)
if [ -z "$list" ]; then
	log "could not fetch the proxy list; falling back to a direct connection"
	exit 0
fi

# The list is one proxy per line. Keep only well-formed http://host:port entries
# so a stray HTML error page can never reach curl's -x flag.
candidates=$(printf '%s\n' "$list" | tr -d '\r' | grep -E '^http://[0-9]{1,3}(\.[0-9]{1,3}){3}:[0-9]{1,5}$' || true)
if [ -z "$candidates" ]; then
	log "proxy list had no usable entries; falling back to a direct connection"
	exit 0
fi

# Deterministic per-day shuffle: same order all day (so a rerun reproduces the
# pick), different order tomorrow. The random source has to be a well-spread
# byte stream — feeding shuf the repeated seed itself doesn't work, since it
# reads only the first few bytes and every date shares that prefix.
seed=$(date -u +%Y%m%d)
if command -v openssl >/dev/null 2>&1; then
	candidates=$(printf '%s\n' "$candidates" |
		shuf --random-source=<(openssl enc -aes-256-ctr -pass "pass:$seed" -nosalt </dev/zero 2>/dev/null))
else
	candidates=$(printf '%s\n' "$candidates" | shuf)
fi
candidates=$(printf '%s\n' "$candidates" | head -n "$MAX_CANDIDATES")

log "probing $(printf '%s\n' "$candidates" | wc -l | tr -d ' ') candidates against the Liquipedia API"

body=$(mktemp)
trap 'rm -f "$body"' EXIT

while IFS= read -r proxy; do
	[ -n "$proxy" ] || continue
	code=$(curl -sS -o "$body" -w '%{http_code}' \
		-x "$proxy" \
		--max-time "$PROBE_TIMEOUT_S" \
		--connect-timeout 5 \
		-H "User-Agent: $USER_AGENT" \
		"$PROBE_URL" 2>/dev/null) || continue

	[ "$code" = "200" ] || continue
	# A proxy that reaches an already-throttled edge is no better than direct,
	# and a transparent proxy may return its own interstitial instead of JSON.
	head -c 1 "$body" | grep -q '{' || continue
	grep -qi 'Rate Limited' "$body" && continue

	log "selected $proxy"
	echo "$proxy"
	exit 0
done <<<"$candidates"

log "no candidate reached Liquipedia; falling back to a direct connection"
exit 0
