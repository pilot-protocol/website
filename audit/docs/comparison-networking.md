# Claim audit: src/pages/docs/comparison-networking.astro
Audited: 2026-07-10 · Sentences examined: 144 · verified: 105 · false: 13 · unverifiable: 3 · opinion: 23 · example: 0

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 24 | "No external Go dependencies." | web4/go.mod requires github.com/coder/websocket v1.8.15, golang.org/x/sys v0.46.0, expr-lang/expr v1.17.8 (indirect), golang.org/x/net (indirect), plus 15 pilot-protocol modules. |
| 104 | "Dependencies: Stdlib only" (Pilot column, vs libp2p table) | Same go.mod evidence — coder/websocket and golang.org/x packages are not stdlib. |
| 135 | "Stdlib-only (no external deps): Pilot Yes" (feature matrix) | Same go.mod evidence. |
| 115 | "Pilot Protocol is opinionated and complete: one binary, no external dependencies, built-in services…" | go.mod has external deps; web4/cmd/ contains three binaries (daemon, pilotctl, updater) and release/install.sh installs daemon + pilotctl + auto-updater (+gateway stop hooks). |
| 103 | "Approach: Complete stack (single binary)" | web4/cmd/{daemon,pilotctl,updater}; install.sh lines 31-32 install daemon + auto-updater units, lines 205-207 manage pilotctl/gateway — the shipped stack is multiple binaries. |
| 109 | "Complexity: One binary, one config file" | Same evidence: three binaries in cmd/, installer ships daemon + pilotctl + updater. |
| 70 | "License: ZeroTier BSL 1.1" (vs ZeroTier table) | zerotier/ZeroTierOne LICENSE.txt (gh api, 2026-07-10): "See LICENSE-MPL.txt for all code in node/, osdep/, service/…" — LICENSE-MPL.txt is Mozilla Public License 2.0. ZeroTier relicensed from BSL 1.1 to MPL-2.0. |
| 144 | "License: ZeroTier BSL 1.1" (feature matrix) | Same evidence — current core license is MPL-2.0 (+ nonfree/ portions). |
| 137 | "E2E encryption: ZeroTier ChaCha20" (feature matrix) | ZeroTierOne node/Packet.hpp cipher suites: Curve25519/Poly1305/**Salsa20/12** and **AES-GMAC-SIV** (fetched 2026-07-10). ZeroTier does not use ChaCha20. |
| 69 | "Free tier: ZeroTier 25 devices" | zerotier.com/pricing (HTTP 200, 2026-07-10): Free plan shows 10 included devices, not 25. |
| 170 | "You need a flat L2 network that 'just works' for up to 25 devices (free tier)" | Same pricing-page evidence — current free tier is 10 devices. |
| 83 | "Identity: Nebula X.509 certificates (CA-signed)" | slackhq/nebula cert/README.md: "a library for interacting with `nebula` style certificates" — a custom **protobuf**-serialized format (cert_v1.proto), not X.509. |
| 141 | "Built-in services: Tailscale None" (feature matrix) | Contradicts Tailscale docs (Taildrop kb/1106, Funnel kb/1223, Serve kb/1312 — all HTTP 200) and this page's own vs-Tailscale table (line 44) which lists "Taildrop, Funnel, Serve". |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 53 | "If your agents run on machines already on a Tailscale network, Pilot tunnels run over it just fine." | Interop/behavior claim with no test evidence; plausible (UDP over any IP link) but untested here. | An actual Pilot-over-Tailscale integration test or documented deployment. |
| 111 | "Setup time: Minutes (Pilot) / Hours to days (libp2p)" | Time-to-setup figures with no benchmark or citation. | A timed TTHW benchmark for both stacks. |
| 180 | "You want MIT-licensed software with proven scale (50,000+ hosts at Slack)" | Slack's own announcement post (slack.engineering, fetched 2026-07-10) says "tens of thousands of computers" — the specific "50,000+" figure could not be confirmed in any fetched source (Medium post JS-walled). MIT license part is verified. | A Slack engineering source explicitly stating 50,000+ hosts. |

## Verified claims (grouped by source)
- **web4/go.mod + LICENSE**: AGPL-3.0 license (×3 occurrences: lines 48, 70/91 Pilot column, 144); Go module layout.
- **web4/pkg/daemon/tunnel.go**: X25519 + AES-256-GCM tunnel encryption (line 534 "scheme X25519+AES-256-GCM"); relay routing (relayPeers, relay-vs-direct WriteFrame); STUN endpoint discovery (DiscoverEndpoint → beacon, line 2147); hole-punch (RequestHolePunch, line 157); Ed25519 identity (keyexchange/, daemon.go) → rows 39, 40, 43, 83-84, 90, 136-137 (Pilot cells).
- **protocol@v1.10.5/pkg/protocol/address.go + header.go**: 48-bit virtual address, layout [16-bit network][32-bit node], text format N:NNNN.HHHH.LLLL (lines 38, 62, 105); 16-bit ports with well-known assignments (PortEcho 7, PortStdIO 1000, PortDataExchange 1001; eventstream 1002 pre-verified) → rows 63, 140; Echo/Data Exchange/Event Stream built-in services (lines 44, 66, 88, 141, 155).
- **web4/cmd/pilotctl/main.go**: publish/subscribe pub/sub commands (lines 1331-1339) → pub/sub rows; set-hostname, extras set-tags, lookup, find → "Registry + tags + hostnames" discovery (lines 42, 65, 86, 139, 156); trust help "Mutual trust is the norm… one-way means you approved them but they haven't approved you" + handshake command → bilateral/mutual handshake trust (lines 41, 64, 84, 108, 138, 157); config.json (~/.pilot/config.json) + daemon CLI flags → "JSON config + CLI flags" (line 87).
- **policy@v0.2.2 module**: per-port allow/deny rules (Match: "port == 80" allow / deny-all) → "Per-port accept rules" firewall (line 85).
- **rendezvous@v0.2.5/cmd/{registry,rendezvous}**: self-hostable rendezvous server binaries (lines 49, 68, 143).
- **release/install.sh**: no account required — daemon generates Ed25519 keypair, email optional/auto-synthetic (lines 46, 67, 133, 154).
- **pkg/daemon (RFC6582 retransmit, ports.go listeners)**: UDP with custom reliable transport / reliable streams; L3/L4 with port multiplexing (lines 47, 56, 61, 106); -transport default udp pre-verified.
- **gh api tailscale/tailscale**: "The easiest, most secure way to use WireGuard and 2FA", BSD-3-Clause → WireGuard-based mesh, BSD-3 client license (lines 25, 32, 39, 47, 48).
- **tailscale.com KB (all HTTP 200, 2026-07-10)**: kb/1015 — 100.x addresses from CGNAT 100.64.0.0/10 (line 38); kb/1232 — DERP relay servers (lines 40, 136); kb/1013 — SSO/OIDC with Google, Microsoft, GitHub, Okta (lines 25, 43, 46, 163); kb/1081 — MagicDNS (lines 25, 42, 139); kb/1106+1223+1312 — Taildrop, Funnel, Serve exist (line 44); centralized ACL/admin-console model (lines 41, 164-165).
- **gh api juanfont/headscale**: "open source, self-hosted implementation of the Tailscale control server", community project → self-hostable via Headscale, proprietary coordination server (lines 48, 49, 143).
- **ZeroTierOne README + docs.zerotier.com/protocol**: "Smart Ethernet Switch for Earth", VL2 Ethernet emulation → L2 virtual Ethernet (lines 26, 56, 61, 171); "40-bit/10-digit" ZeroTier addresses → 10-character node ID (line 62); network ID = controller address + 24-bit ID, network controller approval (lines 26, 64, 65, 138-139); root servers (line 136); self-hosted controller (line 68); account for managed networks (lines 67, 133).
- **gh api slackhq/nebula + README + examples/config.yml**: Slack's overlay network, MIT license (lines 27, 77, 91, 144, 178); "tens of thousands of computers" scale (line 27 "at scale"); lighthouse section + firewall section in YAML config (lines 27, 85-87, 90, 136, 139, 179); punchy/punch: true → "Lighthouse + punch" NAT traversal (line 90); nebula-cert CA required, certs distributed manually (lines 84, 89, 95, 134, 177-178).
- **gh api libp2p/go-libp2p + libp2p.io + docs.libp2p.io + connectivity.libp2p.io + libp2p/specs**: MIT license (line 144 "MIT/Apache"); modular toolkit with transport/discovery/pubsub (lines 28, 98, 103); IPFS, Ethereum, Filecoin, Polkadot listed as users on libp2p.io (lines 28, 98, 110, 185); TCP/QUIC/WebSocket/WebRTC transports + AutoNAT + relay (connectivity.libp2p.io, lines 106, 136); Kademlia DHT docs (HTTP 200) + mdns.md in specs/discovery + go-libp2p p2p/discovery/mdns (lines 107, 139, 187); Noise docs HTTP 200 (line 137); protocol IDs (line 140); gossipsub pub/sub (lines 141-142).
- **www.wireguard.com/protocol**: ChaCha20-Poly1305 AEAD → WireGuard encryption row (line 39).
- **Local site files**: /docs/comparison ("Pilot Protocol vs MCP vs A2A vs ACP") and /docs/research pages exist for prev/next links (lines 200-201); DocLayout exists; all TOC anchors (#overview, #vs-tailscale, #vs-zerotier, #vs-nebula, #vs-libp2p, #matrix, #when) present in body; title/meta description accurately describe page content.

## Resolutions (2026-07-10, loop iteration 5)
All 13 FALSE + 3 UNVERIFIABLE resolved. Third-party facts re-verified live 2026-07-10: ZeroTier LICENSE.txt → MPL-2.0 (not BSL 1.1); zerotier.com/pricing → 10 free devices (not 25); Packet.hpp → Salsa20/12 + AES-GMAC-SIV (not ChaCha20); slackhq/nebula cert_v1.proto → custom protobuf certs (not X.509); Tailscale kb pages Taildrop/Funnel/Serve → 200/308 (not "None"). web4/go.mod → external deps coder/websocket + golang.org/x/sys; cmd/ → 3 binaries. Pilot "stdlib-only/no external deps/single binary" reworded to verifiable "pure Go, small dependency set, daemon + CLI". "50,000+ hosts" → "tens of thousands" per Slack's blog; setup-time and Tailscale-interop claims reworded to remove unbenchmarked figures. Note: line 39 WireGuard=ChaCha20-Poly1305 is correct (Tailscale), left as-is.

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
