# Claim audit: src/pages/docs/trust.astro
Audited: 2026-07-10 · Sentences examined: 70 · verified: 63 · false: 0 · unverifiable: 0 · opinion: 3 · example: 4

No flagged claims.

## Verified claims (grouped by source)
- **web4/cmd/pilotctl/main.go**: `handshake`, `approve`, `reject`, `pending`, `trust`, `untrust` subcommands all exist in the dispatch (L1781-1791) and usage strings match page syntax — `handshake <node_id|hostname> [justification]` (L932), `pending` (L1074), `trust` (L1084), `untrust <node_id|address|hostname>` (L1107), `reject <node_id|address|hostname> [reason]` (L1115), `approve <node_id|address|hostname>` (L1122). cmdUntrust JSON output = `{node_id}` (L4894-4899); cmdPending reads `node_id`/`justification`/`received_at` (L4903-4942); cmdTrust reads `trusted[]` with `approved_at` sort (L4944+); approve help "Once approved, encrypted messages can flow in both directions" + cmdApprove prints "trust is now mutual" → step-5 "both agents can communicate" claim.
- **web4/pkg/daemon/ipc.go:1900-1993**: return-field claims — handshake → `{status,node_id}` (status "sent"/"in_flight", L1911-1924); approve → `{status:"approved",node_id}` (L1936-1940); reject → `{status:"rejected",node_id}` (L1954-1961); pending → `pending[{node_id,justification,received_at,…}]` (L1966-1976); trust → `trusted[{node_id,approved_at,mutual,network,…}]` (L1983-1993).
- **plugins/handshake (…/pilot-protocol/handshake/handshake.go)**: justification field (L36); pending map + persistence; mutual auto-approval "Mutual! Auto-approve (registry confirmed pubkey binding)" (L679, TrustRecord.Mutual "true if both sides initiated" L47) → auto-approval section; TrustRecord fields Mutual/Network/ApprovedAt (L42-48); trust state saved to `trust.json` (storePath L124; snapshot includes trusted+pending+revoked, L282-356; loaded on start L399-439) → persistence claims; untrust "The remote peer is notified (best-effort)": RevokeTrust sends HandshakeRevoke to the peer with comment "Notify the peer BEFORE tearing down the tunnel" and `hm.sendMessage(peerNodeID, &msg) // best-effort, ignore error` (L1230-1243); registry resolve re-blocked on revoke (L1249-1251); P2P handshake signature verification (L557-597, crypto.Verify).
- **common@v0.5.0/crypto/identity.go:38 + handshake/runtime.go:20**: `crypto.Verify` takes `ed25519.PublicKey` → "signed with Ed25519 to prevent spoofing".
- **web4/pkg/daemon/daemon.go:5834-5836**: "relayed handshake request received" → "relayed through the registry"; corroborated by prior ledger audit/docs/concepts.md (registry server.go:4475-4510 Ed25519 verification of relayed requests).
- **web4/cmd/daemon/main.go:85**: `-public` flag default false, "make this node's endpoint publicly visible (default: private)" → "Agents are private by default"; combined with handshake.go:1249 (registry resolve gated on trust pair) → "No other agent can discover your address, resolve your hostname, or open a connection… until trust".
- **Local site files (src/pages)**: internal links — `docs/networks.astro`, `docs/messaging.astro` exist (prev/next + "See also" callout); blog targets `trust-model-agents-invisible-by-default.astro` and `secure-ai-agent-communication-zero-trust.astro` exist; all TOC anchors (#why #flow #auto #commands #persistence) present in body.
- **Frontmatter**: title/description name only commands verified above; prev=/docs/messaging, next=/docs/networks resolve to existing pages.

## Opinion (not flagged)
- L22 "This prevents spam, unwanted connections, and unauthorized access." — design rationale.
- L22 "Every relationship between agents is intentional and bilateral." — characterization of the default model (embedded trusted-agents list and network membership are documented exceptions, acknowledged in the page's own Networks callout).
- L60 "This is useful for automated agent-to-agent trust establishment…" — usefulness judgment.

## Example values (not flagged)
- `agent-b` / `agent-a` hostnames and `approve 5` node ID in the two terminal blocks — illustrative arguments to verified command syntax (numeric args parse as node IDs, cmdApprove/resolveToNodeID).

## Notes (not page errors)
- The CLI help text for `untrust` (main.go:1107-1113) says "This does not notify the remote node", but the implementation (handshake.go:1230-1243) does send a best-effort HandshakeRevoke notification. The page matches the implementation; the stale text is in the CLI help, not the page.
- `pilotctl reject` exists in source (main.go:1115, 1785) despite being absent from the pre-verified subcommand cheatsheet; source grep is authoritative here.
