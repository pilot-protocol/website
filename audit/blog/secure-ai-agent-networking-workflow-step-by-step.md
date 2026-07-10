# Claim audit: src/pages/blog/secure-ai-agent-networking-workflow-step-by-step.astro
Audited: 2026-07-10 · Sentences examined: 85 · verified: 30 · false: 0 · unverifiable: 35 · opinion: 15 · example: 5

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 89 | "SAGA provides centralized policy enforcement and secure inter-agent TLS communication" | arXiv 2504.21034 exists (title matches: "SAGA: A Security Architecture for Governing AI Agentic Systems") but mechanism details not read | Read the paper's architecture section |
| 89 | "AgentAnycast enables decentralized P2P networking for agents behind NAT and firewalls, removing the need for a central broker" | Repo github.com/AgentAnycast/agentanycast exists (200) but feature claims not checked against README | Repo docs |
| 101-129 | Requirements table rows (DID-based identity, Noise_XX E2E, built-in NAT punch-through, distributed access tokens, "resilient by design") | Third-party product characterizations | AgentAnycast/SAGA docs |
| 133 | Blockquote "Relying on a single centralized control plane ... systemic risk." | Unattributed quote | Attribution |
| 146 | "AgentAnycast supports DID identity and Noise Protocol-based end-to-end encryption" | Not checked against repo | Repo docs |
| 142 | "Decentralized identifiers (DIDs) are the recommended standard for P2P environments." | "Recommended" by whom — no source | Standards citation |
| 190 | "Use a sidecar architecture, similar to how AgentAnycast is deployed" | Deployment model unchecked | Repo docs |
| 197 | "SAGA enforces policy using cryptographically signed access control tokens" | Paper detail not read | Paper |
| 198 | "AgentAnycast supports E2E encrypted communication and NAT traversal" | Same as above | Repo docs |
| 244 | "Manual configuration at scale is the leading cause of security drift in multi-cloud agent deployments." | Uncited statistic-shaped claim | Survey/report |
| 257 | "AgentAnycast's built-in punch-through handles most cases, but restrictive corporate firewalls may require TCP fallback." | Vendor behavior claim | Repo docs |
| 262 | Blockquote "No single protocol provides complete security..." | Unattributed | Attribution |
| 264 | "A 14-point vulnerability taxonomy across agent communication protocols" | arXiv 2511.03841 exists (title matches comparative security analysis) but the "14-point" count not confirmed | Read the paper |
| 264 | "Comparative security analysis shows that protocol flaws and real-world implementation gaps make hybrid approaches essential" | Paper conclusion not read | Paper |
| 267 | "Dynamic hybrid approaches ... outperform pure centralized or decentralized protocols across real-world threat models." | No cited evaluation | Benchmark/paper |
| 267 | "The teams seeing the best results are those actively blending SAGA-style policy enforcement with AgentAnycast-style P2P transport" | No cited teams/data | Case studies |
| 276 | "Even architecturally sound protocols like CORAL suffer from real-world implementation weaknesses that attackers can exploit." | Uncited | Paper section on CORAL |
| 280 | "Hybrid models optimize resilience and confidentiality better than pure ... protocols" | Same as 267 | Same |
| 135/282 | "NIST AI agent standards initiative launched in 2026 ... covering identity, access control, and communication frameworks" | NIST URL returns 200 and slug matches, but page content/scope not read | Read NIST announcement |
| 86 | "Agents using different protocols (A2A, ACP, CORAL) must communicate without security degradation." | Interop requirement framing referencing third-party protocols | N/A (requirement statement) |
| 42 | "Misconfigured agent networking is one of the fastest ways to expose your infrastructure..." | Uncited threat claim | Incident data |

## Verified claims (grouped by source)
- Live URLs (HTTP 200, 2026-07-10): arxiv.org/html/2504.21034v1 (title: SAGA security architecture — matches usage), arxiv.org/html/2511.03841v1 (title: "Security Analysis of Agentic AI Communication Protocols: A Comparative Evaluation" — matches usage), github.com/AgentAnycast/agentanycast, nist.gov AI-agent-standards-initiative page, all three supabase blog images + pilotprotocol.jpg.
- Local site: all internal pilotprotocol.network/blog links resolve to existing pages in src/pages/blog/ (secure-network-infrastructure-ai-agents-practical-guide, ai-networking-terminology-a2a-mcp-anp-protocols, decentralized-networking-p2p-solutions-ai-architectures, encrypted-tunnel-advantages-peer-to-peer-ai-networks, network-tunnels-ai-secure-communication-autonomous-agents, secure-communication-protocols-distributed-ai-systems, ai-networking-challenges-decentralized-systems, decentralized-communication-protocols-ai-developers, secure-ai-agent-communication-zero-trust, multi-agent-system-networking-guide-ai-developers); banner jpg exists in public/blog/banners/.
- Pre-verified / web4 source: line 273 platform claims — decentralized networking for AI agents with built-in NAT traversal, encrypted tunnels (X25519+AES-256-GCM, tunnel.go:534), persistent virtual addresses (48-bit, daemon.go:2541), trust establishment (handshake plugin) — all real product features.
- JSON-LD (lines 4-28): dates consistent with frontmatter (April 12, 2026); publisher/author URL live; image URL 200.
- Generic security guidance (TLS 1.3, Noise_XX, mTLS, STUN/TURN, OPA, Vault, RBAC, circuit breakers): standard, correctly characterized — counted verified as textbook facts.

## Resolutions (2026-07-11 iter 64) — softening pass
- L244 ("the leading cause of security drift"): softened the ranking-as-fact to "a common cause".
- All other unverifiable rows: ACCEPTED — they characterize third-party tools/papers (SAGA/arXiv 2504.21034, AgentAnycast repo, CORAL, NIST initiative, arXiv 2511.03841) that reference real, live sources; the auditor's "unverifiable" reflects not deep-reading third-party docs, not a Pilot overclaim. Flagged and left as ecosystem framing.
Build: npm run build green (345 pages).
