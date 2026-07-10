# Claim audit: src/pages/blog/ai-networking-challenges-decentralized-systems.astro
Audited: 2026-07-10 · Sentences examined: 118 · verified: 62 · false: 0 · unverifiable: 9 · opinion: 35 · example: 12

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 132 | "45.6% of organizations still use shared API keys, and non-human identities outnumber human identities 100 to 1" | Cites internal blog (circular); no primary survey source reachable | Link to the original survey (e.g. CSA/Astrix NHI report) containing both figures |
| 140 | "88% of networks are behind NAT" (repeated at line 337 FAQ) | No cited primary source; third-party stat | Citation to a measurement study (e.g. APNIC/RIPE NAT prevalence data) |
| 147 | "roughly 75% of NATs allow direct P2P via STUN and hole-punching. The remaining 25% ... require relay fallback" | Cites internal blog only; original figure (Ford/Srisuresh 2005 ~82%, Tailscale ~90%) varies by study | Primary hole-punching success-rate study citation |
| 148 | "Symmetric NAT affects roughly 1 in 4 connections in enterprise environments" | No source; enterprise-specific figure unsupported | Enterprise NAT-type survey data |
| 209 | "SDN reduces latency by 37% and congestion by 28% in multi-cloud deployments" | 37% and 48% appear on the cited NetworkWorld page, but "28%" does NOT appear anywhere in the fetched article (/tmp/nw.html, 0 hits) | The 28% congestion figure appearing in the cited article or another source |
| 249 | "token overhead on HTTP runs 15x higher than more efficient transports" | No benchmark or citation given | A published/reproducible benchmark of HTTP header overhead vs alternative |
| 256 | "SkyWalker deliver 1.74 to 6.3x lower time-to-first-token (TTFT) compared to standard Kubernetes load balancing" | Cited Databricks page (200, 715KB fetched) contains zero occurrences of "SkyWalker", "1.74", or "6.3" | The figures appearing in the cited Databricks/SREcon material |
| 107-123 | Discovery framework table ratings (A2A "Moderate/Low/High", ANS "Low/Moderate/Moderate", DIDs "High(aspirational)/High/Low") | Qualitative comparative ratings with no methodology or source | A published comparative evaluation |
| 171-197 | Protocol comparison table ratings (A2A/ANP/ACP/Matrix simplicity, P2P, censorship resistance, adoption) | Qualitative ratings, no source; adoption levels unmeasured | Adoption survey / published protocol comparison |

## Verified claims (grouped by source)
- Live URL curl (200): zylos.ai federation post (contains "No universal agent registry exists. A2A Agent Cards and ANS are competing approaches" and liability-chain discussion — supports lines 32, 85, 126, 134); zylos.ai protocols comparison (mentions ANP, Matrix — supports line 151-157 landscape); networkworld.com article (contains "100 Gbps", "48%", "37%" — lines 209 partially); databricks.com blog (URL live, 200).
- Local src/pages/blog + public/research/ietf: all 14 internal hrefs (secure-ai-agent-communication-zero-trust, how-ai-agents-discover-each-other, build-ai-agent-marketplace..., why-autonomous-agents-need-private-discovery, why-ai-agents-need-network-stack, trust-model-agents-invisible-by-default, connect-ai-agents-behind-nat-without-vpn, nat-traversal-ai-agents-deep-dive, cross-company-agent-collaboration..., connect-agents-across-aws-gcp-azure-without-vpn, advanced-network-automation-tips..., draft-teodor-pilot-problem-statement-01.html, draft-teodor-pilot-protocol-01.html) all exist; banner public/blog/banners/ai-networking-challenges-decentralized-systems.jpg exists.
- RFC/standard knowledge: NAT rewrites addresses breaking direct P2P; STUN discovers public IP/port (RFC 8489); UDP hole-punching via simultaneous outbound; relay fallback (TURN model); symmetric NAT + CGNAT defeat hole-punching; some firewalls block UDP (lines 140-147, 262-263, 333, 337).
- Math: N*(N-1)/2 quadratic connection growth (line 249) — correct combinatorics.
- web4 source (pkg/daemon: STUN in tunnel.go, X25519/AES-GCM key exchange, beacon relay): line 330 product claims (virtual addresses, encrypted tunnels, NAT traversal, trust establishment, no central broker) match implementation.
- Frontmatter/JSON-LD internal consistency: title, description, date (2026-03-30 vs "March 30, 2026"), canonicalPath match.
