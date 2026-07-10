# Claim audit: src/pages/for/p2p.astro
Audited: 2026-07-10 · Sentences examined: 85 · verified: 52 · false: 9 · unverifiable: 6 · opinion: 11 · example: 7

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 8 | "No server in the data path." (meta description) | Relay fallback for symmetric NAT puts the beacon relay server in the data path: web4/pkg/daemon/tunnel.go:623 ("SetRelayPeer marks a peer as needing relay through the beacon"), tunnel.go:1957 (`Relay bool // true if using beacon relay`). The page's own tier 03 (line 137) admits relay fallback. True only for the direct tiers. |
| 27 | "The data path is fully peer-to-peer." (FAQ JSON-LD) | Same contradiction: symmetric-NAT peers exchange all data via the beacon relay (tunnel.go:623, 1957; maybeForceRelayOnRekey tunnel.go:312-323). |
| 27 | "…once agents find each other all data flows directly between them." (FAQ JSON-LD) | "All" is false for symmetric-NAT peers — their data flows through the encrypted relay, as line 137 of this very page states. |
| 42 | "No server in the data path." (lede) | Repeat of line-8 claim; same evidence (tunnel.go relay path). |
| 70 | "Encryption isn't optional - it's the default." | Encryption IS optional: `--no-encrypt  disable tunnel encryption` (pilotctl daemon start help, web4/cmd/pilotctl/main.go ~line 1026) and `-encrypt` flag default true in web4/cmd/daemon/main.go:65. Default-on, but disableable. |
| 111 | "Flow-control, CRC32, and encryption fit in it." (the 34-byte header) | Flow-control (Window, bytes 28-29) and CRC32 (bytes 30-33) are in the 34-byte header (protocol@v1.10.5 pkg/protocol/packet.go:10-23), but encryption does NOT fit in it: encrypted packets carry an extra envelope `[PILS][4-byte nodeID][12-byte nonce][ciphertext+16-byte GCM tag]` — ~36 additional bytes (web4/pkg/daemon/tunnel.go:1081, 1235, 1642). |
| 147 | "Three steps. Thirty seconds." | The page's own how-steps list (lines 176-179) has FOUR steps: 01 Install, 02 Start the daemon, 03 Trust, 04 Dial. |
| 176 | "One command. Single static binary, no dependencies." | Static (CGO_ENABLED=0) and dependency-free: yes (release/install.sh:441-447). But NOT a single binary — the installer builds/installs four: pilot-daemon, pilotctl, pilot-gateway, pilot-updater (install.sh:441-447). |
| 189 | "Go direct. No server in the data path." (CTA) | Third instance of the line-8 claim; same relay-fallback evidence. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 94-96 | "P50 40 ms — Cross-region direct tunnel latency, US-East to EU-West." | No published benchmark, methodology, or dataset anywhere in web4, website repo, or live endpoints. | A published bench report (regions, instance types, run date) or a reproducible `pilotctl bench` result artifact. |
| 99-101 | "LAN 4 ms — Same-subnet agent-to-agent RTT." | Same — no benchmark source. | Published LAN bench data. |
| 104-106 | "Loss 0.0003% — Packet loss under sustained 1 Gbps bench traffic, 24h internal run." | "Internal run" with no published artifact. (`pilotctl bench` itself DOES exist — pre-verified subcommand list — so it is reproducible in principle, but the specific figure is unverifiable.) | The internal run's output/log published, or an independent rerun. |
| 127 | "Works across most consumer and cloud NAT." | NAT-type prevalence statistic with no citation. | A cited NAT-behavior survey (e.g. measurement studies of full-cone prevalence). |
| 132 | "Sub-second to establish." (hole-punch) | Timing claim with no benchmark. | Published punch-establishment timing data. |
| 147 | "Thirty seconds." (time to up-and-running) | End-to-end onboarding duration; no measurement. | A timed install-to-first-tunnel run. |

