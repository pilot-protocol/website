# Claim audit: src/pages/blog/network-security-for-multi-agent-systems-key-strategies.astro
Audited: 2026-07-10 · Sentences examined: 115 · verified: 70 · false: 1 · unverifiable: 12 · opinion: 30 · example: 2

## FLAGGED — FALSE
| Line | Sentence (quote, truncate >160 chars) | Evidence it is false |
|---|---|---|
| 181 | "Its Delegated Orchestration Engine (DOE) neutralizes certain replay and spoofing attacks with sub-second overhead..." | arXiv 2508.01332 abstract (fetched 2026-07-10) names it the **Defense** Orchestration Engine (DOE), not "Delegated". Sub-second overhead claim itself is in the abstract. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 92 | "Network-level risks... require dedicated benchmarks for Agent Communication Integrity (ACI) such as compromise rate and attack chain length." | No published "Agent Communication Integrity" benchmark framework found; no citation given. | A paper or standard defining ACI with these metrics. |
| 94 | "ACI is a measurement framework specifically designed for agent networks. It tracks how quickly a compromise spreads (compromise rate) and how many agents are affected before detection (chain length)." | Same as above — appears to be an invented framework name. | Citable source for ACI. |
| 41 | "Layered defensive architecture for multi-agent security requires visibility... pre-execution defense that inspects prompts, outputs, and tool calls..." (attributed to witness.ai) | witness.ai/blog/multi-agent-security/ returns HTTP 403 to curl; page content could not be checked. | Fetching the page in a browser and matching the claim. |
| 125 | "Layered defensive architecture must include pre-execution runtime defense that inspects prompts, outputs, and tool calls to prevent cascading compromises..." | Restates the witness.ai claim; source content unreachable (403). | Same. |
| 201 | "Research on cyberdefense multi-agent systems like cyberSPADE demonstrates that hierarchical architectures... produces measurably better security outcomes." | mdpi.com/2624-800X/6/1/28 returns HTTP 403 to curl; content not checked. | Browser fetch of the MDPI article confirming cyberSPADE + hierarchical claim. |
| 152-179 | Protocol comparison table rows (MCP auth "API key or OAuth", A2A "AgentCard identity", BlockA2A "DIDs + blockchain", Noise "ephemeral keys", plus auditability/attack-surface cells) | Generalized vendor/spec behavior claims with no cited spec sections; MCP/A2A cells plausible but unbenchmarked; "attack surface" cells are editorial. | Citations to each protocol spec / threat-model doc. |
| 184 | "Always verify AgentCard signatures against a known root." | A2A AgentCard signature-verification mechanics not confirmed against the A2A spec. | A2A spec section on AgentCard signing. |
| 197 | "It [AgentCard spoofing] is one of the most common A2A attack vectors..." | No survey or incident data cited. | Published A2A security study. |
| 248 | "RL-based attackers (DQN and Policy Gradient) paired with ML defenders (Random Forest and Autoencoder) produce measurably faster detection and response than static rule-based systems." | Components confirmed in the Nature paper, but "Policy Gradient attackers" appears only once in passing; paper's attackers use Deep Q-Network. Pairing framing partially supported only. | Closer read of paper methods section. |
| 264 | "The attacks that actually succeed against production MAS deployments do not break encryption." | No incident data cited. | Breach/incident reports for MAS deployments. |
| 265 | "Almost no one runs a full-network adversarial test..." | Survey claim, no source. | Industry survey. |
| 82 | "They can be compromised agents already inside your network, injected instructions riding legitimate message channels, or coordinated replay attacks..." (threat-model assertions throughout §1) | General threat assertions without cited taxonomy; plausible but unsourced. | Citation to a MAS threat-model paper (e.g., OWASP agentic threats). |

## Verified claims (grouped by source)
- arxiv.org/html/2408.00989v2 (fetched, HTTP 200): hierarchical lowest drop 23.6%, linear 46.4%, flat 49.8%, code-generation 39.6% — all figures and architecture mapping present in paper text; paper title "On the Resilience of LLM-Based Multi-Agent Collaboration with Faulty Agents".
- arxiv.org/abs/2508.01332 (fetched, HTTP 200): BlockA2A uses DIDs for authentication, blockchain for auditability, smart contracts for access control; DOE operates with "sub-second overhead" (abstract). Link resolves.
- nature.com/articles/s41598-026-45937-9 (fetched, HTTP 200): response times 4.2 s (small) / 5.6 s (medium) / 6.1 s (large); baselines 6.5–18.4 s (rule-based 6.5–9.5 s, static up to 18.4 s); Random Forest + Autoencoder defenders, DQN attackers, cyber-range setting — all in paper.
- Live URL checks: redis.io/blog/multi-agent-systems-coordinated-ai/ 200; blueprysm.com/security 200; witness.ai 403 (exists, bot-blocked); mdpi.com 403 (exists, bot-blocked).
- Local site files: all internal /blog/* links (securing-ai-agent-networks-multi-cloud-environments, peer-to-peer-networking-examples-ai-engineers, secure-network-infrastructure-ai-agents-practical-guide, secure-communication-protocols-distributed-ai-systems, decentralized-communication-protocols-ai-developers, direct-communication-protocols-ai-agents-guide, multi-agent-system-networking-guide-ai-developers, ai-agent-network-examples-secure-scalable-connectivity, peer-to-peer-file-transfer-agents, autonomous-agent-networking-distributed-ai, secure-ai-agent-communication-zero-trust, secure-ai-agent-networking-workflow-step-by-step, network-tunnels-ai-secure-communication-autonomous-agents) exist in src/pages/blog/; /for/p2p exists; banner public/blog/banners/network-security-for-multi-agent-systems-key-strategies.jpg exists.
- web4 product source: Pilot Protocol claim "encrypted peer-to-peer tunnels, mutual trust establishment, NAT traversal, persistent virtual addresses" matches pkg/daemon (tunnel.go, routing/beacon.go, trust surface in cmd/pilotctl/main.go).
- Self-consistent metadata: JSON-LD headline/description/date match frontmatter; meta description matches articleBody.
- OPINION (not flagged): marketing framing ("highest-leverage decisions", "uncomfortable truth", "Our strong recommendation", key-takeaways editorial cells, Pro Tips).

## Resolutions (2026-07-11 iter 60)
- L181 ("Delegated Orchestration Engine"): arXiv 2508.01332 names it the Defense Orchestration Engine (DOE). Corrected "Delegated" -> "Defense".
Build: npm run build green (345 pages).
