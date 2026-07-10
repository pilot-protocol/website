# Claim audit: src/pages/blog/smart-home-without-cloud-local-device-communication.astro
Audited: 2026-07-10 · Sentences examined: 112 · verified: 71 · false: 3 · unverifiable: 10 · opinion: 11 · example: 17

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 164–166 | "The automation engine can now discover it by capability: $ pilotctl peers --search \"smart-plug\"" (output shows tag match) | web4/cmd/pilotctl/main.go peers impl (~line 5395): `--search` filters ONLY by node ID substring (`nodeIDStr := fmt.Sprintf("%d", ...); strings.Contains(nodeIDStr, search)`); help text: "--search <query>  filter by node ID substring". Tags are never matched. |
| 174 | "The automation engine queries tags to find devices by function rather than by protocol or manufacturer." | Same evidence: no tag-query surface in `peers --search`; `find` looks up hostname only ("Look up a hostname in the registry and print its pilot address"). |
| 181–190 | "# Find all lights in the house / $ pilotctl peers --search \"lights\"" (and "security" variant) with tag-matched output | Same: peers --search cannot match tags; the shown output is impossible with current CLI. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 98 | "The Pilot daemon runs at approximately 10MB RSS idle." | No benchmark in repo | A published memory benchmark |
| 98 | "On a Raspberry Pi 4 with 4GB RAM, you could run 300+ device daemons simultaneously." | Extrapolation with no measurement | Load test on a Pi 4 |
| 26 | Home Assistant forum user quotes ("Why does HA try to phone Google…") | Quotes not sourced/linked; forum posts not located | Links to the specific HA forum threads |
| 26 | "When a Home Assistant user tries to add a Matter device, the system contacts Google's servers to complete the commissioning flow." | HA Matter commissioning verifies against the CSA DCL; the Google-servers specifics (Android Play Services path) not confirmable here | HA Matter integration docs/source |
| 30 | "One commenter captured the frustration precisely: '30 minutes logging into somebody else's website…'" | Unsourced quote | Link to the comment |
| 15 | "The CEO disappeared." (Insteon) | Anecdotal community reporting; not a confirmable fact | Contemporary news citation |
| 17 | "Four years of product development, gone." | Ambiguous, uncited figure (Wemo line is far older than 4 years) | Source defining the 4-year span |
| 136 | "The beacon is stateless -- it does not store data, it does not require authentication from relayed parties…" | Beacon internals not audited; not confirmed in available source | Beacon relay source review |
| 139 | "It can be replaced by any other beacon at any time… resumes the moment you point to a different beacon." | Beacon repointing behavior not verified | Daemon beacon-switch test |
| 168 | "Total time: under two minutes." | No timing measurement | Timed walkthrough |

## Verified claims (grouped by source)
- Pre-cutoff public record (knowledge): Belkin announced Wemo cloud shutdown effective Jan 2026 (announced mid-2025); Insteon ceased operations abruptly April 2022, servers offline, community group later acquired IP; Google Cloud IoT Core deprecated Aug 2023 with 12-month sunset and third-party migration guidance; Matter backed by CSA/Apple/Google/Amazon/Samsung, runs over Thread/Wi-Fi, uses Distributed Compliance Ledger and Device Attestation Certificates verified against CSA root of trust; Zigbee = IEEE 802.15.4, AES-128-CCM, 64-bit IEEE addresses, coordinator-based; Matter/Thread AES-128-CCM; MQTT TCP + optional TLS + username/password + ACLs.
- web4/cmd/pilotctl/main.go: `init --hostname` (line 1465), `daemon start --email` (lines 1003–1012), publish/subscribe/send-message/handshake/approve commands exist (pre-verified command list), `extras set-tags` (lines 1747–1749: set-tags lives under extras — article's `pilotctl extras set-tags` usage is correct).
- web4/pkg/daemon/tunnel.go:534 + daemon.go:82: encryption scheme "X25519+AES-256-GCM" — matches "X25519 + AES-256-GCM" claims and comparison-table row.
- web4/README.md:174 + pkg/daemon/daemon.go:2541: 48-bit virtual addresses in N:NNNN.HHHH.LLLL format — matches `1:0001.0000.0001` format and "permanent 48-bit virtual address".
- web4/cmd/daemon/main.go:389: identity at ~/.pilot/identity.json; Ed25519 identity (pkg/daemon/tunnel.go Ed25519 verify).
- Pre-verified cheatsheet: eventstream port 1002, dataexchange port 1001 (pub/sub on 1002, commands via 1001 claims); installer at https://pilotprotocol.network/install.sh live; NAT traversal STUN + hole-punch + beacon relay (registry/beacon architecture); repo github.com/pilot-protocol/pilotprotocol exists; Go single binary.
- peers help text (main.go): relay path adds ~50–150ms — consistent with "145ms RTT" relay example (example output anyway).
- Local site: internal links nat-traversal-ai-agents-deep-dive, zero-dependency-encryption-x25519-aes-gcm, build-multi-agent-network-five-minutes all exist in src/pages/blog/; banner webp exists in public/blog/banners/.
- Honest-limitations section (lines 199–204): consistent with source — no radio layer, no device drivers, Go daemon, no HA/Alexa integrations found in repo. Verified as accurate self-description.
- Example (not flagged): all terminal outputs (addresses, RTTs, byte counts, sensor readings), $5/month VPS, admin@home.local.

## Resolutions (2026-07-11 iter 51)
- L164-166/L181-190 (pilotctl peers --search matching tags): peers --search filters node-ID/hostname substring, never tags (main.go:5395). Reframed to function-named hostnames (the search does match those), fixed search terms to real hostname substrings ("plug"/"light"/"security-*"), and removed the impossible tag columns from the peers output.
- L174 ("queries tags to find devices by function"): reworded — set-tags stores metadata; peer search matches hostname/node-ID, so encode the function in the hostname. Heading updated to "Hostnames and Tags".
Build: npm run build green (345 pages).
