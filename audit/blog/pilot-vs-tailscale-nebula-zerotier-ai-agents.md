# Claim audit: src/pages/blog/pilot-vs-tailscale-nebula-zerotier-ai-agents.astro
Audited: 2026-07-10 · Sentences examined: 82 · verified: 58 · false: 2 · unverifiable: 2 · opinion: 17 · example: 3

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 27 | Table cell: License "AGPL-3.0, stdlib-only Go" | AGPL-3.0 is correct (web4/LICENSE), but "stdlib-only" is false: web4/go.mod requires github.com/coder/websocket v1.8.15, golang.org/x/sys v0.46.0, expr-lang/expr (indirect), plus 15 pilot-protocol modules |
| 77 | "implemented in pure-stdlib Go with no external dependencies, AGPL-licensed" | Same evidence: web4/go.mod lists third-party deps (coder/websocket, golang.org/x/sys, expr-lang/expr) — not pure-stdlib, not dependency-free |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 4 | "They are the three most popular overlay networks" | No market-share source | Adoption survey/download stats |
| 94 | "gives an agent an address on the network in under a minute" | Timing claim with no benchmark | Timed onboarding run |

## Verified claims (grouped by source)
- gh api: slackhq/nebula license = MIT (table cell "MIT"); tailscale/tailscale = BSD-3-Clause ("BSD client"); juanfont/headscale exists; ZeroTier BSL confirmed via ZeroTierOne LICENSE (BUSL — GitHub reports NOASSERTION but repo license file is Business Source License)
- Vendor docs / well-known architecture: Tailscale wraps WireGuard, coordination server, DERP relays, MagicDNS, SSO/OIDC identity; Nebula from Slack, self-run CA + host certs with groups, lighthouses, Noise framework over UDP; ZeroTier L2 Ethernet emulation, 16-digit Network ID, controllers + planet/root servers, Curve25519/Salsa20 crypto; Headscale re-implements the coordination server
- web4 source: 48-bit permanent virtual address — README.md:174, pkg/daemon/daemon.go:2541; X25519 + AES-GCM encrypted UDP tunnels — pkg/daemon/tunnel.go:534; trust handshake — handshake plugin; STUN + hole-punch + relay — tests/zz_nat_traversal_test.go, beacon module; rendezvous + nameserver directory — go.mod (rendezvous, nameserver modules)
- cmd/pilotctl/main.go: `pilotctl daemon start --email` (line 1469), `pilotctl network join <id>` (line 6735), `handshake` and `send-message --data` in pre-verified subcommand list
- Pre-verified: install one-liner https://pilotprotocol.network/install.sh is live; github.com/pilot-protocol/pilotprotocol exists (CTA link)
- Local site files: banner public/blog/banners/pilot-vs-tailscale-nebula-zerotier-ai-agents.svg exists; external links tailscale.com, github.com/slackhq/nebula, zerotier.com, wireguard.com, github.com/juanfont/headscale are valid targets

Decision-guide recommendations ("hard to beat", "which should you choose", FAQ verdicts) classified OPINION. Terminal block commands are real syntax (verified above); agent@example.com and <peer-address> are EXAMPLE values.

## Resolutions (2026-07-11 iter 55)
- L27/L77 ("stdlib-only Go" / "pure-stdlib Go with no external dependencies"): go.mod has coder/websocket, golang.org/x/sys, expr-lang/expr. AGPL kept; reworded to "static Go binary" / "single static binary".
Build: npm run build green (345 pages).
