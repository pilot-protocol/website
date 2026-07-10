# Claim audit: src/pages/blog/trustless-protocols-that-secure-decentralized-ai-systems.astro
Audited: 2026-07-10 · Sentences examined: 82 · verified: 25 · false: 0 · unverifiable: 14 · opinion: 40 · example: 3

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 143 | "GenLayer's optimistic challenge-response model assigns a Primary Solver… verifiers challenge the result using fraud proofs or zero-knowledge proofs… economic incentives penalize (slash) nodes" | Cited Medium article returns HTTP 403 (bot-blocked); content unverifiable | Accessible copy of the GenLayer article/whitepaper |
| 150 | "Using CBOR instead of JSON, DSM achieves a 60% reduction in message size, with a compression ratio of 2.5." | Cited ScienceDirect article returns HTTP 403; figures unverifiable | Accessible paper (S1110016825007525) confirming figures |
| 150 | "The result is 250 transactions per second (TPS), outperforming both Cosmos (100-150 TPS) and Polkadot (100-150 TPS)" | Same blocked source; also Cosmos/Polkadot throughput and "JSON" data-format attribution (table lines 170-182) are dubious — Cosmos SDK/IBC uses Protobuf, and both chains claim far higher TPS in other sources | The cited paper plus independent Cosmos/Polkadot benchmarks |
| 151-184 | Framework comparison table (DSM 250 TPS / Cosmos JSON 100-150 / Polkadot JSON 100-150 / "20-30%" size efficiency) | Derived entirely from the blocked source; "20-30%" figures have no source at all | Same as above |
| 185 | "CAPPR-Wallet and AGENTSNET… privacy-preserving protocols can reduce privacy leakage from 85% down to 5%, with key recovery completing in approximately 8 seconds" | Nature URL returns 200 but article content behind cookie/JS wall; grep found none of the figures | Full-text confirmation of 85%→5% and ~8s figures |
| 187 | "as networks grow toward 100 agents, cooperation rates can drop to near zero without additional coordination mechanisms" | Attributed to AGENTSNET findings; content not confirmable | Full text of the Nature article |
| 197 | "250 TPS throughput using CBOR-based trustless frameworks gives you a practical baseline for sizing your agent network capacity." | Repeats the unconfirmed 250 TPS figure | Same as line 150 |
| 200 | "The ERC-8004 specification identifies three edge cases that directly threaten network integrity." | EIP-8004 mentions Sybil, but "identifies three edge cases" framing (Sybil / non-functional capabilities / LLM hallucinations) not confirmed as spec content | Quote from the EIP security-considerations section listing exactly these three |
| 203 | "LLM hallucinations create what researchers call the trust-unreliability paradox." | No source for the term "trust-unreliability paradox" | Citation to research using this term |
| 215 | "The ERC-8004 guidance for AI developers is explicit on this point: the right approach combines cryptographic IDs, verifiable credentials (VCs), and challenge-response mechanisms into a layered progressive trust model." | Could not confirm this specific guidance/wording in EIP-8004 | Quote from the EIP or its companion guidance |
| 229 | FAQ: "Trustless frameworks like DSM achieve 250 TPS using CBOR compression, significantly outperforming Cosmos and Polkadot" | Repeats unconfirmed figures | Same as line 150 |
| 38/72 | TL;DR/table: "Trustless protocols improve performance, scalability, and security compared to centralized systems" / "higher throughput… over traditional blockchain solutions" | Rests on the blocked DSM figures | Same |
| 214 | "The biggest mistake we see is treating trustless protocols as a cryptography problem." | First-person field-experience claim, no evidence | N/A (anecdote) |
| 185 | "That's a dramatic improvement that directly impacts how safely agents can exchange sensitive data" | Depends on unverified 85%→5% figure | Same as line 185 |

## Verified claims (grouped by source)
- https://eips.ethereum.org/EIPS/eip-8004 (HTTP 200, content grepped): Identity Registry / Reputation Registry / Validation Registry all present; ERC-721 identities; reputation score 0-100; zkML, TEE, stake-secured verification; Sybil discussed (lines 37, 97, 100-105, 202, 227).
- Internal links checked on disk (src/pages/blog/*, src/pages/for/p2p.astro): trust-network-protocols-secure-decentralized-systems, decentralized-communication-protocols-ai-developers, secure-communication-protocols-distributed-ai-systems, ai-networking-best-practices-secure-scalable-systems, decentralized-networking-p2p-solutions-ai-architectures, ai-networking-challenges-decentralized-systems, trust-model-agents-invisible-by-default, cloud-networking-secure-peer-to-peer-distributed-ai, /for/p2p — all exist (lines 86, 145, 194, 196, 201, 209, 218, 222, 236-239).
- public/blog/banners/trustless-protocols-that-secure-decentralized-ai-systems.jpg exists (line 248).
- Supabase image URLs (lines 8, 31, 144, 186, 221): all HTTP 200.
- Product source web4 + pre-verified ground truths: Pilot Protocol provides virtual addresses, encrypted tunnels, NAT traversal, mutual trust establishment (line 222) — matches implementation.

Remaining sentences are definitional/editorial ("trustless does not mean untrusted", pro tips, progressive-trust advice) classified as OPINION.
