# Claim audit: src/pages/blog/secure-research-collaboration-share-models-not-data.astro
Audited: 2026-07-10 · Sentences examined: 110 · verified: 72 · false: 4 · unverifiable: 5 · opinion: 5 · example: 24

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 83 | Terminal: "$ ls ~/pilot-received/" | Received files land in ~/.pilot/received/ — web4 cmd/pilotctl/main.go:1244 "List files received via send-file (~/.pilot/received/)" and main.go:6175. The directory ~/pilot-received/ does not exist in the product. |
| 133 | Script arg: "--remote", f"~/pilot-received/local-round-{round_num}.pt" | Same as above — wrong receive directory (~/.pilot/received/), and send-file preserves the sender's filename (round-3-weights.pt in the earlier example vs local-round-N.pt here is also inconsistent). |
| 163 | Untrust output: "Peer notified" | web4 cmd/pilotctl/main.go untrust help text: "This does not notify the remote node — they will see connection failures on their next attempt to reach you." |
| 179 | "The encryption is mandatory -- there is no way to disable it." | Daemon exposes a --no-encrypt flag: main.go:1022 "--no-encrypt  disable tunnel encryption"; main.go:2643 `encrypt := !flagBool(flags, "no-encrypt")`. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 211 | "This has been tested with gradient exchange... Two nodes on different continents... every 30 seconds... latency overhead...approximately 5-15ms per transfer" | Presented as a real measurement; no benchmark artifact or source available | A published/reproducible benchmark log |
| 24 | Researcher quote: "Getting a VPN approved took four months and required three meetings with two security committees." | Anonymous, uncited quotation | A citation to the forum/interview it came from |
| 156 | "either party runs pilotctl untrust and the connection is severed within milliseconds" | Timing claim with no measurement; untrust exists but teardown latency unbenchmarked | A measured revocation-latency test |
| 151/155 | "the justification is signed and immutable" / "signed, cryptographically verifiable statement" (incl. line 66 "Ed25519 signatures of both parties, and the timestamp") | Handshake requests carry a justification (daemon.go:5834) and node identities are Ed25519, but a signature specifically over the justification text could not be confirmed in source; `pilotctl pending` output does not show a "Signed by:...(verified)" line | Source showing the justification included in the signed handshake payload |
| 264 | "If the network goes offline, new connections cannot be established (existing tunnels continue to work)." | True for direct P2P tunnels, but beacon-relayed connections depend on live infrastructure; behavior during outage not confirmed | An outage test with direct vs relayed tunnels |

## Verified claims (grouped by source)
- web4 cmd/pilotctl/main.go: `init --hostname` (usage line 1465), `daemon start --email` (line 1469, cmd/daemon/main.go:70), `handshake <node> [justification]` (line 932), `pending` (returns node_id+justification, line 1074/2232), `approve` (1122), `untrust` (1107), `send-file` (1343), `subscribe <peer> <topic>` (1331), `publish <peer> <topic> --data` (1339), `set-public` (1180), set-tags under extras (pre-verified).
- web4 pkg/daemon/keyexchange/derive.go + tunnel.go: X25519 ECDH → HKDF → AES-GCM (AES-256-GCM claim, lines 64/179/294); Ed25519 identities in tunnel.go (line 180 mutual authentication).
- Pre-verified: well-known ports dataexchange 1001, eventstream 1002 (lines 93, 145, 253); live network 218K+ active nodes → "network supports thousands of agents" (line 215); registry public stats endpoint (polo.pilotprotocol.network/api/public-stats) exists (line 275).
- Local site files: public/research/social-structures.pdf exists; extracted text confirms OpenClaw, hub nodes, capability tags, connected-component analysis, metadata-only methodology (lines 273–279 and FAQ items); src/pages/docs/research.astro exists; linked blog slugs (zero-dependency-encryption-x25519-aes-gcm, nat-traversal-ai-agents-deep-dive, peer-to-peer-file-transfer-agents) exist; banner webp present; github.com/pilot-protocol/pilotprotocol repo exists (pre-verified).
- Regulations (RFC-class): HIPAA Security Rule §164.312(e)(1) transmission security, GDPR Art. 32(1)(a) encryption, Art. 7(3) withdrawal of consent, HIPAA Breach Notification Rule — all correctly cited; small-cohort aggregate data can be PHI (HIPAA de-identification standard).
- Industry knowledge: Hugging Face Hub model sharing norms; Databricks Delta Sharing protocol; FL frameworks Flower/PySyft/NVIDIA FLARE and Opacus (DP) are real and provide ML machinery not network infra; FL star-topology aggregation; DUA/MOU/IRB concepts.
- Example (not flagged): all terminal outputs, addresses 1:0001.0000.00xx, IRB #2026-0142, hostnames (johns-hopkins-trainer etc.), 142MB/4.2s/33.8 MB/s transfer figures, Python training script, layer-stack diagram, lab-a@university-a.edu emails.
- Opinion (not flagged): "This is better audit evidence than most VPN approval forms", "The honest pitch...", "Connect in minutes, not months".

## Resolutions (2026-07-11 iter 49)
- L83/L89/L133 (~/pilot-received/): received files land in ~/.pilot/received/ (main.go:1244,6175). Fixed all three occurrences.
- L163 ("Peer notified" on untrust): untrust does NOT notify the peer (untrust help). Corrected to "Peer not notified — it will see connection failures on its next attempt".
- L179 ("encryption is mandatory -- no way to disable it"): the daemon has a --no-encrypt flag (main.go:1022,2643). Reworded to "on by default; only turned off with --no-encrypt, so leave it on".
Build: npm run build green (345 pages).
