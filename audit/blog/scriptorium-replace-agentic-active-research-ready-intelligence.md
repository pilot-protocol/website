# Claim audit: src/pages/blog/scriptorium-replace-agentic-active-research-ready-intelligence.astro
Audited: 2026-07-10 · Sentences examined: 45 · verified: 8 · false: 2 · unverifiable: 16 · opinion: 11 · example: 8

## FLAGGED — FALSE
| Line | Sentence | Evidence it is false |
|---|---|---|
| 6 | "No central server. No middleman. No lock-in." | Architecture depends on central infrastructure: registry 34.71.57.205:9000 and beacon :9001 (pre-verified); NAT-blocked traffic is relayed through beacons (web4 main.go:945 "PATH=relay ... traffic goes through" relay). Data plane is E2E-encrypted but a central rendezvous server and relay middleman exist. |
| 77 | `bannerImage="banners/scriptorium-...png"` (missing leading `/blog/`) | BlogLayout.astro:22-23 builds og:image as `https://pilotprotocol.network${bannerImage}` → malformed URL `https://pilotprotocol.networkbanners/...`; every other post uses `/blog/banners/...`. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 8/11 | "The first production service ... is Scriptorium" / "available exclusively on Pilot Protocol" | No source for firstness/exclusivity | Service registry history |
| 14 | "agents using Scriptorium summaries perform identically to agents doing full live research on prediction markets" | Benchmark not published | Published methodology + data |
| 15 | "Two intelligence feeds are live today." | No live check possible (needs trusted network access to 0:0000.0000.3814) | Query the service |
| 20 | "92% fewer tokens. Less than half the response time." | Unpublished benchmark | Benchmark data |
| 25 | "Validated head-to-head ... identical predictive performance, with 92% fewer tokens and less than half the response time." | Same | Same |
| 28 | "Scriptorium was benchmarked against direct data retrieval." | No published benchmark | Same |
| 32 | "Direct retrieval consumes 2,600 tokens ... Scriptorium: 210 - a 92% reduction. Total cost drops 5.9×." | Chart images exist but underlying data unpublished | Raw benchmark data |
| 36 | "10,000 characters of raw data ... 800 - 12.5× less ... no meaningful loss in reasoning quality." | Same | Same |
| 40 | "Scriptorium calls complete in 1.8 seconds. Direct retrieval takes 4.5 seconds." | Same | Same |
| 44 | "At 1,000 calls, direct retrieval has consumed 2.9M tokens. Scriptorium: 490K - 83% less." | Same | Same |
| 48 | "services are discoverable by any agent on the network - no hardcoded addresses, no external directories" | In tension with the how-to below, which hardcodes address 0:0000.0000.3814; discovery claim unchecked | Directory lookup demo |
| 47 | "On Pilot Protocol, every connection is verified before it opens. There are no anonymous callers." | Consistent with handshake model but stated for this service; not independently checked | Service trust policy |
| 52 | "Sign up at pilotprotocol.network to get your agent on the network and start calling both feeds today." | Feed availability unchecked | Live call |
| 73 | Meta description: "92% fewer tokens, half the latency, identical decision quality" | Repeats unpublished benchmark | Benchmark data |
| 67 | "Up next: How to integrate Scriptorium with agents you have already built" | Future content promise | Follow-up post |
| 32-44 | Charts themselves presented as measurements | Data source unpublished | Same |

## Verified claims (grouped by source)
- web4 cmd/pilotctl/main.go: gateway lives under `extras` (line 1547, pre-verified); `gateway start --ports` flag exists (line 3283); default gateway subnet 10.4.0.0/16 (line 3278) → curl target 10.4.0.1:8100 consistent with `--ports 8100`.
- Pre-verified: pilotprotocol.network live; agent-to-agent E2E encryption + mutual-consent trust model; permanent identity/virtual addresses.
- Local files: all four chart PNGs exist in public/blog/scriptorium/ (chart_tokens/context/latency/scale.png).
- EXAMPLE (not flagged): curl query strings with 2026-04 date windows; service address 0:0000.0000.3814 (unverifiable as a live address but shown as usage sample).
