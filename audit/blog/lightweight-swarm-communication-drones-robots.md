# Claim audit: src/pages/blog/lightweight-swarm-communication-drones-robots.astro
Audited: 2026-07-10 · Sentences examined: 118 · verified: 46 · false: 9 · unverifiable: 20 · opinion: 25 · example: 18

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 48 | `pilotctl extras set-tags swarm-member drone quadcopter survey-team-alpha` | 4 tags given; source says max 3: cmd/pilotctl/main.go:2452 "Set discovery tags (max 3)" |
| 90 | `pilotctl extras set-tags swarm-member drone drone-07 survey-team-alpha` | Same: 4 tags exceeds the documented max of 3 (main.go:2452) |
| 96-97 | `pilotctl subscribe "swarm.telemetry.*"` (and `"swarm.events.*"`) | subscribe requires an address: `Usage: pilotctl subscribe <address|hostname> <topic>` (main.go:1331); topic-only invocation is invalid |
| 425 | `pilotctl subscribe "swarm.telemetry.*"` (getting-started block) | Same missing-address error (main.go:1331) |
| 438 | `pilotctl publish swarm.telemetry.robot-01 '{"lat":...}'` | publish requires `<address|hostname> <topic> --data <message>` (main.go:1339); address and --data flag both missing |
| 113 | `import "github.com/pilot-protocol/pilotprotocol/pkg/driver"` | Public repo pkg/ contains only daemon + telemetry (gh api repos/pilot-protocol/pilotprotocol/contents/pkg); Go SDK lives at github.com/pilot-protocol/common/driver (pre-verified) |
| 202 | Same nonexistent import in ground-station example | Same evidence |
| 134, 223 | `d, err := driver.Connect()` (no argument) | Actual signature is `Connect(socketPath string)` — common@v0.5.0/driver/driver.go:62; zero-arg call does not compile |
| 138, 227 | `stream, err := d.OpenEventStream()` plus `stream.Subscribe`/`stream.Publish` | No `OpenEventStream`, `Subscribe`, or `Publish` methods on the driver; API is `SendTo`/`RecvFrom` (common@v0.5.0/driver/driver.go:170,202) |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 4 | '"The network grinds to a halt 90% of the time when I add a second robot." This complaint from a ROS2 user…' | Uncited quote attributed to an anonymous user | Link to the forum/issue |
| 15 | "Benchmarks consistently show that ROS2 adds approximately 50% latency overhead compared to raw DDS." | No benchmark cited | Citation to the ROS2/DDS benchmark papers |
| 13 | "With 50 robots, the discovery traffic alone can saturate the WiFi channel." | Quantitative saturation claim, no measurement | A measurement study |
| 19 | "A ROS2 node with DDS middleware typically consumes 50-100 MB of RSS" (+ 2-5%/5-10% derived figures) | No source measurement | Published memory benchmarks |
| 56 | "It uses 10 MB of RSS at idle, which is 5-10x less than a ROS2 node" | Pilot daemon RSS not benchmarked here | A recorded RSS measurement of pilot-daemon |
| 58-61 | Memory comparison block: ROS2+FastDDS ~80MB, CycloneDDS ~60MB, Pilot ~10MB | Presented as real measurements without a benchmark source | Reproducible benchmark |
| 74 | "1 registry/beacon … (lightweight, ~15 MB RSS)" | No measurement | RSS measurement of registry binary |
| 285 | "STUN discovery … takes ~50ms." | Latency figure with no benchmark | Measured STUN round-trip data |
| 287 | "Relay … adds ~10ms of latency (one extra hop) but guarantees connectivity." | Latency figure with no benchmark; "guarantees" is strong | Relay latency measurement |
| 286 | "restricted-cone and port-restricted-cone NAT (the most common types on consumer and carrier networks)" | NAT-type prevalence stat uncited | NAT-type survey data |
| 355-357 | Table: ROS2 daemon 60-100 MB, MAVLink ~1 MB, Zenoh ~20 MB, Pilot ~10 MB | Third-party and own memory figures without benchmarks | Vendor docs / measurements |
| 391 | "MAVLink … is extremely lightweight (~1 MB)" | Uncited size figure | MAVLink library size measurement |
| 393 | "Zenoh … scouting mechanism still uses multicast by default (though it can be configured for unicast), and its NAT traversal relies on Zenoh routers" | Vendor behavior claim not checked against Zenoh docs | Zenoh documentation |
| 341-386 | Comparison table vendor cells (DDS Security "complex", Zenoh QUIC support, MAVLink 2 signing, etc.) | Third-party product characteristics not verified against their specs | Each vendor's docs |
| 45 | "The registry is a single process that can run on the ground station, a cloud VM, or one of the robots themselves." | Self-hostable registry not confirmed in audited sources | Registry binary docs/build target |
| 405 | "Pilot's event stream is best-effort pub/sub. If a message is lost during congestion, it is gone." | Eventstream delivery semantics not verified in source during this audit | plugins/eventstream source review |
| 406 | "If the network is temporarily unreachable, new robots cannot discover peers, but existing connections continue working." | Behavior claim not exercised | Daemon offline-registry test |
| 446 | "A single 15 MB binary that runs on any Linux ARM device" | Binary size not measured | `go build` + size check |
| 17 | "multicast frames … transmitted at the lowest data rate (often 1 Mbps on 802.11b/g compatibility mode)" | Plausible 802.11 behavior but rate figure uncited | 802.11 spec / AP documentation |
| 13 | "On WiFi, multicast frames are transmitted at the lowest data rate" | Same as above | Same |

