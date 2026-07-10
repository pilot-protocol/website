# Claim audit: src/pages/blog/overlay-networking-automation-secure-ai-agent-solutions.astro
Audited: 2026-07-10 · Sentences examined: 76 · verified: 47 · false: 0 · unverifiable: 12 · opinion: 12 · example: 5

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 68 / 234 | "Cilium offers best L4 performance; Istio Ambient delivers advanced L7 mesh capabilities but adds latency" (Key Takeaways + FAQ repeat) | Third-party benchmark claim; cited page (platformengineeringplaybook.com, 200) content not confirmed to state this | Fetch and match the cited benchmark text |
| 72 / 166 / 186 / 234 | "GUE tunneling with authorization keys enables … policy enforcement … adding less than 1ms of latency" (repeated in table "Under 1ms" and FAQ) | Latency figure from arxiv.org/html/2510.04052v1 (200) not content-verified; no local benchmark | Read the arXiv paper's measured latency |
| 95 | ONUG: "agentic AI overlays treat autonomous AI agents as first-class network citizens with standardized identity, zero-trust routing, and A2A protocols" | Attributed quote; link live (200) but page text not matched | Fetch onug.net article body |
| 103 | "Kubernetes CNIs like Cilium (eBPF), Calico (BGP), and Flannel (VXLAN) provide overlay networking at the pod level…" per cited comparison | Technologies/mechanisms are common knowledge, but the source-attribution not content-checked | Fetch cited page |
| 178-200 | Security-mechanism table latency rows ("mTLS Low", "IPSec Medium", "VXLAN Very low") | No benchmark source given for relative latency ratings | Cited measurements |
| 208 | "Service mesh sidecars can double CPU and memory consumption" | Quantified vendor-behavior claim, no source | Benchmark citation |
| 218 | "A conflict that is harmless at 10 agents becomes a production outage at 200" | Illustrative quantified assertion, no source | Incident data |
| 229 | "Pilot Protocol wraps your existing HTTP, gRPC, and SSH traffic inside its overlay" | HTTP/TCP mapping exists (gateway map), but gRPC and SSH wrapping specifically not confirmed in source | Gateway docs/tests showing gRPC/SSH flows |
| 25-26 | JSON-LD articleBody/description "compare top tools like Cilium and Istio…" | Meta framing of the above unverified comparisons | Same as above |
| 42 | "The gap between legacy networking and what modern agentic systems actually require is wider than most teams realize" | Survey-style claim about teams | Survey data |
| 96 | "Intent-driven overlays … enforce that intent automatically, even as agents scale or move" | Vendor-category behavior claim, no named implementation verified | Product docs |
| 222 | "retrofitting a coherent identity and authorization model is painful and slow" | Experiential claim ("in our experience"), unmeasurable | — |

## Verified claims (grouped by source)
- Live URLs (HTTP 200): onug.net article, platformengineeringplaybook.com showdown, arxiv.org/html/2510.04052v1, repost.aws CIDR-overlap article, all 3 supabase images, pilotprotocol.network
- Local site (src/pages/blog/**): all 9 internal blog links exist (ai-networking-terminology…, secure-ai-agent-communication-zero-trust, multi-agent-system-networking-guide…, advanced-network-automation-tips…, secure-network-infrastructure…, decentralized-communication-protocols…, ai-networking-challenges…, encrypted-tunnel-advantages…, decentralized-networking-p2p-solutions…); banner .jpg exists
- Common networking knowledge / RFC-level facts: overlay = virtual network over underlay; Cilium=eBPF, Calico=BGP, Flannel=VXLAN; Istio mTLS; Docker default bridge 172.17.0.0/16 (also repost.aws source); Kubernetes NetworkPolicy is cluster-scoped
- web4 source + pre-verified: Pilot Protocol provides encrypted P2P tunnels (tunnel.go:534), persistent virtual addresses (docs/comparison-networking.astro), NAT traversal (pkg/daemon), mutual trust handshake (handshake module), SDKs for Python and Go (pre-verified repos sdk-python + Go module), unified CLI pilotctl, no centralized broker

OPINION (not flagged): "Pro Tip" advice, "Governance is not [easy]", "Speed is easy to optimize later", "simpler overlay with strong governance beats a feature-rich one", checklist best-practice imperatives, "do it right".
EXAMPLE: 10 vs 200 agents scenario framing, table archetypes.

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
