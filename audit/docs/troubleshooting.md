# Claim audit: src/pages/docs/troubleshooting.astro
Audited: 2026-07-10 · Sentences examined: 108 · verified: 101 · false: 2 · unverifiable: 2 · opinion: 1 · example: 2

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 54 | "Check that the peer's tunnel UDP port is reachable (check `pilotctl info` on the peer for the exact port)" | `pilotctl info` unconditionally calls `redactPeerEndpoints()` (web4 cmd/pilotctl/main.go:5171, impl :3402-3416) which deletes `endpoint`, `real_addr`, `lan_addrs`, `public_addr`, `stun_addr`, `observed_addr` — in both human and `--json` output. The IPC info payload (pkg/daemon/ipc.go:1119-1151) has no other listen-port field (`ports` is a count of open service ports). `pilotctl info` cannot show the tunnel UDP port. |
| 70 | "The daemon's tunnel UDP port is not blocked by a local firewall (run `pilotctl info` to see the port in use)" | Same evidence as line 54 — the endpoint (host:port) is redacted from all `pilotctl info` output; no port field survives. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 101 | Symptom: "free networks are limited to 3 agents" | Error string appears nowhere in web4 client source (grep of cmd/ + pkg/ for "free network", "limited to", "3 agents" — zero hits); it would be emitted by the registry server, whose source is not in the audit set. Only self-referential website pages (error-codes.astro, plain mirror) repeat it. | Registry server source, or a live repro (create a free network, add a 4th agent, capture the error). |
| 102 | "The free tier allows up to 3 agents per network." | No local source states this limit. /plans page (src/pages/plans.astro) says the open tier has "Unlimited agents, connections, bandwidth" and lists Private Network as early-access with no public agent-count figure; the 3-agent cap is a registry-side policy with no verifiable artifact. | Registry server source or published pricing/limits doc stating the free per-network agent cap. |

## Verified claims (grouped by source)
- **Pre-verified cheatsheet**: daemon `-listen` default `:0` (OS-assigned) + `-transport` default udp (L25); IPC socket `/tmp/pilot.sock` (L25, 29, 121-122); registry 34.71.57.205:9000 TCP (L44, 46); beacon UDP :9001 (L55, 69, 77); echo well-known port 7 (L157); pilotctl subcommands ping/trust/find/pending/approve/untrust/peers/connect/handshake/config exist (L43, 53, 56, 59, 87-89, 95-96, 112, 141, 153-154).
- **web4 cmd/pilotctl/main.go**: `daemon start|stop|status` (:1003/:1028/:1033, L27-30, 123, 130, 150); `PILOT_SOCKET` env override (:261, :1561, L124); `pilotctl config` common keys incl. `registry` (:1265-1274, L43); `approve <node_id|address|hostname>` usage (:1122, L89); network subcommands list/members/invite/invites/accept/kick (:1802, :6675, :6797, :7078, :1814, L59, 104, 110, 113, 142, 155); `connect <address|hostname> [port]` usage (:896, :3699, L157); `~/.pilot/pilot.log` default log file + symlink (:47, :2874-2906, L156); cmdInfo prints node ID + address (:5210-5213, L151); "cannot reach registry" error string (:581, L41).
- **web4 cmd/daemon/main.go**: `PILOT_REGISTRY` env var (:49, L45); `-endpoint` fixed-endpoint flag skipping STUN (:63, L79); `-trust-auto-approve` flag default false → auto-approve off by default, target must approve (:95, L85, 89); auto-load of `~/.pilot/config.json` (:129-151) + common config `ApplyToFlags` mapping JSON key `email` → `-email` flag (common@v0.5.7/config/config.go, L36-37); `--email` flag in daemon start usage (main.go:1469, L34-35).
- **web4 pkg/daemon/daemon.go**: "invalid email: %w" startup refusal (:718, L33-34); synthetic `<fingerprint>@nodes.pilotprotocol.network` when email omitted (:691-711, L34); STUN/endpoint discovery visible in logs — "beacon discover failed" Warn, "discovered public endpoint", "daemon registered ... endpoint" Info (:805-812, :1058, L64); NAT-punch wave (:1236, L67).
- **web4 pkg/daemon/tunnel.go**: SYN trust gate — untrusted SYNs dropped (:1397; services.go:167 references SYN/datagram drop policy daemon.go:2223/2636, L59); `SetRelayPeer` — symmetric NAT peers automatically flipped to beacon relay, "peer marked for relay"/"flipping to relay" log lines (:623-641, :728-765, L75, 78); relay flag "true if using beacon relay (symmetric NAT)" (:1957, L74-75); "encrypted packet from node but no key" warn + exact phrase "encrypted packet but no key" in comments (:1262, :367, :425, L137); key desync after restart — remote keeps cached crypto context, rekey re-establishes (:1255-1258, L138, 140).
- **web4 pkg/daemon/services.go**: echo service binds port 7 and echoes received data (:142-161, L157).
- **Installer (release/install.sh)**: binaries installed to `~/.pilot/bin/pilot-daemon` (:451-473, L131).
- **Live URL**: https://pilotprotocol.network/install.sh → HTTP/2 200, text/plain (curl 2026-07-10, L132).
- **Local site files**: /plans (src/pages/plans.astro, Private Network tier present, L105); /docs/error-codes and /docs/diagnostics pages exist (src/pages/docs/, L161); /docs/comparison exists (frontmatter next link); all 9 TOC anchors match in-page ids (L10-18); frontmatter title/description/prev/next consistent with page content and existing routes (L165-170).
- **Standard OS semantics**: "address already in use" = EADDRINUSE on bind (L24); "text file busy" = ETXTBSY when overwriting a running binary (L127-128); full-cone vs restricted vs symmetric NAT behavior per RFC 4787 (L63-75).

Notes (not flagged): L157's "the echo server should respond" is trust-gated on private daemons (services.go:166-172 — private nodes refuse echo for untrusted peers), which is consistent with the checklist context (peer already trusted by step 5). L46's "outbound TCP 9000 must be open" is correct for the default transport; compat mode uses TCP/443 instead (pre-verified) but the page does not claim 9000 is the only path.

Examples (not flagged): L35 `--email you@example.com` and L37 `{ "email": "you@example.com" }` use RFC 2606 example.com placeholders.
Opinion: L5 subtitle "Common issues and how to fix them."

## Resolutions (2026-07-11 iter 43)
- L54/L70 ("run pilotctl info to see the tunnel UDP port"): corrected both. pilotctl info calls redactPeerEndpoints() and strips endpoint/real_addr/etc. in human and --json output (main.go:5171,3402-3416), so it never shows the port. Both steps now point to the daemon log (~/.pilot/pilot.log, "discovered public endpoint" line) and explicitly note pilotctl info redacts endpoints.
- L101/L102 UNVERIFIABLE (free-tier 3-agent cap): left as-is — registry-side policy string not in the local client source; echoed only by error-codes page. Noted; would need registry source or a live repro.
Build: npm run build green (345 pages).
