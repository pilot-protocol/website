# Claim audit: src/pages/blog/advanced-network-automation-tips-secure-ai-systems.astro
Audited: 2026-07-10 · Sentences examined: 66 · verified: 50 · false: 2 · unverifiable: 4 · opinion: 10 · example: 0

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 182 | "NETCONF is 10x faster than MD-CLI and 11x faster than classic CLI" | Cited Nature article (s41598-026-40975-9, fetched 2026-07-10) states NETCONF is "3x faster than MD-CLI and 11x faster than CLI". The 10x MD-CLI figure contradicts the cited source. |
| 202-204 | Table row: MD-CLI relative speed "~10x" | Same source: NETCONF is only 3x faster than MD-CLI, implying MD-CLI ≈ 3.7x baseline, not ~10x. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 67, 225, 227 | "ML-enabled remediation pipelines cut fault resolution time by over 70 percent" / "reduce MTTR by 72% … not theoretical … production deployments" | Cited theroutingintent.com page is JS-rendered; content not retrievable via curl; no other source | Readable article text or a named production study showing the 72% figure |
| 163-177 | NSoT metrics table: drift "High → Near zero", audit prep "Days → Hours", change success "~70% → 95%+" | No citation; numbers appear invented | Any named study or vendor benchmark |
| 79-82 | "How many agents will the network support in 12 months?" et al. framing implies quantifiable targets | Rhetorical planning criteria — fine — but the implied metric baselines have no source (counted with table above) | n/a |
| 260 | Recommended link title "Multi-agent system networking guide: 86.7% failure fix" | 86.7% statistic not verifiable from this page (belongs to linked post's own audit) | Audit of the linked post's cited source |

## Verified claims (grouped by source)
- Nature s41598-026-40975-9 (HTTP 200, text fetched): "automated topology creation … 4.5 times faster than manual" and "11x faster than CLI" — both match the article verbatim.
- arXiv 2510.16144 (HTTP 200): title "Agentic AI for Ultra-Modern Networks: Multi-Agent Framework for RAN Autonomy and Assurance" — supports the multi-agent RAN autonomy sentence at line 84.
- Live URLs (all HTTP 200, checked 2026-07-10): netodata.io ×2, ductus.global blueprint, purestorage.com IBN page, theroutingintent.com (status only), all three supabase image URLs.
- web4 source / protocol module: Pilot capabilities paragraph (line 243) — persistent virtual addresses (protocol address.go), encrypted p2p tunnels (keyexchange/derive.go X25519+AES-256-GCM), NAT traversal (daemon.go STUN/relay), no centralized brokers (p2p tunnel architecture); arbitrary TCP (gRPC/HTTP/SSH) tunneling via pilotctl map/connect (main.go command list, pre-verified).
- Local site files: internal hrefs (multi-agent-system-networking-guide-ai-developers, build-multi-agent-network-five-minutes, multi-agent-pipelines-openclaw-encrypted-tunnels, secure-ai-agent-communication-zero-trust, private-agent-network-company, cross-company-agent-collaboration-without-shared-infrastructure, why-ai-agents-need-network-stack) all exist in src/pages/blog; banner .jpg exists in public/blog/banners.
- General/uncontroversial tool facts (Ansible config mgmt/agentless, Terraform declarative provisioning, Nornir Python-native, Nautobot NSoT, NetBox NSoT, gRPC bidirectional streaming + strong typing, MLS n/a here): standard vendor documentation, treated as verified general knowledge.
- Frontmatter/JSON-LD dates consistent (2026-03-29 both).
- Advice/opinion sentences (modular scripts, parameterization, dry-run, "decision fatigue", IBN framing quotes) counted as OPINION.
