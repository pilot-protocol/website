# Claim audit: src/pages/blog/boarding-pilotagent-org-alternatives-3.astro
Audited: 2026-07-10 · Sentences examined: 88 · verified: 41 · false: 0 · unverifiable: 17 · opinion: 24 · example: 6

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 60 | "Private networks and enterprise features are paid with plans starting at $200 per month plus per agent fees..." | No pricing anywhere on the site: src/pages/plans.astro contains no dollar amounts; grep of src/ finds $200 only in this post | A published pricing page or contract terms |
| 157 | Table cell "Free core, paid plans from $200/month" | Same as above | Same |
| 92 | "Gopilot offers a Pro plan at $29 per month and a Team plan at $79 per month with a free trial" | gopilot.dev (HTTP 200) fetched; $29/$79 not found in served HTML (pricing likely JS-rendered) | Vendor pricing page rendered / archived snapshot |
| 164 | Table cell "Pro $29/month, Team $79/month, free trial" | Same as above | Same |
| 67,73 | Gopilot "isolated VMs", "single API call", "persistent memory" | Vendor behavior claims; site mentions "isolated" but VM isolation/persistence not independently verifiable | Vendor docs / technical whitepaper |
| 89-90 | Gopilot real-world use case: "reduces average first response time and offloads repetitive tasks" | Hypothetical outcome presented as effect; no data | Case study with metrics |
| 135 | "The agent reduced manual processing time while keeping workflows auditable" (Lazarus finance use case) | No cited customer or data | A published case study |
| 137 | "Enterprise features or managed services are likely offered through custom arrangements..." | Speculation ("likely") about a third-party vendor | Vendor pricing/services page |
| 58 | "The result is lower transfer latency, fewer egress costs, and a private control plane" | No benchmark or cost analysis cited | Published latency/egress benchmark |
| 56 | "That combination produces low latency, direct paths between agents" | Latency claim with no benchmark on this page | Benchmark data |
| 184 | "Many alternatives to boarding.pilotagent.org are emerging in 2026, including decentralized networking solutions..." | Market-trend claim, no source | Market survey/citation |

## Verified claims (grouped by source)
- web4/cmd/pilotctl/main.go + pkg/daemon: virtual addressing, encrypted transport, NAT traversal (STUN in pkg/daemon/udpio, relay fallback per `peers` help "PATH=relay"), trust model/handshakes, DNS-style discovery (set-hostname/find/lookup), CLI tooling in Go.
- Pre-verified cheatsheet: Go SDK (common/driver) and Python SDK (sdk-python repo) exist → "CLI and SDKs for Go and Python"; open tooling (repos public).
- web4 gateway (extras gateway map, TCP port mapping): protocol-agnostic wrapping supports "HTTP, gRPC, SSH inside the overlay" (TCP encapsulation).
- Live HTTP checks 2026-07-10: gopilot.dev 200; openlazarus.ai 200; boarding.pilotagent.org 200; pilotprotocol.network links; all three Supabase blog images 200.
- openlazarus.ai (live GET): "open source", SOC 2, CCPA, ISO 27001, GDPR, governance all present on vendor site → Lazarus compliance-listing and open-source sentences (post itself says "lists compliance").
- gopilot.dev (live GET): multi-model support incl. Anthropic, Mistral; "isolated" wording present.
- Site files: canonical /blog/boarding-pilotagent-org-alternatives-3 matches file; banner public/blog/banners/boarding-pilotagent-org-alternatives-3.jpg exists; Recommended links (http-services-over-encrypted-overlay, a2a-agent-cards-over-pilot-tunnels, scriptorium-replace-agentic-active-research-ready-intelligence) all exist in src/pages/blog/; JSON-LD date/description match frontmatter.
- Opinion (not flagged): "leading", "gold standard", "perfect fit", comparison-table pros/cons phrasing, FAQ generic advice sentences.
