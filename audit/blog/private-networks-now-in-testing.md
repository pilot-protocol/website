# Claim audit: src/pages/blog/private-networks-now-in-testing.astro
Audited: 2026-07-10 · Sentences examined: 40 · verified: 22 · false: 0 · unverifiable: 7 · opinion: 7 · example: 4

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 5 | "Private networks have been the most requested enterprise feature since Pilot Protocol launched." | No request-tracking source | Feature-request data |
| 13-33 | `pilot-admin` CLI session (create-network -name ... -join-rule token -node 685, add-node, list-members, remove-node, delete-network) | cmd/pilot-admin was removed from web4 (gitignored at web4/.gitignore:145; layers.yaml:122 says the extraction "has been removed"); underlying registry RPCs exist but the exact CLI flags cannot be checked against source today | Archived pilot-admin source at the post's date |
| 35 | "All operations persist to disk immediately." | Snapshot persistence exists (-store) but "immediately" per-operation not confirmed | Persistence write path in rendezvous |
| 61 | "nodes cannot leave backbone" | Network 0 is default/backbone per code comments, but an explicit leave-rejection for network 0 was not located | Registry leave-network handler |
| 95 | "Private networks are live on the production registry as of March 2026." | No live endpoint exposes network list; historical deployment state unverifiable | Registry operator confirmation |
| 95 | "We are testing network lifecycle operations under load and validating ... across all NAT configurations." | Internal process claim | Test artifacts |
| 97 | "private networks are in early access and we onboard teams directly" | Business-process claim | — |

## Verified claims (grouped by source)
- rendezvous/cmd/rendezvous/main.go:73: admin token gates network creation ("empty = creation disabled") — "no token, no mutation".
- rendezvous (server_membership_admin.go, membership/, web4/tests/zz_admin_cli_test.go): registry supports full network lifecycle — CreateNetwork, JoinNetwork/add, ListNetworks/members, remove, DeleteNetwork; delete cleans member references (membership tests).
- web4/cmd/pilotctl/main.go:6946: three join rules `open|token|invite`; token set at creation (`--token`); semantics of each rule match the usage/help text.
- web4/pkg/daemon/daemon.go:2913: same-network peers get registry trust fallback ("covers admin-set trust pairs + shared networks") — auto-trust at resolve + SYN acceptance.
- web4/cmd/pilotctl/main.go (network list output): "member counts hidden — admin only" — scoped listing / no backbone enumeration for outsiders.
- web4 code comments (network_events.go:35, daemon.go:4341,5619): network 0 is the default/backbone every node holds — backbone auto-enrollment; backbone address is the canonical identifier (protocol module address format `0:0000.XXXX.XXXX`, 32-bit node ID = pre-verified header format).
- web4/cmd/daemon/main.go:94: `-networks` comma-separated auto-join flag — Phase 2 "daemon auto-joins configured networks" description matches the shipped flag.
- Local site files: /plans (src/pages/plans.astro), /blog/enterprise-private-networks-roadmap, banner webp all exist.
- EXAMPLE (not flagged): list-members output table (node IDs 685/686, addresses, real addrs), $TOKEN/join-secret placeholders.
- OPINION/roadmap intent (not flagged): Phase 2/3 plans, self-service design, policy engine microsegmentation pitch, "honest look" framing.