## Verified claims (grouped by source)
- **protocol@v1.10.5 pkg/protocol/packet.go:10-23,158**: 34-byte wire header (packetHeaderSize = 34); Window field bytes 28-29 (flow control); CRC32 checksum bytes 30-33 (also checksum.go:5 `hash/crc32`).
- **web4/pkg/daemon/tunnel.go:534 + keyexchange/derive.go:21-60 + cmd/daemon/main.go:65**: X25519 Diffie-Hellman key exchange, AES-256-GCM authenticated encryption, encrypted by default (`-encrypt` default true) — covers meta description, FAQ #3, "End-to-end encrypted" card, "encrypted end-to-end" step, "Nothing in the middle can read your data" (E2E-derived key; relay forwards ciphertext envelopes tunnel.go:1081).
- **web4/pkg/daemon/daemon.go:96-97,749-791 + tunnel.go:614,681-685,623**: three traversal tiers — STUN public-endpoint discovery, beacon-coordinated hole-punching (RequestHolePunch), automatic encrypted relay fallback for symmetric NAT — covers FAQ #2, all three NAT-tier cards ("STUN discovers your public endpoint", "rendezvous coordinates a simultaneous hole-punch", "auto-falls-back to an encrypted relay", "relay forwards opaque packets"), "NAT traversal is automatic".
- **RFC 4787 NAT semantics**: full-cone dialable without punch; restricted-cone first-outbound-packet opens return path; classic hole-punch fails on symmetric NAT ("Hole-punching impossible" — consistent with source treating symmetric as relay-only, tunnel.go:1957).
- **web4/cmd/pilotctl/main.go:1003-1027 (daemon start help), :901 (--message), :2957-2962 (output), pre-verified subcommand list**: `pilotctl daemon start --hostname` exists; `pilotctl handshake` exists; `pilotctl connect <host> --message` exists; terminal output format "Daemon running (pid N) / Address: / Hostname:" matches actual Printf; `pilotctl bench` exists; config file is JSON not YAML ("No YAML"); address format `0:0000.XXXX.XXXX` matches real format (help example `0:0000.0000.400E`).
- **web4/cmd/pilotctl/main.go:702 (trust gate), pending/approve subcommands**: mutual handshake required before connection; "You decide who can reach you."
- **web4/pkg/daemon/daemon.go:92,2297,2369**: persisted Ed25519 identity → stable ("permanent") address across restarts and key rotation; registration ("Joins the network").
- **release/install.sh:441-447 + live curl**: https://pilotprotocol.network/install.sh → HTTP 200 (2026-07-10); CGO_ENABLED=0 static builds, no runtime dependencies — covers "One command install", "Install in one line", the curl one-liner, "no dependencies", "No Docker. No Kubernetes."
- **Live curl 2026-07-10**: https://vulturelabs.com → HTTP 200 (JSON-LD publisher URL).
- **Local site files**: /docs/getting-started, /docs/concepts, /blog/peer-to-peer-agent-communication-no-server all exist under src/pages — covers both CTA blocks and "Read the architecture" / "Read the deep dive" links.
- **Architecture (web4 source, absence of broker/gateway in data path; per-peer TunnelManager)**: "No API gateway", "No message broker", "Zero-hop data path" / "exact network RTT" (direct tier), "No message broker to scale / No gateway fleet to patch / only long-running service is the daemon" (user-operated services), "Each new peer adds one tunnel to whoever it talks to", "Connect by hostname", h1/title "Direct peer-to-peer for AI agents".

## Notes
- OPINION (not flagged): "Hub-and-spoke is a bottleneck", "Linear by construction", "There is no central fan-in limit", "The network grows with the agents, not around them", "No middleman, no middleman overhead", "Pilot stays out of the way", section eyebrows/labels.
- EXAMPLE (not flagged): terminal bar "agent@node ~ direct p2p / 0.8s", pid 24817, address 0:0000.A91F.7C2E, hostname agent-a, "✓ direct tunnel · 34ms · no relay", the two `#` comment lines.
