# Claim audit: src/pages/blog/ai-agent-discovery-process-p2p-networks.astro
Audited: 2026-07-10 · Sentences examined: 104 · verified: 66 · false: 3 · unverifiable: 14 · opinion: 16 · example: 5

## FLAGGED — FALSE
| Line | Sentence (quote, truncated) | Evidence it is false |
|---|---|---|
| 82 | "The discovery process is two-phase: agents announce capabilities via structured metadata using OASF taxonomies and Content Identifiers (CIDs)… retrieving records from DHT-mapped endpoints." (cites arxiv 2511.19113) | Fetched https://arxiv.org/html/2511.19113v1 (200, "Agent Discovery in Internet of Agents: Challenges and Solutions"): 0 occurrences of "OASF", no "content identifier"/"two-phase"/taxonomy framing; DHT appears once. The specific mechanism is misattributed to this paper. |
| 214 | "Pressure-field coordination solves 48.5% of complex scheduling scenarios, outperforming conversation-based methods by 4x and hierarchical methods by 30x." (cites arxiv 2603.03753) | Fetched https://arxiv.org/html/2603.03753v1 (200): no "48.5", "4x/4×", "30x/30×", or "pressure-field" anywhere in the paper. Figures do not come from the cited source. |
| 204 | "Pressure-field methods scale better in complex, high-agent-count scenarios." | Depends entirely on the fabricated 48.5%/4x/30x result above; "pressure-field coordination" does not appear in either cited arxiv paper. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 216 | Blockquote: "Risk-aware verification maintained network function up to 50% Sybil infiltration. No-verify approaches collapsed well before that threshold." | Presented as a verbatim quote; this sentence does not appear in arxiv 2603.03753 (the paper sweeps Sybil ratio α∈[0,0.5] and says risk-aware selection is "substantially more robust", but never this wording) | An actual quoted sentence from the paper |
| 84 | "Centralized registries like Google A2A broadcast or Prompts Plaza work well for small or ephemeral networks…" (cites medium.com/agentive-futures) | Medium URL returns 403 (bot-blocked); "Prompts Plaza" not confirmable elsewhere | Accessible copy of the article confirming both examples |
| 124/131/138 | OASF "is the current best option for interoperability" / "most discovery engines already support" it | Vendor/ecosystem adoption claim; no source fetched supports OASF adoption levels | OASF (AGNTCY) adoption documentation or survey |
| 113 | "Open-source OASF validators" as recommended schema validators | Existence of such validators not verified | Link to a specific validator repo |
| 130 | sonanceai.com link supports "semantic taxonomies in practice" | URL is live (200) but is a services-marketing page; relevance/claim support not established | A source actually about semantic capability taxonomies |
| 150 | "DHT records expire… re-announce… typically every few hours" | Interval is implementation-specific (Kademlia republish is commonly 1h/24h); "typically every few hours" has no cited source | Reference to a specific DHT implementation's TTL |
| 226 | "The teams we see struggle most are those who build fast, skip the trust layer… spend months untangling security incidents" | Anecdotal vendor claim, no data | Case studies |
| 227 | "The 50% Sybil robustness result is not a theoretical ceiling. It is a real signal about how quickly unverified networks degrade…" | Extrapolation beyond the cited paper's claims | Direct statement in the paper |
| 38/68/240 | "Risk-aware multi-factor checks… keeps your network functional even when Sybil infiltration reaches 50%" (TL;DR, table, FAQ repeats) | Cited paper shows robustness trends over α∈[0,0.5] for its own tiered-verification design, not a general guarantee for "multi-factor checks" | Precise restatement of the paper's result |

## Verified claims (grouped by source)
- arxiv 2603.03753v1 (fetched 200): paper is real, about agentic P2P networks; covers Sybil-style index poisoning, risk-aware/tiered verification, sweeps Sybil ratio up to 0.5, and finds risk-aware selection substantially more robust while naive trust degrades — supports the directional claims at lines 206, 214 (first clause "Risk-aware verification… remains robust up to a 50% Sybil ratio" — supported as tested range), 238.
- arxiv 2511.19113v1 (fetched 200): paper exists and is about agent discovery (announce + semantic query themes present) — supports the generic "two-phase announce/query" framing (lines 36, 42, 81, 236) even though the OASF/CID specifics are not in it.
- General networking ground truth: DHT and CID definitions (line 82 second half), Sybil attack definition (line 206), libp2p gossipsub exists (line 118), DHT put/get operations (lines 144, 165) — standard, correct.
- Local site files: all internal links exist in src/pages/blog/ (decentralized-communication-protocols-ai-developers, how-ai-agents-discover-each-other, autonomous-agent-networking-distributed-ai, direct-communication-protocols-ai-agents-guide, peer-to-peer-networking-examples-ai-engineers, encrypted-tunnel-advantages-peer-to-peer-ai-networks, cloud-networking-secure-peer-to-peer-distributed-ai, ai-networking-best-practices-secure-scalable-systems, ai-networking-challenges-decentralized-systems, decentralized-networking-p2p-solutions-ai-architectures, build-ai-agent-marketplace-discovery-reputation, federated-learning-p2p-communication) and /for/p2p exists; banner public/blog/banners/ai-agent-discovery-process-p2p-networks.jpg exists.
- Live URLs (curl 2026-07-10): all 4 supabase images 200; ontherice.org/AIOpportunities 200; aimsetwin.com article 200; sonanceai.com 200. medium.com link 403 (bot-block, likely alive).
- Pilot Protocol product claims (line 233: NAT traversal, encrypted tunnels, persistent virtual addresses, mutual trust establishment): verified against web4 pilotctl surface (handshake/trust/ping/map) and site docs — consistent with product.
- JSON-LD datePublished 2026-04-23 matches frontmatter date "April 23, 2026".
- OPINION (not flagged): "Solving it is not optional", "far less error-prone", Pro Tips, "Start building with confidence today", etc.
