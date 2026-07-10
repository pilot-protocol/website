# Claim audit: src/pages/blog/connect-agents-across-aws-gcp-azure-without-vpn.astro
Audited: 2026-07-10 · Sentences examined: 112 · verified: 74 · false: 3 · unverifiable: 21 · opinion: 9 · example: 5

## FLAGGED — FALSE
| Line | Sentence | Evidence it is false |
|---|---|---|
| 135 | "Two <code>go install</code> commands, two <code>daemon start</code> commands, one trust handshake..." | The walkthrough above (L90-133) uses `curl ... install.sh \| sh`, not `go install`, and 5+ commands per agent. Internal contradiction with own example. |
| 135 | "No firewall rules beyond the three ports." | No "three ports" are established anywhere in the article; L374 says "no firewall rules beyond port 4000 UDP" (one port). Contradicts itself. |
| 141 | "The example above used VMs with public IPs and the <code>--endpoint</code> flag..." | The example (L90-133) never uses `--endpoint`; it uses `daemon start --email` + `set-public`. Internal contradiction. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 29 | Quote: "When managing hundreds of applications, you are quickly talking about managing hundreds of VPN tunnels." | Unattributed quotation, no citation | A cited source/report URL |
| 33 | "Industry reports note that organizations are 'very much limited by the throughput of the various VPNs -- around 300 Mbps.'" | Unattributed "industry reports" quote | Citation to the report |
| 33 | "AWS VPN connections support up to 1.25 Gbps per tunnel" | Not checked against AWS docs during audit | AWS Site-to-Site VPN quotas doc page |
| 39 | "A survey of cloud professionals found that 93% expressed concern about cloud security skills shortage." | No survey named or linked | Named survey with URL |
| 41 | Quote: "The costs for multi-cloud are enormous -- support and operation cost easily more than doubles." | Unattributed quote | Citation |
| 178 | "Cloud NAT services (AWS NAT Gateway, GCP Cloud NAT, Azure NAT Gateway) typically implement Port-Restricted Cone or Symmetric NAT." | Vendor NAT behavior claim, no source | Vendor docs / RFC 4787 behavior test results |
| 200-243 | Per-packet overhead table rows for IPsec (58-76 bytes), WireGuard (60 bytes), IKE "2-4 RTT" | Third-party protocol figures, no benchmark or citation | RFC 4303/WireGuard whitepaper citations |
| 327-372 | Cost table: "~$0.05/hr per tunnel (~$36/mo)", "~$108/mo", "$360/month", "$1,620/month", Tailscale "$6/user/mo", "free for 3 users" | Vendor pricing not checked live; changes over time | Live AWS/GCP/Azure VPN pricing pages + tailscale.com/pricing |
| 411 | "Deploy agents across any combination of clouds in under 10 minutes" | Timing claim with no measurement | A timed walkthrough |

## Verified claims (grouped by source)
- protocol@v1.10.5 pkg/protocol/header.go + address.go: 48-bit address N:NNNN.HHHH.LLLL (16-bit network + 32-bit node); 34-byte header; well-known ports stdio 1000, dataexchange 1001, eventstream 1002 (L319); 62-byte per-packet figure = 34 header + 16 GCM tag + 12 nonce (arithmetic).
- web4 cmd/pilotctl/main.go dispatch (~1620-1963) + help text: daemon start --email, network join, set-hostname, set-public, set-private, extras set-tags, lookup, handshake <addr> "justification", approve, send-message, send-file, send, bench, peers --search, ping — all commands/flags in L90-133, 180-186, 389-421 exist.
- web4 cmd/daemon/main.go:63,85: --endpoint flag skips STUN (L141-143 mechanism), --public flag.
- Pre-verified cheatsheet: installer pins -listen :4000 (L374 "port 4000 UDP"); Ed25519 per-agent identity; open-source/free.
- curl 200 (2026-07-10): aws.amazon.com, cloud.google.com, azure.microsoft.com, github.com/pilot-protocol/pilotprotocol, pilotprotocol.network/install.sh.
- protocol@v1.10.5 pkg/beacon + pkg/daemon: STUN discovery, NAT-type-based strategy table (L145-176), hole-punch/relay fallback consistent with beacon server code.
- Local site files: banner public/blog/banners/connect-agents-across-aws-gcp-azure-without-vpn.webp exists; canonicalPath matches file slug.
- General/RFC knowledge: N*(N-1)/2 tunnel mesh math (L29, arithmetic checks: 3→3 tunnels/6 endpoints, 4→6/12); VPN encapsulation overhead description (L194); Tailscale DERP relays, Headscale self-hosting, ZeroTier controllers (public docs, low-risk).
- EXAMPLE (not flagged): addresses 1:0001.0000.0017/0042/0063, private IPs 10.x, ASCII diagrams, sample emails/tags.
