# Claim audit: src/pages/blog/clawhub-to-live-network-openclaw-discovery.astro
Audited: 2026-07-10 · Sentences examined: 70 · verified: 49 · false: 2 · unverifiable: 8 · opinion: 3 · example: 8

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 13 | "This places the SKILLS.md file in the agent's skill directory" | skillinject@v0.2.3/skillinject.go:184,401 — the file is `SKILL.md` (skills/<name>/SKILL.md), not SKILLS.md. |
| 55-57, 65 | `pilotctl peers --search "ml" --json` returning tag-matched agents; "Search results are returned from the registry, showing online agents with matching tags" | cmd/pilotctl/main.go peers help: `--search <query>  filter by node ID substring` — it filters connected peers by node ID, not registry tag search. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 39 | "Hostnames are unique within a network." | Uniqueness enforcement not confirmed in registry source | Registry code rejecting duplicate hostnames |
| 46 | "the most common tags were: python (43%), data-analysis (31%), ml (28%), web-search (24%), code-review (19%)" | No live data source; public-stats API has no tag breakdown | Registry tag statistics endpoint |
| 46 | "Most agents tagged themselves with 3-5 capabilities" | Same — no source | Same |
| 67, 104 | "The 77% of agents that remain private" / "Private agents (77% of the network)" | public-stats (curl 2026-07-10) exposes only active/total node counts, no public/private split | Registry stat exposing visibility split |
| 87 | "OpenClaw agents evaluate trust requests by examining the initiator's tags and stated purpose" | Third-party agent behavior claim | Observed OpenClaw policy code |
| 120 | "The daemon detects NAT type during STUN discovery and automatically uses the appropriate traversal strategy" | NAT-type classification step not confirmed in source | pkg/daemon STUN/NAT-classification code |
| 130-140 | "takes about 30 seconds" + timing table (~5s install, ~3s daemon, ~2s, ~1s, ~5s) | Presented as real timings, no measurement | Timed install benchmark |
| 116 | "Takes 1-2 seconds, then direct connection" (hole-punching) | Latency figure with no benchmark | Measurement |

## Verified claims (grouped by source)
- clawhub.ai API (live, 2026-07-10): skill slug `pilotprotocol` exists (389 downloads) — `clawhub install pilotprotocol` is a real package.
- web4 cmd/daemon/main.go: identity at ~/.pilot/identity.json (line 389); Ed25519 keypair (-identity flag, line 69); private by default (-public default false, line 85); -endpoint skips STUN for fixed public IPs (line 63); X25519-derived session encryption (line 65); -hostname flag.
- protocol@v1.10.5/pkg/protocol/address.go:12: 48-bit virtual address (2-byte network + 4-byte node); persists via identity file.
- protocol@v1.10.5/pkg/registry/client.go:45: registry connection is TCP.
- web4 pkg/daemon/daemon.go:1175,4871: relayed-handshake polling — handshake requests relayed via registry.
- cmd/pilotctl/main.go: set-hostname, extras set-tags (pre-verified), network members <id>, lookup (returns address/hostname/public key), handshake with optional [justification], pending/approve flow (target evaluates and accepts).
- cmd/pilotctl peers help: symmetric-NAT peers relay through beacon (+~50-150ms) — supports three-tier model (direct / hole-punch / beacon relay); pkg/daemon/tunnel.go:614 beacon used for hole-punching and relay.
- Pre-verified: beacon is the STUN server (UDP :9001); registry at :9000; github repo link.
- EXAMPLE items: addresses 1:0001.0B22.4E19 etc., hostnames ml-trainer-8, sample JSON output, 34.148.103.117:4000 endpoint.
