# Claim audit: src/pages/blog/ietf-internet-draft-pilot-protocol.astro
Audited: 2026-07-10 · Sentences examined: 64 · verified: 43 · false: 2 · unverifiable: 12 · opinion: 5 · example: 2

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 44 | "converts our <a href='https://github.com/pilot-protocol/pilotprotocol/blob/main/docs/SPEC.md'>wire specification</a>" | curl → HTTP 404. Pre-verified: public pilotprotocol repo has no docs/SPEC*.md. Broken/false citation. |
| 83 | "These sections are now part of the wire specification (Sections 8, 9, and 10)" linking the same docs/SPEC.md | Same 404 link — the referenced document does not exist publicly. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 22 | "Over a dozen [AI agent drafts] have been filed" | No live count performed; datatracker keyword census not feasible here | Datatracker search enumerating the drafts |
| 22 | "Every single one operates at the application layer over HTTP." | Sweeping claim over an open set of third-party drafts | Reading each draft |
| 24 | "Nobody is addressing the network and transport layer for agents." / "We are the only protocol that…" | Absolute uniqueness claim over all filed drafts | Exhaustive datatracker review |
| 34 | "88% of real-world networks involve NAT." | Uncited third-party statistic | A cited measurement study |
| 44 | "The protocol spec is a 45-page document" | Local -01 txt is ~43 pages (42 form feeds); the rev-00 page count at posting time not available locally | Page count of draft-…-00 from IETF archive |
| 57 | "Go reference implementation (226+ tests, 5 GCP regions)" | Historic test count and multi-region test runs not reproducible | CI records at that commit |
| 62 | "typically multiple revisions over months to years" | General IETF process characterization, plausible but uncited | RFC-editor/IESG process docs |
| 68 | "Anyone working on AI agent protocols at the IETF will find these documents." | Prediction about third-party behavior | n/a |
| 90 | Email teodor@vulturelabs.com | Mailbox existence not verifiable; note the author's known address is teodor@vulturelabs.io — possible wrong TLD | Sending mail / MX + mailbox check |
| 128 (FAQ) | "Over a dozen … every one operates at the application layer over HTTP" | Same as line 22 | Same |
| 18 | "It does not (yet) carry IETF consensus" — "independent stream" submission classification | Datatracker page state (stream) not inspected | Datatracker metadata for the drafts |
| 70 | "could lead to a BoF … potentially a working group, and eventually an RFC" | Future projection | n/a |

## Verified claims (grouped by source)
- Live URLs (curl, HTTP 200): www.ietf.org/archive/id/draft-teodor-pilot-problem-statement-01.html and draft-teodor-pilot-protocol-01.html (drafts are live on IETF archive); datatracker pages for draft-rosenberg-aiproto-framework, draft-zyyhl-agent-networks-framework, draft-narvaneni-agent-uri (all exist); rfc-editor.org/rfc/rfc7364.html (NVO3 problem statement exists).
- public/research/ietf/draft-teodor-pilot-problem-statement-01.txt: REQ-1 through REQ-11 present (13 total in -01, consistent with "11 formal requirements" at rev 00 + 2 added later); gap analysis covers MCP, A2A, WebRTC, QUIC, libp2p, WireGuard, LISP (28 mentions).
- public/research/ietf/draft-teodor-pilot-protocol-01.txt: spec covers addressing, 34-byte header, four frame types PILT/PILS/PILK/PILA, session layer (sliding window, SACK, congestion control, Nagle), NAT traversal, Ed25519/X25519/AES-256-GCM security, nonce management, version negotiation, PMTU, IANA considerations, implementation status — all listed bullet topics present.
- protocol@v1.10.5 source: 48-bit addresses (16+32), 34-byte header, frame magics, nonce construction — matches "spec improvements" descriptions (keyexchange/crypto.go, protocol/header.go, packet.go).
- Local site files: /research/WHITEPAPER.pdf exists (public/research/WHITEPAPER.pdf); internal links connecting-mcp-servers-across-agents, pilot-vs-tcp-grpc-nats-comparison, nat-traversal-ai-agents-deep-dive exist; banner webp exists.
- Pre-verified: PyPI package pilotprotocol exists ("Python SDK on PyPI").
- Datatracker (curl 200): CATALIST-adjacent claims deferred to rev-01 audit.
- OPINION: "The positioning is simple", "Credibility…different conversation", "demands rigor", CTA copy.
- EXAMPLE: subject-line templates.

## Resolutions (2026-07-11 iter 53)
- L44/L83 (docs/SPEC.md link 404): the public repo has no docs/SPEC.md. Repointed both "wire specification" links to the live IETF draft (www.ietf.org/archive/id/draft-teodor-pilot-protocol-01.html, verified 200). Also dropped the unverifiable "45-page" count from L44.
Build: npm run build green (345 pages).
