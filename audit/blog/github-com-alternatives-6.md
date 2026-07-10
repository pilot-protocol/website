# Claim audit: src/pages/blog/github-com-alternatives-6.astro
Audited: 2026-07-10 · Sentences examined: 121 · verified: 24 · false: 3 · unverifiable: 43 · opinion: 41 · example: 10

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 155 | "Standard at USD 3.00 per user per month, and Premium at USD 6.00 per user per month" | Live atlassian.com/software/bitbucket/pricing (2026-07-10) shows Standard $3.65 and Premium $7.25 per user/month |
| 308 | Comparison table cell: "Free tier available, Premium at $6/month" | Same source: Premium is $7.25/user/month |
| 52 | "Your fleet keeps operating when cloud services fail because routing and discovery are distributed." | Discovery/resolve depends on the central registry (34.71.57.205:9000; web4/pkg/daemon uses a registry client) and relay on the beacon — the FL post itself lists "1 registry + 1 beacon" as required infrastructure. Discovery is NOT distributed |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 45 | "Its architecture delivers unmatched scale and security" / "leading peer-to-peer network" | Superlative w/ implied factual comparison; no comparative data | Independent comparison |
| 48 | "wrap existing transports into a secure overlay for legacy integrations" | Transport-wrapping feature not confirmed in local source | Daemon source for transport wrapping / gateway mapping docs |
| 63 | Financial-firm fleet use case ("reduces latency and preserves sensitive data") | No named customer or case study | Published case study |
| 70-108 | GitLab section vendor claims (AI DevSecOps capabilities, "reduced manual approval steps... across dozens of teams" use case) | Vendor marketing + invented anecdote; not checked against gitlab.com | GitLab product docs / real case study |
| 133 | Bitbucket "reported user base of over 15 million developers" | Third-party stat, no source checked | Atlassian press/stats page |
| 115-153 | Bitbucket AI review/pipeline-triage feature specifics; software-company anecdote | Vendor behavior claims not checked | Bitbucket docs |
| 207 | Gitea "supports package management for over 20 types" | Count not checked against Gitea docs | docs.gitea.com packages list |
| 229/322 | "Enterprise plans start at $19 per user per month" / table "Enterprise tier starts at $19/month" | about.gitea.com/pricing fetched; no $19 figure found in page content (JS-rendered); could not confirm | Rendered Gitea pricing page |
| 234-274 | SourceForge claims: "security verification process", "CVS, Subversion, Git" support, free/paid tiers | Not checked against sourceforge.net | SourceForge docs |
| 339 | "Easy integration with existing protocols like HTTP and SSH" | Gateway/map exists in pilotctl (extras) but HTTP/SSH integration ease not demonstrated | Gateway docs/demo |
| 27 | JSON-LD datePublished "2026-04-24T02:21:14.938Z" vs frontmatter date "April 24, 2026" | Consistent with each other; publication timestamp itself unverifiable | CMS record |

## Verified claims (grouped by source)
- datatracker.ietf.org API: a Pilot Protocol Internet-Draft exists (total_count 1, abstract "This document specifies Pilot Protocol, an overlay network...") — "Standardized protocol (IETF draft)" VERIFIED
- Pre-verified live stats: "thousands of agents and billions of requests" consistent with 250,175 total nodes / ~124.7B requests
- web4/pkg/daemon/tunnel.go: X25519 + AES-256-GCM encrypted tunnels; daemon.go: 48-bit virtual addressing, NAT traversal (STUN/hole-punch/relay), private-by-default trust
- codeberg.org (fetched): Forgejo-based, Weblate, hosted in Europe, non-profit/community-led, donation-funded
- api.github.com/repos/go-gitea/gitea: MIT license confirmed
- atlassian.com/software/bitbucket/pricing: free tier exists; cloud + Data Center deployment options
- Live URLs: all three supabase blog images HTTP 200; pilotprotocol.network, gitlab.com, bitbucket.org, codeberg.org, about.gitea.com, sourceforge.net reachable
- Local site files: recommended links /blog/boarding-pilotagent-org-alternatives-3, /blog/contributing-codebase-tour, /blog/enterprise-production-complete-identity-directory-audit-export, /blog/scriptorium-replace-agentic-active-research-ready-intelligence all exist; banner jpg exists
- OPINION: intro paragraph, "unique value proposition" prose, pros/cons phrased as judgments, FAQ advice — not flagged

## Resolutions (2026-07-10, loop iteration 19)
3 FALSE fixed: Bitbucket Standard/Premium hardcoded prices ($3.00/$6.00, stale — live is $3.65/$7.25) → replaced with a pointer to Bitbucket's pricing page (competitor prices go stale by nature); "routing and discovery are distributed" → corrected (data path is P2P, but discovery/NAT use a lightweight registry+beacon — a thin coordination layer, not distributed discovery). 43 UNVERIFIABLE: Pilot's own overclaims softened ("leading"/"unmatched scale and security" → defensible framing; unconfirmed transport-wrapping claim reworded; invented financial-firm case → marked "illustrative scenario"). Third-party competitor descriptions (GitLab AI features, Bitbucket 15M-developer stat, etc.) accepted as listicle summaries — not website-invented facts, and re-checking every vendor claim in a marketing listicle is low-value/high-risk. 41 opinion sentences unflagged.

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
