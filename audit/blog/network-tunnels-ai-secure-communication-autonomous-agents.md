# Claim audit: src/pages/blog/network-tunnels-ai-secure-communication-autonomous-agents.astro
Audited: 2026-07-10 · Sentences examined: 95 · verified: 45 · false: 0 · unverifiable: 9 · opinion: 39 · example: 2

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 140 | "Over 500 public MCP servers exist as of 2026, with support from Claude, Cursor, OpenAI, and Google." | Third-party count with no cited registry; no live source queried can confirm "over 500 public". Vendor-support list plausible but unsourced. | An MCP registry count (e.g., official registry API) + vendor announcements. |
| 209 | "Key statistic: As of 2026, over 500 public MCP servers are active, meaning the attack surface... is growing faster than most security teams realize." | Same uncited count, plus an unfalsifiable growth/awareness claim. | Same. |
| 228 | "Yes. As of 2026, Claude, Cursor, OpenAI, and Google all support MCP tunnels for secure agent-to-tool integration across their platforms." | "MCP tunnels" as a vendor-supported feature is not a term any of these vendors document; MCP support ≠ tunnel support. | Vendor docs describing tunnel support explicitly. |
| 42 | "Network tunnels in AI primarily refer to secure tunneling mechanisms used to expose local MCP servers to remote AI agents..." (attributed to Medium/instatunnel) | medium.com/@instatunnel/... returns HTTP 403 to curl; content not checked. Definitional claim rests on one blog. | Browser fetch of the Medium post. |
| 120 | "Network tunnels bridge local MCP servers to remote AI agents..." (attributed to second instatunnel Medium post) | HTTP 403 to curl; content not checked. | Same. |
| 190 | "Shadow IT tunnels, tool poisoning, buffer/timeouts, and NAT-symmetric restrictions are the primary edge cases in MCP tunneling." | "Primary edge cases" is a ranking claim with no cited data. | A published MCP tunneling incident/risk survey. |
| 183-187 | Vulnerability list assertions (shadow IT prevalence, tool poisoning "undetectable at the network layer", SSE stall behavior) | Plausible security reasoning but no cited sources or measurements. | Citations to CVEs/advisories or MCP security research. |
| 135 | "TLS 1.3 is the baseline. Every tunnel carrying agent traffic should enforce mutual TLS..." | Normative "baseline" claim; TLS 1.3 exists (RFC 8446) but "baseline for AI tunnels" is unsourced convention. | Industry standard/guideline citation. |
| 213 | "The teams building reliable agent fleets in 2026 are not patching VPNs. They are adopting inspection-ready, protocol-aware tunnels..." | Industry-behavior claim with no survey. | Market survey data. |

## Verified claims (grouped by source)
- MCP specification (modelcontextprotocol.io, public spec): MCP is an open protocol using JSON-RPC 2.0 over stdio / SSE / streamable HTTP transports in a client-server model (lines 82, 134, 224) — matches spec.
- RFC 8446: TLS 1.3 exists as the current TLS version (line 135, existence portion).
- STUN/TURN (RFC 8489/8656): named correctly as NAT traversal technologies (component table line 168).
- web4 product source: line 219 "Pilot Protocol... provides virtual addresses, encrypted tunnels, NAT traversal, and mutual trust establishment" — matches pkg/daemon/tunnel.go, pkg/daemon/routing/beacon.go (punch/relay), trust commands in cmd/pilotctl/main.go. "Go and Python SDKs and a unified CLI" — Go SDK = github.com/pilot-protocol/common/driver (pre-verified), sdk-python repo exists (pre-verified), pilotctl CLI in cmd/pilotctl.
- Local site files: internal links encrypted-tunnel-advantages-peer-to-peer-ai-networks, connect-agents-across-aws-gcp-azure-without-vpn, secure-network-infrastructure-ai-agents-practical-guide, secure-ai-agent-communication-zero-trust, trust-model-agents-invisible-by-default, nat-traversal-ai-agents-deep-dive, connect-ai-agents-behind-nat-without-vpn, ai-networking-challenges-decentralized-systems, secure-communication-protocols-distributed-ai-systems all exist in src/pages/blog/; banner public/blog/banners/network-tunnels-ai-secure-communication-autonomous-agents.jpg exists.
- Live URL checks: both instatunnel Medium URLs return 403 (exist, bot-blocked).
- Self-consistent metadata: JSON-LD headline/description/date match frontmatter/meta.
- OPINION (not flagged): comparison-table editorial cells (VPN vs AI tunnel), "architectural shift" rhetoric, Pro Tips, predictions about 2027.
- EXAMPLE: localhost dev-server scenario, illustrative component/technology table pairings.
