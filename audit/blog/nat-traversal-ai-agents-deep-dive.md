# Claim audit: src/pages/blog/nat-traversal-ai-agents-deep-dive.astro
Audited: 2026-07-10 · Sentences examined: 102 · verified: 52 · false: 8 · unverifiable: 12 · opinion: 8 · example: 22

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 12 | "RFC 3022 introduced Network Address Translation in 2001 as a stopgap for IPv4 address exhaustion." | NAT was introduced by RFC 1631 (May 1994). RFC 3022 (Jan 2001) obsoleted RFC 1631; it did not introduce NAT. |
| 119, 141, 148 | Beacon shown at "35.193.106.76:9001" and "Registered with rendezvous server at 35.193.106.76:9000" | Pre-verified ground truth: registry is 34.71.57.205:9000, beacon :9001. 35.193.106.76 is not the current infrastructure address. |
| 148 | `pilotctl daemon start --email ... --endpoint 34.148.103.117:4000 --public` | `--endpoint` is a pilot-daemon binary flag (cmd/daemon/main.go:63) but `pilotctl daemon start` does NOT forward it — daemonArgs builder (cmd/pilotctl/main.go ~2680-2720) forwards registry/beacon/listen/email/hostname/public/webhook etc., not endpoint. Command as shown does not work. |
| 248, 255 | `pilotctl init --hostname research-agent` (no registry) | Usage: `pilotctl init --registry <addr> [flags]` with "--registry <addr> registry address (required)" (cmd/pilotctl/main.go:1043). Command as shown fails. |
| 140, 251, 258 & 217 | Startup logs "NAT type: port_restricted_cone" / "NAT type: symmetric"; "The daemon detects the NAT type during STUN discovery and selects the appropriate strategy" | No NAT-type classification exists anywhere in web4 (grep for "nat type"/"port_restricted"/"NATType" across pkg/ and cmd/ = 0 hits). The daemon never prints or infers a NAT type; strategy is a fixed direct→relay fallback ladder. |
| 219-235, 282 | "DialConnection: direct (3 retries, 2s timeout each) → hole-punch → relay (3 retries, 3s each); up to 9 attempts across three tiers" | Source: DialDirectRetries=3, DialMaxRetries=7 (3 direct + 4 relay), DialInitialRTO=250ms exponential backoff capped at 8s (pkg/daemon/daemon.go:197-199). Two phases, 7 attempts — not 9 attempts / three explicit tiers / 2s+3s timeouts. |
| 192 | "Pilot retries the hole-punch if the first attempt fails. The retry logic is built into the DialConnection function" | DialConnection's retry ladder is direct→relay (daemon.go:3588 "Phase 1: Direct... Phase 2: Relay"); there is no hole-punch retry tier inside DialConnection. |
| 327-328 | "Pilot does not attempt to tunnel over TCP or HTTP in these cases -- if UDP is blocked, the agent cannot join the overlay network." | A TCP compat path exists: `-transport` flag (default udp, tcp available) and TCP/443 SNI-routed compat endpoints registry./beacon.pilotprotocol.network (pre-verified ground truth). UDP-blocked agents CAN join over TCP. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why | What WOULD verify it |
|---|---|---|---|
| 4 | "An estimated 88% of networked devices sit behind some form of NAT" | No citation; no live source for this statistic | A citable measurement study |
| 102-105, 109, 312, 316 | NAT prevalence figures: Full Cone ~15%, Restricted ~25%, Port-Restricted ~35%, Symmetric ~25%; "approximately 75% of NAT configurations allow direct" | No source; prevalence studies vary widely | Citation (e.g., a NAT characterization study) |
| 67 | Port-Restricted Cone "is the most common NAT type in enterprise and residential environments" | No source | Measurement study |
| 308-310, 235, 299 | Performance table: setup ~50ms / ~600ms / ~100ms; relay +15-25ms per hop; relay throughput ~50%; "typical connection time 50ms (direct) to 900ms (relay)" | Presented as real measurements; no benchmark exists in repo | Published `pilotctl bench`/ping benchmark data |
| 132 | "STUN discovery uses a temporary UDP socket that is closed before the tunnel binds the same port... race condition causes dropped packets" | Could not locate this exact socket-lifecycle sequence in web4 (only udpio DiscoverEndpoint references) | Pointer to the STUN discovery code path |
| 184 | "In practice, the two UDP packets arrive at each NAT within a few milliseconds of each other" | Timing claim, no measurement | Benchmark |
| 190 | "NAT mappings have a timeout, typically 30-120 seconds for UDP" | Plausible per RFC 4787 (recommends ≥2 min; real devices vary) but the specific range has no cited source | RFC 4787 citation / device survey |
| 323 | "CGNAT is typically symmetric" | Common belief; no cited source | RFC 6888 / measurement study |
| 332 | "A clean restart of all involved services with fresh registry resolution fixes this [key desync]" | Remedy claim; error string verified in source but the fix procedure is not documented in code | Ops runbook / issue reference |

