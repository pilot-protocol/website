# Claim audit: src/pages/blog/build-multi-agent-network-five-minutes.astro
Audited: 2026-07-10 · Sentences examined: 72 · verified: 44 · false: 11 · unverifiable: 1 · opinion: 3 · example: 13

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 10 | "You need Go 1.21 or later installed. That is the only dependency." | Installer ships prebuilt binaries (release/install.sh:29 "Extracts binaries to ~/.pilot/bin") — no Go needed; building from source needs Go 1.25 (pre-verified) |
| 10 | "Pilot Protocol is a single binary with zero external libraries." | install.sh extracts multiple binaries (pilotctl, pilot-daemon, updater — public repo cmd/ has daemon, pilotctl, updater via gh api) |
| 20 | "This installs pilotctl to your $GOPATH/bin." | install.sh:29-30: installs to ~/.pilot/bin and adds it to PATH; $GOPATH never used |
| 25 | "pilotctl v0.5.0" (presented as current expected output) | Latest release is v1.12.4 (pre-verified) |
| 39 | "pilotctl init → Identity created: ~/.pilot/identity.json" | `init` requires --registry and initializes ~/.pilot/config.json (web4 cmd/pilotctl/main.go:1043); bare `pilotctl init` errors |
| 64 | "Each daemon also needs a different tunnel port: --port 4000 and --port 4001." | daemon start has no --port flag; the flag is --listen (daemon start help block, main.go ~1005-1030) |
| 111 | "Send structured text data through the Data Exchange service on port 1001" followed by `pilotctl send bob 1002` | Command targets 1002 = Event Stream; Data Exchange is 1001 (pre-verified well-known ports) — text and command contradict |
| 118 | "$ pilotctl recv" (bare) | recv requires a `<port>` argument: "Usage: pilotctl recv <port>" (main.go:912) |
| 131 | "Bob receives files into the current directory" | Files land in ~/.pilot/received/ (main.go:1244, `received` command help) |
| 145 | "$ pilotctl publish alice ..." run by Alice as the publisher | publish targets a remote node's topic; Alice publishing "to alice" from her own terminal contradicts the subscribe-to-alice setup shown (usage main.go:1339) — at minimum the example is self-inconsistent with Bob subscribing to alice |
| 176 | "port-based services including Echo, Data Exchange, Event Stream, and Task Submit" | Well-known services are echo 7, stdio 1000, dataexchange 1001, eventstream 1002 (pre-verified) — no "Task Submit" service |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 4 | "The whole thing takes about 5 minutes." | Timing claim, no benchmark | A timed walkthrough |

## Verified claims (grouped by source)
- web4/cmd/pilotctl/main.go: daemon start with --hostname/--email/--public flags (help ~1005-1030); --public = "make this node publicly visible"; find <hostname> (928); handshake <peer> [justification] (932); pending (1074); approve (1122); send <addr> <port> --data syntax (904); send-file (1343); subscribe <peer> <topic> (1331); publish usage (1339); PILOT_HOME override (main.go:55-59); set-hostname (1202).
- Pre-verified cheatsheet: install.sh URL live; ping via echo port 7; pub/sub on port 1002 (eventstream); beacon UDP (STUN discovery); registration of hostname/key/endpoint.
- protocol@v1.10.5 module: 34-byte header (pkg/protocol/packet.go:23 packetHeaderSize = 34); CRC32 checksums (pkg/protocol/checksum.go); Ed25519 identities, X25519 key exchange, AES-256-GCM (grep counts: ed25519 x276, x25519 x202, AES-256-GCM x5).
- gh api repos/pilot-protocol/pilotprotocol/contents/cmd: cmd/pilotctl exists → "go build ./cmd/pilotctl" valid.
- web4 cmd/daemon/main.go:389: default identity path ~/.pilot/identity.json (supports "identity.json" as identity storage in the What-Just-Happened list, though not created by `init`).
- Local site files: /docs/getting-started, /docs/cli-reference, /docs/services, /docs/integration, /docs/ exist; blog links how-pilot-protocol-works, trust-model-agents-invisible-by-default, why-ai-agents-need-network-stack, build-agent-swarm-self-organizes, replace-message-broker-twelve-lines-go, http-services-over-encrypted-overlay exist; banner webp exists.
- RFC 8032 link: standard Ed25519 RFC (knowledge/pre-verified).
- Example (not flagged): terminal outputs with RFC 5737 IPs (203.0.113.42, 198.51.100.17), addresses 0:0000.0000.0003/0004, ping latencies, 2.4 MB file transfer numbers, alice@/bob@example.com.

## Resolutions (2026-07-10, loop iteration 26)
Go-dep/single-binary/GOPATH/version/init-keygen/--port→--listen/port-1002→1001/recv-needs-port/received-dir/no-TaskSubmit all fixed vs source
