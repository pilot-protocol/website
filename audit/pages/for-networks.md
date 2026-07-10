# Claim audit: src/pages/for/networks.astro

Audited: 2026-07-10 · Sentences examined: 79 · verified: 65 · false: 5 · unverifiable: 5 · opinion: 4 · example: 0

## FLAGGED — FALSE

| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 8 | "30+ networks running on Pilot Protocol - each with its own membership rules, trust model, and purpose." (meta description) | Live production registry (34.71.57.205:9000, queried via `pilotctl network list --json` 2026-07-10) returns exactly **4** networks: 0 backbone (open), 6 pilot-main (invite), 8 ph-network (token), 10 my-network (token). configs/networks/SHIPPED.md claims 64 deployed, but the live agent-visible list contradicts it — and the page itself says the 30 interest networks are "Not live yet". |
| 88 | "30+ Networks. Each with its own rules." (H1) | Same evidence: live registry list_networks returns 4 networks total on 2026-07-10. |
| 131-133 | "A network where agents can only talk to service agents - never to each other." | configs/networks/data-exchange-policy.json rule `allow-text` permits port-1000 datagrams for **everyone** (no service tag required), and web4/tests/zz_data_exchange_policy_test.go states "Text messaging (port 1000) is allowed for everyone". Regular agents CAN message each other; only stream connect/dial and port-1001 file transfer are service-gated. "Never to each other" is contradicted by the policy it describes. |
| 142 | "+ 30 more networks visible only to agents." | The agent-visible view IS `list_networks` (registry server.go:5894 — "Anyone can list networks"), and it returns 4 networks total, not 32. There is no hidden per-agent list containing 30 more networks. |
| 124, 139 | Data Exchange card "Learn more →" links to /docs/networks#data-exchange | src/pages/docs/networks.astro has no `id="data-exchange"` anchor (anchors present: overview, vs-trust, permissions, backbone, join-rules, lifecycle, how-it-works, security). The page never mentions Data Exchange at all. Broken fragment link. |

## FLAGGED — UNVERIFIABLE

| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 124-140 | Data Exchange presented as a live Public network "Net #9" | Pre-verified cheatsheet says Backbone #0 + Data Exchange #9 are the public networks, and configs/networks/data-exchange-policy.json defines it — but the live registry's list_networks (2026-07-10) does **not** list any network with ID 9 (only 0, 6, 8, 10). Design existence is verified; live deployment could not be confirmed and is contradicted by the live list. | Registry list_networks returning ID 9, or `pilotctl network join 9` succeeding. |
| 149, 160 | "Coming soon" eyebrow badge + 30 "Soon" tile badges | Future roadmap promise with no citation; blueprints exist (configs/networks/*.json) and a deploy workflow is referenced in SHIPPED.md, but a launch commitment can't be confirmed. | The networks appearing in the live registry, or a dated public roadmap. |
| 153 | "Dedicated networks per vertical, seeded from the busiest specialist categories on the Backbone." | The 30 verticals match configs/networks/*.json blueprints 1:1, but the "busiest categories" ranking can't be checked: the list-agents directory agent (0:0000.0002.BBE4) was unreachable at audit time (dial timeout on port 1001), and no static source ranks category sizes. | list-agents category breakdown, or a directory snapshot with per-category agent counts. |
| 182 | "Currently early access - reach out to get one provisioned." | First-party business status; no external source. Provisioning machinery exists (pilotctl provision/provision-status/managed), but "early access" status is a company statement. | Public plans/pricing page stating the access tier, or the provisioning flow being gated in code. |
| 192 | "Private and enterprise deployments are being onboarded one by one." | Vendor onboarding-cadence claim; no verifiable source. | Customer count/CRM data — not available to this audit. |

## Verified claims (grouped by source)

- **Live registry 34.71.57.205:9000 (`pilotctl network list --json`, 2026-07-10)**: Backbone exists as network 0 named "backbone" with join_rule "open" (card L108-118: "Net #0", "Public" badge, "The default public network", "Open membership, no approval", "Open / Join rule"); token join rule is real and in use (L171 "token-gated joins"); interest networks are indeed "Not live yet" (L153).
- **protocol@v1.10.5 pkg/protocol/address.go:70** (`%d:%04X.%04X.%04X` — network, network, node-hi, node-lo): address patterns "0:0000.*" (L108) and "9:0009.*" (L126) are the correct prefixes for networks 0 and 9.
- **protocol@v1.10.5 pkg/registry/server.go**: backbone net 0 created by default with JoinRule "open" (L1008-1014) and bare node IDs resolve to backbone addresses (web4 cmd/pilotctl/main.go:773) — "Every agent starts on the Backbone / starts here" (L90, L113); join rules open/token/invite + network create/join/invite RPCs (L3525-3704, 4766) — "join curated networks with different membership rules... or spin up their own private network" (L91-92); registration never sets Public so nodes default private (handleRegister L2194ff, visibility only via handleSetVisibility L4373) — "Private by default" (L176); private nodes resolvable only via trust pair or shared non-backbone network (privacy check L5793-5815) — "Agents in a private network are invisible outside of it", "No cross-network discovery unless explicitly bridged" (L177); managed networks are a first-class registry concept (list handler `managed` flag L5920, audit "managed" L3642) — "Managed by us", "We spin up the network, you invite agents by token, and the swarm self-discovers" (L182); "shared commons where agents register, discover peers, and establish trust" (L114-115) — register/lookup/handshake RPC surface.
- **web4 pkg/daemon/daemon.go:2907-2924** ("Trust gate: private nodes only accept SYN from trusted or same-network peers"; "SYN rejected: untrusted source" + syn.rejected event): "SYN-level enforcement", "Trust rules apply at the connection handshake - not at the app layer", "A rejected agent never sees your data" (L186-187).
- **configs/networks/data-exchange-policy.json + web4 tests/zz_data_exchange_policy_test.go**: network name "data-exchange" (L129), join_rule "open" (L136 "Open / Join rule"), default-deny expr_policy gating connect/dial on the "service" tag (L137 "Service-only / Talk rule").
- **Pre-verified cheatsheet**: Data Exchange = network #9, public; service-agents = network 9 (L126-127 ID and Public badge — but see UNVERIFIABLE note on live deployment).
- **configs/networks/SHIPPED.md**: all 30 interest-tile names and descriptions (L36-65 → tiles L156-162) match the shipped open-data network table verbatim (checked programmatically, 30/30 exact match after trailing-period normalization); grid order matches SHIPPED.md order ("the grid below is the build order", L153).
- **Live https://polo.pilotprotocol.network/api/public-stats (200, 2026-07-10)**: active_nodes 218,558 — the dynamic "{backboneCount} Agents live" stat (L119) renders ~219K from active_nodes as the code intends.
- **Internal links (src/pages/**)**: /docs/getting-started (L95, L203), /docs/networks (L97), /docs/networks#backbone anchor exists at docs/networks.astro:93 (L106), /plans exists (L192 "See the plans").
- **curl (live URLs)**: canonical https://pilotprotocol.network/for/networks → 200 (L9); JSON-LD publisher url https://vulturelabs.com → 200 (L78); page title "Live Networks on Pilot Protocol" (L7) — live networks do exist (backbone).
- **dig MX pilotprotocol.network (Google MX present) + site-wide usage** (Footer, plans, privacy, cookies, publisher-agreement): founders@pilotprotocol.network contact mailto (L204).

## Notes

- The per-category counts in the frontmatter array (`count: 32` etc., L36-65) are **not rendered** anywhere in the template (only name, description, and "Soon" appear) and were therefore excluded from the audit.
- configs/networks/SHIPPED.md claims "All 64 first-class networks deployed... to the production registry at 34.71.57.205:9000", which the live registry contradicts (4 networks). The page's "Not live yet" hedge matches the live registry; the "30+" headline and "+30 more visible only to agents" match neither.
