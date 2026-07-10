# Claim audit: src/pages/blog/enterprise-production-complete-identity-directory-audit-export.astro
Audited: 2026-07-10 · Sentences examined: 118 · verified: 22 · false: 0 · unverifiable: 62 · opinion: 6 · example: 28

The registry SERVER source is not present in the local checkout (web4/pkg contains only daemon + telemetry; no registry server package found under /Users/calinteodor/Development/pilot-protocol). Protocol command names could be corroborated in client-side test fakes (web4/cmd/pilotctl/zz_fake_registry_test.go, web4/tests/*), but all server-internal behavior claims (caches, buffers, retry counts, metric names, test counts) are UNVERIFIABLE with local tools.

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 5 | "Pilot Protocol now ships 99 features across 53 protocol commands, backed by 234 tests." | Registry server source and test suite not locally available; counts cannot be re-derived | Registry repo checkout; `go test -list` output |
| 5 | "Every feature described here is implemented, tested, and running in production on the live registry." | Cannot inspect the live registry's deployed build | Registry deployment manifest / version endpoint |
| 9-11 | Enterprise gating behavior ("Seven registry handlers enforce the enterprise gate...", RBAC init on toggle) | Server-side logic; source not local | Registry handler source |
| 15-28 | IDP details: five provider types, RS256/HS256, claims validated, 60s clock skew, algorithm-confusion blocking | Server-side JWT validation code not local (validate_token/set_idp_config names do appear in client test fakes) | Registry JWT validator source |
| 32 | "JWKS keys are cached for 5 minutes... capped at 64KB" | Server internals | Registry JWKS cache source |
| 57-65 | Directory sync semantics (role updates, disable/kick, remove-unlisted, pre-assignment, hostname enrichment) | Server internals; only command names (directory_sync/directory_status) corroborated in client fakes | Registry directory sync source |
| 97,132,150 | Blueprint provisioning atomicity, idempotency, validation-before-mutation | Server internals; provision_network name corroborated in client fakes | Registry provision handler |
| 154-168 | Audit export: three channels, Splunk HEC/CEF/JSON formats, CEF severity mapping, 1024-slot buffer, 3 retries w/ 1s/2s/4s backoff, drop counting | Server internals | Registry audit exporter source |
| 172 | "DLQ holds the last 100 failed events"; 5xx retried 3x, 4xx straight to DLQ | Server internals | Registry webhook DLQ source |
| 195-199 | Ownership transfer atomicity, "six edge cases", chain transfers | Server internals; transfer_ownership listed in blog only | Registry ownership handler + tests |
| 205-233 | All Prometheus metric names (pilot_network_members, pilot_invites_sent_total, etc.), "40+ metrics", from-scratch exposition format | Server internals; no /metrics endpoint curled (URL not stated) | Registry metrics source or live /metrics scrape |
| 240-246 | Security hardening list incl. constant-time replication token compare, per-op rate limits (resolve 100/min, query 500/min, heartbeat 50/min, registration 10/min) | Server internals | Registry rate limiter source |
| 248-274 | "234 Tests Across 21 Files" and entire per-file test-count table (enterprise_gate_test.go 43, fuzz_registry_server_test.go 42, ...) | `find` across the whole pilot-protocol tree found none of the named test files locally | Registry repo test files |
| 276-290 | "53 Protocol Commands" table incl. auth grouping | Only ~12 command names corroborated in client fakes; full list and auth tiers unverifiable | Registry command dispatch source |
| 292-317 | "99 Features, 21 Categories" inventory (incl. "60+ methods" client SDK) | Aggregate counts not derivable locally; common@v0.5.0 driver has far fewer than 60 exported methods (grep showed ~30 range), suggesting the count refers to a different client | Registry/client source with method count |

## Verified claims (grouped by source)
- web4/cmd/pilotctl/zz_fake_registry_test.go + web4/tests/*.go: existence of protocol commands directory_sync, directory_status, provision_network, set_idp_config, set_audit_export, get_audit_export, set_network_policy, promote_member, demote_member, kick_member, set_network_enterprise, validate_token
- Pre-verified: well-known port 1001 (dataexchange) appearing in blueprint allowed_ports example
- Local site files: /docs/getting-started, /docs/networks, /plans pages exist; banner webp exists
- Frontmatter/meta description: restates in-body claims (counted once above)
- EXAMPLE: all JSON request/response payloads (set_idp_config, directory_sync, blueprint, DLQ, provision result) — illustrative sample values