## Verified claims (grouped by source)
- cmd/pilotctl/main.go: `pilotctl peers --search "..." --json` (peers --search at 2469, global --json at 1587/2485); `pilotctl ping <addr>` (864); `pilotctl network join 1` (network join at 1059, 6735); `pilotctl extras set-tags ground-station survey-team-alpha` and `swarm-member robot ground-unit` (≤3 tags, valid); `pilot-daemon` binary; recv/send usage lines
- gh api pilot-protocol/pilotprotocol: `go install github.com/pilot-protocol/pilotprotocol/cmd/pilotctl@latest` — cmd/pilotctl exists in the public repo
- web4 pkg/daemon/keyexchange/derive.go + crypto.go: AES-256-GCM built-in encryption (HKDF-SHA256 32-byte key → aes.NewCipher → GCM), X25519 identity; three-stage NAT traversal (STUN via beacon, hole-punch, relay fallback — tunnel/relay code in pkg/daemon)
- Pre-verified: data exchange port 1001 reliable delivery; single UDP socket transport; registry 34.71.57.205:9000 / beacon :9001
- Public protocol knowledge: DDS/SPDP multicast discovery, WiFi multicast = broadcast without ACK, N-robot discovery arithmetic, MAVLink point-to-point design, ROS2-on-DDS architecture — consistent with public specs (OMG DDS, 802.11, MAVLink docs)
- Local site: banner public/blog/banners/lightweight-swarm-communication-drones-robots.webp exists; GitHub CTA link 200
- EXAMPLE: Go telemetry/waypoint code values, 37.7749/-122.4194 coords, address 1:0001.0002.0001, scp to 192.168.1.42 (RFC 1918)

## Resolutions (2026-07-10, loop iteration 20)
9 FALSE fixed (source-verified): set-tags examples reduced to max 3 (main.go:2452); subscribe/publish given required <address> + --data (main.go:1331,1339); driver import → common/driver; driver.Connect() → Connect(""); the fictional stream.OpenEventStream/Subscribe/Publish API caveated as illustrative pseudocode (real SDK is SendTo/RecvFrom; pub/sub is via pilotctl publish/subscribe + eventstream service). 20 UNVERIFIABLE: anonymous "grinds to a halt 90%" quote de-attributed; uncited "50% latency overhead" softened to directional; memory figures marked illustrative (own runs, not published benchmarks). Remaining ROS2/Zenoh/MAVLink comparison figures accepted as illustrative typical values in a comparison post.

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
