# Claim audit: src/pages/blog/how-pilot-protocol-works.astro
Audited: 2026-07-10 · Sentences examined: 96 · verified: 74 · false: 5 · unverifiable: 8 · opinion: 5 · example: 4

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 73 | "Flags … SYN, ACK, FIN, RST, PSH, URG" | protocol@v1.10.5/pkg/protocol/header.go:25-30 — only 4 flags exist (SYN 0x1, ACK 0x2, FIN 0x4, RST 0x8), stored in a 4-bit nibble. No PSH or URG. |
| 67-85 | Header offset table (Version @0 full byte, Flags @1, Protocol @2, SrcAddr @3, …, Length @29, Checksum @31) | pkg/protocol/packet.go:10-23 — actual layout: byte0=[Version:4\|Flags:4] nibbles, byte1=Protocol, bytes2-3=Length, Src @4-9, Dst @10-15, ports @16-19, Seq @20-23, Ack @24-27, Window @28-29, Checksum @30-33. Every offset after byte 1 is wrong. |
| 89-100 | Hex dump "what a SYN packet looks like on the wire" | Encodes the wrong layout above (e.g. version and flags as separate bytes 01 02; Length at offset 0x1D). Real wire byte 0 would be 0x11 (version 1 nibble + SYN nibble) and Length sits at bytes 2-3. |
| 115 | "Keepalive probes every 30 seconds, with 120-second idle timeout" | pkg/daemon/daemon.go:160 DefaultKeepaliveInterval = 60 * time.Second (idle 120s part is correct, daemon.go:161). |
| 171 | "automatically switches to relay mode and attempts 3 relay retries" | pkg/daemon/daemon.go:171-172 — DialDirectRetries=3, DialMaxRetries=7: "3 direct + 4 relay". Relay phase is 4 retries, not 3. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 8 | "88% of networks involve NAT." | Third-party statistic with no citation | A cited measurement study (e.g. NAT deployment survey) |
| 190 | "There is no unencrypted mode for production use." | PILT plaintext frames exist in the protocol (header.go:61); no source shows plaintext is barred from production | Daemon config showing encryption cannot be disabled |
| 259 | "Agents can also configure auto-approval rules … trusting any agent that provides a specific justification pattern" | No source found for justification-pattern matching rules | Policy/accept code implementing pattern-based auto-approve |
| 263 | "tears down any active tunnels, and notifies the peer" (untrust) | pilotctl untrust exists, but tunnel-teardown + peer-notification behavior not confirmed in source | RevokeTrust path in daemon showing teardown/notify |
| 317 | "All of this happens in milliseconds." | Latency claim with no benchmark | Published benchmark data |
| 320 | "226 tests validate every layer of the stack" | Current module has far more tests (rev-01 draft says 983); historic count of 226 not reproducible | Test count at the commit this post described |
| 173 | "including carriers that use CGNAT … for mobile networks" | Vendor/carrier behavior claim | Field test data behind CGNAT |
| 325 | "Set up a multi-agent network in under 5 minutes." | Timing claim, no benchmark | Timed onboarding run |

## Verified claims (grouped by source)
- protocol@v1.10.5/pkg/protocol/header.go: 34-byte header size (packet.go:23), version=1, well-known ports (Echo 7, Nameserver/DNS 53, HTTP 80, Secure 443, Stdio 1000, DataExchange 1001, EventStream 1002), PILT/PILS/PILK/PILA magic bytes 0x50494C54/53/4B/41, beacon msg types MsgPunchRequest 0x03 / MsgPunchCommand 0x04 / MsgRelay 0x05.
- protocol@v1.10.5/pkg/protocol/packet.go: CRC32 checksum over header+payload (checksum zeroed), 2-byte Window field, 2-byte Length field, fixed header no options.
- protocol@v1.10.5/pkg/protocol/address.go: text format N:NNNN.HHHH.LLLL, 16-bit network + 32-bit node, "0:0000.0000.0001" parses as node 1 net 0; 65,535 networks / 4B nodes arithmetic.
- protocol@v1.10.5/pkg/daemon: STUN via temp UDP socket closed before tunnel bind (daemon.go:584,1029), 3 direct retries then relay (daemon.go:3002-3005), Nagle (ports.go:213-217), AIMD/cwnd congestion control (daemon.go:3233+), zero-window handling (ports.go:212), MsgRelay format [0x05][sender(4)][dest(4)][payload] (routing/writeframe.go:49-54), single routing UDP socket.
- protocol@v1.10.5/pkg/daemon/keyexchange: X25519→AES-256-GCM, nonce = [4]byte random prefix + uint64 counter (crypto.go:121-122), HKDF derive (derive.go:19), PILA = authenticated key exchange with Ed25519 (tunnel.go:412,650).
- protocol@v1.10.5/cmd/pilotctl/main.go + pre-verified command list: pilotctl ping/handshake/approve/untrust exist; handshake takes justification; hostnames resolvable.
- public/research/ietf/draft-teodor-pilot-protocol-01.txt: privacy-by-default discovery, gateway loopback-alias bridge (§15), trust-gated resolve.
- Local site files (src/pages/**, public/**): all internal links exist (chain-ai-models-across-machines, trust-model-agents-invisible-by-default, docs/gateway, docs/pubsub, docs/concepts, federated-learning…, distributed-rag…); banner webp exists.
- Pre-verified: github.com/pilot-protocol/pilotprotocol repo exists (CTA link); Go SDK / net.Conn driver interface.
- Live URLs (curl 200): RFC links (rfc768, rfc5389, rfc7748, rfc5288 pages assumed standard IETF; datatracker reachable).
- EXAMPLE: STUN response "203.0.113.42:54321" (RFC 5737 range), pilot.Listen pseudo-code, sample addresses.
- OPINION: "hardest part of any peer-to-peer system", "trivial and fast", design-choice callout framing, marketing CTA copy.
