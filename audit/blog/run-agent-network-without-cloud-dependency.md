# Claim audit: src/pages/blog/run-agent-network-without-cloud-dependency.astro
Audited: 2026-07-10 · Sentences examined: 86 · verified: 49 · false: 4 · unverifiable: 13 · opinion: 10 · example: 10

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 133 | Table: "Open source — Pilot Protocol: Yes (MIT license)" | `gh api repos/pilot-protocol/pilotprotocol` → license.spdx_id = "AGPL-3.0". web4/LICENSE = GNU AGPL v3. Not MIT. |
| 141 | Table: "Vendor lock-in — None (open source, MIT license)" | Same: AGPL-3.0, not MIT. |
| 189 | "The software is open source (MIT license)." | Same: AGPL-3.0, not MIT. |
| 168 | Heading "Step 4: Establish Trust Between Devices" (immediately after "Step 2"; and the section promises "use auto-approval rules" but shows only manual `pilotctl handshake` commands) | No Step 3 exists (numbering broken), and no auto-approval rule command is shown or exists under that name in the pilotctl surface. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 12 | "In January 2026, Belkin announced the end-of-life for Wemo's cloud services." | Belkin's Wemo EOL announcement was widely reported mid-2025 with a Jan-2026 effective date; the announcement date as stated can't be confirmed here | Belkin press release / support notice with date |
| 22 | "Google Cloud had a global networking outage in 2023." | No incident citation | GCP incident report link |
| 22 | "Azure had a 14-hour authentication outage in 2025." | No incident citation; post-cutoff event | Azure status history link |
| 22 | "During each of these events, millions of IoT devices became unresponsive" | Uncited magnitude claim | Vendor/analyst report |
| 26 | "Round-trip: 200-500ms. The same operation over a local connection: 2ms." | Presented as measured figures, no benchmark | Published measurement |
| 38 | Quote: "30 minutes logging into somebody else's website per device." | Unattributed user quote | Source thread link |
| 142 | Table: "Monthly cost at 1K devices — Cloud IoT $50-500/month" | Uncited pricing estimate | AWS/GCP/Azure IoT pricing calc |
| 57 | "The binary runs on Linux, macOS, and Windows." | release/install.sh supports linux/darwin only (lines 25, 267); PyPI calls Windows "experimental"; no Windows release artifact confirmed | Windows binary in a GitHub release |
| 156 | "Pilot compiles to a static binary for Linux (amd64, arm64, arm), macOS, and Windows." | install.sh builds only Linux/Darwin amd64/arm64; 32-bit arm and Windows artifacts unconfirmed | Release artifact list |
| 183 | "A rendezvous server is still needed ... but you can self-host it" | No registry/beacon server binary in web4/cmd (only daemon, pilotctl, updater) or the public repo; self-hosting path unconfirmed | Published registry server source/binary |
| 116 | "Existing connections continue working because the NAT mappings are maintained by keepalive probes" (during registry outage) | Keepalive flag exists (cmd/daemon/main.go:72) but outage-survival behavior not tested/confirmed | Documented failure-mode test |
| 117 | "when the network recovers, agents reconnect and re-register automatically" | Re-registration retry behavior not confirmed in source with available greps | Registry client reconnect code cite |
| 34 | "Peer-to-peer communication eliminates this entire category of risk" (GDPR/HIPAA compliance burden) | Legal/compliance generalization | — |

## Verified claims (grouped by source)
- Historical record (pre-cutoff, widely documented): Insteon ceased operations without warning April 2022, devices bricked overnight, no migration path; Google shut down Cloud IoT Core August 2023 with ~18 months notice (announced Feb 2022); AWS has had multiple multi-hour us-east-1 outages.
- web4/cmd/pilotctl/main.go: `pilotctl init --hostname` works with registry defaulting to 34.71.57.205:9000 (cmdInit line 1995-2000 — --registry not actually required despite usage text); `pilotctl daemon start` (dispatch 1670) forwards -email (cmd/daemon/main.go:70); `pilotctl find <hostname>` (usage 928); `pilotctl handshake <node> [justification]` (usage 932) matches "Fleet enrollment" examples; `pilotctl peers --search` (usage 939) + global --json matches the fleet loop; network subcommands.
- web4/cmd/daemon/main.go: Ed25519 identity persisted at ~/.pilot/identity.json (line 389); -encrypt X25519 + AES-256-GCM (line 65); local key generation, keepalive probes (line 72).
- Live: https://pilotprotocol.network/install.sh → HTTP 200; one-command curl|sh install matches release/install.sh.
- Pre-verified cheatsheet: encrypted UDP tunnels, registry = discovery only (not in data path), STUN/hole-punch/relay NAT traversal, trust state stored locally in ~/.pilot/, GitHub repo link.
- release/install.sh: no Docker/Kubernetes/Terraform required — single-script install confirmed.
- web4 source tree: cmd/pilotctl exists → `go build ./cmd/pilotctl` cross-compile example valid.
- MQTT general facts (protocol standard): broker always in data path, TLS-to-broker, no NAT traversal, username/password or cert auth, Mosquitto open source, MQTT is a standard (low lock-in).
- Local site files: internal links connect-ai-agents-behind-nat-without-vpn, private-agent-network-company, secure-ai-agent-communication-zero-trust, build-multi-agent-network-five-minutes all exist in src/pages/blog/.
- EXAMPLE: virtual addresses 1:0001.0000.000x, 7a2c...f819 key, 192.168.1.50:4000, sensor-N provisioning loops, example.com emails.
- OPINION: "rented, not owned", "design flaw", "phonebook not the phone network", "ownership principle", CTA copy.

## Resolutions (2026-07-11 iter 54)
- L133/L141/L189 ("MIT license"): the repo is AGPL-3.0 (gh api + web4/LICENSE). Corrected all three to AGPL-3.0.
- L168 (broken step numbering "Step 4" with no Step 3, and "auto-approval rules"): the deployment section had Step 1/2/4/5. Renumbered Step 4→3 and Step 5→4. Reworded the trust step to "script the handshakes (or enable the daemon's -trust-auto-approve flag)" since no "auto-approval rule" command exists.
Build: npm run build green (345 pages).
