# Claim audit: src/pages/blog/chain-ai-models-across-machines.astro
Audited: 2026-07-10 · Sentences examined: 85 · verified: 50 · false: 4 · unverifiable: 9 · opinion: 6 · example: 16

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 119 | `import "github.com/pilot-protocol/pilotprotocol/pkg/driver"` | Public pilotprotocol repo has NO pkg/driver (pre-verified). Go SDK is github.com/pilot-protocol/common/driver (common@v0.5.0/driver/driver.go). |
| 141 | `d, err := driver.Connect()` | Signature is `func Connect(socketPath string)` — common@v0.5.0/driver/driver.go:62. Call with zero args does not compile. |
| 153, 229 | `pilotTransport := d.HTTPTransport()` / "This returns an http.RoundTripper that routes HTTP requests through Pilot tunnels" | No `HTTPTransport` symbol anywhere in web4 or common@v0.5.0/driver (grep: zero hits). Method does not exist. |
| 99-101, 333 | "The orchestrator discovers available models by tag" via `pilotctl peers --search "model-service" --json` | cmd/pilotctl/main.go help: `--search <query>  filter by node ID substring` — peers --search filters node IDs, not tags. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 4 | "A single complex query now routinely requires 5 to 10 model invocations." | Industry stat with no citation | A cited survey/benchmark |
| 24 | "you add 50-150ms per hop ... a 25 to 75 percent overhead" | Latency figure with no benchmark | Published measurement |
| 52 | "Keep-alive connections expire after idle timeouts (typically 60 seconds)" | Vendor-default claim, no source | Server/proxy default docs |
| 60 | "The tunnel survives network changes, NAT rebinding, and transient packet loss." | Behavioral claim not confirmed against source | Test or code showing rebind survival |
| 65 | "~200ms first connection" | Presented as measured, no benchmark | Real measurement |
| 235 | "We benchmarked a 3-stage model chain processing 1,000 sequential inference requests." | No benchmark artifact exists in repo | Published benchmark script + results |
| 237-286 | Benchmark table (~750ms / ~620ms / ~605ms / overhead %s) | Same — presented as measurements, no source | Same |
| 288 | "this saves roughly 145 seconds compared to per-request HTTPS" | Derived from unverifiable benchmark | Same |
| 290 | "If a probe fails, the tunnel reconnects automatically." | Reconnect-on-probe-failure not confirmed in source | Code path in pkg/daemon |

## Verified claims (grouped by source)
- web4 cmd/daemon/main.go:72-73: keepalive probes default 30s; idle timeout default 120s; encryption X25519+AES-256-GCM (flag 65); UDP tunnel transport.
- web4 cmd/pilotctl/main.go: `ping`, `network join`, `send-file`, global `--json`, `extras set-tags` (pre-verified), `peers` command existence.
- common@v0.5.0/driver/driver.go:144: `Listen(port uint16)` — driver.Listen(80) valid.
- Pre-verified: install URL https://pilotprotocol.network/install.sh live; github.com/pilot-protocol/pilotprotocol exists; registry compat via registry.pilotprotocol.network (public rendezvous).
- Arithmetic/general ML knowledge: 7B params × 2 bytes (FP16) ≈ 14 GB VRAM; KV cache formats incompatible across vLLM/TGI/Ollama/TensorRT-LLM (each hop re-tokenizes).
- Generic networking (RFC-level): TCP handshake 1 RTT, TLS ~2 RTTs; STUN discovery + key exchange as one-time setup (daemon flags).
- EXAMPLE items: agent addresses 1:0001.000X.000Y, machine/GPU layout (A100/T4/A10G), HTTP latency comment block (illustrative estimates), mock endpoints.
