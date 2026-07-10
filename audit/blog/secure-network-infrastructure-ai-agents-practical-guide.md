# Claim audit: src/pages/blog/secure-network-infrastructure-ai-agents-practical-guide.astro
Audited: 2026-07-10 · Sentences examined: 90 · verified: 71 · false: 0 · unverifiable: 6 · opinion: 11 · example: 2

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 39/208 | Heading/claim "Lessons from 3 years in production" | No evidence of 3 years of production agent-network operation; Pilot Protocol and A2A are far younger than 3 years of documented production history | Named deployments or dated production postmortems |
| 88/226 | "Benchmarks like AGENTSNET test coordination between agents but do not evaluate the underlying network infrastructure at all." | Cited openreview.net PDF returns 403 to automated fetch; paper content unconfirmed | Fetching the AGENTSNET paper and confirming its scope |
| 148/164 | "Store-and-forward solutions like Indigo Mesh queue messages and deliver them when the connection restores." | "Indigo Mesh" — no citation given and no product could be confirmed with available tools | A link to the Indigo Mesh project/repo |
| 149/169 | "AgenticConnect circuit breakers prevent cascading failures by isolating the fault and rerouting tasks." | Repo agentralabs/agentic-connect exists (gh api, desc: "Universal external interface engine for AI agents...Intelligent Retry, Encrypted Vault") but a circuit-breaker feature is not confirmed | Repo README/docs showing circuit-breaker functionality |
| 207 | "Importantly, there are no established benchmarks for decentralized AI agent network performance." | Absence claim; cannot be proven with available tools | A literature survey confirming no such benchmark exists |
| 220 | "It is adopted by over 150 partners and is the most mature option..." (superlative part) | "Most mature option" is a comparative claim without a maturity survey; the 150+ figure itself is supported by the cited source (see verified) | Independent protocol-maturity comparison |

## Verified claims (grouped by source)
- developers.googleblog.com A2A announcement (HTTP 200): A2A protocol exists, built on HTTP/JSON-RPC, Agent Cards, task lifecycle (submitted/working/completed/failed), enterprise interoperability standard.
- rywalker.com/research/anp-agent-network-protocol (HTTP 200, content fetched): page states "150+ organizations and production SDKs" — supports the "150+ production partners" figure at lines 93, 129, 210, 220; also ANP open/decentralized, early-stage positioning.
- gh api: github.com/agentralabs/agentic-connect exists (repo-existence for the link at line 149).
- Networking knowledge: mesh connection count grows quadratically; NAT blocks unsolicited inbound so P2P needs punch-through; VPN static config; mTLS baseline for regulated workloads; store-and-forward concept.
- Local site files: internal hrefs (why-ai-agents-need-network-stack, decentralized-communication-protocols-ai-developers, ai-networking-challenges-decentralized-systems, how-ai-agents-discover-each-other, secure-ai-agent-communication-zero-trust, connect-agents-across-aws-gcp-azure-without-vpn, hipaa-compliant-agent-communication, advanced-network-automation-tips-secure-ai-systems, scaling-openclaw-fleets-thousands-agents, + Recommended links) all exist in src/pages/blog/; /research/ietf/draft-teodor-pilot-problem-statement-01.html in public/; banner jpg present.
- web4 source / pre-verified: Pilot Protocol persistent virtual addresses, encrypted P2P tunnels, NAT traversal, mutual trust; Python SDK (pilot-protocol/sdk-python repo exists) and Go SDK (common/driver) — "CLI or Python/Go SDKs" (line 217).
- Supabase image URLs: HTTP 200.
- Opinion/marketing (not flagged): "That assumption is wrong", "Getting the infrastructure right...is not optional", pull quote, Pro Tips, "connect your first agents in under an hour", "Build for resilience...first".
