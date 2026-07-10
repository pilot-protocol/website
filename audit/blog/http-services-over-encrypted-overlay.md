# Claim audit: src/pages/blog/http-services-over-encrypted-overlay.astro
Audited: 2026-07-10 · Sentences examined: 78 · verified: 52 · false: 6 · unverifiable: 3 · opinion: 4 · example: 13

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 20 (also 78,123,223,274,324,443) | import "github.com/pilot-protocol/pilotprotocol/pkg/driver" | Pre-verified: public pilotprotocol repo has NO pkg/driver. Go SDK is github.com/pilot-protocol/common/driver. Import path does not resolve. |
| 24 (and all examples) | d, err := driver.Connect() | common@v0.5.0/driver/driver.go:62 and protocol@v1.10.5/pkg/driver/driver.go:48 — func Connect(socketPath string): requires an argument. Zero-arg call does not compile. |
| 88 | conn, err := d.DialAddr("1:0001.0002.0003", 80) | DialAddr signature is DialAddr(dst protocol.Addr, port uint16) — takes a parsed Addr, not a string. |
| 134 | resolved, err := d.Resolve(host) then d.DialAddr(resolved, 80) | No Resolve method on Driver (full method list checked in common@v0.5.0 and protocol@v1.10.5 drivers); only ResolveHostname returning map[string]interface{}, not a dialable Addr. |
| 455, 479 | ln, err := d.ListenSecure(443) / conn, err := d.DialSecure(...) | No ListenSecure or DialSecure method exists in either driver package (grep across common@v0.5.0/driver and protocol@v1.10.5/pkg/driver: zero hits). |
| 42, 54, 472 | d.Address().String() / d.Address() | No Address() method on Driver (full method list enumerated; closest is Info()). |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 430 | "The tunnel encryption key is shared across all connections between two daemons." | Consistent with per-peer tunnel keys in keyexchange, but "all connections" sharing not explicitly confirmed | Keyexchange code showing one session key per peer pair reused across streams |
| 453-454 | "The driver automatically performs X25519 key exchange for each incoming connection" (port 443 per-connection) | Draft §11.4/pilot-secure-v1 describes port-443 per-connection crypto, but no driver API implements it (ListenSecure missing) | Driver code performing per-connection X25519 |
| 6 | "zero TLS configuration on your part" | Marketing-adjacent but factual-ish; holds only if the code paths shown work — they don't compile as written | Working end-to-end example |

## Verified claims (grouped by source)
- protocol@v1.10.5/pkg/driver + common@v0.5.0/driver: Driver.Listen(port) returns Listener usable with http.Serve; Dial/DialAddr exist; connections implement net.Conn semantics.
- protocol@v1.10.5/cmd/pilotctl/main.go:1175-1179,1289-1309: `pilotctl extras gateway start [--subnet][--ports <list>] [<pilot-addr>...]` and `pilotctl gateway list` exist (gateway is extras-only, matching "pilotctl extras gateway").
- protocol@v1.10.5 gateway (cmd/gateway/main.go:39, plugins/gateway/gateway.go:30): default subnet 10.4.0.0/16 → 10.4.0.x local IPs; loopback alias + TCP listen + bridge behavior per draft §15 (public/research/ietf/draft-teodor-pilot-protocol-01.txt:1523-1553).
- protocol@v1.10.5/pkg/protocol/header.go: PortHTTP 80, PortSecure 443; virtual port space separate from OS ports (overlay ports).
- keyexchange (derive.go, crypto.go) + draft §11: tunnel AES-256-GCM, X25519, port-443 second encryption layer ("pilot-secure-v1") — double-encryption concept as specified.
- Local site files: internal links benchmarking-http-vs-udp-overlay, replace-message-broker-twelve-lines-go, /docs/ all exist; banner webp exists.
- Pre-verified: GitHub repo pilot-protocol/pilotprotocol exists (CTA link).
- EXAMPLE: all sample addresses (1:0001.0002.000x), users/orders/inventory data, curl outputs, gateway output lines, alice@example.com emails.
- OPINION: "The HTTP ecosystem is enormous", "more ergonomic", "just work", CTA copy.

## Resolutions (2026-07-11 iter 44)
- L20/imports + Connect(): already fixed in the iter-21 batch (common/driver + Connect("")).
- L88/L401 (DialAddr("addr", 80) — wrong signature): DialAddr takes a parsed protocol.Addr; switched to d.Dial("N:XXXX.YYYY.YYYY:80"), the string-form dial (driver.go:77 doc comment).
- L134 (d.Resolve — no such method): switched to d.ResolveHostname(host) + d.Dial(fmt.Sprintf("%s:80", info["address"])).
- L42/L54/L472 (d.Address() — no such method): capture the agent's address from d.Info() ("address" key) into a local var and use that.
- L455/L479 (ListenSecure/DialSecure — don't exist): switched to Listen(443)/Dial(":443") and added a Roadmap callout that the per-connection "pilot-secure-v1" layer is IETF-draft §11.4, not yet a distinct driver API; softened the secure-handler JSON so it no longer asserts active double-encryption.
Build: npm run build green (345 pages).
