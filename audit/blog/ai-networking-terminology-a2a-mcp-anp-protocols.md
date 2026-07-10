# Claim audit: src/pages/blog/ai-networking-terminology-a2a-mcp-anp-protocols.astro
Audited: 2026-07-10 · Sentences examined: 95 · verified: 55 · false: 0 · unverifiable: 6 · opinion: 27 · example: 7

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 188 | "Anemoi, a semi-centralized system, outperforms OWL, a decentralized alternative, on GAIA benchmarks in practical scenarios" | Not in the cited COMMA paper (arxiv 2410.07553v2); no source given for Anemoi/OWL/GAIA comparison | Citation to the Anemoi paper with GAIA scores |
| 187 | "SOTA models like GPT-4o fail agent-to-agent collaboration tasks at rates that would be unacceptable in production" | arXiv page (200) confirms COMMA benchmark + GPT-4o exist, but the "unacceptable in production" failure-rate characterization is an interpretation with no quoted figure | Specific failure rates quoted from the paper |
| 187,193,214,216 | "no public benchmarks currently exist for ANP or similar decentralized protocols" (repeated 4x) | A universal negative; cannot be confirmed with available tools | A survey confirming absence of ANP benchmarks |
| 117 | Medium link "MCP uses JSON-RPC over HTTP/SSE" — URL returns 403 | Cited Medium article blocked (HTTP 403); the technical claim itself matches the MCP spec (JSON-RPC 2.0, SSE transport) so content is fine, but the citation is unreachable | Medium URL returning 200 or citing modelcontextprotocol.io instead |
| 200 | "Together, they cover 90% of what most agent systems actually need" | Invented coverage statistic; no source | Any survey/measurement basis |
| 201 | "Watch ANP, HMP, and Coral closely ... The benchmark gaps are real, the infrastructure requirements are significant" | HMP and Coral existence/status as decentralized agent protocols could not be confirmed with available sources | Links to HMP and Coral project pages |

## Verified claims (grouped by source)
- Live URLs (curl 200): aihandbook.io/agentic-ai-handbook/google-a2a/, reputagent.com/protocols/anp, agentnetworkprotocol.com/en/ (ANP docs — DID-based, decentralized), digitalapplied.com A2A guide (OAuth/Agent Cards), rywalker.com ANP research, arxiv.org/html/2410.07553v2 (COMMA paper, mentions GPT-4o), ietf.org draft-dong-fantel-state-of-art-01.html (IETF analysis exists), linkedin.com Piyush Ranjan post.
- Spec/standard knowledge: A2A uses JSON-RPC over HTTP with OAuth and Agent Cards (Google A2A spec); Agent Card = JSON document describing capabilities/endpoints/auth; MCP = Anthropic Model Context Protocol, JSON-RPC over HTTP/SSE, solves N×M tool integration; ANP uses W3C DIDs + meta-protocol negotiation; prompt injection is MCP's primary documented risk vector (lines 74-76, 114-124, 137-155, 160-179, 208-212).
- Local src/pages/blog: internal hrefs (decentralized-communication-protocols-ai-developers, mcp-plus-pilot-tools-and-network, connecting-mcp-servers-across-agents, secure-ai-agent-communication-zero-trust, why-ai-agents-need-network-stack, benchmarking-http-vs-udp-overlay, multi-agent-system-networking-guide-ai-developers, ai-networking-challenges-decentralized-systems, cross-company-agent-collaboration-without-shared-infrastructure, a2a-agent-cards-over-pilot-tunnels) all exist; public/research/ietf/draft-teodor-pilot-protocol-01.html exists; banner jpg exists.
- web4 source: line 205 product claims (encrypted P2P tunnels, NAT traversal, virtual addressing, trust establishment, no central broker) match pkg/daemon implementation (X25519, AES-GCM, STUN, beacon hole-punching).
- Frontmatter/JSON-LD internal consistency: title/description/date (2026-04-01 = "April 1, 2026")/canonicalPath match.

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