## Verified claims (grouped by source)
- protocol@v1.10.5/pkg/protocol/header.go:80-85: BeaconMsgPunchRequest=0x03, BeaconMsgPunchCommand=0x04, BeaconMsgRelay=0x05 — exactly as stated (lines 160-161, 203)
- web4/pkg/daemon/routing/writeframe.go:50-54: MsgRelay wire format [0x05][senderNodeID(4)][destNodeID(4)][frame] — matches blog byte layout exactly (lines 202-209); PILS magic 0x50494C53 (protocol/header.go:63-64)
- protocol@v1.10.5/pkg/beacon/server.go:496-525: beacon handles PunchRequest and sends PunchCommand to both sides back-to-back ("same event loop iteration", line 184); punch request names target by node ID (line 160); relay: beacon reads destNodeID and forwards (line 208)
- web4/pkg/daemon/keyexchange/derive.go: X25519 ECDH + HKDF-SHA256-derived 32-byte key + AES-GCM — supports "X25519 key exchange and AES-256-GCM" (line 211); beacon sees only header + opaque encrypted bytes (E2E property, line 211)
- web4/pkg/daemon/tunnel.go:367,425,1255: "encrypted packet but no key" error string exists verbatim (line 332)
- web4/pkg/daemon/daemon.go:3423: DialConnection function exists (lines 192, 217, 282); relay fallback when direct fails (daemon.go:3588 phases)
- common@v0.5.0/driver/conn.go:22: "Conn implements net.Conn over a Pilot Protocol stream" — supports net.Conn / Read/Write/Close/SetDeadline claim (line 237)
- cmd/pilotctl/main.go: `ping --count` (line 864 usage, default 4); `handshake <node_id|hostname> [justification]` (line 932); `approve` exists; `connect <addr>` (line ~900); `daemon start --email` (line 1469); init has `--hostname` flag (line 1043 block); cmd/daemon/main.go:63 `-endpoint` "skips STUN (for cloud VMs)" (concept at line 145 verified, though not via pilotctl); main.go peers help: relay "adds ~50-150ms latency" (partially consistent with relay-latency direction)
- RFCs (datatracker links resolve; content pre-known): RFC 3022 is the NAT spec dated 2001; RFC 3489 (classic STUN) defines the four NAT types full cone / restricted / port-restricted / symmetric with the mapping/filtering behavior described (lines 34-105); RFC 5389 = "Session Traversal Utilities for NAT" (line 113); RFC 1918/5737 example IPs used correctly throughout diagrams
- Pre-verified: github.com/pilot-protocol/pilotprotocol exists (CTA); beacon :9001 UDP / registry :9000 port numbers in diagrams correct (IP wrong, flagged above)
- Internal links: connect-ai-agents-behind-nat-without-vpn, zero-dependency-encryption-x25519-aes-gcm, how-pilot-protocol-works, lightweight-swarm-communication-drones-robots, connect-agents-across-aws-gcp-azure-without-vpn all exist in src/pages/blog/; banner public/blog/banners/nat-traversal-ai-agents-deep-dive.webp exists
- EXAMPLE items: all packet diagrams, IPs from RFC 5737/1918 ranges (203.0.113.x, 198.51.100.x, 192.168.x, 10.x), example virtual addresses 1:0001.*, ping latency outputs, example emails
