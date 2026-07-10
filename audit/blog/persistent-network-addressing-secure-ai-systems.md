# Claim audit: src/pages/blog/persistent-network-addressing-secure-ai-systems.astro
Audited: 2026-07-10 · Sentences examined: 104 · verified: 55 · false: 1 · unverifiable: 5 · opinion: 41 · example: 2

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 27 vs 257 | JSON-LD "datePublished": "2026-04-20T11:37:49.908Z" vs frontmatter date="April 21, 2026" | Internal inconsistency in the same file: structured data says Apr 20, visible/meta date says Apr 21 |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 132 | "Some proposals like PRDO shift security responsibility to the provider level..." | "PRDO" is an uncited acronym; no draft/paper found or linked | Link to the actual proposal/draft |
| 134 | Block quote "Persistent addressing gives your infrastructure a stable identity layer..." | Unattributed quotation presented as an authority statement | Attribution to a named source |
| 214 | Block quote "Ephemeral addressing forces you to build systems that tolerate identity change..." | Unattributed quotation | Attribution |
| 229 | "Most teams struggle because they inherit network assumptions from web-app thinking." | Survey-style claim about "most teams" with no data | Survey/citation |
| 139 | Link https://repost.aws/knowledge-center/eks-resolve-cluster-ip-address-issues returned HTTP 403 to curl (bot-blocked) — the underlying claim (EKS/AKS lack native persistent pod addressing) is standard K8s behavior, but the cited page could not be fetched | Bot-blocking prevents confirmation of page content | Browser fetch of the repost.aws page |

## Verified claims (grouped by source)
- Live URLs (curl 200): all 4 Supabase images; https://datatracker.ietf.org/doc/html/draft-ietf-6lo-path-aware-semantic-addressing-11 → 200 (PASA is a real IETF 6lo draft; topology-in-IPv6-address / stateless forwarding matches the draft's stated design)
- Local site files: internal hrefs resolve — blog/{persistent-addresses-distributed-autonomous-systems, connect-agents-across-aws-gcp-azure-without-vpn, multi-cloud-networking-decentralized-ai-systems, decentralized-networking-p2p-solutions-ai-architectures, decentralized-communication-protocols-ai-developers, ai-networking-best-practices-secure-scalable-systems, advanced-network-automation-tips-secure-ai-systems, ai-networking-challenges-decentralized-systems, run-agent-network-without-cloud-dependency, network-tunnels-ai-secure-communication-autonomous-agents, ai-networking-terminology-a2a-mcp-anp-protocols}.astro all exist; public/research/ietf/draft-teodor-pilot-problem-statement-01.html exists; banner public/blog/banners/persistent-network-addressing-secure-ai-systems.jpg exists
- General Kubernetes/cloud knowledge: pod IPs ephemeral by default from cluster CIDR and recycled on termination; Services as stable layer; AWS Elastic IPs are node-level not pod-level; kube-vip adds HA complexity; CSMA/CD is MAC-layer, distinct from L3 addressing; en.wikipedia.org/wiki/IP_address is a valid target
- web4 source: "Pilot Protocol provides ... persistent virtual addresses, encrypted tunnels, NAT traversal, and mutual trust" — README.md:174, pkg/daemon/tunnel.go:534 (X25519+AES-256-GCM), handshake plugin, NAT traversal tests

Comparison-table qualitative ratings, Key Takeaways, "fresh perspective" section, and FAQ generalities classified OPINION; the two block quotes flagged above are the only quotes presented as authoritative.
