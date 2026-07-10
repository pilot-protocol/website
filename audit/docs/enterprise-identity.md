# Claim audit: src/pages/docs/enterprise-identity.astro
Audited: 2026-07-10 · Sentences examined: 106 · verified: 75 · false: 22 · unverifiable: 0 · opinion: 2 · example: 7

Primary source of truth: the registry server implementation, `github.com/pilot-protocol/rendezvous@v0.2.5`
(module cache: /Users/calinteodor/go/pkg/mod/github.com/pilot-protocol/rendezvous@v0.2.5), which is the
version pinned by web4/go.mod. Abbreviated below as `rv/`.

## FLAGGED — FALSE

| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 26 | "Identity integration is per-network." | IDP config is registry-global: `Store.idpConfig` is a single field (rv/identity/identity.go:188), `HandleSetIDPConfig` accepts no `network_id` (rv/identity/identity.go:659-702), and blueprint provisioning also writes the same global store (rv/identity/provision.go:142). |
| 26 | "Each network can have its own IDP configuration, allowing different teams or environments to use different providers." | Same evidence — one global config; setting a new IDP overwrites the previous one for the whole registry. |
| 47 (also 59, 80, 132, 146, 153, 168, 205) | `"command": "set_idp_config"` — every JSON example uses `"command"` as the message key | The wire envelope key is `"type"`: `msgType, _ := msg["type"].(string)` (rv/server_api.go:114); the official client sends `"type": "set_idp_config"` (common@v0.5.0/registry/client/client.go:1334). A message with only `"command"` would dispatch nothing. |
| 48 (also 133) | `"type": "oidc"` / `"type": "webhook"` as the provider-type field | The handler reads the provider type from `msg["idp_type"]` (rv/identity/identity.go:664); the client sends `"idp_type"` (client.go:1335). `"type"` is the command envelope key, so `"type":"oidc"` would be parsed as an unknown command. |
| 85 | "Returns: `valid` (bool), `claims` (the decoded JWT claims if valid), or `error` (string...)" | `HandleValidateToken` returns `"verified"` (bool), `"subject"`, `"issuer"`, and optionally `"error"` — there is no `valid` field and no `claims` object (rv/identity/identity.go:791-795, 817-821, 850-855). |
| 95 | "**Issued-at** (`iat`) - checked for reasonableness" | `iat` is parsed into `JwtClaims.IssuedAt` but never referenced in `ValidateJWTClaims` — only `exp` and `nbf` are checked (rv/identity/identity.go:932-959). |
| 96 | "**Issuer** (`iss`) - must match the configured IDP URL" | Issuer is compared to the configured `issuer` field, not the URL: `ValidateJWTClaims(claims, idp.Issuer, idp.ClientID)` (rv/identity/identity.go:790, 933), and only when `issuer` is non-empty. |
| 110 | "Refresh — Automatic on cache expiry; on-demand if `kid` not found in cached set" | Second clause false: with a fresh cache, a missing `kid` returns error `JWKS key %q not found (cached)` without refetching (rv/identity/identity.go:1006-1025). Refetch happens only on TTL expiry, URL change, or empty cache. |
| 120 | "The validator enforces the expected algorithm based on configuration." | The IDP config has no algorithm field (`BlueprintIdentityProvider`: type/url/issuer/client_id/tenant_id/domain — common@v0.5.0/registry/wire/blueprint.go:57-64). The switch is on the attacker-supplied JWT `alg` header; protection comes from matching against the JWKS key's own `alg`/`kty` (rv/identity/identity.go:800-844). |
| 120 | "The `alg` header in the JWT must match the configured algorithm." | Same evidence — there is no configured algorithm; the `alg` header must be consistent with the fetched JWKS key (`oct` for HS256, `RSA` for RS256). |
| 124 | "A 60-second clock skew tolerance is applied to all time-based claims (`exp`, `nbf`, `iat`)." | `jwtClockSkew = 60` is applied to `exp` and `nbf` only; `iat` is never validated at all (rv/identity/identity.go:930, 950-956). |
| 163 | "...automatically provisioning and deprovisioning network members." | Sync never provisions (adds) members: unmatched entries are counted `Unmapped` and at most get a role pre-assignment for a future join (rv/directory_sync.go:91-98). Only deprovisioning (disabled/remove_unlisted removal) happens. |
| 170-181 | Sync example entries contain `"node_id": 5` and `"tags": ["frontend", "us-east"]` | `DirectoryEntry` has no `node_id` or `tags` fields — only external_id, display_name, email, groups, role, disabled (rv/replication/replication.go:220-228); `ParseDirectoryEntries` ignores unknown keys (replication.go:248-278). |
| 190 | "**Matches entries** - each entry is matched to a registered node by `node_id`" | Matching is by normalized `external_id` against existing members' external IDs (rv/directory_sync.go:23-24 doc comment, 73-91). `node_id` is never read from entries. |
| 191 | "**Joins to network** - nodes not already in the network are added" | `applyDirectorySync` never adds members; entries with no matching member increment `Unmapped` and are skipped (rv/directory_sync.go:91-98). |
| 192 | "Owner role cannot be assigned through sync." | It can: `case "owner": targetRole = RoleOwner` (rv/directory_sync.go:114-115). |
| 193 | "**Sets external IDs** - the `external_id` field is stored for identity mapping" | Sync only reads external IDs to match; it never calls `UpdateNodeExternalID` or stores anything on the node — the node must already carry an external ID (set via `set_external_id` or register) to be matched. |
| 194 | "**Applies tags** - optional `tags` field sets the node's capability tags" | No tags handling anywhere in the sync path; `DirectoryEntry` has no tags field (rv/directory_sync.go:88-139, replication.go:220-228). |
| 200 | "when a new member is added through sync, they receive their assigned role immediately instead of defaulting to member" | Members are never added through sync. Pre-assignments are stored for unmatched external IDs (rv/directory_sync.go:94-97) and applied later when the node joins via `join_network` (rv/membership/membership.go:430). |
| 205 | `"command": "get_directory_status"` | The command is `directory_status`, not `get_directory_status` (rv/dispatch.go:245); pre-verified cheatsheet also lists pilotctl `directory-status`. |
| 210 | "Returns the last sync timestamp, number of entries processed, and any errors encountered." | `handleGetDirectoryStatus` returns network_id, total, mapped, unmapped, enterprise, pre_assignments, last_sync — no entries-processed count and no errors field (rv/directory_sync.go:255-278). |
| 212 | "recording the network ID, number of entries added, removed, and role changes" | Audit attrs are `network_id, mapped, updated, disabled, unmapped` (rv/directory_sync.go:165-167). There is no "added" count (nothing is ever added); event name `directory.synced` and network ID are correct. |

