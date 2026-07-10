# Claim audit: src/pages/blog/hipaa-compliant-agent-communication.astro
Audited: 2026-07-10 · Sentences examined: 96 · verified: 68 · false: 2 · unverifiable: 6 · opinion: 8 · example: 12

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
| --- | --- | --- |
| 159-162 | Webhook events pushed: "trust.request, trust.approve, trust.revoke / connection.open, connection.close / task.submit, task.complete / data.send, data.receive" | Actual daemon event topics (web4 pkg/daemon, grep publishEvent) are agent.heartbeat, agent.registered, conn.established, conn.fin, conn.rst, data.datagram, file.delivered, key.rotated, node.registered, security.*, tunnel.* — none of the listed names exist |
| 164 | "The webhook pushes to a local HTTP server -- it does not send events to an external service." | common@v0.5.0/urlvalidate/validate.go accepts any http/https URL (only blocks cloud-metadata endpoints); nothing restricts webhooks to localhost |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
| --- | --- | --- | --- |
| 8 | Compliance officer quote: "Healthcare pros are calling out companies for vague privacy language." | Anonymous, uncited quote | A citation/link to the source |
| 34 | "most AI API providers do not sign BAAs by default" | Vendor behavior claim, no source | Survey of provider ToS/BAA pages |
| 36 | "Some providers offer BAA-covered tiers (typically enterprise plans with significant minimum commitments)" | Vendor pricing claim, no source | Provider pricing/BAA documentation |
| 38 | Compliance researcher quote: "Static controls collapse when an agent rewrites its plan mid-run." | Anonymous, uncited quote | A citation/link |
| 81 | "Go's ... crypto/tls package supports FIPS 140-2 mode on supported platforms" | Go's native FIPS module (GOFIPS140, Go 1.24+) targets FIPS 140-3; 140-2 applied to the older BoringCrypto fork. Claim as stated is imprecise and unconfirmed | Go release notes / NIST certificate reference |
| 127 | "Pilot's revocation is effective within the keepalive interval (30 seconds by default, immediate if a connection is active)." | 30s keepalive default verified (cmd/daemon/main.go:72) but "immediate termination of active connections on untrust" behavior not found in source | A test or code path showing untrust tears down live tunnels |

## Verified claims (grouped by source)
- web4 pkg/daemon/keyexchange/derive.go: X25519 ECDH key exchange (ecdh.X25519()), AES-256-GCM (aes.NewCipher + cipher.NewGCM), random NoncePrefix per connection, stdlib-only crypto imports
- web4 pkg/daemon/tunnel.go + cmd/daemon/main.go: Ed25519 identity signing; keepalive default 30s; log/slog structured logging used by daemon
- protocol@v1.10.5 pkg/protocol/header.go:46: PortSecure = 443 ("port 443, the secure port")
- protocol@v1.10.5 pkg/secure + peers help text: beacon relay for symmetric NAT; relay path exists; E2E session keys established peer-to-peer so beacon sees ciphertext
- web4 cmd/pilotctl/main.go: commands handshake <peer> [justification], pending, approve, untrust, set-webhook <url>, send-file, recv, daemon start --email, network join all exist
- Pre-verified cheatsheet: github.com/pilot-protocol/pilotprotocol repo exists (CTA link); private-by-default visibility model (set-private/set-public, registry-enforced visibility)
- RFC/regulation knowledge: 45 CFR 164.312(a)/(b)/(c)/(e) safeguard descriptions correct; 164.514(b) Safe Harbor 18 identifiers; 164.408 60-day/500+ notification; GDPR Art. 9 and Art. 35 quote correct; RFC 7748 = X25519 (HTTP 200), RFC 5288 = AES-GCM (HTTP 200)
- Live URL: hhs.gov/hipaa/index.html (403 = bot block; canonical HHS HIPAA URL)
- Local files: banner public/blog/banners/hipaa-compliant-agent-communication.webp exists
- EXAMPLE items: terminal blocks (addresses 1:0001.0000.0042, BAA #2026-0142, example.com emails, sample slog JSON lines — note the slog msg names mirror the invented event names above; illustrative only). Cosmetic: "Getting Started" steps jump 1→3.

## Resolutions (2026-07-11 iter 53)
- L159-162 + slog examples L146-149 (fictional event names trust.request/connection.open/task.submit/data.send): replaced with the real daemon publishEvent topics (node.registered, agent.registered, agent.heartbeat, conn.established/fin/rst, data.datagram, file.delivered, key.rotated, tunnel.*, security.*).
- L164 ("webhook pushes to a local HTTP server, does not send to external"): common/urlvalidate accepts any http/https URL (blocks only cloud-metadata). Reworded to "can push to any HTTP/HTTPS endpoint; point it at a local server to keep data on-host; nothing forces localhost".
Build: npm run build green (345 pages).
