# Claim audit: src/pages/blog/openanp-ai-alternatives-6.astro
Audited: 2026-07-10 · Sentences examined: 140 · verified: 55 · false: 1 · unverifiable: 34 · opinion: 48 · example: 2

## FLAGGED — FALSE
| Line | Sentence (quote, truncate >160 chars) | Evidence it is false |
|---|---|---|
| 279 | "Free tier available. Paid plans start at $5 per month for Pro and $10 per month for Team..." (AgentDM) | agentdm.ai homepage (fetched 2026-07-10, HTTP 200) states the service is "free during the user-adoption window"; no $5/$10 plans appear anywhere on the site. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 59 | "Fast response times at the network layer, milliseconds latency" | No published benchmark for Pilot Protocol latency. | Benchmark data / measured RTT publication. |
| 56 | "Decentralized and trustless agent communication: The architecture avoids single points of failure..." | Network relies on registry (34.71.57.205:9000) and beacon; "avoids single points of failure" is unbenchmarked marketing. | Architecture doc showing failover behavior. |
| 178 | "Hooble offers a free plan..., a Pro plan at $99 per month..., and custom enterprise plans..." | hooble.org homepage (200) shows no $99 pricing (only $1/$16 figures found). | Hooble pricing page showing these tiers. |
| 176 | Hooble use case: token rewards, stake slashing for underperformers | Behavior claims about a third-party tokenomics system; not on fetched homepage. | Hooble docs/whitepaper. |
| 183-229 | All OpenAgents claims: self-hosted multi-agent platform, Playwright web automation, persistent memory, custom domains/SSL/VPS, "Starter $29 / Team $49 / Business $99 per month", free self-hosting | https://openagents.us was unreachable (curl exit, no HTTP response) on 2026-07-10; nothing could be checked. | Site coming back online or archived snapshot. |
| 248 | "Strong reliability with 99.9% uptime and delivery guarantees" (AgentDM) | No uptime SLA found on agentdm.ai homepage. | AgentDM SLA/status page. |
| 237 | "AgentDM implements MCP and A2A protocols... protocol translation so agents speaking different standards can interoperate" | Homepage confirms MCP-native; no A2A or protocol-translation mention found. | AgentDM docs listing A2A support. |
| 238 | "The feature set includes Slack integration, real time streaming and push notifications..." | Slack integration not found on fetched homepage content. | AgentDM feature/docs page. |
| 103-149 | All "Agent Communication Protocol" section claims (standardization aims, target users, use cases) | Article itself admits the site is inaccessible; agentcommunicationprotocol.org indeed unreachable (curl no response) — so every substantive claim is speculation, as the text concedes ("may", "could", "likely"). | The site becoming reachable. |
| 82 | "Originating at Google and donated to the Linux Foundation" (A2A) | Widely reported and consistent with a2a-protocol.org (200), but attribution not re-verified against a primary announcement during this audit. | Google/Linux Foundation announcement fetch. |
| 352 | "Most of these alternatives offer free tiers or trial periods." | OpenAgents unreachable, Hooble free plan unconfirmed; only partially checkable. | Each vendor's pricing page. |
| 32 | Intro claims about "fresh ideas... options catching the eyes of users everywhere" and similar trend assertions | Generic ungrounded market claims. | N/A (rewrite as opinion). |

## Verified claims (grouped by source)
- web4 product source + pre-verified stats: Pilot Protocol P2P encrypted tunnels, automated discovery/routing, trust establishment (pkg/daemon/tunnel.go, routing/beacon.go, cmd/pilotctl trust/handshake); "thousands of agents and billions of requests" — live stats (pre-verified 2026-07-10): active_nodes 218,560, requests ~124.7B; "350+ service agents" — overlay directory indexes ~436 service agents (pre-verified), so 350+ holds; "one line onboarding / no API key" — installer one-liner (release/install.sh) with no API key step.
- Local site files: "Pricing is not explicitly specified on the website" — src/pages/plans.astro has tiers but no dollar amounts (grep for $/month returned nothing); internal links github-com-alternatives-6, boarding-pilotagent-org-alternatives-3, ai-agent-network-examples-secure-scalable-connectivity exist in src/pages/blog/; banner public/blog/banners/openanp-ai-alternatives-6.jpg exists.
- a2a-protocol.org (HTTP 200): A2A is an open standard for agent interoperability; free and open source (spec publicly hosted).
- hooble.org (HTTP 200, fetched): no-code visual builder, validator-based ranking with multi-judge scoring, Ethereum-compatible L2 blockchain layer for agent metadata/scores — all present on homepage.
- agentdm.ai (HTTP 200, fetched): MCP-native agent-to-agent direct messaging, no SDK required, works with Claude Desktop/Cursor/Windsurf MCP clients — matches "built on the Model Context Protocol" and "No SDK required" claims.
- Live URL checks: openanp.ai 200; agentcommunicationprotocol.org unreachable (matches article's "page for this offering is inaccessible" — that specific claim VERIFIED).
- Self-consistent metadata: JSON-LD headline/description/date match frontmatter.
- OPINION (not flagged): all "Unique Value Proposition" superlatives ("unmatched foundation", "sophisticated buyers"), pros/cons editorializing, FAQ advice.
- EXAMPLE: hypothetical use-case narratives (financial services firm, fintech firm, security operations team) — illustrative scenarios, not presented as real customers.

## Resolutions (2026-07-10, loop iteration 26)
AgentDM pricing corrected (no $5/$10 plans; free during adoption window per agentdm.ai)

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