## Verified claims (grouped by source)

- rv/dispatch.go:215-250: commands `set_idp_config`, `get_idp_config`, `validate_token`, `set_external_id`, `get_identity`, `directory_sync` all exist and are dispatched.
- rv/identity/identity.go: RS256+HS256 as the only two supported JWT algorithms (800-844, default→"unsupported"); signature verification against JWKS RSA key / HMAC secret (1088-1135); exp and nbf validation (951-956); aud must match configured client_id (937-948); `idp.configured` audit on set/change (695); `identity.external_id_set` audit with old+new values (646); external IDs free-form (no format validation, 634-637) and included in audit; webhook IDP POSTs token to endpoint and requires JSON verified/rejection response, never falls back to accepting unverified tokens (260-354); JWKS cache TTL 5 min (`JwksCacheTTL = 5*time.Minute`, 989), max response 64 KB (`io.LimitReader(..., 64*1024)`, 1074), key matching by `kid` (1004-1051), refetch on expiry, hard failure when JWKS unreachable; algorithm-confusion attack outcome prevented via JWKS `kty`/`alg` cross-check (806-833) — mechanism differs from doc but the attack is blocked; 60 s skew constant (930).
- rv/server_persist.go:429-430, 917-922: IDP config included in snapshot and restored on start — "stored in the registry and persists across restarts".
- rv/server_handlers.go:30: register flow calls `s.identity.VerifyToken` — registry validates presented tokens before granting access.
- rv/directory_sync.go:142-167: `remove_unlisted` kicks members whose external_id is absent from entries (caveat: members without an external_id are skipped); `directory.synced` audit emitted after each sync with network ID; enterprise-network gate (67-69); last-sync timestamp surfaced by `directory_status` (273-278). RBAC pre-assignment mechanism exists (173-187) and is applied at join (rv/membership/membership.go:430).
- common@v0.5.0/registry/wire/blueprint.go:31, 57-64, 120-131: blueprint `identity_provider` field exists; valid provider type values exactly `oidc`, `saml`, `webhook`, `entra_id`, `ldap` (matches the providers table); `client_id`, `url`, `issuer`, `tenant_id`, `domain` config keys.
- common@v0.5.0/registry/client/client.go:1331-1350: `admin_token`, `url`, `client_id` message field names.
- Local site files: `src/pages/docs/enterprise-blueprints.astro`, `enterprise-rbac.astro` (contains permissions matrix), `enterprise-policies.astro` all exist; prev/next frontmatter labels match those pages' titles ("RBAC & Access Control", "Network Policies"); all 9 TOC anchors resolve to headings in the body; canonicalPath/activePage self-consistent.
- Public standards knowledge: OIDC = JWT-based SSO used by Auth0/Okta/Google; SAML = XML-based SSO; Entra ID = renamed Azure AD; LDAP = on-prem directory protocol; Ed25519 built-in keys (pre-verified: Pilot crypto).

## OPINION (not flagged)
- Line 124: "This accommodates minor clock differences ... without opening a significant window for expired tokens."
- Line 200: "This is useful for provisioning admin roles in bulk."

## EXAMPLE (not flagged)
- Placeholder values in all seven code blocks: `accounts.example.com`, `pilot-network-prod`, `your-admin-token`, `eyJhbGciOiJSUzI1NiIs...`, `auth.example.com`, `user@example.com`, `alice@example.com`, `bob@example.com`, node IDs 5/8, network_id 1.
