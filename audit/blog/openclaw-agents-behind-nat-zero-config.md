# Claim audit: src/pages/blog/openclaw-agents-behind-nat-zero-config.astro
Audited: 2026-07-10 · Sentences examined: 62 · verified: 30 · false: 4 · unverifiable: 14 · opinion: 8 · example: 6

## FLAGGED — FALSE
| Line | Sentence (quote, truncate >160 chars) | Evidence it is false |
|---|---|---|
| 19 | "the daemon detects the NAT type during STUN discovery and selects the appropriate approach" | No NAT-type classification exists in web4 source: grep for NATType / nat_type across pkg, cmd, internal returns nothing outside comments about symmetric-NAT relay. Strategy selection is retry-based (pkg/daemon/daemon.go:3588 "Phase 1: Direct... Phase 2: Relay"), not NAT-type detection. |
| 68 | Status output sample: '{"address":"1:0001.0A3F.7B21","nat_type":"port_restricted",...,"tunnel_port":4000,...}' | Fabricated fields: neither "nat_type" nor "tunnel_port" appears as a JSON key anywhere in web4 (pkg/daemon/ipc.go emits "endpoint" but no nat_type/tunnel_port). Presented as real command output, not marked illustrative. |
| 75 | "The pilotctl status output shows the detected NAT type and STUN-discovered endpoint" | No NAT-type field in status output (pkg/daemon/ipc.go:1081,1122 — endpoint yes, nat_type no). |
| 81-82 | "If direct fails: request hole-punching via beacon, 3 more attempts; If hole-punching fails: switch to relay mode automatically" | Source retry budget is 3 direct + 4 relay attempts (pkg/daemon/daemon.go:197-198, DialDirectRetries=3, DialMaxRetries=7 "3 direct + 4 relay"). There is no separate 3-attempt hole-punch phase; punch coordination happens as part of tunnel setup, then relay. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 4 | "Of the OpenClaw agents that joined... roughly 52% were behind NAT." | Presented as a real network measurement; no live stats endpoint exposes NAT distribution (public-stats has node/request counts only). | Telemetry export showing NAT distribution. |
| 13 | "This is why 88% of real-world networks cannot accept inbound connections without explicit port forwarding or a relay." | No citation; no known survey with this figure. | A citable NAT survey. |
| 25 | "Approximately 35% of the OpenClaw agents had Full Cone NAT." | Same as line 4 — no data source. | Telemetry export. |
| 41 | "Hole-punching typically succeeds within 1-2 seconds"; "Approximately 40% of OpenClaw agents used hole-punching." | No benchmark or telemetry source. | Measured punch-latency data. |
| 55 | "Approximately 12% of OpenClaw agents required relay. The remaining 13% were on networks with no NAT..." | Same. | Telemetry export. |
| 93-100 | NAT distribution table (13/35/18/22/12%) | Same fabricated-looking distribution; note the daemon does not even classify NAT types (see FALSE above), so this data could not have been collected as described. | Telemetry with NAT classification. |
| 102 | "These numbers are consistent with published NAT surveys." | No survey cited; canonical surveys (e.g., Ford et al. 2005) report different breakdowns. | Citation. |
| 85 | "In practice, connection succeeds over 99% of the time" | No measurement source. | Dial success-rate metrics. |
| 104 | "This is why autonomous agents chose Pilot Protocol over alternatives. Half of them literally cannot use HTTP-based agent protocols..." | Motivation claim about third-party agents; unmeasurable. | User research. |
| 110 | "Some of the OpenClaw agents ran on IPv6 networks where every device has a public address." | No telemetry source. | Telemetry export. |
| 112 | "Pilot Protocol's beacon supports both IPv4 and IPv6 STUN. The daemon auto-detects the network stack and uses the appropriate protocol." | No IPv6 STUN evidence in web4: only IPv6 references are LAN-scan skip (daemon.go:1357) and addr-family-mismatch guard (daemon.go:1409); beacon server code not in this repo to confirm. | Beacon source or docs showing dual-stack STUN. |
| 110 | "For these agents, STUN still runs... but hole-punching and relay are never needed." | Depends on unverified IPv6 support above. | Same. |
| 114 | "For the complete NAT traversal specification, including the packet formats, timing parameters, and keepalive intervals, see the NAT traversal deep dive." | Link exists (src/pages/blog/nat-traversal-ai-agents-deep-dive.astro) but completeness of the spec there was not audited here. | Audit of the linked page. |
| 12 | "The packet is dropped silently." (universal claim; some NATs send ICMP) | Overgeneralization of NAT behavior; commonly true but not universal. | RFC 4787 behavior citation. |

## Verified claims (grouped by source)
- web4 pkg/daemon/routing/writeframe.go:49: relay message format "[0x05][senderNodeID(4)][destNodeID(4)][payload...]" — exact match with the code block (lines 49-53).
- web4 pkg/daemon/routing/beacon.go:25,43 + tests/zz_nat_traversal_test.go:21: MsgDiscover/MsgPunchRequest/MsgPunchCommand exist; beacon coordinates punch by sending MsgPunchCommand to both sides; simultaneous UDP send flow (lines 31-39) matches test narrative.
- web4 pkg/daemon/daemon.go:197 (DialDirectRetries=3): "3 direct connection attempts" (line 80) verified; DialConnection function exists (pkg/daemon/zz_daemonapi_conformance.go:124, CHANGELOG).
- web4 cmd/daemon/main.go:63: -endpoint flag "fixed public endpoint (host:port) — skips STUN (for cloud VMs with known IPs)" — matches line 55.
- web4 install.sh:366: binary named pilot-daemon — "pilot-daemon" command (line 64) verified.
- web4 cmd/pilotctl/main.go:904 ("Usage: pilotctl send <address|hostname> <port> --data <msg>") and :1033 ("pilotctl daemon status [flags]"): `pilotctl send 1:... 1002 --data "..."` and `pilotctl daemon status --json` command shapes verified; port 1002 = eventstream well-known port (pre-verified).
- web4 docs/SIGNATURE-VERIFICATION.md:29: address format N:NNNN.HHHH.LLLL — sample addresses 1:0001.0A3F.7B21 / 1:0001.0B22.4E19 match the format (EXAMPLE values).
- Pre-verified: installer pins -listen :4000 (the "tunnel_port":4000 value is right even though the key is fabricated); github.com/pilot-protocol/pilotprotocol repo exists (CTA link).
- RFC 3489/5389 & standard NAT taxonomy: Full Cone / Restricted / Port-Restricted / Symmetric definitions (lines 21-45) match STUN-classic NAT classification; NAT mapping mechanics (line 9-11) standard.
- RFC 5737: 203.0.113.5 is TEST-NET-3 documentation address; 192.168.1.x RFC 1918 — proper EXAMPLE values.
- Local site files: internal link nat-traversal-ai-agents-deep-dive exists; banner public/blog/banners/openclaw-agents-behind-nat-zero-config.webp exists.
- OPINION (not flagged): "Zero configuration. Automatic detection. Universal connectivity." CTA, "the agent doesn't know or care how".
