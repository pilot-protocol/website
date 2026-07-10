# Claim audit: src/pages/blog/ietf-internet-drafts-pilot-protocol-revision-01.astro
Audited: 2026-07-10 · Sentences examined: 72 · verified: 55 · false: 1 · unverifiable: 9 · opinion: 3 · example: 4

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 178 | "The source Markdown and build tooling live in <a href='https://github.com/pilot-protocol/pilotprotocol/tree/main/docs/ietf'>docs/ietf/</a> in the repository." | curl → HTTP 404. Pre-verified: public pilotprotocol repo has no docs/ietf. The linked directory does not exist. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 30, 36 | "reflecting 80+ commits of new functionality since the initial March 2026 submission" / "Three weeks and 80+ commits later" | Commit count between two dates not verifiable (source repo of record private/not identified) | git log between the two submission dates |
| 32, 48 | "30+ new IETF drafts filed since the CATALIST BoF" / "Over 30 individual drafts have been filed" | No independent census of datatracker performed; count only asserted in Pilot's own draft | Datatracker enumeration of agent-protocol drafts |
| 49 | "every new draft operates at the application layer over HTTP … None addresses the network or transport layer" | Sweeping claim over third-party drafts | Reading each draft |
| 59 | "No existing draft covers this [multi-tenant isolation]." | Same class of exhaustive claim | Same |
| 83 | "Ten new informative references are added." | Requires diff against rev-00, which was not fetched | Diff of -00 vs -01 references sections |
| 153 | "The Python SDK is upgraded from beta to production-ready." | Draft -01 says production; the -00 "beta" designation not checked | rev-00 implementation status section |
| 178 | "Run make build to regenerate from source (requires kramdown-rfc and xml2rfc)" | Tooling lives in the 404'd docs/ietf path; cannot inspect Makefile | Access to the ietf build directory |
| 188 | "Yes. The drafts will continue to track the implementation…" | Future projection | n/a |
| 49-50 | "This validates the original problem statement's thesis and gives Pilot Protocol a distinct position" | Interpretive/uniqueness claim | n/a |

## Verified claims (grouped by source)
- public/research/ietf/draft-teodor-pilot-protocol-01.txt (local copy of the live -01, which also returns 200 on ietf.org): HKDF (RFC 5869) extract/expand with info strings pilot-tunnel-v1 and pilot-secure-v1; GCM AAD = sender Node ID (tunnel) / nonce prefix (port 443) (lines 1153, 1208); PILP punch frame [P I L P][SenderID 4 bytes], no payload, silently discarded; role-prefix nonces 0x00000001 server / 0x00000002 client; sliding-window replay bitmap, recommended 256 nonces (line 1984-1985); IPC commands 0x11-0x22 (= 18 commands); registry hot-standby, push snapshots, 15-second heartbeat, manual failover (lines 1724-1754); RBAC Owner/Admin/Member (line 1768+); max_members policy; ring-buffer audit trail (line 1809); OIDC/JWT, RS256, JWKS; gateway bridge via loopback aliases (§15, line 1523+); P2P handshake signing, registry authentication, TLS certificate pinning SHA-256 (§19.4, line 1909); Node.js SDK section (§21.3); "983 tests. Integration tests validated across 5 GCP regions" (line 2139).
- public/research/ietf/draft-teodor-pilot-problem-statement-01.txt: REQ-12 and REQ-13 present; CATALIST cited 16×; AGTP/ATP/AIP gap analysis present (10-12 mentions each); IETF 125 / Shenzhen referenced.
- Live URL (curl 200): datatracker.ietf.org/meeting/125/session/catalist — CATALIST BoF session at IETF 125 exists.
- protocol@v1.10.5 source: PILP = TunnelMagicPunch 0x50494C50 (header.go:73); HKDF info "pilot-tunnel-v1" in code (keyexchange/derive.go:19); NoncePrefix[4]+counter (crypto.go:121-122) — spec matches implementation.
- Local site files: /research/ietf/draft-teodor-pilot-{problem-statement,protocol}-01.{html,txt} all exist in public/research/ietf/; internal link /blog/ietf-internet-draft-pilot-protocol exists.
- Live URLs (curl 200): the three "Recommended" pilotprotocol.network blog links resolve.
- Pre-verified: npm package pilotprotocol exists (TypeScript FFI bindings on npm); PyPI pilotprotocol exists.
- Frontmatter/JSON-LD: datePublished 2026-04-06 matches date "April 6, 2026"; headline/description match page title/description.
- OPINION: "the implementation has grown substantially", "a solid core", "distinct position" framing.
- EXAMPLE: frame diagram formatting, HKDF pseudo-code block.

## Resolutions (2026-07-11 iter 61)
- L178 (docs/ietf/ repo link 404 + make build tooling): the public repo has no docs/ietf. Removed the false repo-path + make-build claim; repointed to the IETF datatracker and the on-site /research/ietf/ mirror (both live).
Build: npm run build green (345 pages).
