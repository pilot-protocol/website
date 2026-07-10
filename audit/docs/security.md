# Claim audit: src/pages/docs/security.astro

Audited: 2026-07-10 · Sentences examined: 23 · verified: 23 · false: 0 · unverifiable: 0 · opinion: 0 · example: 0

No flagged claims.

## Verified claims (grouped by source)

- **web4/pkg/daemon/tunnel.go:534 + pkg/daemon/keyexchange/derive.go:21-60**: tunnel scheme "X25519+AES-256-GCM" (logged literally); shared AES-256-GCM cipher derived from peer X25519 key; per-tunnel encryption → L30 tunnels bullet, L42 "end-to-end encrypted" claim.
- **web4/pkg/daemon/tunnel.go:8,111-120 + zz_tunnel_frames_test.go:95-120**: Ed25519 identity keys; handshake frame = X25519 pub + Ed25519 pub + 64-byte signature → L29 "signs trust handshakes".
- **web4/cmd/daemon/main.go:389**: default identity path `filepath.Join(home, ".pilot", "identity.json")` → L29 `~/.pilot/identity.json`.
- **web4/pkg/daemon/zz_info_snapshot_test.go:115** (lookupPeerPubKey fetches Ed25519 pubkey from registry Lookup): public key registered with / served by registry → L29.
- **Go crypto imports (grep, no matches for golang.org/x/crypto anywhere in web4; keyexchange + tunnel import only stdlib crypto/aes, crypto/cipher, crypto/ecdh, crypto/ed25519, crypto/hmac, crypto/rand, crypto/sha256)** + go.mod (no crypto module deps): "Go standard library only; no external crypto dependencies" → L31.
- **https://datatracker.ietf.org/doc/draft-teodor-pilot-protocol/ (HTTP 200, 2026-07-10; page body contains 70 wire/frame/header matches)**: IETF Internet-Draft exists and covers wire format → L31.
- **Pre-verified cheatsheet**: compat mode = single outbound TCP/443 SNI-routed (L30); consent defaults telemetry/broadcasts/reviews = true and skill_inject default auto (L42); injection toolchains Claude Code, OpenClaw, OpenHands, PicoClaw, Hermes — no Cursor (L42); service-agents = network 9, Backbone #0 separate (L38 "isolated network"); pilot-protocol GitHub org repos exist (L38).
- **web4/pkg/daemon/daemon.go:3489-3505 + cmd/pilotctl/main.go:1503,2246**: auto-handshake/auto-approval is scoped to the embedded trusted-agents list ("Scoped to the trusted-agents list so we don't spray handshakes at arbitrary peers") → L38 "auto-approval never affects your personal peer connections"; "open trust" = embedded directory of auto-approved service agents.
- **web4/pkg/daemon/services.go:171 + daemon.go:2911,3339 (IsTrusted gates on traffic paths); pilotctl approve/accept subcommands (pre-verified)**: mutual handshake required before traffic flows → L38.
- **web4/LICENSE (GNU Affero General Public License v3)**: AGPL-3.0 → L38.
- **https://pilotprotocol.network/install.sh (live, fetched 2026-07-10)**: discloses all four default-on features — "TELEMETRY (on by default)" L781, "BROADCASTS (on by default)" L788, "REVIEWS (on by default)" L795, plus skill auto-injection section with per-tool paths — each with a one-line `consent.<flag> = false` opt-out → L42 "each disclosed by the installer and individually disableable". (Note: local release/install.sh copy at HEAD lacks the CONSENT & PRIVACY block; the live served installer has it.)
- **common@v0.5.0/consent/consent_test.go:47-97**: individual per-flag consent keys (telemetry, broadcasts, reviews) with independent opt-out → L42.
- **web4/cmd/pilotctl/skills.go:27-52,66-147**: `pilotctl skills status` exists and prints per-tool/per-file state + "what, if anything, the next tick would change" (`next: <action>`) → L42 "previews every pending change before it lands".
- **website/src/pages/docs/consent.astro:11-14,38,76,91,107,127,148-168,261**: documents each default, risk profiles / "The realistic threat", exact files written (SKILL.md + heartbeat paths), "What you lose if you turn it off", one-line opt-outs → L42.
- **web4/cmd/pilotctl/main.go:7404**: `audit-export set --format <json|splunk_hec|syslog_cef>` → L46 "audit export (Splunk HEC, CEF/Syslog, JSON)"; corroborated by website enterprise-audit.astro:118-130.
- **website/src/pages/docs/ listing**: internal link targets exist — concepts.astro (with `id="rendezvous"` at line 89), firewalls.astro, trust.astro, consent.astro, enterprise.astro, enterprise-rbac.astro, enterprise-identity.astro, enterprise-policies.astro, enterprise-audit.astro → L29-30, L34, L38, L42, L46, and prev/next frontmatter (L9-10).
- **website/public/**: enterprise-readiness-report.pdf exists → L46; .well-known/security.txt exists with `Contact: mailto:founders@pilotprotocol.network` → L50 both sentences (email matches the machine-readable contact).
- **Page self-consistency**: title (L5), meta description (L6), h1 (L12), subtitle (L13), and TOC entries (L16-23) accurately describe the five sections present on the page (#crypto, #trust, #transparency, #enterprise, #reporting).
