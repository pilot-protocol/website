# Claim audit: src/pages/blog/multi-agent-system-networking-guide-ai-developers.astro
Audited: 2026-07-10 · Sentences examined: 74 · verified: 38 · false: 2 · unverifiable: 14 · opinion: 20 · example: 0

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 50 | "Research on MAS failure rates [arxiv.org/html/2507.08616v1] shows ... failure rates between 41% and 86.7% ... on benchmarks like SWE-Bench and GAIA." | Fetched 2507.08616v1 (HTTP 200): it is "AgentsNet: Coordination and Collaborative Reasoning in Multi-Agent LLMs" — a coordination benchmark paper. It contains NO 41%/86.7% failure-rate figures. The 86.7% figure actually comes from arXiv 2503.13657 ("Why Do Multi-Agent LLM Systems Fail?"). Wrong citation. |
| 180 | "Research on MAS productivity gains [arxiv.org/html/2503.13657v3] confirms that well-architected multi-agent systems outperform single-agent approaches..." | Fetched 2503.13657v3 (HTTP 200): title is "Why Do Multi-Agent LLM Systems Fail?" — a failure taxonomy paper; no "productivity gains" content (grep for "productivity" = 0 hits). Citation mislabeled/misattributed. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why | What WOULD verify it |
|---|---|---|---|
| 30 | "Choosing the right protocol can affect completion time by up to 36 percent" | No source given; figure not found in any of the cited papers | A citable benchmark reporting the 36% figure |
| 163 | "ProtocolBench: Directly compares communication protocols and has shown up to 36% task time variance" | No evidence "ProtocolBench" exists; not found in cited sources or arXiv fetches | Link to the ProtocolBench paper/repo |
| 162, 191 | "COMMA: Evaluates multimodal collaboration..." | COMMA benchmark existence not confirmable with available tools (only lowercase "comma" word matches in fetched papers) | Citation/URL for the COMMA benchmark |
| 50, 52, 193 | "failure rates between 41% and 86.7%" / blockquote / FAQ repeat | 86.7% confirmed in arXiv 2503.13657; the 41% lower bound not found in any fetched source | Locating 41% (likely 41.77%) in 2503.13657 tables |
| 26 | "Decentralized MAS networking yields better scalability and privacy" | Comparative vendor/architecture performance claim with no benchmark | Published comparative study |
| 102, 187 | Symphony "delivers scalability and privacy without central orchestrators" (performance claim) | Paper exists and describes blockchain/ledger/federated design (verified), but the performance delta is the paper's own unreplicated claim | Independent replication |
| 175-176 | Targets: "delivery rate above 99.9%", "reconnection under 2 seconds" | Invented recommendation figures, no source | N/A (recommendation; could be labeled as such) |
| 161 | AgentsNet "up to 100+ agents" | "up to 100 agents" verified in arXiv paper; the "+" (beyond 100) is not supported | Paper text stating >100 |

## Verified claims (grouped by source)
- arXiv 2508.20019v1 (HTTP 200): Symphony framework uses blockchain/ledger-based discovery and federated learning terms — present in paper
- arXiv 2507.08616v1 (HTTP 200): AgentsNet tests coordination on graph problems, scales to 100 agents
- modelcontextprotocol.io (HTTP 200): MCP exists; MCP uses JSON-RPC with tools/resources/prompts primitives (matches MCP spec)
- Live URLs: babylovegrowth.ai 200; all 4 supabase images 200; openreview.net forum lqNqKUG2dn 200 (AgentsNet)
- Internal links: all pilotprotocol.network/blog/* slugs referenced (secure-ai-agent-communication-zero-trust, build-multi-agent-network-five-minutes, openclaw-meets-pilot-agent-networking-one-command, private-agent-network-company, why-ai-agents-need-network-stack, scaling-openclaw-fleets-thousands-agents, build-agent-swarm-self-organizes, benchmarking-http-vs-udp-overlay, nat-traversal-ai-agents-deep-dive) exist in src/pages/blog/
- Pre-verified/web4: Pilot gives persistent virtual addresses, encrypted P2P tunnels, NAT traversal, mutual trust (pkg/daemon); wraps HTTP/gRPC/SSH via net.Conn overlay (common@v0.5.0/driver/conn.go); Python and Go SDKs exist (sdk-python repo, common/driver)
- Local: banner public/blog/banners/multi-agent-system-networking-guide-ai-developers.jpg exists
- OPINION items: Key-takeaways framing, pro tips, architecture-comparison table rows (qualitative), FAQ hedged answers
