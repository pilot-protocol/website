# Claim audit: src/pages/blog/how-ai-agents-discover-each-other.astro
Audited: 2026-07-10 · Sentences examined: 102 · verified: 70 · false: 2 · unverifiable: 8 · opinion: 9 · example: 13

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
| --- | --- | --- |
| 202 | Comparison table: "Open source | Yes (MIT license)" | web4/LICENSE and protocol@v1.10.5/LICENSE are both GNU AGPL v3, not MIT |
| 103, 118, 141, 225 | `pilotctl peers --search "summarization"` presented as registry-wide tag/capability search returning public agents with matching tags | cmd/pilotctl/main.go peers help: "Summarize currently connected peers... --search <query> filter by node ID substring". It filters already-connected peers by node ID, not a registry tag search; discovery-by-tag is served by list-agents/find, not `peers --search` |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
| --- | --- | --- | --- |
| 6 | A2A spec quote: "A2A intentionally leaves discovery infrastructure up to you." | Exact quotation not confirmed against the A2A spec text | The A2A spec page containing this sentence |
| 4 | Opening quote "There is still no good way to find agents scattered across GitHub repos..." "repeated across dozens of developer threads" | Anonymous aggregate quote | Links to the threads |
| 111 | "A private agent's tags are not searchable by the general network, but a trusted peer can query its trusted peer's tags" | Trusted-peer tag query path not located in source within budget | Code path/test showing per-peer tag visibility |
| 134 | "An agent can parse this JSON and choose the most capable peer based on tags, uptime, and connectivity status" | Depends on the tag-search output shape shown, which does not match the real `peers --search` semantics (see FALSE above) | Real --json output |
| 153-157 | Registry-as-public-directory listing "hostnames, tags, uptime, and connectivity status" | Directory listing fields not confirmed against a live command | Live `pilotctl` directory output |
| 184 | Symmetric-NAT agents "preferring smaller payloads to reduce relay load" as agent behavior | Advisory scenario, no source | N/A (illustrative) |
| 207 | "IETF's Agent Name Service (ANS) draft ... As of early 2026, it remains a draft with no production implementations" | ANS draft status/implementations not confirmed | datatracker.ietf.org draft lookup |
| 198/201 | A2A/ANS table cells (HTTP health check, heartbeat proposed, JSON-LD proposed, ANS "Configurable" privacy) | Third-party spec details not confirmed | A2A/ANS spec texts |

## Verified claims (grouped by source)
- web4 cmd/pilotctl/main.go: set-hostname, find, extras set-tags, handshake with justification, send-file, recv, context (case "context", line 1666), member-tags, global --json output flag (jsonOutput var) all exist
- cmd/daemon/main.go:72: keepalive default 30s (table rows "Keepalive (30s)")
- protocol@v1.10.5 pkg/protocol/header.go:44: PortNameserver = 53 — "built-in nameserver on port 53 (standard DNS port on the overlay)"
- protocol@v1.10.5 pkg/registry/server.go:870-903: hostnameRegex lowercase alphanumeric + hyphens, reservedHostnames list, uniqueness — matches "validated against naming rules (alphanumeric with hyphens, no reserved words)"
- protocol@v1.10.5 pkg/daemon + web4: automatic registration on daemon start; registry not in data path (direct encrypted UDP tunnels); relay/NAT traversal built in; private-by-default visibility (pre-verified + set-private/set-public)
- Live URL: https://pilotprotocol.network/blog/ai-agent-discovery-process-p2p-networks → 200; CTA GitHub repo (pre-verified)
- Local site files: internal links secure-ai-agent-communication-zero-trust, connect-ai-agents-behind-nat-without-vpn, build-multi-agent-network-five-minutes, private-agent-network-company all exist in src/pages/blog; banner .webp exists
- Knowledge: DNS history/behavior claims (hierarchical, cached, ~40 years, WHOIS public, no capability info); A2A Agent Cards at /.well-known/agent.json is the documented A2A convention
- EXAMPLE items: all terminal outputs (agent-alpha, 1:0001.0000.00xx addresses, 34.148.103.117:4000, sample JSON incl. the malformed `context` JSON with duplicate "network" keys and trailing comma — illustrative but sloppy)
