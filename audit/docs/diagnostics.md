# Claim audit: src/pages/docs/diagnostics.astro
Audited: 2026-07-10 · Sentences examined: 37 · verified: 31 · false: 5 · unverifiable: 0 · opinion: 0 · example: 1

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 87 | "Returns: peers [{node_id, encrypted, authenticated, path (direct \| relay)}], total, plus the encrypted_peers / authenticated_peers / relay_peer_count aggregates." | web4/cmd/pilotctl/main.go:5426-5432 — `peers` JSON output is `{"peers": filtered, "total": total, "encrypted": encCount}`. Peer objects carry a `relay` bool (main.go:5412), not a `path` field with `direct`/`relay` values. There are no `encrypted_peers`, `authenticated_peers`, or `relay_peer_count` keys in the peers output (those names exist only in `health`/`info` responses, main.go:5318-5324, 5245-5249). |
| 87 | "Real endpoints are always redacted by the daemon before they reach any client." | Redaction is client-side in pilotctl, not the daemon: cmdPeers strips `endpoint`/`real_addr`/`lan_addrs`/`public_addr` itself (main.go:5380-5387, comment "Strip endpoint fields") and cmdInfo calls `redactPeerEndpoints` locally (main.go:5171, func at 3402-3416). `grep -rn redact` over web4/cmd/daemon and web4/pkg finds nothing — the daemon sends endpoints over IPC; a non-pilotctl client would receive them. |
| 85 | `pilotctl peers --search "web-server"  # Filter by tag or query` | main.go:5394-5398 — `--search` only substring-matches the numeric node_id string (`nodeIDStr := fmt.Sprintf("%d", ...); strings.Contains(nodeIDStr, ...)`). It does not filter by tag, hostname, or free-text query; searching "web-server" can never match. |
| 29-36 | Health example output ("Daemon Health / Status: ok / Uptime: ... / Bytes Sent: 1.2 MB ...") | Stale format. Current cmdHealth (main.go:5342-5350) prints `● pilot-daemon ok`, then `uptime 01:23:45 · 3 connection(s)`, `peers 5 (N encrypted, N via relay)`, `traffic ↑ 1.2 MB  ↓ 842 KB`. No "Daemon Health" header or "Status:/Bytes Sent:" labels exist in the binary. |
| 50-55 | Ping example output ("seq=0 bytes=6 time=513.952ms" lines, indented) | Minor staleness: current cmdPing always appends a dial/echo breakdown — `seq=%d bytes=%d time=%v  [dial=%v echo=%v]` (main.go:5781-5783, comment "Always show dial/echo breakdown") — and prints without leading indentation. The shown lines cannot be produced by the current binary. |

## Verified claims (grouped by source)
- web4/cmd/pilotctl/main.go:1922-1939 (dispatch): `health`, `ping`, `traceroute`, `bench`, `peers`, `connections`, `info`, `disconnect` all exist as subcommands (note: `disconnect` is real despite being absent from the pre-verified subcommand cheatsheet — `case "disconnect"` at line 1924, handler at 5140).
- web4/cmd/pilotctl/main.go:5294-5350 (cmdHealth): returns `status`, `uptime_seconds`, `connections`, `peers`, `bytes_sent`, `bytes_recv`; "quick check on daemon vitals" description.
- web4/cmd/pilotctl/main.go:5519-5817 (cmdPing): `--count` (default 4, line 5526), `--timeout` flag (line 5529), echo-probe RTT measurement; JSON returns `target`, `results` [{`seq`, `bytes`, `rtt_ms`, `error`}], `timeout` bool (lines 5721-5744, 5804-5811); dials `protocol.PortEcho` = port 7 (pre-verified: echo 7).
- web4/cmd/pilotctl/main.go:5818-5917 (cmdTraceroute): measures connection setup time + 3 RTT samples; JSON returns `target`, `setup_ms`, `rtt_samples` [{`rtt_ms`, `bytes`}] (lines 5906-5911).
- web4/cmd/pilotctl/main.go:5918-6035 (cmdBench): default size 1 MB (`totalSize := 1024*1024`, line 5928), positional size in MB (`sizeMB * 1024 * 1024`, line 5941), sends via echo port; JSON returns `target`, `sent_bytes`, `recv_bytes`, `send_duration_ms`, `total_duration_ms`, `send_mbps`, `total_mbps` (lines 6023-6031); text output "Sent: ... / Echoed: ... round-trip" matches lines 6033-6034.
- web4/cmd/pilotctl/main.go:5065-5139 (cmdConnections): per-connection ID, local/remote port, state, bytes sent/received, segments, retransmissions, CWND (`cong_win`), SRTT (`srtt_ms`), SACK (`sack_sent`/`sack_recv`) columns all printed; `--search` flag exists on peers (line 5362).
- web4/cmd/pilotctl/main.go:5140-5157 (cmdDisconnect): usage `disconnect <conn_id>`, returns `{"conn_id": ...}` via outputOK.
- web4/cmd/pilotctl/main.go:5160-5292 (cmdInfo): returns `node_id`, `address`, `hostname`, `uptime_secs`, `connections`, `ports`, `peers`, `encrypt`, `bytes_sent`, `bytes_recv`, `conn_list` per-connection stats, `peer_list` with encryption status — all fields read from the info map.
- Local site files: TOC anchors #health/#ping/#traceroute/#bench/#peers/#connections/#info/#disconnect all present in page; prev/next hrefs resolve to src/pages/docs/firewalls.astro and src/pages/docs/configuration.astro.
- Page frontmatter/meta: title "Diagnostics", description "Ping, traceroute, bench, connections, and peer inspection" accurately describe page contents (verified against sections above).

## Example content (not flagged)
- Lines 75-78 bench example output: format matches current cmdBench output (values invented, hyphen vs em dash immaterial). Addresses like `0:0000.0000.0005` / `0:0000.0000.037D` in command lines are illustrative.

## Resolutions (2026-07-10, loop iteration 37)
5 FALSE fixed: health output format (● pilot-daemon ok / uptime·connections / peers / traffic, not "Daemon Health/Status:/Bytes Sent:"); peers --search filters by node-ID substring not tag/query; peers Returns shape ({peers[node_id,encrypted,authenticated,relay],total,encrypted} — no path/aggregates); endpoints stripped client-side not by daemon; ping output includes [dial= echo=] breakdown, no indent. 0 unverifiable.

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
