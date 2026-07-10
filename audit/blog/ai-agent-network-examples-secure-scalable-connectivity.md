# Claim audit: src/pages/blog/ai-agent-network-examples-secure-scalable-connectivity.astro
Audited: 2026-07-10 · Sentences examined: 110 · verified: 62 · false: 1 · unverifiable: 20 · opinion: 22 · example: 5

## FLAGGED — FALSE
| Line | Sentence (quote, truncated) | Evidence it is false |
|---|---|---|
| 145 | "A2A uses Agent Cards and open protocols… backed by 150+ partners including Salesforce and SAP." (cites developers.googleblog.com A2A announcement) | Fetched the cited googleblog page (200): it says "50 technology partners" (grep confirmed "50 technology partners"; no "150" anywhere). The 150+ figure is misattributed to this source. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 73 | "It's adopted by hundreds of organizations for multi-cloud and regulated enterprise integration." | No source; cited googleblog says 50 partners | Linux Foundation / a2aproject membership count |
| 169, 228, 276 | "Ecosystem: 150+ partners" / "Yes, 150+ partner ecosystem" / "adopted by 150+ organizations" | Same 150+ figure, no accessible source confirms it (cited source says 50) | Current a2aproject.org partner count |
| 104, 115-128 | "AgentNet… achieving 85% on MATH, 32% on API-Bank, and 86% on BBH… beating no-evolution baselines" + benchmark table | github.com/zoe-yyx/AgentNet exists (gh api 200, NIPS2025 framework) but README.md on main returned 404/empty; numbers not confirmable from the cited repo page | The AgentNet paper's results table |
| 96 | "CrewAI's sequential execution drives high token and latency overhead. LangGraph and AutoGen scale more effectively. Swarm prioritizes speed but loses accuracy as task complexity grows." | aimultiple.com/multi-agent-frameworks is live (200) and benchmarks these frameworks, but its text attributes the sequential-overhead finding to LangChain's AgentExecutor, not CrewAI; per-framework verdicts as stated not confirmed | Exact per-framework results from the cited benchmark |
| 97 | "Byzantine tolerance in agent frameworks… rarely appears in vendor documentation but is critical" (cites arxiv 2511.03841) | arxiv 2511.03841v1 is live (200) but paper content vs claim not established; "rarely appears in vendor documentation" is a survey claim | Reading the paper + vendor-doc survey |
| 143 | Blockquote: "A2A enables a future where specialized agents from different vendors collaborate seamlessly, without tight coupling or proprietary lock-in." | Presented as a quote; not found verbatim in the fetched googleblog page (similar sentiment exists, wording differs) | Verbatim match in the source |
| 184, 274 | "ICP-hosted DeAI agents include LLM Canister… Anda Framework… Alice… DCA Agent" (+ FAQ "production DeAI agents") | Cited medium.com/dfinity post returns 403 (bot-blocked); agent list unconfirmed | Accessible DFINITY post or ICP docs |
| 188 | "Ethereum bridging: Agents can interact with Ethereum smart contracts natively" | ICP chain-key ECDSA integration is real in general, but "natively" claim not verified against a source here | DFINITY docs on chain-key/EVM RPC |
| 200 | "onchain compute is more expensive per operation" | Plausible but no benchmark cited | Cycle-cost comparison |
| 37, 68-69 | "AgentNet excels in adaptive reasoning… leads in performance for autonomous multi-agent math and orchestration tasks" | Depends on the unverifiable benchmark numbers above | AgentNet paper |

## Verified claims (grouped by source)
- developers.googleblog.com A2A announcement (fetched 200): Agent Card concept, open protocol, multi-vendor interoperability framing, Salesforce/SAP among partners — supports lines 141, 145 (Agent Card mechanism), 146 (A2A complements MCP: A2A agent↔agent, MCP agent↔tool — stated in Google's A2A materials).
- General knowledge, widely documented (Linux Foundation announcement, 2025-06-23): A2A is now under Linux Foundation governance (lines 145, 222, 276 governance clause).
- github.com/zoe-yyx/AgentNet (gh api, 200): repo exists; description "decentralized, RAG-enhanced multi-agent framework for LLMs with dynamic task routing and agent evolution" — supports lines 102-103 (dynamic DAG/RAG/adaptive framing).
- General ICP ground truth: canisters are smart-contract compute units with persistent memory and HTTP endpoints; deploy via DFINITY SDK (dfx) in Rust/Motoko; stable canister IDs; upgrades via controllers/governance (lines 183, 189-198) — standard ICP facts.
- Local site files: internal links all exist in src/pages/blog/ (ai-networking-challenges…, ai-networking-terminology…, secure-network-infrastructure…, autonomous-agent-networking…, a2a-agent-cards-over-pilot-tunnels, decentralized-communication…, multi-cloud-networking…, securing-ai-agent-networks…, ai-networking-best-practices…, network-tunnels-ai…); banner .jpg exists.
- Live URLs (curl 2026-07-10): both supabase images 200; aimultiple.com 200; arxiv 2511.03841 200; github AgentNet 200; googleblog 200. medium dfinity 403 (bot-block).
- web4 pilotctl surface + site docs: Pilot Protocol closing claims (line 267: encrypted P2P tunnels, persistent virtual addresses, NAT traversal, mutual trust across multi-cloud) consistent with product (handshake/trust/map/ping).
- Frontmatter note: JSON-LD datePublished 2026-04-19 vs frontmatter date "April 21, 2026" — minor internal inconsistency (not a factual claim to readers; noted, not flagged).
- OPINION (not flagged): "cuts through the noise", "genuinely compelling", "trade-off is real", practitioner's-take section, Pro Tips, "Getting started takes minutes, not weeks."
