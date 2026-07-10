# Claim audit: src/pages/blog/multi-agent-pipelines-openclaw-encrypted-tunnels.astro
Audited: 2026-07-10 · Sentences examined: 46 · verified: 22 · false: 3 · unverifiable: 3 · opinion: 7 · example: 11

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 32, 51, 55, 59, 124 | `pilotctl send 1:0001.0B22.4E19 '{"description":...}'` | Actual usage: `pilotctl send <address|hostname> <port> --data <msg>` (cmd/pilotctl/main.go:904). Port arg and `--data` flag are required; the JSON-positional form shown will fail. |
| 36, 63-65, 126 | `pilotctl recv --from 1:0001.0B22.4E19 --json` | Actual usage: `pilotctl recv <port> [--count][--timeout]` (main.go:912). There is no `--from` flag; recv takes a port, not a peer address. |
| 119-121 | `pilotctl --json member-tags get --net 1` returning a list of member addresses/hostnames | Actual: `member-tags get <network_id> <node_id>` — returns the tags of ONE member (main.go:2440); the `--net` flag form is only for `member-tags set` (main.go:7876). It does not list network members. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why | What WOULD verify it |
|---|---|---|---|
| 145 | "When a replacement agent comes online and subscribes, it picks up from the last published event." | Implies event retention/replay in the pub/sub stream; no replay/retained-message mechanism found in eventstream usage or CLI docs | eventstream plugin source showing message persistence/replay |
| 90 | "Both agents will receive data-ready events and process in parallel." | Fan-out delivery semantics of the eventstream plugin to multiple subscribers not confirmed from source | eventstream plugin broadcast code |
| 128 | "tag search and tunnel health signals enable the orchestrator to dynamically compose pipelines" | "tunnel health signals" as an orchestrator-consumable API not confirmed (peers/status exist, but no health-signal API) | daemon/IPC API exposing per-peer health |

## Verified claims (grouped by source)
- web4/cmd/pilotctl/main.go: `send-file <addr> <filepath>` usage (line ~904 area); `publish <addr> <topic> --data <msg>` (line 1339); `subscribe <addr> <topic>` usage; member-tags/set-tags exist (extras)
- Pre-verified cheatsheet: github.com/pilot-protocol/pilotprotocol repo exists (CTA link); pilotctl subcommands send/send-file/recv/publish/subscribe/member-tags all exist
- General protocol claims (tunnels handle encryption, NAT traversal, reliable delivery): consistent with web4 pkg/daemon (X25519/AES-GCM tunnel, DialConnection relay fallback)
- EXAMPLE items: all `1:0001.*` addresses, JSON payloads, fake returned member lists, broker-addr placeholders
- OPINION items: "the right model", "naturally resilient", MapReduce analogy, framing sentences

## Resolutions (2026-07-11 iter 50)
- L32/51/55/59/124 (pilotctl send <addr> '{...}'): send needs <port> --data. Inserted `1002 --data` on all five.
- L36/63-65/126 (pilotctl recv --from <addr> --json): recv takes a port, not --from. Changed to `pilotctl --json inbox --from <addr>`.
- L119-121 (member-tags get --net 1 returning a member list): that form returns ONE member's tags, not a list. Changed to `pilotctl --json network members 1` (which lists addresses+hostnames), reframed the intro to hostname-based selection.
Build: npm run build green (345 pages).
