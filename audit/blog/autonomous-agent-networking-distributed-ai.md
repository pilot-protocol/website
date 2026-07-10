# Claim audit: src/pages/blog/autonomous-agent-networking-distributed-ai.astro
Audited: 2026-07-10 · Sentences examined: 100 · verified: 48 · false: 0 · unverifiable: 12 · opinion: 32 · example: 8

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 137 | "AgentNet uses DAG routing for task delegation" — cited openreview.net PDF returns HTTP 403 | Source PDF blocked; AgentNet claims cannot be checked | Reachable copy of the AgentNet paper |
| 137 | "AgentConnect ... using hubs that sign and relay messages between agents" | No source cited; AgentConnect project not confirmable | Link to AgentConnect spec/paper |
| 149,213 | "Performance drops sharply above 100 agents" (attributed to Frontiers in Blockchain article) | Cited Frontiers page fetched (200, 479KB) contains no "100 agents", "Byzantine", or "ossification" — the claims are not visibly supported by the cited source | Quote/section of the article containing these findings |
| 149,155-158 | "Byzantine faults, partial observability, non-stationarity ... protocol ossification" attributed to same source | Concepts are standard MAS literature, but attribution to the cited article unsupported (0 hits in fetched HTML) | Correct citation |
| 151,170-184,215 | "AgentNet achieves 92.86% on MATH compared to 77% for Synapse, and 94% test pass@1 versus 79%, with 30 average test cases versus 22" (+ table) | Source is the 403-blocked openreview PDF; numbers unverifiable | Reachable paper with these benchmark tables |
| 192,215 | "Evolutionary adaptation boosts performance 20-30% over static roles" (repeated) | No reachable source | Paper section with this figure |
| 198 | "Frontier LLMs perform well with 4 to 8 agents but degrade significantly at scale" | No source cited | Benchmark citation |
| 201,211 | "LLM-based agents break down at consensus beyond 16 nodes" / "LLM agents fail at 16+ nodes for consensus and leader election" | No source cited; specific hard ceiling unsupported | Study measuring LLM consensus by node count |
| 142 | "Centralized systems work well under 50 agents. Beyond that, orchestrator bottlenecks appear quickly." | Specific threshold with no source | Load-test data |

## Verified claims (grouped by source)
- Live URL curl (200): media.mit.edu/projects/mit-nanda/overview/ — page exists and describes "Decentralized AI ... foundational infrastructure for a true 'Internet of AI Agents'" with agents "transacting on our behalf"; supports the paraphrased NANDA definition (lines 42, 86, 209). frontiersin.org article URL live (200) — existence verified even though quoted findings were not found.
- Local src/pages/blog + public/research/ietf: internal hrefs (decentralized-networking-p2p-solutions-ai-architectures, decentralized-communication-protocols-ai-developers, ai-networking-challenges-decentralized-systems, secure-network-infrastructure-ai-agents-practical-guide, scaling-openclaw-fleets-thousands-agents, network-tunnels-ai-secure-communication-autonomous-agents, secure-communication-protocols-distributed-ai-systems, secure-ai-agent-communication-zero-trust, draft-teodor-pilot-problem-statement-01.html) all exist; banner jpg exists.
- Distributed-systems knowledge: centralized vs decentralized trade-off table (single point of failure, global observer, orchestrator bottleneck, consensus rounds) — standard, correct characterizations (lines 101-135); removing central coordinator eliminates SPOF / improves privacy (line 97); consensus needs multiple communication rounds and grows with fleet size (line 211).
- web4 source (pkg/daemon, cmd/pilotctl map/listen — generic TCP tunneling; X25519 handshake; STUN): line 206 claims (persistent virtual addresses, mutual trust establishment, direct encrypted P2P connections, wraps HTTP/gRPC/SSH via overlay port mapping) match implementation.
- Frontmatter/JSON-LD internal consistency: title/description/date (2026-04-11 = "April 11, 2026")/canonicalPath match.
