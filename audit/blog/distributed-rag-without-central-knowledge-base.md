# Claim audit: src/pages/blog/distributed-rag-without-central-knowledge-base.astro
Audited: 2026-07-10 · Sentences examined: 88 · verified: 32 · false: 4 · unverifiable: 7 · opinion: 26 · example: 19

## FLAGGED — FALSE
| Line | Sentence (quote, truncate >160 chars) | Evidence it is false |
|---|---|---|
| 189 | Python retriever calls `pilotctl receive-message --timeout 60 --json` (presented as working implementation) | No `receive-message` subcommand exists. Dispatch in web4/cmd/pilotctl/main.go has `recv`, `received`, `inbox`, `send-message` — grep for "receive-message" across cmd/ and pkg/ returns nothing. |
| 267 | Synthesis agent calls `pilotctl receive-message --timeout 30 --from <addr> --json` | Same — command does not exist, nor a `--from` filter for it. |
| 77 | `pilotctl peers --search "rag-retriever" --json` used for tag-based discovery | peers flags are `--all`, `--limit`, `--search` only (main.go help); no `--json` flag; `--search` filters by node-ID substring in cmdPeers, not tags. |
| 79 | "This returns the address and tags of each retriever. The synthesis agent uses the tags to route queries..." | peers output is a secure/relay/direct summary plus exception rows built from the daemon's connected peer_list; it does not return tags, and cannot discover agents by tag. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 351/353 | "Query latency ~50ms (single store)" vs "~200ms (network + search)" | No benchmark cited | Published benchmark |
| 376 | "the synthesis agent sends queries to retrievers (~5ms per peer on Pilot), each retriever searches its local store (~50ms) ... Total is roughly 100-200ms" | Invented latency figures presented as real measurements | Measured RTT/benchmark data |
| 367 | "Pilot daemon (10MB per agent)" | No memory measurement source | RSS measurement |
| 6 | "Teams report constantly debugging where things break down in their RAG pipelines." | Unattributed survey-style claim | Citation to reports/threads |

## Verified claims (grouped by source)
- web4/cmd/pilotctl/main.go: `extras set-tags`, `send-message <addr> --data`, `handshake <peer> [justification]` ("remote node must approve the request before messages can flow" — supports trust-gated access), `approve`, `untrust` all exist.
- web4/cmd/daemon/main.go:85: `-public` defaults to false ("default: private") — "agents are private by default", not in public directory; set-private help confirms directory hiding.
- web4/pkg/daemon/keyexchange/: encrypted queries (X25519 + AES-GCM) backing the CTA "encrypted queries" claim.
- Live URLs (HTTP 200, 2026-07-10): https://www.pinecone.io, https://www.trychroma.com.
- Pre-verified: github.com/pilot-protocol/pilotprotocol repo exists.
- Local site files: banner public/blog/banners/distributed-rag-without-central-knowledge-base.webp exists.
- General knowledge: RAG/vector-DB architecture description, ChromaDB PersistentClient/upsert/query API shape, hnsw:space cosine metadata, OpenAI chat.completions API shape — all consistent with public docs (code examples otherwise EXAMPLE).

Note: line 99 "It cannot even discover the HR agent exists (private by default)" is directionally supported (hidden from public directory) but a node's address remains reachable by peers that already know it (set-private help) — trust gating, not invisibility, is what blocks queries. Not counted as FALSE.

## Resolutions (2026-07-11 iter 47)
- L77/L79 (peers --search for tag discovery + "returns address and tags"): peers matches node-ID/hostname substring and does not return tags. Reframed to hostname-substring discovery (name retrievers rag-hr/rag-legal/rag-eng), fixed command to `pilotctl --json peers --search "rag-"`, and route by hostname.
- L189/L267 (pilotctl receive-message — no such command): replaced with the real `pilotctl --json inbox [--from <addr>] --limit 1` (recv/inbox exist; receive-message does not).
Build: npm run build green (345 pages).
