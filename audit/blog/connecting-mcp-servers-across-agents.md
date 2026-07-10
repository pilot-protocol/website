# Claim audit: src/pages/blog/connecting-mcp-servers-across-agents.astro
Audited: 2026-07-10 · Sentences examined: 76 · verified: 44 · false: 2 · unverifiable: 9 · opinion: 6 · example: 15

## FLAGGED — FALSE
| Line | Sentence | Evidence it is false |
|---|---|---|
| 71 | Go example: `conn, _ := d.Dial("reporter-agent", 1001)` | protocol@v1.10.5 pkg/driver/driver.go:63 — `func (d *Driver) Dial(addr string) (*Conn, error)` takes ONE argument; port-taking variant is `DialAddr(dst protocol.Addr, port uint16)`. This "copy and run" example does not compile. |
| 49 | "Agent A dials Agent B by hostname, a trust handshake and encrypted tunnel are established automatically" | Trust is not automatic by default: handshake requires explicit `pilotctl approve` on the peer (see article's own Step 3 at L139-142 and web4 daemon `--trust-auto-approve` opt-in flag, cmd/pilotctl/main.go:1469). |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 37 | "# Install Pilot (one command, under 30 seconds)" | Timing claim, no measurement | Timed install run |
| 91 | "88% of networks involve NAT" (linked to sibling post) | The linked post also gives no source | Cited measurement study |
| 75-85 | Python example `import pilotprotocol as pilot; pilot.connect("reporter-agent", port=1001)` | PyPI package pilotprotocol exists (pre-verified) but this API surface (`pilot.connect` async context manager) was not confirmed | pip install + inspect the SDK API |
| 213 | "Code examples - Go and Python examples you can copy and run" | The Go example is broken (see FALSE above) and the Python API unconfirmed | Compiling/running the samples |

## Verified claims (grouped by source)
- protocol@v1.10.5 pkg/protocol/header.go: dataexchange port 1001 (used throughout examples); pkg/beacon: three-tier traversal (STUN, hole-punch coordination, relay of opaque encrypted packets) — L93-99.
- web4 cmd/pilotctl/main.go: `daemon start --hostname` (help line 2146), `connect <hostname> [port] [--message <msg>]` (line 1488/3699) — L41-47, 104, 140-142, 193-199 commands exist; handshake by hostname exists.
- Pre-verified cheatsheet: socket /tmp/pilot.sock (Go example driver.New path); PyPI package pilotprotocol exists (L227 `pip install pilotprotocol`); single-binary install via install.sh.
- curl 200: pilotprotocol.network/install.sh, github.com/pilot-protocol/pilotprotocol.
- Local site: internal links /blog/connect-ai-agents-behind-nat-without-vpn, /blog/mcp-plus-pilot-tools-and-network, /for/mcp all exist under src/pages; banner webp exists; canonicalPath matches slug.
- General MCP knowledge: MCP = Model Context Protocol, JSON-RPC client/server tool interface, agent→tool axis — matches MCP spec.
- General networking: webhook/broker/shared-DB/pub-sub trade-off descriptions (L17-23) — standard, low-risk.
- EXAMPLE: 1,842 rows, "Q4 up 23%", RTT 34ms output, pilot_send/pilot_receive pseudocode, scraper→analyzer→reporter pipeline, cfo@company.com.
