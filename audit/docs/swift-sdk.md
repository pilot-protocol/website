# Claim audit: src/pages/docs/swift-sdk.astro
Audited: 2026-07-10 · Sentences examined: 24 · verified: 23 · false: 0 · unverifiable: 0 · opinion: 0 · example: 1

No flagged claims.

## Verified claims (grouped by source)
- **gh api pilot-protocol/sdk-swift README.md**: description sentence ("End-to-end-encrypted P2P messaging for iOS and macOS apps — embedded Pilot daemon inside an XCFramework, no separate process"); subtitle ("no separate process, sandbox-clean" — README: "no separate process, no system-wide socket. Single-process, sandbox-clean"); all four "What you get" bullets (Ed25519 identity persisted to dataDir; registration + mutual-trust handshake; encrypted UDP tunnels X25519+AES-256-GCM NAT-traversed via beacons; app-level send/receive, same wire protocol as desktop pilot-daemon); "daemon compiled to a static library inside an XCFramework" (README + scripts/build-xcframework.sh via `go build -buildmode=c-archive`); Xcode "File → Add Package Dependencies…" instruction (verbatim in README).
- **gh api pilot-protocol/sdk-swift Package.swift**: "Requires iOS 14+ or macOS 12+, Swift 5.9+" (`swift-tools-version:5.9`, `.iOS(.v14)`, `.macOS(.v12)`); install snippet product name `Pilot` / package `sdk-swift` (products: `.library(name: "Pilot", ...)`); XCFramework binaryTarget (Pilot.xcframework.zip from v0.2.0 release).
- **gh api pilot-protocol/sdk-swift Sources/Pilot/Pilot.swift**: quickstart API surface — `Pilot.start(.init(dataDir:socketPath:trustAutoApprove:keepaliveSeconds:))` (Config lines 31-49), `pilot.start.address` (`public let start: StartResult`, `address: String`), `handshake(peerID:justification:)` (line 171), `waitForTrust(peerID:timeoutMs:)` (line 178), `send(to:port:data:)` (line 183).
- **web4 Go source**: X25519 + AES-256-GCM (pkg/daemon/keyexchange/derive.go:20-60 — `ecdh.X25519()`, HKDF-SHA256 32-byte key → AES-256, `cipher.NewGCM`); UDP tunnels (pkg/daemon/tunnel.go:70 "TunnelManager manages real UDP tunnels to peer daemons"); Ed25519 identity (pkg/daemon/daemon.go imports crypto/ed25519, ed25519.PublicKey peer keys).
- **Pre-verified cheatsheet**: repo pilot-protocol/sdk-swift exists with tags v0.1.0/v0.2.0 (install `from: "0.1.0"` and repo URL/link at line 66); beacon :9001 UDP (NAT-traversal via beacons); registry exists (registration bullet); sdk-python/sdk-node/sdk-swift all exist ("the three SDKs" at line 66).
- **Local site files (src/pages/docs/)**: prev link /docs/node-sdk (node-sdk.astro exists); next + inline link sdk-parity → /docs/sdk-parity (sdk-parity.astro exists); TOC anchors #what/#install/#quickstart match on-page ids; headings/title match page content.

## EXAMPLE (not flagged)
- Quickstart placeholder values: `peerID: 12345`, address `"0:0000.0000.AAAA"`, port `7777`, payload `"hi"` — illustrative demo values, consistent with the README's own commented example.
