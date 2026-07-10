# Claim audit: src/pages/blog/connect-ai-agents-behind-nat-without-vpn.astro
Audited: 2026-07-10 · Sentences examined: 96 · verified: 54 · false: 1 · unverifiable: 19 · opinion: 6 · example: 16

## FLAGGED — FALSE
| Line | Sentence | Evidence it is false |
|---|---|---|
| 213 | `$ pilotctl init --hostname home-agent-2 --public` | pilotctl init usage (web4 cmd/pilotctl/main.go:1465) is `init --registry <addr> [--hostname <name>] [--beacon <addr>]` — no `--public` flag on init (`--public` belongs to daemon start). |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 4 | "This is one of the most searched networking questions on Stack Overflow, and it has been for years." | No SO data cited | SO search-volume data |
| 4 / 91 | "88% of networked devices sit behind a NAT." | No source; repeated in MCP post | Cited measurement study |
| 8, 50 | Quote: "The network grinds to a halt 90% of the time when I add a second robot." | Unattributed anecdote | Link to the forum/issue |
| 8 | Quote: "NAT/firewall traversal is unsolved for P2P federated learning." | Unattributed researcher quote | Citation |
| 26-32 | NAT prevalence figures: Full Cone ~15%, Restricted ~25%, Port-Restricted ~35%, Symmetric ~25% | No measurement study cited | NAT-behavior survey (e.g. published P2P measurement papers) |
| 38, 178 | "roughly 75% of NAT configurations allow direct peer-to-peer connections" | Derived from the uncited prevalence table | Same |
| 153 | "The nine retry attempts ... happen inside the <code>DialConnection</code> function." | Function name/retry count not found in audited source | grep of daemon dial code confirming DialConnection + 9 attempts |
| 163-176 | Performance table presented as "measurements from Pilot's test fleet across five GCP regions" (~2ms/850 Mbps, ~600ms punch setup, +15/+25ms relay, etc.) | Presented as real measurements; no benchmark published | Published benchmark data/repro script |
| 180 | "Throughput is roughly halved because the beacon becomes the bottleneck." | Measurement claim, no benchmark | Same |
| 237 | "After the initial punch (~600ms), traffic flows directly ... at ~12ms round-trip time." | Presented as measured demo results | Actual captured run |

## Verified claims (grouped by source)
- RFC 3022 / RFC 3489 / RFC 5389 (curl 200 on both datatracker links): NAT as IPv4-exhaustion fix, private ranges 192.168/10.x, four NAT types classification (RFC 3489 §5), STUN = Session Traversal Utilities for NAT, symmetric NAT defeats hole-punching.
- protocol@v1.10.5 pkg/beacon/server.go + pkg/protocol/header.go: beacon does STUN, punch coordination, relay forwarding (BeaconMsgRelay=0x05, header 1+4+4); relay forwards opaque encrypted bytes with sender/dest node IDs (L129).
- protocol@v1.10.5 internal/crypto: Ed25519 identity, X25519 + AES-256-GCM tunnel encryption (L126-129).
- web4 cmd/pilotctl/main.go: daemon start --email, connect --message, handshake <peer> "justification", approve, ping --count all exist; web4 cmd/daemon/main.go:63: --endpoint "skips STUN (for cloud VMs with known IPs)" — matches L155-159.
- curl 200: wireguard.com, tailscale.com, pilotprotocol.network/install.sh, github.com/pilot-protocol/pilotprotocol.
- Local site: internal links /blog/hipaa-compliant-agent-communication, /blog/connect-agents-across-aws-gcp-azure-without-vpn, secure-ai-agent-communication-zero-trust, nat-traversal-ai-agents-deep-dive, zero-dependency-encryption-x25519-aes-gcm all exist in src/pages/blog/; banner webp exists. (Note: several hrefs are relative, e.g. "secure-ai-agent-communication-zero-trust" without "/blog/" — resolves correctly only from /blog/ paths without trailing slash; works given Astro routing but fragile.)
- General networking (textbook): hole-punch sequence description, ROS2/DDS uses UDP multicast discovery and is LAN-scoped, ngrok per-endpoint model, MQTT broker bottleneck — standard, low-risk.
- EXAMPLE: all terminal transcripts (STUN endpoints 34.148.103.117, 73.162.88.14, 91.203.45.67, 98.45.211.33, addresses 1:0001.0000.0008/0009, ping replies) — except the ~600ms/~12ms figures flagged above.

## Resolutions (2026-07-11 iter 62)
- L213 (pilotctl init --hostname home-agent-2 --public): init has no --public flag (it belongs to daemon start). Removed --public from init and added it to the daemon start line, preserving the public-visibility intent.
Build: npm run build green (345 pages).
