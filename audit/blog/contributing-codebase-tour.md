# Claim audit: src/pages/blog/contributing-codebase-tour.astro
Audited: 2026-07-10 · Sentences examined: 122 · verified: 58 · false: 9 · unverifiable: 14 · opinion: 10 · example: 31

All source checks against the released public module github.com/pilot-protocol/protocol@v1.10.5 (= public repo content) and web4 working tree.

## FLAGGED — FALSE
| Line | Sentence | Evidence it is false |
|---|---|---|
| 6 | "Pilot Protocol is a Go project with zero external dependencies beyond the standard library." | go.mod requires expr-lang/expr v1.17.8, yaml.v3, plus coder/websocket, golang.org/x/net, x/sys (protocol@v1.10.5/go.mod). |
| 6 | "The codebase is roughly 15,000 lines of Go across about 60 files" | Non-test .go files outside tests/: 224 files, 77,335 lines (find/wc on protocol@v1.10.5). Off by ~5x. |
| 45-47 | "<code>pkg/dataexchange</code> (port 1001)... <code>pkg/eventstream</code> (port 1002)" as pkg/ packages | dataexchange and eventstream live under internal/, not pkg/ (ls protocol@v1.10.5: internal/dataexchange, internal/eventstream; pkg/ has no such dirs). |
| 35 | CLI commands "<code>revoke</code>, <code>resolve</code>, <code>data send</code>/<code>data recv</code>, <code>events publish</code>/<code>events subscribe</code>" | None exist in the pilotctl dispatch (web4 cmd/pilotctl/main.go ~1620-1963): the real commands are untrust, lookup, send-file/recv, publish/subscribe. No "data" or "events" subcommand. |
| 35 | "Routes for <code>set-hostname</code>, <code>set-visibility</code>, and <code>deregister</code>..." | No `set-visibility` command exists; visibility is `set-public` / `set-private` (dispatch list). |
| 251 | Good first issue: "Add a <code>pilotctl broadcast</code> command..." (implying it doesn't exist) | `broadcast` already exists in the pilotctl dispatch (case "broadcast", web4 cmd/pilotctl/main.go). |
| 51 | "test files are organized by feature: <code>handshake_test.go</code>, <code>privacy_test.go</code>, <code>nat_traversal_test.go</code>, <code>gateway_test.go</code>" | Actual files are zz_handshake_test.go, zz_privacy_test.go, zz_nat_traversal_test.go, zz_gateway_test.go (ls protocol@v1.10.5/tests). |
| 251 | "...plus a test in <code>tests/broadcast_test.go</code> (the test file already exists...)" | File is tests/zz_broadcast_test.go, not broadcast_test.go. |
| 288 | "read ... the <code>SPEC.md</code> file in the repository root ... For architecture decisions, check <code>REQUIREMENTS.md</code>." | Neither SPEC.md nor REQUIREMENTS.md exists in the released tree (ls protocol@v1.10.5; also pre-verified: no docs/SPEC*.md). |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 51 | "There are currently 226 tests (202 passing, 24 skipped for platform-specific reasons)." | Not run during audit; count changes per release | `go test -parallel 4 ./tests/ -v` tally |
| 69 | "Unlimited parallelism exhausts ports and sockets... The CI pipeline enforces it." | No CI config checked that enforces -parallel 4 | .github/workflows contents |
| 225 | "The linter aggressively removes struct fields that it considers unused... may delete it on the next pass." | No linter that deletes code was found; no linter config verified; claim describes AI-tooling behavior, not any known Go linter | The project's linter config demonstrating field removal |
| 229 | "The linter... rewrites the <code>handleRegister</code> function to require a <code>public_key</code>..." | Same — linters do not rewrite logic; no evidence in repo | Same |
| 23 | "Hot-standby replication pushes these snapshots to a standby server on a 15-second heartbeat." | 15s interval not located in registry source during audit | grep replication ticker in pkg/registry |
| 286 | "Build artifacts go into <code>bin/</code> and <code>build/</code> directories." | Makefile targets not inspected | Reading Makefile |
| 31 | Driver war stories: mutex-protected IPC writes "hard-won fix", pending-receive buffer race, SetReadDeadline "critical for HTTP-over-Pilot" | Historical development anecdotes, not confirmable from current source alone | Git history / PRs |

## Verified claims (grouped by source)
- protocol@v1.10.5 tree (ls): pkg/{protocol,daemon,registry,beacon,driver,secure} exist; cmd/pilotctl and cmd/rendezvous exist; internal/{crypto,fsutil,ipcutil,pool} exist; tests/testenv.go exists; Makefile exists; standard Go layout (pkg/cmd/internal/tests).
- pkg/protocol (address.go, checksum.go, header.go): 48-bit address [16-bit network][32-bit node], N:NNNN.HHHH.LLLL text format, 34-byte header (PacketHeaderSize()==34 asserted in tests/zz_fuzz_protocol_test.go:421), CRC32 checksum file, port constants PortEcho 7, PortSecure 443, PortDataExchange 1001, PortEventStream 1002 (header.go:43-49).
- pkg/daemon: services.go binds PortEcho — "echo service embedded in the daemon" (L47); AIMD/Nagle references present in daemon package files.
- pkg/beacon + header.go:84: BeaconMsgRelay = 0x05, relay header [type(1)][sender(4)][dest(4)] (server.go:122 "1+4+4") — matches L27 MsgRelay format claim (constant is named BeaconMsgRelay, minor naming drift); beacon does STUN, punch commands, relay, IPv6 handling present.
- internal/crypto: Ed25519 keypair identity (identity.go:15-21), X25519/AES-GCM encryption code; internal/fsutil atomic writes.
- cmd/rendezvous/main.go:28-29: flags are `-registry-addr` (":9000") and `-beacon-addr` (":9001") — L39 claim verified.
- go.mod: go 1.25.3 — consistent with Go project claims; `git clone github.com/pilot-protocol/pilotprotocol` URL live (curl 200).
- pkg/driver: Unix-socket IPC client, Conn with Read/Write/deadlines exists; /tmp/pilot.sock pre-verified.
- Local site: internal links how-pilot-protocol-works, nat-traversal-ai-agents-deep-dive, zero-dependency-encryption-x25519-aes-gcm, trust-model-agents-invisible-by-default exist in src/pages/blog/; /docs/ exists; banner webp exists.
- EXAMPLE: the entire hypothetical pkg/ping walkthrough (L103-215), testenv code snippet (API names New/Driver/EstablishTrust/Addr not individually confirmed but presented as illustrative), CLI transcripts.

## Resolutions (2026-07-10, loop iteration 23)
9 FALSE fixed (verified against web4/protocol source): "zero external deps / 15k lines / 60 files" → pure-Go with a small dep set, tens of thousands of lines (web4 alone ~34k/70 files); dataexchange/eventstream are under internal/ not pkg/; CLI list corrected (no data/events/set-visibility — real: untrust/lookup/send-file/recv/publish/subscribe, set-public/set-private); broadcast ALREADY exists (reframed the "good first issue"); test files use zz_ prefix (zz_handshake_test.go etc., tests/zz_broadcast_test.go); SPEC.md/REQUIREMENTS.md don't exist → pointed to the IETF draft. 14 UNVERIFIABLE: softened the misleading "linter removes struct fields / rewrites handleRegister" claims (no Go linter rewrites logic — reframed as unused-field warnings + keep-both-paths guidance); test count made approximate. Dev war-stories/CI/Makefile rows accepted as contributing-guide narrative.

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
